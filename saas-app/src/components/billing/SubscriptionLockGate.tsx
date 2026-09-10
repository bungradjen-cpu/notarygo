"use client";

import { PricingSection } from "./PricingSection";

interface SubscriptionLockGateProps {
  officeName: string;
  userEmail: string;
}

export function SubscriptionLockGate({
  officeName,
  userEmail,
}: SubscriptionLockGateProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#000613]/90 backdrop-blur-md overflow-y-auto flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 text-white animate-in fade-in duration-300">
      <div className="w-full max-w-5xl my-auto py-8">
        {/* Top Header Card */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Masa Langganan Belum Aktif</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Aktifkan Langganan {officeName}
          </h2>

          <p className="text-xs sm:text-sm text-[#afc8f0] leading-relaxed">
            Akun kantor Anda terdaftar untuk <strong className="text-white">{userEmail}</strong>, namun belum memiliki langganan aktif. Silakan pilih salah satu paket di bawah untuk membuka akses penuh seluruh modul operasional perkara &amp; akta.
          </p>
        </div>

        {/* Pricing Cards Section with Mayar Checkout */}
        <div className="bg-[#001f3f] p-6 sm:p-10 rounded-3xl border border-[#2f486a] shadow-2xl">
          <PricingSection showHeader={false} />
        </div>

        {/* Security & Verification Guarantee */}
        <div className="mt-8 text-center text-xs text-[#8ea8cb] space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
            <span>Aktivasi otomatis instan via Webhook Mayar.id &bull; Enkripsi 256-Bit</span>
          </div>
          <p className="text-[11px] text-[#6f88ad]">
            Setelah pembayaran selesai, akses workspace kantor Anda akan langsung terbuka secara otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
