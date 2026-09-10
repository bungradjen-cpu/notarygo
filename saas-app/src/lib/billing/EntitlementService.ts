import { createClient } from "@/utils/supabase/server";

export class EntitlementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntitlementError";
  }
}

export class EntitlementService {
  /**
   * Retrieves the current limit for a specific feature for an organization.
   * Returns -1 if unlimited, 0 if not allowed, or a positive number for a specific limit.
   */
  static async getEntitlementLimit(orgId: string, featureKey: string): Promise<number> {
    const supabase = await createClient();
    
    // First, get the org's active subscription plan
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("plan_id, status")
      .eq("org_id", orgId)
      .maybeSingle();

    // If subscription is explicitly EXPIRED or SUSPENDED or CANCELLED, they have 0 entitlements
    const blockedStatuses = ["EXPIRED", "SUSPENDED", "CANCELLED"];
    if (subData && blockedStatuses.includes(subData.status)) {
      return 0;
    }


    if (subData?.plan_id) {
      // Fetch the limit for this feature on the org's plan
      const { data: entitlementData } = await supabase
        .from("plan_entitlements")
        .select("limit_val")
        .eq("plan_id", subData.plan_id)
        .eq("feature_key", featureKey)
        .maybeSingle();

      if (entitlementData && typeof entitlementData.limit_val === "number") {
        return entitlementData.limit_val;
      }
    }

    // Generous default fallback limits so active offices are never blocked
    switch (featureKey) {
      case "storage_limit_bytes":
        return 10 * 1024 * 1024 * 1024; // 10 GB default
      case "max_members":
        return 20; // 20 team members default
      case "max_active_matters":
        return -1; // Unlimited active matters default
      default:
        return -1; // Unlimited
    }
  }

  /**
   * Checks if an organization has access to a specific feature (i.e. limit > 0 or -1).
   */
  static async hasEntitlement(orgId: string, featureKey: string): Promise<boolean> {
    const limit = await this.getEntitlementLimit(orgId, featureKey);
    return limit === -1 || limit > 0;
  }

  /**
   * Calculates the current usage of a feature.
   */
  static async getUsage(orgId: string, featureKey: string): Promise<number> {
    const supabase = await createClient();

    switch (featureKey) {
      case "max_members": {
        const { count, error } = await supabase
          .from("organization_members")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId);
        if (error) return 0;
        return count ?? 0;
      }
      case "max_active_matters": {
        const { count, error } = await supabase
          .from("matters")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId)
          .not("status", "in", '("CLOSED", "CANCELED")');
        if (error) return 0;
        return count ?? 0;
      }
      default: {
        const { data, error } = await supabase
          .from("usage_counters")
          .select("current_usage")
          .eq("org_id", orgId)
          .eq("feature_key", featureKey)
          .maybeSingle();
        if (error || !data) return 0;
        return data.current_usage;
      }
    }
  }

  /**
   * Asserts that an organization can consume one more unit of a feature.
   */
  static async assertEntitlement(orgId: string, featureKey: string): Promise<void> {
    const limit = await this.getEntitlementLimit(orgId, featureKey);

    if (limit === 0) {
      throw new EntitlementError(`Paket langganan Anda tidak mencakup fitur ${featureKey}. Silakan tingkatkan paket langganan Anda.`);
    }

    if (limit === -1) {
      return; // Unlimited access
    }

    const currentUsage = await this.getUsage(orgId, featureKey);
    
    if (currentUsage >= limit) {
      throw new EntitlementError(`Anda telah mencapai batas maksimum ${limit} untuk ${featureKey}. Silakan tingkatkan paket langganan Anda.`);
    }
  }
}
