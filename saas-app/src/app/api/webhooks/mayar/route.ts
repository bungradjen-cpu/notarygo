import { NextRequest, NextResponse } from "next/server";
import { MayarAdapter } from "@/lib/billing/MayarAdapter";
import { PlatformBillingService } from "@/lib/billing/PlatformBillingService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Extract security headers and query parameter (GoBuild pattern)
    const tokenHeader =
      req.headers.get("x-mayar-token") ||
      req.headers.get("X-Mayar-Token") ||
      req.headers.get("x-token");

    const signatureHeader =
      req.headers.get("X-Mayar-Signature") ||
      req.headers.get("x-mayar-signature") ||
      req.headers.get("x-signature");

    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = {};
    }

    const eventType = (payload.event || payload.status || "").toLowerCase();

    // 2. Handle Test Ping from Mayar Dashboard
    if (
      eventType === "testing" ||
      eventType === "ping" ||
      (payload.data?.status === "SUCCESS" && payload.event === "testing")
    ) {
      console.log("[Mayar Webhook] Test URL ping received successfully:", payload);
      return NextResponse.json(
        {
          status: "success",
          message: "Mayar Webhook URL successfully verified & connected to NOTARYGO™!",
          received: true,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // 3. Verify Webhook Authenticity (Headers & Secrets)
    const authCheck = MayarAdapter.verifyWebhookAuthenticity({
      rawBody,
      tokenHeader,
      querySecret,
      signatureHeader,
    });

    if (!authCheck.valid) {
      console.warn(`[Mayar Webhook] Unauthorized webhook attempt: ${authCheck.reason}`);
      return NextResponse.json({ error: "Unauthorized: Invalid webhook secret token" }, { status: 401 });
    }

    // 4. Process Payment Event through PlatformBillingService
    const result = await PlatformBillingService.processWebhookPayment(payload);

    if (!result.processed) {
      console.warn(`[Mayar Webhook] Event not processed: ${result.reason}`);
      return NextResponse.json({ status: "ignored", reason: result.reason }, { status: 200 });
    }

    console.log(`[Mayar Webhook] Successfully processed payment event: ${result.reason}`);
    return NextResponse.json(
      {
        status: "success",
        message: "Webhook processed successfully",
        reason: result.reason,
        reference: result.transaction?.internal_reference,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[Mayar Webhook] Critical processing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
