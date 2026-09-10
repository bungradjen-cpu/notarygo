import { describe, it, expect } from "vitest";
import { CANONICAL_PLANS, resolveCanonicalPlan } from "@/config/pricing";
import { PlatformBillingService } from "@/lib/billing/PlatformBillingService";
import { MayarAdapter } from "@/lib/billing/MayarAdapter";

describe("A. Canonical Pricing & Server Authoritative Calculations", () => {
  it("A1. Plan NOTARYGO_MONTHLY must strictly charge Rp 129.000", () => {
    const plan = CANONICAL_PLANS.NOTARYGO_MONTHLY;
    expect(plan.price).toBe(129000);
    expect(plan.durationMonths).toBe(1);
  });

  it("A2. Plan NOTARYGO_QUARTERLY must strictly charge Rp 249.000", () => {
    const plan = CANONICAL_PLANS.NOTARYGO_QUARTERLY;
    expect(plan.price).toBe(249000);
    expect(plan.durationMonths).toBe(3);
  });

  it("A3. Plan NOTARYGO_ANNUAL must strictly charge Rp 499.000 (actual charge, not marketing equivalent)", () => {
    const plan = CANONICAL_PLANS.NOTARYGO_ANNUAL;
    expect(plan.price).toBe(499000);
    expect(plan.durationMonths).toBe(12);
    expect(plan.annualEquivalentPrice).toBe("± Rp 41.500/bulan");
  });

  it("A4. Client price tampering must be ignored; server resolves canonical price", async () => {
    // Simulating browser client sending tampered amount of Rp 1.000 for ANNUAL plan
    const tamperedClientInput = {
      planCode: "NOTARYGO_ANNUAL",
      name: "Dr. Tamperer",
      email: "tamper@example.com",
      phone: "081234567890",
      amount: 1000, // Attacker attempts to send Rp 1.000
    };

    const session = await PlatformBillingService.createPaymentSession(tamperedClientInput);
    // Server must strictly enforce Rp 499.000
    expect(session.amount).toBe(499000);
    expect(session.plan.price).toBe(499000);
  });
});

describe("B. Email Normalization & Reference Generation", () => {
  it("B1. Normalizes email with whitespace and mixed cases", () => {
    const email = "  Customer.NOTARY@ExAmPLE.Com  ";
    const normalized = PlatformBillingService.normalizeEmail(email);
    expect(normalized).toBe("customer.notary@example.com");
  });

  it("B2. Normalizes Indonesian phone numbers consistently", () => {
    expect(PlatformBillingService.normalizePhone("+62 812-3456-7890")).toBe("081234567890");
    expect(PlatformBillingService.normalizePhone("6281234567890")).toBe("081234567890");
    expect(PlatformBillingService.normalizePhone("081234567890")).toBe("081234567890");
  });

  it("B3. Generates collision-resistant internal reference with NGPAY- prefix", () => {
    const ref1 = PlatformBillingService.generateInternalReference();
    const ref2 = PlatformBillingService.generateInternalReference();
    expect(ref1.startsWith("NGPAY-")).toBe(true);
    expect(ref2.startsWith("NGPAY-")).toBe(true);
    expect(ref1).not.toBe(ref2);
  });
});

describe("C. Webhook Authenticity & Security Guard", () => {
  const dummySecret = "test_webhook_secret_12345";

  it("C1. Accepts test ping event from Mayar dashboard without rejection", () => {
    const check = MayarAdapter.verifyWebhookAuthenticity({
      rawBody: JSON.stringify({ event: "testing", status: "SUCCESS" }),
    });
    expect(check.valid).toBe(true);
  });

  it("C2. Rejects webhook when secret token does not match", () => {
    process.env.MAYAR_WEBHOOK_SECRET = dummySecret;
    const check = MayarAdapter.verifyWebhookAuthenticity({
      rawBody: JSON.stringify({ event: "payment.received" }),
      tokenHeader: "wrong_secret_token",
      querySecret: "wrong_query_secret",
    });
    expect(check.valid).toBe(false);
  });

  it("C3. Accepts webhook when valid x-mayar-token header is provided", () => {
    process.env.MAYAR_WEBHOOK_SECRET = dummySecret;
    const check = MayarAdapter.verifyWebhookAuthenticity({
      rawBody: JSON.stringify({ event: "payment.received" }),
      tokenHeader: dummySecret,
    });
    expect(check.valid).toBe(true);
  });

  it("C4. Accepts webhook when valid query secret parameter is provided (GoBuild compatibility)", () => {
    process.env.MAYAR_WEBHOOK_SECRET = dummySecret;
    const check = MayarAdapter.verifyWebhookAuthenticity({
      rawBody: JSON.stringify({ event: "payment.received" }),
      querySecret: dummySecret,
    });
    expect(check.valid).toBe(true);
  });
});

describe("D. Amount Verification & Idempotency", () => {
  it("D1. Rejects payment when received amount is less than expected plan amount", async () => {
    const session = await PlatformBillingService.createPaymentSession({
      planCode: "NOTARYGO_ANNUAL",
      name: "Security Test User",
      email: "sectest@notary.id",
      phone: "081299998888",
    });

    const fakeTamperedWebhook = {
      event: "payment.received",
      data: {
        id: "mayar_inv_123",
        amount: 129000, // Attacker paid 129k but expects Annual
        status: "PAID",
        customer: { email: "sectest@notary.id" },
        extraData: { txId: session.reference },
      },
    };

    const result = await PlatformBillingService.processWebhookPayment(fakeTamperedWebhook);
    expect(result.processed).toBe(false);
    expect(result.reason).toContain("Amount mismatch");

    const tx = await PlatformBillingService.getTransaction(session.reference);
    expect(tx?.status).toBe("FAILED");
  });

  it("D2. Webhook idempotency: Second duplicate webhook must return ALREADY_PROCESSED and not re-credit", async () => {
    const session = await PlatformBillingService.createPaymentSession({
      planCode: "NOTARYGO_MONTHLY",
      name: "Idempotency Test User",
      email: "idempotency@notary.id",
      phone: "081277776666",
    });

    const validWebhook = {
      event: "payment.received",
      data: {
        id: "mayar_inv_456",
        amount: 129000,
        status: "PAID",
        customer: { email: "idempotency@notary.id" },
        extraData: { txId: session.reference },
      },
    };

    // First delivery
    const res1 = await PlatformBillingService.processWebhookPayment(validWebhook);
    expect(res1.processed).toBe(true);
    expect(res1.reason).toBe("PAYMENT_SUCCESSFULLY_RECORDED");

    // Second duplicate delivery
    const res2 = await PlatformBillingService.processWebhookPayment(validWebhook);
    expect(res2.processed).toBe(true);
    expect(res2.reason).toBe("ALREADY_PROCESSED");
  });
});

describe("E. Pay-First Signup & Secure Payment Claiming", () => {
  it("E1. Payment before signup is saved as PAID and UNCLAIMED", async () => {
    const preSignupEmail = "calon_notaris@kantor.com";
    const session = await PlatformBillingService.createPaymentSession({
      planCode: "NOTARYGO_ANNUAL",
      name: "Calon Notaris",
      email: preSignupEmail,
      phone: "081233334444",
    });

    // Customer completes payment on Mayar
    await PlatformBillingService.processWebhookPayment({
      event: "payment.received",
      data: {
        id: "mayar_inv_annual_789",
        amount: 499000,
        status: "PAID",
        customer: { email: preSignupEmail },
        extraData: { txId: session.reference },
      },
    });

    const tx = await PlatformBillingService.getTransaction(session.reference);
    expect(tx?.status).toBe("PAID");
    expect(tx?.claimed_at).toBeFalsy();
  });

  it("E2. Same email user signs up, creates org -> payment is securely CLAIMED and 12-month period calculated", async () => {
    const preSignupEmail = "calon_notaris@kantor.com";
    const newOrgId = "org_notaris_baru_123";
    const newUserId = "user_notaris_baru_456";

    const claimResult = await PlatformBillingService.claimPaymentForNewOrg(preSignupEmail, newOrgId, newUserId);
    expect(claimResult.claimed).toBe(true);
    expect(claimResult.planCode).toBe("NOTARYGO_ANNUAL");

    // Check calendar month arithmetic (12 months from now)
    const expectedYear = new Date().getFullYear() + 1;
    expect(claimResult.periodEnd?.getFullYear()).toBe(expectedYear);
  });

  it("E3. Wrong email signup MUST NOT claim the subscription", async () => {
    const wrongEmail = "stranger_attacker@fraud.com";
    const claimResult = await PlatformBillingService.claimPaymentForNewOrg(
      wrongEmail,
      "org_stranger_789",
      "user_stranger_000"
    );
    expect(claimResult.claimed).toBe(false);
  });
});

describe("F. Calendar Month Arithmetic", () => {
  it("F1. 1 Month calculation preserves exact calendar duration", () => {
    const start = new Date(2026, 0, 15); // Jan 15, 2026
    const end = PlatformBillingService.calculatePeriodEnd(start, 1);
    expect(end.getMonth()).toBe(1); // Feb
    expect(end.getDate()).toBe(15);
  });

  it("F2. 3 Months calculation preserves exact calendar duration", () => {
    const start = new Date(2026, 2, 10); // March 10, 2026
    const end = PlatformBillingService.calculatePeriodEnd(start, 3);
    expect(end.getMonth()).toBe(5); // June
    expect(end.getDate()).toBe(10);
  });

  it("F3. 12 Months calculation advances year exactly", () => {
    const start = new Date(2026, 8, 6); // Sept 6, 2026
    const end = PlatformBillingService.calculatePeriodEnd(start, 12);
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(8);
    expect(end.getDate()).toBe(6);
  });
});
