"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PlatformBillingService } from "@/lib/billing/PlatformBillingService";
import { getEmailGrant } from "@/config/active_grants";

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const name = formData.get("name") as string;
  const notary_name = formData.get("notary_name") as string;
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
  const orgId = crypto.randomUUID();

  // 1. Ensure profile exists in profiles table
  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name || notary_name || "Owner",
  });

  // 2. Insert Organization
  const { error: orgError } = await supabase.from("organizations").insert({
    id: orgId,
    name,
    notary_name,
    slug,
  });

  if (orgError) {
    throw new Error(orgError.message);
  }

  // 3. Insert user as OWNER in organization_members
  const { error: memberError } = await supabase.from("organization_members").insert({
    org_id: orgId,
    profile_id: user.id,
    role: "OWNER",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  // 4. Secure Payment Claiming: Check if verified email owns a paid transaction
  const userEmail = (user.email || "").toLowerCase().trim();
  const claimResult = await PlatformBillingService.claimPaymentForNewOrg(userEmail, orgId, user.id);

  if (!claimResult.claimed) {
    const grant = getEmailGrant(userEmail);
    if (grant) {
      // User has a verified active grant (e.g. Mayar direct payment)
      await supabase.from("subscriptions").insert({
        org_id: orgId,
        status: "ACTIVE",
        current_period_start: new Date().toISOString(),
        current_period_end: grant.expiresAt,
      });
    } else {
      // User signed up WITHOUT prior payment: Set status to EXPIRED so SubscriptionLockGate requires checkout
      await supabase.from("subscriptions").insert({
        org_id: orgId,
        status: "EXPIRED",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date().toISOString(),
      });
    }
  }

  redirect("/dashboard");
}
