"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface TransactionStatusData {
  success: boolean;
  transactionId: string;
  reference: string;
  planCode: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  status: "CREATED" | "MAYAR_PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "CLAIMED";
  createdAt: string;
  paidAt?: string | null;
  claimedAt?: string | null;
  isClaimed: boolean;
  hasOrg: boolean;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const txId = searchParams.get("txId") || searchParams.get("transactionId") || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TransactionStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!txId) {
      setError("Parameter transaksi (txId) tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/billing/transactions/${txId}/status`);
      if (!res.ok) {
        throw new Error("Data transaksi pembayaran tidak ditemukan.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Gagal memverifikasi status pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto-poll status while in PENDING state
    const interval = setInterval(() => {
      if (data && (data.status === "MAYAR_PENDING" || data.status === "CREATED")) {
        fetchStatus();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [txId, data?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000613] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#001f3f] border-t-[#fc8f34] rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#afc8f0] animate-pulse">Memeriksa status pembayaran dari gateway...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#000613] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#001f3f] border border-red-500/40 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-950/80 text-red-400 mx-auto flex items-center justify-center mb-4 border border-red-500/40">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pemeriksaan Gagal</h2>
          <p className="text-xs text-red-200 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fc8f34] text-[#000613] font-bold text-xs hover:bg-[#f97316] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = data.status === "PAID" || data.status === "CLAIMED";
  const isPending = data.status === "MAYAR_PENDING" || data.status === "CREATED";

  return (
    <div className="min-h-screen bg-[#000613] text-white flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#fc8f34]/20 selection:text-white">
      <div className="w-full max-w-xl bg-[#001f3f] border border-[#2f486a] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Header Branding */}
        <div className="px-6 py-6 border-b border-[#2f486a] bg-[#000613]/70 text-center flex flex-col items-center">
          <Link href="/" className="py-1">
            <img src="/logo-transparent-light.png" alt="NOTARYGO™" className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-xs text-[#afc8f0] mt-2 font-medium">
            Notary Office Operational Control System
          </p>
        </div>

        {/* Status Badge & Content */}
        <div className="p-6 sm:p-8 space-y-6 bg-[#001832]/80">
          <div className="text-center space-y-3">
            {isPaid ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pembayaran Berhasil Diverifikasi</span>
              </div>
            ) : isPending ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Menunggu Pembayaran / Verifikasi</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>Status: {data.status}</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isPaid
                ? "Pembayaran NOTARYGO™ Berhasil"
                : isPending
                ? "Menunggu Konfirmasi Mayar"
                : "Pembayaran Tidak Berhasil"}
            </h1>

            <p className="text-xs sm:text-sm text-[#afc8f0] max-w-md mx-auto leading-relaxed">
              {isPaid
                ? "Transaksi Anda telah terekam secara aman. Silakan ikuti petunjuk di bawah untuk mengaktifkan akses workspace kantor Notaris Anda."
                : isPending
                ? "Jika Anda telah mentransfer via QRIS/VA, halaman ini akan otomatis diperbarui begitu webhook Mayar diterima."
                : "Transaksi dibatalkan atau telah kedaluwarsa. Silakan lakukan pemesanan ulang."}
            </p>
          </div>

          {/* Details Card */}
          <div className="rounded-2xl bg-[#000613]/60 border border-[#2f486a] p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#afc8f0]">No. Referensi Transaksi</span>
              <span className="font-mono font-bold text-white text-xs">{data.reference}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#afc8f0]">Nama Pemesan</span>
              <span className="font-semibold text-white">{data.customerName}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#afc8f0]">Email Pembayaran</span>
              <span className="font-semibold text-[#fc8f34]">{data.customerEmail}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#afc8f0]">Paket Layanan</span>
              <span className="font-semibold text-white">{data.planCode}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#afc8f0]">Total Pembayaran</span>
              <span className="font-extrabold text-white text-sm">
                Rp {Number(data.amount).toLocaleString("id-ID")}
              </span>
            </div>
            {data.paidAt && (
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[#afc8f0]">Waktu Pembayaran</span>
                <span className="font-medium text-emerald-400">
                  {new Date(data.paidAt).toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {isPaid ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#fc8f34]/15 border border-[#fc8f34]/30 p-4 text-xs text-[#fc8f34] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">verified</span>
                  <div>
                    <p className="font-bold text-white mb-0.5">Langkah Selanjutnya:</p>
                    <p className="leading-relaxed">
                      Daftarkan atau masuk ke akun NOTARYGO™ menggunakan email yang sama:{" "}
                      <strong className="text-white underline">{data.customerEmail}</strong>. Sistem akan
                      otomatis mengklaim langganan dan membuka kantor Anda.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/auth/signup?email=${encodeURIComponent(data.customerEmail)}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#fc8f34] to-[#f97316] hover:from-[#f97316] text-[#000613] font-black text-xs sm:text-sm tracking-wide uppercase shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>Buat Akun NOTARYGO™ Sekarang</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>

                <div className="text-center">
                  <Link
                    href={`/auth/login?email=${encodeURIComponent(data.customerEmail)}`}
                    className="text-xs text-[#afc8f0] hover:text-white underline transition-colors"
                  >
                    Sudah memiliki akun? Masuk ke sini
                  </Link>
                </div>
              </div>
            ) : isPending ? (
              <div className="space-y-3">
                <button
                  onClick={fetchStatus}
                  className="w-full py-3 px-4 rounded-xl bg-[#001f3f] hover:bg-[#000613] border border-[#2f486a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#fc8f34]">refresh</span>
                  <span>Cek Status Pembayaran Lagi</span>
                </button>
                <Link
                  href="/"
                  className="block text-center text-xs text-[#afc8f0] hover:text-white underline"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            ) : (
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-[#fc8f34] text-[#000613] font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Pilih Ulang Paket Langganan</span>
              </Link>
            )}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3 bg-[#000613]/90 border-t border-[#2f486a] flex items-center justify-between text-[11px] text-gray-400">
          <span>Gateway Resmi Mayar.id &bull; Enkripsi SSL 256-Bit</span>
          <span>Bantuan: support@notarygo.id</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000613] text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-[#fc8f34] rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
