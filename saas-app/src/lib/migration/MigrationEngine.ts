import { SupabaseClient } from "@supabase/supabase-js";

export interface LegacyDataPayload {
  version?: string;
  clients?: Array<{
    clientId: string;
    name: string;
    clientType?: string;
    identifier?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    [key: string]: any;
  }>;
  matters?: Array<{
    matterId: string;
    matterNumber?: string;
    clientId: string;
    title: string;
    description?: string;
    status?: string;
    deadline?: string;
    priority?: string;
    [key: string]: any;
  }>;
  tasks?: Array<{
    taskId: string;
    matterId: string;
    title: string;
    description?: string;
    status?: string;
    deadline?: string;
    [key: string]: any;
  }>;
  invoices?: Array<{
    invoiceId: string;
    matterId?: string;
    clientId?: string;
    invoiceNumber?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    status?: string;
    [key: string]: any;
  }>;
  documents?: Array<{
    documentId: string;
    matterId?: string;
    title: string;
    documentType?: string;
    driveUrl?: string;
    status?: string;
    [key: string]: any;
  }>;
}

export interface MigrationResult {
  batchId?: string;
  dryRun: boolean;
  counts: {
    clients: { total: number; prospective: number; duplicates: number };
    matters: { total: number; prospective: number; duplicates: number };
    tasks: { total: number; prospective: number; duplicates: number };
    invoices: { total: number; prospective: number; duplicates: number };
    documents: { total: number; prospective: number; duplicates: number };
  };
  errors: string[];
  unsupportedFields: Array<{ entity: string; legacyId: string; fields: string[] }>;
  success: boolean;
}

const KNOWN_FIELDS: Record<string, string[]> = {
  clients: ["clientId", "name", "clientType", "identifier", "phone", "email", "address", "notes"],
  matters: ["matterId", "matterNumber", "clientId", "title", "description", "status", "deadline", "priority", "assignedPIC", "supervisor"],
  tasks: ["taskId", "matterId", "title", "description", "status", "deadline", "assignedTo"],
  invoices: ["invoiceId", "matterId", "clientId", "invoiceNumber", "subtotal", "tax", "total", "paidAmount", "outstanding", "status"],
  documents: ["documentId", "matterId", "title", "documentType", "driveUrl", "fileId", "status"]
};

export class MigrationEngine {
  static validatePayload(payload: LegacyDataPayload): {
    errors: string[];
    unsupportedFields: Array<{ entity: string; legacyId: string; fields: string[] }>;
  } {
    const errors: string[] = [];
    const unsupportedFields: Array<{ entity: string; legacyId: string; fields: string[] }> = [];

    // Validate Clients
    if (payload.clients) {
      payload.clients.forEach((c, idx) => {
        if (!c.clientId) errors.push(`Client row ${idx + 1} is missing clientId.`);
        if (!c.name) errors.push(`Client [${c.clientId || idx + 1}] is missing name.`);

        const extraKeys = Object.keys(c).filter(k => !KNOWN_FIELDS.clients.includes(k));
        if (extraKeys.length > 0) {
          unsupportedFields.push({ entity: "clients", legacyId: c.clientId || `row-${idx}`, fields: extraKeys });
        }
      });
    }

    // Validate Matters
    const clientIds = new Set((payload.clients || []).map(c => c.clientId));
    if (payload.matters) {
      payload.matters.forEach((m, idx) => {
        if (!m.matterId) errors.push(`Matter row ${idx + 1} is missing matterId.`);
        if (!m.title) errors.push(`Matter [${m.matterId || idx + 1}] is missing title.`);
        if (m.clientId && payload.clients && payload.clients.length > 0 && !clientIds.has(m.clientId)) {
          errors.push(`Matter [${m.matterId}] references unknown clientId [${m.clientId}].`);
        }

        const extraKeys = Object.keys(m).filter(k => !KNOWN_FIELDS.matters.includes(k));
        if (extraKeys.length > 0) {
          unsupportedFields.push({ entity: "matters", legacyId: m.matterId || `row-${idx}`, fields: extraKeys });
        }
      });
    }

    // Validate Tasks
    const matterIds = new Set((payload.matters || []).map(m => m.matterId));
    if (payload.tasks) {
      payload.tasks.forEach((t, idx) => {
        if (!t.taskId) errors.push(`Task row ${idx + 1} is missing taskId.`);
        if (!t.title) errors.push(`Task [${t.taskId || idx + 1}] is missing title.`);
        if (t.matterId && payload.matters && payload.matters.length > 0 && !matterIds.has(t.matterId)) {
          errors.push(`Task [${t.taskId}] references unknown matterId [${t.matterId}].`);
        }

        const extraKeys = Object.keys(t).filter(k => !KNOWN_FIELDS.tasks.includes(k));
        if (extraKeys.length > 0) {
          unsupportedFields.push({ entity: "tasks", legacyId: t.taskId || `row-${idx}`, fields: extraKeys });
        }
      });
    }

    return { errors, unsupportedFields };
  }

  static async runMigration(
    supabase: SupabaseClient,
    orgId: string,
    userId: string,
    payload: LegacyDataPayload,
    dryRun: boolean = true
  ): Promise<MigrationResult> {
    const { errors, unsupportedFields } = this.validatePayload(payload);

    // If critical validation errors exist, halt
    if (errors.length > 0) {
      return {
        dryRun,
        counts: {
          clients: { total: payload.clients?.length || 0, prospective: 0, duplicates: 0 },
          matters: { total: payload.matters?.length || 0, prospective: 0, duplicates: 0 },
          tasks: { total: payload.tasks?.length || 0, prospective: 0, duplicates: 0 },
          invoices: { total: payload.invoices?.length || 0, prospective: 0, duplicates: 0 },
          documents: { total: payload.documents?.length || 0, prospective: 0, duplicates: 0 }
        },
        errors,
        unsupportedFields,
        success: false
      };
    }

    // Query existing legacy_ids in the organization to calculate prospective vs duplicates
    const [
      { data: existingClients },
      { data: existingMatters },
      { data: existingTasks },
      { data: existingInvoices },
      { data: existingDocs }
    ] = await Promise.all([
      supabase.from("clients").select("id, legacy_id").eq("org_id", orgId).not("legacy_id", "is", null),
      supabase.from("matters").select("id, legacy_id").eq("org_id", orgId).not("legacy_id", "is", null),
      supabase.from("tasks").select("id, legacy_id").eq("org_id", orgId).not("legacy_id", "is", null),
      supabase.from("invoices").select("id, legacy_id").eq("org_id", orgId).not("legacy_id", "is", null),
      supabase.from("documents").select("id, legacy_id").eq("org_id", orgId).not("legacy_id", "is", null)
    ]);

    const existingClientMap = new Map((existingClients || []).map(c => [c.legacy_id, c.id]));
    const existingMatterMap = new Map((existingMatters || []).map(m => [m.legacy_id, m.id]));

    const counts = {
      clients: {
        total: payload.clients?.length || 0,
        duplicates: (payload.clients || []).filter(c => existingClientMap.has(c.clientId)).length,
        prospective: (payload.clients || []).filter(c => !existingClientMap.has(c.clientId)).length
      },
      matters: {
        total: payload.matters?.length || 0,
        duplicates: (payload.matters || []).filter(m => existingMatterMap.has(m.matterId)).length,
        prospective: (payload.matters || []).filter(m => !existingMatterMap.has(m.matterId)).length
      },
      tasks: {
        total: payload.tasks?.length || 0,
        duplicates: (payload.tasks || []).filter(t => (existingTasks || []).some(et => et.legacy_id === t.taskId)).length,
        prospective: (payload.tasks || []).filter(t => !(existingTasks || []).some(et => et.legacy_id === t.taskId)).length
      },
      invoices: {
        total: payload.invoices?.length || 0,
        duplicates: (payload.invoices || []).filter(i => (existingInvoices || []).some(ei => ei.legacy_id === i.invoiceId)).length,
        prospective: (payload.invoices || []).filter(i => !(existingInvoices || []).some(ei => ei.legacy_id === i.invoiceId)).length
      },
      documents: {
        total: payload.documents?.length || 0,
        duplicates: (payload.documents || []).filter(d => (existingDocs || []).some(ed => ed.legacy_id === d.documentId)).length,
        prospective: (payload.documents || []).filter(d => !(existingDocs || []).some(ed => ed.legacy_id === d.documentId)).length
      }
    };

    if (dryRun) {
      return {
        dryRun: true,
        counts,
        errors: [],
        unsupportedFields,
        success: true
      };
    }

    // 1. Create Migration Batch record
    const { data: batch, error: batchErr } = await supabase
      .from("migration_batches")
      .insert({
        org_id: orgId,
        imported_by: userId,
        status: "COMPLETED",
        dry_run: false,
        counts_summary: counts,
        errors: [],
        unsupported_fields: unsupportedFields,
        completed_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (batchErr) throw new Error(`Failed to create migration batch: ${batchErr.message}`);
    const batchId = batch.id;

    // 2. Insert Clients
    if (payload.clients && payload.clients.length > 0) {
      for (const c of payload.clients) {
        if (!existingClientMap.has(c.clientId)) {
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              org_id: orgId,
              name: c.name,
              client_type: c.clientType || "INDIVIDUAL",
              phone: c.phone || null,
              email: c.email || null,
              address: c.address || null,
              notes: c.notes || null,
              legacy_id: c.clientId,
              import_batch_id: batchId
            })
            .select("id")
            .single();

          if (newClient) {
            existingClientMap.set(c.clientId, newClient.id);
          }
        }
      }
    }

    // 3. Insert Matters
    if (payload.matters && payload.matters.length > 0) {
      for (const m of payload.matters) {
        if (!existingMatterMap.has(m.matterId)) {
          const mappedClientId = m.clientId ? existingClientMap.get(m.clientId) : null;
          const { data: newMatter } = await supabase
            .from("matters")
            .insert({
              org_id: orgId,
              client_id: mappedClientId,
              matter_number: m.matterNumber || `LEGACY-${m.matterId}`,
              title: m.title,
              description: m.description || null,
              matter_status: (m.status || "ACTIVE").toUpperCase(),
              priority: (m.priority || "NORMAL").toUpperCase(),
              deadline: m.deadline || null,
              legacy_id: m.matterId,
              import_batch_id: batchId,
              created_by: userId
            })
            .select("id")
            .single();

          if (newMatter) {
            existingMatterMap.set(m.matterId, newMatter.id);
          }
        }
      }
    }

    // 4. Insert Tasks
    if (payload.tasks && payload.tasks.length > 0) {
      for (const t of payload.tasks) {
        const mappedMatterId = t.matterId ? existingMatterMap.get(t.matterId) : null;
        if (mappedMatterId) {
          await supabase
            .from("tasks")
            .insert({
              org_id: orgId,
              matter_id: mappedMatterId,
              title: t.title,
              description: t.description || null,
              status: (t.status || "PENDING").toUpperCase(),
              due_date: t.deadline || null,
              legacy_id: t.taskId,
              import_batch_id: batchId,
              created_by: userId
            });
        }
      }
    }

    return {
      batchId,
      dryRun: false,
      counts,
      errors: [],
      unsupportedFields,
      success: true
    };
  }
}
