import { createClient } from "@/utils/supabase/server";

export type OrgRole = "OWNER" | "ADMIN" | "SUPERVISOR" | "STAFF" | "FINANCE";

export async function hasOrgRole(orgId: string, role: OrgRole): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("profile_id", user.id)
    .single();

  if (error || !data) return false;

  // Simple hierarchy can be implemented here if needed.
  // For now, exact match or OWNER.
  if (data.role === "OWNER") return true;
  return data.role === role;
}

export async function getUserOrgs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      org_id,
      role,
      organizations (
        name,
        slug
      )
    `);

  if (error) return [];
  return data;
}
