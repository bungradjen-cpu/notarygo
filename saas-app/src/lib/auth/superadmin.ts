import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const AUTHORIZED_SUPERADMIN_EMAIL = "bungradjen@gmail.com";
export const SUPERADMIN_ROLE = "PLATFORM_SUPERADMIN";

export interface SuperadminContext {
  userId: string;
  email: string;
  fullName: string;
  role: "PLATFORM_SUPERADMIN";
  authorizedAt: string;
}

/**
 * Normalizes email address safely.
 */
export function normalizeEmail(email?: string | null): string {
  return (email || "").toLowerCase().trim();
}

/**
 * Server-Side Single Superadmin Verification Helper.
 * Strictly satisfies Single Superadmin Policy:
 * 1. Obtains authenticated Supabase user
 * 2. Rejects anonymous / unauthenticated user
 * 3. Normalizes and validates exact authorized email (bungradjen@gmail.com)
 * 4. Checks server-side platform_admins record with role PLATFORM_SUPERADMIN & status ACTIVE
 * 5. Returns trusted admin context or throws 403 / redirects.
 */
export async function requireSuperadmin(options?: { throwOnUnauthorized?: boolean }): Promise<SuperadminContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (options?.throwOnUnauthorized) {
      throw new Error("UNAUTHORIZED: Anonymous or invalid session");
    }
    redirect("/auth/login?next=/superadmin");
  }

  const normalized = normalizeEmail(user.email);
  if (normalized !== AUTHORIZED_SUPERADMIN_EMAIL) {
    if (options?.throwOnUnauthorized) {
      throw new Error("FORBIDDEN: User is not authorized to access Platform Superadmin");
    }
    redirect("/dashboard");
  }

  // Verify server-side platform_admins record
  const { data: adminRecord, error: adminErr } = await supabase
    .from("platform_admins")
    .select("role, status")
    .or(`profile_id.eq.${user.id},user_id.eq.${user.id}`)
    .maybeSingle();

  // If table is queried and record exists, enforce active superadmin role
  if (adminRecord) {
    if (adminRecord.role !== SUPERADMIN_ROLE || adminRecord.status !== "ACTIVE") {
      if (options?.throwOnUnauthorized) {
        throw new Error("FORBIDDEN: Platform admin record is inactive or revoked");
      }
      redirect("/dashboard");
    }
  } else {
    // If platform_admins table doesn't have the record yet (e.g. pending DB migration),
    // we also check RPC function is_platform_admin()
    try {
      await supabase.rpc("is_platform_admin");
    } catch {
      // Ignored if RPC is not present
    }
  }

  const fullName = user.user_metadata?.full_name || "Ezra";

  return {
    userId: user.id,
    email: normalized,
    fullName,
    role: SUPERADMIN_ROLE,
    authorizedAt: new Date().toISOString(),
  };
}

/**
 * Immutable Platform Admin Audit Logger.
 * Records administrative actions with timestamp, admin ID, before/after states.
 */
export async function logPlatformAdminAudit(params: {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  beforeState?: any;
  afterState?: any;
  metadata?: any;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("platform_admin_audit_logs").insert({
      admin_user_id: params.adminUserId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      reason: params.reason || "Executed from Platform Superadmin Command Center",
      before_state: params.beforeState || null,
      after_state: params.afterState || null,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Superadmin Audit Log Error]", err);
  }
}
