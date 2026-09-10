import { createClient } from "@/utils/supabase/server";

/**
 * A Test Billing Adapter to simulate payment gateway webhooks and lifecycle events.
 * Do NOT use this in a real production environment.
 */
export class TestBillingAdapter {
  /**
   * Simulates starting a trial for an organization.
   */
  static async startTrial(orgId: string, planId: string, trialDays = 14) {
    const supabase = await createClient();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + trialDays);

    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        org_id: orgId,
        plan_id: planId,
        status: 'TRIALING',
        current_period_end: endDate.toISOString(),
      }, { onConflict: 'org_id' });

    if (error) throw new Error(`Failed to start trial: ${error.message}`);

    await this.logEvent(orgId, 'TRIAL_STARTED', null, 'TRIALING');
  }

  /**
   * Simulates a successful payment and sets the subscription to ACTIVE.
   */
  static async simulatePaymentSuccess(orgId: string, planId: string, days = 30) {
    const supabase = await createClient();
    
    // Fetch previous status
    const { data: sub } = await supabase.from("subscriptions").select("status").eq("org_id", orgId).single();
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        org_id: orgId,
        plan_id: planId,
        status: 'ACTIVE',
        current_period_end: endDate.toISOString(),
      }, { onConflict: 'org_id' });

    if (error) throw new Error(`Failed to simulate payment: ${error.message}`);

    await this.logEvent(orgId, 'PAYMENT_SUCCESS', sub?.status || null, 'ACTIVE');
  }

  /**
   * Simulates a failed payment (e.g. credit card expired), changing status to PAST_DUE.
   */
  static async simulatePaymentFailed(orgId: string) {
    const supabase = await createClient();
    
    const { data: sub } = await supabase.from("subscriptions").select("status").eq("org_id", orgId).single();

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: 'PAST_DUE' })
      .eq("org_id", orgId);

    if (error) throw new Error(`Failed to simulate payment failure: ${error.message}`);

    await this.logEvent(orgId, 'PAYMENT_FAILED', sub?.status || null, 'PAST_DUE');
  }

  /**
   * Simulates canceling the subscription (at period end).
   */
  static async cancelSubscription(orgId: string) {
    const supabase = await createClient();
    
    const { data: sub } = await supabase.from("subscriptions").select("status").eq("org_id", orgId).single();

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: 'CANCEL_AT_PERIOD_END' })
      .eq("org_id", orgId);

    if (error) throw new Error(`Failed to cancel subscription: ${error.message}`);

    await this.logEvent(orgId, 'SUBSCRIPTION_CANCELLED', sub?.status || null, 'CANCEL_AT_PERIOD_END');
  }

  /**
   * Immediately expires the subscription.
   */
  static async expireSubscription(orgId: string) {
    const supabase = await createClient();
    
    const { data: sub } = await supabase.from("subscriptions").select("status").eq("org_id", orgId).single();

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: 'EXPIRED' })
      .eq("org_id", orgId);

    if (error) throw new Error(`Failed to expire subscription: ${error.message}`);

    await this.logEvent(orgId, 'SUBSCRIPTION_EXPIRED', sub?.status || null, 'EXPIRED');
  }

  private static async logEvent(orgId: string, eventType: string, previousStatus: string | null, newStatus: string) {
    const supabase = await createClient();
    await supabase.from("subscription_events").insert({
      org_id: orgId,
      event_type: eventType,
      previous_status: previousStatus,
      new_status: newStatus,
    });
  }
}
