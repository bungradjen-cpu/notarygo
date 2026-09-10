"use server";

import { createClient } from "@/utils/supabase/server";
import { MayarAdapter } from "@/lib/billing/MayarAdapter";
import { redirect } from "next/navigation";

export async function upgradePlanAction(orgId: string, planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Get Org and User details
  const { data: org } = await supabase
    .from("organizations")
    .select("mayar_customer_id, name")
    .eq("id", orgId)
    .single();
  
  if (!org) throw new Error("Organization not found");

  let mayarCustomerId = org.mayar_customer_id;

  // 2. Create Mayar Customer if not exists
  if (!mayarCustomerId) {
    // Need user email and phone (fetch from profiles)
    const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();
    
    // Hardcoded phone for demo since we don't store it in profiles yet
    const customer = await MayarAdapter.createCustomer(profile?.full_name || "Unknown", profile?.email || user.email || "", "08123456789");
    mayarCustomerId = customer.id;

    // Save to Org
    await supabase.from("organizations").update({ mayar_customer_id: mayarCustomerId }).eq("id", orgId);
  }

  // 3. Create Checkout URL
  const checkout = await MayarAdapter.createCheckoutUrl(mayarCustomerId, planId, orgId);

  // 4. Save Payment Link ID to DB temporarily
  await supabase.from("subscriptions").update({ mayar_payment_link_id: checkout.linkId }).eq("org_id", orgId);

  // 5. Redirect to Mayar Checkout
  redirect(checkout.url);
}

export async function cancelPlanAction(orgId: string) {
  const supabase = await createClient();
  const { data: sub } = await supabase.from("subscriptions").select("mayar_subscription_id").eq("org_id", orgId).single();

  if (sub?.mayar_subscription_id) {
    await MayarAdapter.cancelSubscription(sub.mayar_subscription_id);
    // Let webhook handle the actual DB update
  }
}
