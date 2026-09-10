"use server";

import { createClient } from "@/utils/supabase/server";
import { MigrationEngine, LegacyDataPayload, MigrationResult } from "@/lib/migration/MigrationEngine";
import { revalidatePath } from "next/cache";

export async function executeMigrationAction(
  orgId: string,
  jsonString: string,
  dryRun: boolean
): Promise<MigrationResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is OWNER or ADMIN
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    throw new Error("Only organization Owners and Admins can perform migrations.");
  }

  let payload: LegacyDataPayload;
  try {
    payload = JSON.parse(jsonString);
  } catch (err: any) {
    return {
      dryRun,
      counts: {
        clients: { total: 0, prospective: 0, duplicates: 0 },
        matters: { total: 0, prospective: 0, duplicates: 0 },
        tasks: { total: 0, prospective: 0, duplicates: 0 },
        invoices: { total: 0, prospective: 0, duplicates: 0 },
        documents: { total: 0, prospective: 0, duplicates: 0 }
      },
      errors: [`Invalid JSON file: ${err.message}`],
      unsupportedFields: [],
      success: false
    };
  }

  const result = await MigrationEngine.runMigration(supabase, orgId, user.id, payload, dryRun);
  revalidatePath("/dashboard/settings/migration");
  return result;
}
