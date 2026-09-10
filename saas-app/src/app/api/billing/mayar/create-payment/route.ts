import { NextRequest, NextResponse } from "next/server";
import { PlatformBillingService } from "@/lib/billing/PlatformBillingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { planCode, name, email, phone, organizationId, userId } = body;

    if (!planCode) {
      return NextResponse.json(
        { success: false, error: "Kode paket langganan wajib disertakan" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Nama lengkap pemesan wajib diisi (minimal 2 karakter)" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Alamat email pemesan tidak valid" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 9) {
      return NextResponse.json(
        { success: false, error: "Nomor WhatsApp / telepon wajib diisi minimal 10 digit (contoh: 081234567890)" },
        { status: 400 }
      );
    }

    // Server-side canonical resolution (ignores any client-provided amount)
    const result = await PlatformBillingService.createPaymentSession({
      planCode,
      name,
      email,
      phone,
      organizationId: organizationId || null,
      userId: userId || null,
    });

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      reference: result.reference,
      paymentUrl: result.paymentUrl,
      amount: result.amount,
      plan: {
        code: result.plan.code,
        name: result.plan.name,
        formattedPrice: result.plan.formattedPrice,
        durationLabel: result.plan.durationLabel,
      },
    });
  } catch (err: any) {
    console.error("[Create Payment API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal membuat sesi pembayaran Mayar" },
      { status: 500 }
    );
  }
}
