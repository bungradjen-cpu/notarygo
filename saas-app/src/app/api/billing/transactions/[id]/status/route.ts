import { NextRequest, NextResponse } from "next/server";
import { PlatformBillingService } from "@/lib/billing/PlatformBillingService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing transaction id or reference" }, { status: 400 });
    }

    const tx = await PlatformBillingService.getTransaction(id);

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Return safe data without exposing secret provider details or credentials
    return NextResponse.json({
      success: true,
      transactionId: tx.id,
      reference: tx.internal_reference,
      planCode: tx.plan_code,
      customerEmail: tx.normalized_email,
      customerName: tx.customer_name,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      createdAt: tx.created_at,
      paidAt: tx.paid_at || null,
      claimedAt: tx.claimed_at || null,
      isClaimed: tx.status === "CLAIMED",
      hasOrg: Boolean(tx.organization_id),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
