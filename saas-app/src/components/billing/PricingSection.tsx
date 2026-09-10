"use client";

import { useState } from "react";
import { MAIN_MAYAR_PAYMENT_URL, PRICING_PLAN_LIST, PRICING_PLANS, PricingPlan } from "@/config/pricing";
import { MayarCheckoutModal } from "./MayarCheckoutModal";
import { CustomerCheckoutDialog } from "./CustomerCheckoutDialog";

interface PricingSectionProps {
  showHeader?: boolean;
  className?: string;
  defaultEmail?: string;
  defaultName?: string;
}

export function PricingSection({
  showHeader = true,
  className = "",
  defaultEmail = "",
  defaultName = "",
}: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isMayarModalOpen, setIsMayarModalOpen] = useState(false);
  const [activePaymentUrl, setActivePaymentUrl] = useState<string | null>(null);
  const [activeReference, setActiveReference] = useState<string | null>(null);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsCustomerDialogOpen(true);
  };

  const handleProceedToPayment = (paymentUrl: string, transactionId: string, reference: string) => {
    setIsCustomerDialogOpen(false);
    setActivePaymentUrl(paymentUrl);
    setActiveReference(reference);
    setIsMayarModalOpen(true);
  };

  const handleSelectAlternative = (planId: "MONTHLY") => {
    setSelectedPlan(PRICING_PLANS[planId]);
    setIsCustomerDialogOpen(true);
  };

  return (
    <section className={`w-full max-w-full overflow-hidden min-w-0 box-border ${className}`}>
      {showHeader && (
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fc8f34]/10 border border-[#fc8f34]/30 text-[#944a00] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
            <span className="w-2 h-2 rounded-full bg-[#fc8f34] animate-ping" />
            Paket Berlangganan Fleksibel
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#001f3f] tracking-tight">
            Pilih Paket Terbaik untuk Kantor Notaris &amp; PPAT Anda
          </h2>
          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Semua paket menyertakan fitur inti sistem operasional perkara akta, checklist dokumen para pihak, invoicing otomatis, dan integrasi Mayar.
          </p>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto items-stretch">
        {PRICING_PLAN_LIST.map((plan) => {
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all duration-300 ${
                isPopular
                  ? "bg-[#001f3f] text-white shadow-2xl ring-2 ring-[#fc8f34] md:-translate-y-2 order-first md:order-none"
                  : "bg-white text-gray-900 shadow-lg hover:shadow-xl border border-gray-200"
              }`}
            >
              {/* Top Badge for Popular Plan */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#fc8f34] to-[#f97316] text-[#000613] text-[10px] sm:text-xs font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[13px] sm:text-[14px]">star</span>
                  <span>{plan.badge || "Paling Hemat & Populer"}</span>
                </div>
              )}

              <div>
                {/* Plan Title & Description */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3
                    className={`text-lg sm:text-xl font-bold tracking-tight ${
                      isPopular ? "text-white" : "text-[#001f3f]"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${
                      isPopular
                        ? "bg-white/10 text-[#afc8f0]"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {plan.durationLabel}
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed mb-5 ${
                    isPopular ? "text-[#afc8f0]" : "text-gray-500"
                  }`}
                >
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-5 pb-5 border-b border-gray-200/40">
                  {plan.annualEquivalentPrice ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-3xl sm:text-4xl font-black tracking-tight ${
                            isPopular ? "text-white" : "text-[#001f3f]"
                          }`}
                        >
                          {plan.formattedPrice}
                        </span>
                        <span
                          className={`text-xs ${
                            isPopular ? "text-[#afc8f0]" : "text-gray-500"
                          }`}
                        >
                          / {plan.durationLabel}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#fc8f34] bg-[#fc8f34]/15 px-2 py-0.5 rounded border border-[#fc8f34]/30">
                          Setara {plan.annualEquivalentPrice}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-1.5 ${
                          isPopular ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {plan.billingText}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-3xl sm:text-4xl font-black tracking-tight ${
                            isPopular ? "text-white" : "text-[#001f3f]"
                          }`}
                        >
                          {plan.formattedPrice}
                        </span>
                        <span
                          className={`text-xs ${
                            isPopular ? "text-[#afc8f0]" : "text-gray-500"
                          }`}
                        >
                          / {plan.durationLabel}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-1.5 ${
                          isPopular ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {plan.billingText}
                      </p>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isPopular ? "text-[#fc8f34]" : "text-gray-800"
                    }`}
                  >
                    Fitur Unggulan Termasuk:
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                        <span
                          className={`material-symbols-outlined text-[17px] shrink-0 mt-0.5 ${
                            isPopular ? "text-[#fc8f34]" : "text-emerald-600"
                          }`}
                        >
                          check_circle
                        </span>
                        <span
                          className={
                            isPopular ? "text-gray-200" : "text-gray-700"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.99] ${
                    isPopular
                      ? "bg-[#fc8f34] hover:bg-[#f97316] text-[#000613] hover:shadow-lg"
                      : "bg-[#001f3f] hover:bg-[#000613] text-white hover:shadow-lg"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Payment Link to Mayar Portal */}
      <div className="mt-8 sm:mt-12 text-center">
        <a
          href={MAIN_MAYAR_PAYMENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#2f486a]/30 text-[#001f3f] text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all group"
        >
          <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">verified_user</span>
          <span>Buka Portal Pembayaran Utama NOTARYGO™ di Mayar.id</span>
          <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:translate-x-0.5 transition-transform">open_in_new</span>
        </a>
      </div>

      {/* Step 1: Customer Details Input Dialog */}
      <CustomerCheckoutDialog
        isOpen={isCustomerDialogOpen}
        plan={selectedPlan}
        defaultEmail={defaultEmail}
        defaultName={defaultName}
        onClose={() => setIsCustomerDialogOpen(false)}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Step 2: Mayar Responsive Embed Modal with Server Generated Link */}
      <MayarCheckoutModal
        isOpen={isMayarModalOpen}
        plan={selectedPlan}
        paymentUrl={activePaymentUrl}
        reference={activeReference}
        onClose={() => setIsMayarModalOpen(false)}
        onSelectAlternativePlan={handleSelectAlternative}
      />
    </section>
  );
}
