"use server";

import { createClient } from "@/utils/supabase/server";
import { MatterGenerator } from "@/lib/operations/MatterGenerator";
import { WorkflowEngine } from "@/lib/operations/WorkflowEngine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMatterAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const picId = (formData.get("picId") as string) || user.id;

  // Handle Client: support direct text typing (free text) or ID
  let clientId = formData.get("clientId") as string;
  const clientName = (formData.get("clientName") as string)?.trim();

  if (!clientId && clientName) {
    // Check if client with this name already exists in org
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("org_id", orgId)
      .ilike("name", clientName)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Create new client directly
      const { data: newClient, error: clientErr } = await supabase
        .from("clients")
        .insert({
          org_id: orgId,
          name: clientName,
          client_type: "INDIVIDUAL",
        })
        .select("id")
        .single();

      if (clientErr || !newClient) {
        // Fallback if client insert fails
        console.warn("Client insert fallback:", clientErr?.message);
      } else {
        clientId = newClient.id;
      }
    }
  }

  // Handle Service Type: support direct text typing (free text) or ID
  let serviceTypeId = formData.get("serviceTypeId") as string;
  const serviceTypeName = (formData.get("serviceTypeName") as string)?.trim();

  if (!serviceTypeId && serviceTypeName) {
    // Check if service type with this name already exists in org
    const { data: existingService } = await supabase
      .from("service_types")
      .select("id")
      .eq("org_id", orgId)
      .ilike("name", serviceTypeName)
      .maybeSingle();

    if (existingService) {
      serviceTypeId = existingService.id;
    } else {
      // Try inserting new service type
      const code = serviceTypeName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 6) || "AKTA";

      const { data: newService } = await supabase
        .from("service_types")
        .insert({
          org_id: orgId,
          name: serviceTypeName,
          code: `${code}-${Date.now().toString().slice(-4)}`,
        })
        .select("id")
        .maybeSingle();

      if (newService) {
        serviceTypeId = newService.id;
      }
    }
  }

  // If serviceTypeId is still not resolved, check for any existing service type in the org as fallback
  if (!serviceTypeId) {
    const { data: anyService } = await supabase
      .from("service_types")
      .select("id")
      .eq("org_id", orgId)
      .limit(1)
      .maybeSingle();

    if (anyService) {
      serviceTypeId = anyService.id;
    }
  }

  const matterNumber = await MatterGenerator.generateMatterNumber(orgId);

  const insertPayload: any = {
    org_id: orgId,
    client_id: clientId || null,
    matter_number: matterNumber,
    title,
    pic_id: picId,
  };

  if (serviceTypeId) {
    insertPayload.service_type_id = serviceTypeId;
  }

  const { data: matter, error } = await supabase
    .from("matters")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !matter) {
    throw new Error(error?.message || "Gagal membuat perkara baru");
  }

  // Initialize Workflow if serviceTypeId available
  if (serviceTypeId) {
    await WorkflowEngine.initializeMatterWorkflow(orgId, matter.id, serviceTypeId).catch(() => {});
  }

  // Log Activity
  await WorkflowEngine.logActivity(orgId, user.id, "MATTER_CREATED", "matters", matter.id, {
    matterNumber,
    description,
  }).catch(() => {});

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/matters");
  redirect(`/dashboard/matters/${matter.id}`);
}

export async function updateMatterAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const matterId = formData.get("matterId") as string;
  const title = (formData.get("title") as string)?.trim();
  const status = formData.get("status") as string;
  const picId = (formData.get("picId") as string) || null;

  const { error } = await supabase
    .from("matters")
    .update({
      title,
      status,
      pic_id: picId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/matters/${matterId}`);
  revalidatePath("/dashboard/matters");
  revalidatePath("/dashboard");
}

export async function deleteMatterAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const matterId = formData.get("matterId") as string;

  // Soft delete or hard delete
  const { error } = await supabase
    .from("matters")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", matterId);

  if (error) {
    // If deleted_at column fails, try hard delete
    await supabase.from("matters").delete().eq("id", matterId);
  }

  revalidatePath("/dashboard/matters");
  revalidatePath("/dashboard");
  redirect("/dashboard/matters");
}

export async function completeTaskAction(taskId: string, matterId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("tasks")
    .update({ status: "COMPLETED", updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  const { data: taskData } = await supabase.from("tasks").select("org_id").eq("id", taskId).single();

  if (taskData) {
    await WorkflowEngine.logActivity(taskData.org_id, user.id, "TASK_COMPLETED", "tasks", taskId, {}).catch(() => {});
  }

  revalidatePath(`/dashboard/matters/${matterId}`);
  revalidatePath("/dashboard");
}

export async function deleteClientAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const clientId = formData.get("clientId") as string;
  if (!clientId) return;

  // 1. Try Soft Delete first (setting deleted_at so it respects RLS and matters foreign keys)
  const { error: softErr } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", clientId);

  if (softErr) {
    // 2. Fallback to hard delete if soft delete fails
    const { error: hardErr } = await supabase.from("clients").delete().eq("id", clientId);
    if (hardErr) throw new Error(hardErr.message || "Gagal menghapus klien.");
  }

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/matters");
}

export async function upsertClientAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const clientId = formData.get("clientId") as string;
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const identifier = (formData.get("identifier") as string)?.trim();
  const clientType = (formData.get("client_type") as string) || "INDIVIDUAL";

  if (clientId) {
    const { error } = await supabase
      .from("clients")
      .update({ name, phone, email, identifier, client_type: clientType })
      .eq("id", clientId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("clients").insert({
      org_id: orgId,
      name,
      phone,
      email,
      identifier,
      client_type: clientType,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/clients");
}
