import { createClient } from "@/utils/supabase/server";

export class WorkflowEngine {
  /**
   * Initializes tasks and checklist items for a newly created matter
   * based on the workflow templates for the specific service type.
   */
  static async initializeMatterWorkflow(orgId: string, matterId: string, serviceTypeId: string) {
    const supabase = await createClient();

    // 1. Fetch Workflow Template & Steps
    const { data: template } = await supabase
      .from("workflow_templates")
      .select("id")
      .eq("org_id", orgId)
      .eq("service_type_id", serviceTypeId)
      .maybeSingle();

    if (template) {
      const { data: steps } = await supabase
        .from("workflow_steps")
        .select("*")
        .eq("template_id", template.id)
        .order("step_order", { ascending: true });

      if (steps && steps.length > 0) {
        // Map steps to tasks
        const tasksToInsert = steps.map((step) => {
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + (step.estimated_days || 0));

          return {
            org_id: orgId,
            matter_id: matterId,
            title: step.title,
            description: step.description,
            status: "PENDING",
            deadline: deadline.toISOString(),
          };
        });

        const { error: taskError } = await supabase.from("tasks").insert(tasksToInsert);
        if (taskError) console.error("Failed to insert tasks", taskError);
      }
    }

    // 2. Fetch Checklist Templates
    const { data: checklistTemplates } = await supabase
      .from("checklist_templates")
      .select("*")
      .eq("org_id", orgId)
      .eq("service_type_id", serviceTypeId);

    if (checklistTemplates && checklistTemplates.length > 0) {
      const checklistsToInsert = checklistTemplates.map((cl) => ({
        org_id: orgId,
        matter_id: matterId,
        item_name: cl.item_name,
        is_mandatory: cl.is_mandatory,
        status: "PENDING",
      }));

      const { error: clError } = await supabase.from("checklist_items").insert(checklistsToInsert);
      if (clError) console.error("Failed to insert checklist items", clError);
    }
  }

  /**
   * Logs an activity for the given matter.
   */
  static async logActivity(orgId: string, actorId: string, action: string, entityType: string, entityId: string, metadata: any = {}) {
    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      org_id: orgId,
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  }
}
