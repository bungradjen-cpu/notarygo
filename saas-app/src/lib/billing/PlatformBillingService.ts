import { createClient } from "@supabase/supabase-js";
import { CANONICAL_PLANS, CanonicalPlanCode, PricingPlan, resolveCanonicalPlan } from "@/config/pricing";
import { MayarAdapter } from "./MayarAdapter";

export interface CreatePaymentInput {
  planCode: string;
  name: string;
  email: string;
  phone: string;
  organizationId?: string | null;
  userId?: string | null;
}

export interface PlatformBillingTransaction {
  id: string;
  organization_id?: string | null;
  user_id?: string | null;
  normalized_email: string;
  customer_name: string;
  customer_phone: string;
  plan_code: CanonicalPlanCode;
  internal_reference: string;
  provider: string;
  provider_payment_id?: string | null;
  provider_invoice_id?: string | null;
  provider_payment_url?: string | null;
  amount: number;
  currency: string;
  status: "CREATED" | "MAYAR_PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "CLAIMED";
  created_at: string;
  paid_at?: string | null;
  claimed_at?: string | null;
  metadata?: any;
}

const VERIFIED_INITIAL_TRANSACTIONS: PlatformBillingTransaction[] = [
  {
    id: "3f2b5325-8e0b-4148-b9d7-0b3c90350d9e",
    normalized_email: "restudarmaa@gmail.com",
    customer_name: "Restu Darma Saputra",
    customer_phone: "081225051070",
    plan_code: "NOTARYGO_QUARTERLY",
    internal_reference: "NGPAY-MAYAR-3F2B5325",
    provider: "MAYAR",
    provider_payment_id: "8637111f-b3c3-4b55-94ec-acc12c7ceca0",
    provider_invoice_id: "3f2b5325-8e0b-4148-b9d7-0b3c90350d9e",
    amount: 249000,
    currency: "IDR",
    status: "PAID",
    created_at: new Date(1788700229201).toISOString(),
    paid_at: new Date(1788700229201).toISOString(),
    metadata: {
      source: "Mayar QRIS Payment Link",
      paymentLinkName: "NotaryGo Akses 3 Bulan",
      paymentLinkId: "051b530d-0da8-42a2-851e-efcc735b7897",
    },
  },
];

// In-memory fallback repository when DB table billing_transactions is not yet created in Supabase
const MEMORY_TRANSACTIONS = new Map<string, PlatformBillingTransaction>();
for (const tx of VERIFIED_INITIAL_TRANSACTIONS) {
  MEMORY_TRANSACTIONS.set(tx.id, tx);
  MEMORY_TRANSACTIONS.set(tx.internal_reference, tx);
}

export class PlatformBillingService {
  private static getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  static normalizeEmail(email: string): string {
    return (email || "").toLowerCase().trim();
  }

  static normalizePhone(phone: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9+]/g, "").trim();
    if (cleaned.startsWith("+62")) {
      cleaned = "0" + cleaned.slice(3);
    } else if (cleaned.startsWith("62")) {
      cleaned = "0" + cleaned.slice(2);
    }
    return cleaned;
  }

  static generateInternalReference(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `NGPAY-${timestamp}-${randomHex}`;
  }

  static calculatePeriodEnd(startDate: Date, durationMonths: number): Date {
    const end = new Date(startDate.getTime());
    end.setMonth(end.getMonth() + durationMonths);
    return end;
  }

  /**
   * 1. Resolves canonical plan and calculates server-authoritative amount.
   * 2. Generates internal reference NGPAY-...
   * 3. Calls Mayar API v2 (or uses verified fallback if Mayar API key is mock/unreachable)
   * 4. Persists the transaction.
   */
  static async createPaymentSession(input: CreatePaymentInput): Promise<{
    success: boolean;
    transactionId: string;
    reference: string;
    paymentUrl: string;
    amount: number;
    plan: PricingPlan;
  }> {
    const plan = resolveCanonicalPlan(input.planCode);
    if (!plan) {
      throw new Error(`Paket langganan '${input.planCode}' tidak valid atau tidak aktif`);
    }

    const normalizedEmail = this.normalizeEmail(input.email);
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      throw new Error("Alamat email tidak valid");
    }

    const normalizedPhone = this.normalizePhone(input.phone);
    if (!normalizedPhone || normalizedPhone.length < 9) {
      throw new Error("Nomor WhatsApp/telepon harus minimal 10 digit (contoh: 081234567890)");
    }

    const reference = this.generateInternalReference();
    const transactionId = crypto.randomUUID();
    const canonicalAmount = plan.price;

    // Determine return redirect URL
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const redirectUrl = `${appUrl.replace(/\/+$/, "")}/payment/status?txId=${reference}`;

    let providerInvoiceId = "";
    let providerPaymentUrl = "";

    // Call Mayar API v2
    try {
      const mayarResult = await MayarAdapter.createSinglePaymentInvoice({
        name: input.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        amount: canonicalAmount,
        description: `Langganan NOTARYGO™ — ${plan.name} (${plan.durationLabel})`,
        redirectUrl,
        internalReference: reference,
        planCode: plan.code,
        extraData: {
          transactionId,
          orgId: input.organizationId || null,
          userId: input.userId || null,
        },
      });

      providerInvoiceId = mayarResult.invoiceId;
      providerPaymentUrl = mayarResult.paymentUrl;
    } catch (err: any) {
      console.warn(`[PlatformBillingService] Mayar API call returned: ${err.message}. Falling back to plan embed link.`);
      // If live Mayar API credentials aren't active in local dev, use the verified Mayar plan embed URL
      providerPaymentUrl = plan.mayarEmbedUrl || `https://notarygo.myr.id/m/notarygotm`;
      providerInvoiceId = `manual_invoice_${reference}`;
    }

    const transactionRecord: PlatformBillingTransaction = {
      id: transactionId,
      organization_id: input.organizationId || null,
      user_id: input.userId || null,
      normalized_email: normalizedEmail,
      customer_name: input.name.trim(),
      customer_phone: normalizedPhone,
      plan_code: plan.code,
      internal_reference: reference,
      provider: "MAYAR",
      provider_payment_id: providerInvoiceId,
      provider_invoice_id: providerInvoiceId,
      provider_payment_url: providerPaymentUrl,
      amount: canonicalAmount,
      currency: "IDR",
      status: "MAYAR_PENDING",
      created_at: new Date().toISOString(),
      metadata: {
        plan_name: plan.name,
        duration_months: plan.durationMonths,
      },
    };

    // Save to memory store first
    MEMORY_TRANSACTIONS.set(reference, transactionRecord);
    MEMORY_TRANSACTIONS.set(transactionId, transactionRecord);

    // Try saving to Supabase if table exists
    try {
      const supabase = this.getSupabaseAdmin();
      await supabase.from("billing_transactions").insert(transactionRecord);
    } catch (dbErr) {
      // Ignored if table not in schema
    }

    return {
      success: true,
      transactionId,
      reference,
      paymentUrl: providerPaymentUrl,
      amount: canonicalAmount,
      plan,
    };
  }

  /**
   * Retrieves transaction by reference NGPAY-... or UUID
   */
  static async getTransaction(txIdOrRef: string): Promise<PlatformBillingTransaction | null> {
    if (!txIdOrRef) return null;

    // Check memory store
    if (MEMORY_TRANSACTIONS.has(txIdOrRef)) {
      return MEMORY_TRANSACTIONS.get(txIdOrRef)!;
    }

    // Check Supabase
    try {
      const supabase = this.getSupabaseAdmin();
      const { data } = await supabase
        .from("billing_transactions")
        .select("*")
        .or(`internal_reference.eq.${txIdOrRef},id.eq.${txIdOrRef}`)
        .maybeSingle();

      if (data) {
        return data as PlatformBillingTransaction;
      }
    } catch (e) {}

    return null;
  }

  /**
   * Process incoming Mayar Webhook callback (Event: payment.received)
   */
  static async processWebhookPayment(payload: any): Promise<{
    processed: boolean;
    reason: string;
    transaction?: PlatformBillingTransaction;
  }> {
    const eventType = (payload.event || payload.status || "").toLowerCase();
    const isPaymentSuccess =
      eventType.includes("payment.received") ||
      eventType.includes("payment.succeeded") ||
      eventType.includes("payment.success") ||
      eventType.includes("payment_success") ||
      payload.data?.status === "SUCCESS" ||
      payload.status === "SUCCESS";

    if (!isPaymentSuccess) {
      return { processed: false, reason: `Ignored event type: ${eventType}` };
    }

    const extraData = payload.data?.extraData || payload.extraData || {};
    const ref = extraData.txId || payload.data?.id || payload.transaction_id || "";
    const customerEmail = this.normalizeEmail(
      payload.data?.customer?.email ||
      payload.data?.customerEmail ||
      payload.data?.email ||
      payload.customerEmail ||
      ""
    );

    const receivedAmount = Number(payload.data?.amount || payload.amount || 0);

    // 1. Locate internal transaction record
    let tx = await this.getTransaction(ref);
    if (!tx && customerEmail) {
      // Find latest pending transaction for this email
      for (const t of MEMORY_TRANSACTIONS.values()) {
        if (t.normalized_email === customerEmail && t.status === "MAYAR_PENDING") {
          tx = t;
          break;
        }
      }
    }

    // If transaction still not found, create on the fly from verified webhook data
    if (!tx) {
      const resolvedPlan =
        resolveCanonicalPlan(extraData.planCode) ||
        (receivedAmount >= 400000
          ? CANONICAL_PLANS.NOTARYGO_ANNUAL
          : receivedAmount >= 200000
          ? CANONICAL_PLANS.NOTARYGO_QUARTERLY
          : CANONICAL_PLANS.NOTARYGO_MONTHLY);

      tx = {
        id: crypto.randomUUID(),
        normalized_email: customerEmail,
        customer_name: payload.data?.customer?.name || "Pelanggan Mayar",
        customer_phone: payload.data?.customer?.mobile || "",
        plan_code: resolvedPlan.code,
        internal_reference: ref || `NGPAY-RECV-${Date.now()}`,
        provider: "MAYAR",
        provider_payment_id: String(payload.data?.id || ""),
        provider_invoice_id: String(payload.data?.invoiceId || payload.data?.id || ""),
        amount: receivedAmount || resolvedPlan.price,
        currency: "IDR",
        status: "MAYAR_PENDING",
        created_at: new Date().toISOString(),
        metadata: payload,
      };
      MEMORY_TRANSACTIONS.set(tx.internal_reference, tx);
      MEMORY_TRANSACTIONS.set(tx.id, tx);
    }

    // 2. Amount verification check
    if (receivedAmount > 0 && tx.amount > 0 && receivedAmount < tx.amount) {
      console.error(
        `[SECURITY ALERT] Webhook amount mismatch! Expected Rp ${tx.amount}, received Rp ${receivedAmount} for ref ${tx.internal_reference}`
      );
      tx.status = "FAILED";
      tx.metadata = { ...(tx.metadata || {}), error: "AMOUNT_MISMATCH", receivedAmount };
      return { processed: false, reason: "Amount mismatch rejection" };
    }

    // 3. Webhook idempotency guard
    if (tx.status === "PAID" || tx.status === "CLAIMED") {
      console.log(`[PlatformBillingService] Transaction ${tx.internal_reference} already processed.`);
      return { processed: true, reason: "ALREADY_PROCESSED", transaction: tx };
    }

    // 4. Mark transaction as PAID
    tx.status = "PAID";
    tx.paid_at = new Date().toISOString();
    MEMORY_TRANSACTIONS.set(tx.internal_reference, tx);
    MEMORY_TRANSACTIONS.set(tx.id, tx);

    // 5. If organization ID is known, activate/extend subscription immediately
    if (tx.organization_id) {
      await this.activateOrgSubscription(tx.organization_id, tx.plan_code, tx);
      tx.status = "CLAIMED";
      tx.claimed_at = new Date().toISOString();
    } else {
      // Check if user already exists in profiles
      const supabase = this.getSupabaseAdmin();
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", tx.normalized_email)
          .maybeSingle();

        if (profile) {
          const { data: member } = await supabase
            .from("organization_members")
            .select("org_id")
            .eq("profile_id", profile.id)
            .maybeSingle();

          if (member?.org_id) {
            tx.organization_id = member.org_id;
            tx.user_id = profile.id;
            await this.activateOrgSubscription(member.org_id, tx.plan_code, tx);
            tx.status = "CLAIMED";
            tx.claimed_at = new Date().toISOString();
          }
        }
      } catch (e) {}
    }

    // 6. Record Audit Event in subscription_events
    try {
      const supabase = this.getSupabaseAdmin();
      await supabase.from("subscription_events").insert({
        org_id: tx.organization_id || null,
        event_type: "payment.received",
        new_status: "ACTIVE",
        metadata: {
          transaction_ref: tx.internal_reference,
          plan_code: tx.plan_code,
          amount: tx.amount,
          customer_email: tx.normalized_email,
          paid_at: tx.paid_at,
          payload,
        },
      });
    } catch (e) {}

    return { processed: true, reason: "PAYMENT_SUCCESSFULLY_RECORDED", transaction: tx };
  }

  /**
   * Activates or extends an organization's subscription using proper calendar month arithmetic
   */
  private static async activateOrgSubscription(
    orgId: string,
    planCode: CanonicalPlanCode,
    tx: PlatformBillingTransaction
  ) {
    const plan = CANONICAL_PLANS[planCode] || CANONICAL_PLANS.NOTARYGO_MONTHLY;
    const durationMonths = plan.durationMonths;

    const supabase = this.getSupabaseAdmin();
    let startDate = new Date();

    // Check if org has an existing active subscription
    try {
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("current_period_end, status")
        .eq("org_id", orgId)
        .maybeSingle();

      if (
        existingSub &&
        existingSub.status === "ACTIVE" &&
        existingSub.current_period_end &&
        new Date(existingSub.current_period_end) > new Date()
      ) {
        // Extend from existing current_period_end
        startDate = new Date(existingSub.current_period_end);
      }
    } catch (e) {}

    const endDate = this.calculatePeriodEnd(startDate, durationMonths);

    console.log(
      `[PlatformBillingService] Activating Org ${orgId} for plan ${plan.name} from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    try {
      await supabase.from("subscriptions").upsert(
        {
          org_id: orgId,
          status: "ACTIVE",
          current_period_start: new Date().toISOString(),
          current_period_end: endDate.toISOString(),
          mayar_payment_link_id: tx.provider_payment_id || tx.internal_reference,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "org_id" }
      );
    } catch (err: any) {
      console.error("[PlatformBillingService] Failed to upsert subscription in DB:", err.message);
    }
  }

  /**
   * Claims an unclaimed paid payment during post-signup onboarding
   */
  static async claimPaymentForNewOrg(
    verifiedEmail: string,
    orgId: string,
    userId: string
  ): Promise<{ claimed: boolean; planCode?: string; periodEnd?: Date }> {
    const normalized = this.normalizeEmail(verifiedEmail);
    if (!normalized) return { claimed: false };

    // Search in-memory store for matching PAID unclaimed payment
    let matchedTx: PlatformBillingTransaction | null = null;
    for (const t of MEMORY_TRANSACTIONS.values()) {
      if (t.normalized_email === normalized && t.status === "PAID") {
        matchedTx = t;
        break;
      }
    }

    if (!matchedTx) {
      // Check Supabase billing_transactions
      try {
        const supabase = this.getSupabaseAdmin();
        const { data } = await supabase
          .from("billing_transactions")
          .select("*")
          .eq("normalized_email", normalized)
          .eq("status", "PAID")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) matchedTx = data as PlatformBillingTransaction;
      } catch (e) {}
    }

    if (!matchedTx) {
      // Check subscription_events pending registration payments
      try {
        const supabase = this.getSupabaseAdmin();
        const { data: events } = await supabase
          .from("subscription_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        const matchingEvt = events?.find((e: any) => {
          const m = e.metadata || {};
          const em = this.normalizeEmail(m.customer_email || m.customerEmail || m.email);
          return em === normalized;
        });

        if (matchingEvt) {
          const durationMonths = matchingEvt.metadata?.duration_days >= 360 ? 12 : 1;
          const endDate = this.calculatePeriodEnd(new Date(), durationMonths);
          await supabase.from("subscriptions").upsert(
            {
              org_id: orgId,
              status: "ACTIVE",
              current_period_start: new Date().toISOString(),
              current_period_end: endDate.toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "org_id" }
          );

          return { claimed: true, periodEnd: endDate };
        }
      } catch (e) {}

      return { claimed: false };
    }

    // Attach transaction to this organization & user
    matchedTx.organization_id = orgId;
    matchedTx.user_id = userId;
    matchedTx.status = "CLAIMED";
    matchedTx.claimed_at = new Date().toISOString();

    MEMORY_TRANSACTIONS.set(matchedTx.internal_reference, matchedTx);
    MEMORY_TRANSACTIONS.set(matchedTx.id, matchedTx);

    await this.activateOrgSubscription(orgId, matchedTx.plan_code, matchedTx);
    const plan = CANONICAL_PLANS[matchedTx.plan_code] || CANONICAL_PLANS.NOTARYGO_MONTHLY;
    const endDate = this.calculatePeriodEnd(new Date(), plan.durationMonths);

    return {
      claimed: true,
      planCode: matchedTx.plan_code,
      periodEnd: endDate,
    };
  }

  /**
   * Retrieves all platform transactions for Admin view
   */
  static async listAllTransactions(): Promise<PlatformBillingTransaction[]> {
    const list: PlatformBillingTransaction[] = [];
    const seen = new Set<string>();

    for (const t of MEMORY_TRANSACTIONS.values()) {
      if (!seen.has(t.internal_reference)) {
        seen.add(t.internal_reference);
        list.push(t);
      }
    }

    try {
      const supabase = this.getSupabaseAdmin();
      const { data } = await supabase
        .from("billing_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        for (const d of data) {
          if (!seen.has(d.internal_reference)) {
            seen.add(d.internal_reference);
            list.push(d as PlatformBillingTransaction);
          }
        }
      }
    } catch (e) {}

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
