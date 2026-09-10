"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { PricingPlan } from "@/config/pricing";

interface MayarCheckoutModalProps {
  isOpen: boolean;
  plan: PricingPlan | null;
  paymentUrl?: string | null;
  reference?: string | null;
  onClose: () => void;
  onSelectAlternativePlan?: (planId: "MONTHLY") => void;
}

export function MayarCheckoutModal({
  isOpen,
  plan,
  paymentUrl,
  reference,
  onClose,
  onSelectAlternativePlan,
}: MayarCheckoutModalProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset loading state when plan or paymentUrl changes
  useEffect(() => {
    if (isOpen) {
      setIframeLoading(true);
    }
  }, [isOpen, plan, paymentUrl]);

  if (!isOpen || !plan) return null;

  const activeUrl = paymentUrl || plan.mayarEmbedUrl || "";
  const hasMayarUrl = Boolean(activeUrl && activeUrl.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#000613]/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Tutup Dialog Pembayaran"
      />

      {/* Modal Container: Set h-[100dvh] on mobile and fixed height on desktop with internal scrolling */}
      <div className="relative z-10 w-full h-[100dvh] sm:h-[90vh] sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col border border-[#2f486a]/30 overflow-hidden">
        {/* Modal Top Header (Fixed top) */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-[#001f3f] text-white border-b border-[#2f486a] shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#fc8f34] shrink-0">
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white tracking-wide">
                  Checkout — {plan.name}
                </h3>
                {reference && (
                  <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#afc8f0]">
                    {reference}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#afc8f0]">
                Total: <span className="font-semibold text-white">{plan.formattedPrice}</span> ({plan.durationLabel})
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {hasMayarUrl && (
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#fc8f34] hover:bg-[#f97316] text-[#000613] text-[11px] sm:text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Buka halaman checkout langsung di Mayar.id"
              >
                <span>Buka di Tab Baru</span>
                <span className="material-symbols-outlined text-[14px] sm:text-[15px]">open_in_new</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold transition-colors focus:outline-none"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">close</span>
              <span className="hidden sm:inline">Tutup</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Fully scrollable container with touch-action-auto and overflow-y-auto */}
        <div className="relative flex-1 w-full bg-[#f8f9fa] flex flex-col overflow-y-auto overflow-x-hidden -webkit-overflow-scrolling-touch">
          {hasMayarUrl ? (
            <div className="relative w-full flex-1 flex flex-col min-h-[600px] sm:min-h-[750px]">
              {/* Embed Script */}
              <Script
                src="https://mayarembed.r2.mayar.id/mayarEmbed.min.js"
                strategy="lazyOnload"
              />

              {/* Loading Spinner Indicator */}
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 gap-3">
                  <div className="w-10 h-10 border-3 border-[#001f3f] border-t-[#fc8f34] rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-600 font-medium animate-pulse">
                    Memuat formulir pembayaran aman Mayar...
                  </p>
                </div>
              )}

              {/* Responsive Mayar Iframe with full height & scrolling enabled */}
              <iframe
                src={activeUrl}
                allowFullScreen
                allow="payment"
                scrolling="yes"
                frameBorder="0"
                width="100%"
                height="100%"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "680px",
                  border: "none",
                  display: "block",
                }}
                className="w-full flex-1 border-0"
                data-hide-merchant-logo="true"
                onLoad={() => setIframeLoading(false)}
                title={`Mayar Checkout ${plan.name}`}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
                <span className="material-symbols-outlined text-3xl">hourglass_top</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                Tautan Pembayaran Sedang Disiapkan
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
                Tautan checkout Mayar untuk <strong className="text-gray-900">{plan.name} ({plan.formattedPrice})</strong> sedang dalam proses sinkronisasi gateway. Anda dapat memilih <strong>Paket 1 Bulan</strong> yang sudah aktif atau hubungi admin kami.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {onSelectAlternativePlan && (
                  <button
                    onClick={() => onSelectAlternativePlan("MONTHLY")}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#001f3f] hover:bg-[#000613] text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">check_circle</span>
                    <span>Pilih Paket 1 Bulan (Rp 129.000)</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors"
                >
                  Kembali ke Daftar Paket
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security & Verification Notice Footer (Fixed bottom) */}
        <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-1 text-[11px] text-gray-500 shrink-0 z-20">
          <div className="flex items-center gap-1.5 text-gray-600 truncate">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0">lock</span>
            <span className="truncate">Enkripsi 256-Bit &bull; Terverifikasi Mayar.id</span>
          </div>
          {hasMayarUrl && (
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#001f3f] font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Buka situs Mayar</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
