"use client";

import { useState } from "react";
import { PricingPlan } from "@/config/pricing";

interface CustomerCheckoutDialogProps {
  isOpen: boolean;
  plan: PricingPlan | null;
  onClose: () => void;
  onProceedToPayment: (paymentUrl: string, transactionId: string, reference: string) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export function CustomerCheckoutDialog({
  isOpen,
  plan,
  onClose,
  onProceedToPayment,
  defaultEmail = "",
  defaultName = "",
}: CustomerCheckoutDialogProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/billing/mayar/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: plan.code,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuat sesi pembayaran Mayar");
      }

      onProceedToPayment(data.paymentUrl, data.transactionId, data.reference);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000613]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-label="Tutup Dialog" />

      <div className="relative z-10 w-full max-w-lg bg-[#001f3f] text-white rounded-3xl border border-[#2f486a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2f486a] bg-[#000613]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fc8f34]/15 border border-[#fc8f34]/30 flex items-center justify-center text-[#fc8f34]">
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Informasi Pemesan &bull; {plan.name}
              </h3>
              <p className="text-xs text-[#afc8f0]">
                Total: <span className="font-bold text-white">{plan.formattedPrice}</span> ({plan.durationLabel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Notice for Pre-Signup Users */}
        <div className="px-6 py-3 bg-[#fc8f34]/10 border-b border-[#fc8f34]/20 flex items-start gap-2.5 text-xs text-[#fc8f34]">
          <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">info</span>
          <p className="leading-relaxed">
            <strong>Penting:</strong> Gunakan email yang sama saat pendaftaran akun NOTARYGO™ nanti agar langganan otomatis aktif.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#001832]/80">
          {error && (
            <div className="rounded-xl bg-red-950/80 p-3.5 border border-red-500/50 text-red-200 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#afc8f0] uppercase tracking-wider">
              Nama Lengkap Notaris / Pemesan
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dr. Budi Santoso, S.H., M.Kn."
              className="w-full rounded-xl border border-[#2f486a] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 bg-[#000613] focus:border-[#fc8f34] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#afc8f0] uppercase tracking-wider">
              Alamat Email (Untuk Aktivasi Akun)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="notaris@kantor.com"
              className="w-full rounded-xl border border-[#2f486a] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 bg-[#000613] focus:border-[#fc8f34] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#afc8f0] uppercase tracking-wider">
              Nomor WhatsApp / HP
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full rounded-xl border border-[#2f486a] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 bg-[#000613] focus:border-[#fc8f34] focus:outline-none"
            />
            <p className="text-[10px] text-gray-400">
              Digunakan oleh sistem Mayar untuk mengirimkan notifikasi kuitansi dan status pembayaran.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#fc8f34] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-[#000613] text-xs sm:text-sm font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#000613] border-t-transparent rounded-full animate-spin" />
                  <span>Menyiapkan Pembayaran Mayar...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan ke Pembayaran ({plan.formattedPrice})</span>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#000613]/90 border-t border-[#2f486a] flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">verified_user</span>
            <span>Gateway Resmi Mayar.id &bull; QRIS / VA / E-Wallet</span>
          </span>
          <span className="text-[#afc8f0]">Enkripsi SSL 256-Bit</span>
        </div>
      </div>
    </div>
  );
}
