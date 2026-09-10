export type PlanTier = "MONTHLY" | "QUARTERLY" | "ANNUAL";
export type CanonicalPlanCode = "NOTARYGO_MONTHLY" | "NOTARYGO_QUARTERLY" | "NOTARYGO_ANNUAL";

export interface PricingPlan {
  id: PlanTier;
  code: CanonicalPlanCode;
  name: string;
  durationLabel: string;
  durationMonths: number;
  price: number;
  formattedPrice: string;
  annualEquivalentPrice?: string;
  billingText: string;
  ctaText: string;
  popular?: boolean;
  badge?: string;
  description: string;
  mayarEmbedUrl?: string;
  features: string[];
}

export const MAIN_MAYAR_PAYMENT_URL =
  process.env.NEXT_PUBLIC_MAYAR_MAIN_URL || "https://notarygo.myr.id/m/notarygotm";

export const CANONICAL_PLANS: Record<CanonicalPlanCode, PricingPlan> = {
  NOTARYGO_MONTHLY: {
    id: "MONTHLY",
    code: "NOTARYGO_MONTHLY",
    name: "Paket 1 Bulan",
    durationLabel: "1 Bulan",
    durationMonths: 1,
    price: 129000,
    formattedPrice: "Rp 129.000",
    billingText: "Ditagihkan setiap bulan",
    ctaText: "Pilih 1 Bulan",
    description: "Solusi fleksibel untuk kantor Notaris & PPAT yang ingin akses operasional bulanan penuh.",
    mayarEmbedUrl:
      process.env.NEXT_PUBLIC_MAYAR_PLAN_MONTHLY_URL ||
      "https://notarygo.myr.id/pl/notarygo-akses-1-bulan",
    features: [
      "Register Perkara & Berkas Akta Tanpa Batas",
      "Checklist Dokumen Kelengkapan Para Pihak",
      "Jadwal Penandatanganan (Signing Readiness)",
      "Document Center & Generator PDF",
      "Invoicing Honorarium & Kuitansi Resmi",
      "Akses Kolaborasi Tim Staf & Supervisor",
      "Notifikasi & Daily Brief Kantor",
    ],
  },
  NOTARYGO_QUARTERLY: {
    id: "QUARTERLY",
    code: "NOTARYGO_QUARTERLY",
    name: "Paket 3 Bulan",
    durationLabel: "3 Bulan",
    durationMonths: 3,
    price: 249000,
    formattedPrice: "Rp 249.000",
    billingText: "Ditagihkan per 3 bulan (Hemat 35%)",
    ctaText: "Pilih 3 Bulan",
    description: "Pilihan hemat kuartalan untuk stabilitas operasional dan kendali berkas kantor Notaris.",
    mayarEmbedUrl:
      process.env.NEXT_PUBLIC_MAYAR_PLAN_QUARTERLY_URL ||
      "https://notarygo.myr.id/pl/notarygo-akses-3-bulan",
    features: [
      "Semua fitur lengkap Paket 1 Bulan",
      "Cadangan Otomatis Database & File Drive",
      "Audit Trail & Riwayat Aktivitas Lengkap",
      "Monitoring Beban Kerja Staf (Workload)",
      "Sinkronisasi Kalender Penandatanganan Akta",
      "Dukungan Teknis Prioritas",
    ],
  },
  NOTARYGO_ANNUAL: {
    id: "ANNUAL",
    code: "NOTARYGO_ANNUAL",
    name: "Paket 1 Tahun",
    durationLabel: "1 Tahun",
    durationMonths: 12,
    price: 499000,
    formattedPrice: "Rp 499.000",
    annualEquivalentPrice: "± Rp 41.500/bulan",
    billingText: "Ditagihkan Rp 499.000 per tahun (Hemat 68%)",
    ctaText: "Pilih 1 Tahun",
    popular: true,
    badge: "Paling Hemat & Populer",
    description: "Solusi terbaik untuk kantor Notaris & PPAT dengan efisiensi biaya maksimal sepanjang tahun.",
    mayarEmbedUrl:
      process.env.NEXT_PUBLIC_MAYAR_PLAN_ANNUAL_URL ||
      "https://notarygo.myr.id/pl/notarygo-akses-1-tahun",
    features: [
      "Semua fitur lengkap NOTARYGO™ Enterprise",
      "Tarif Terbaik (Setara ± Rp 41.500/bulan)",
      "Akses Tanpa Batas Seluruh Modul Operasional",
      "Custom Branding Nama Notaris & Kop Kantor",
      "Penyimpanan Dokumen Terenkripsi Aman",
      "Bimbingan & Onboarding Prioritas",
      "Garansi Akses 365 Hari Penuh",
    ],
  },
};

export const PRICING_PLANS: Record<PlanTier, PricingPlan> = {
  MONTHLY: CANONICAL_PLANS.NOTARYGO_MONTHLY,
  QUARTERLY: CANONICAL_PLANS.NOTARYGO_QUARTERLY,
  ANNUAL: CANONICAL_PLANS.NOTARYGO_ANNUAL,
};

export const PRICING_PLAN_LIST: PricingPlan[] = [
  PRICING_PLANS.MONTHLY,
  PRICING_PLANS.QUARTERLY,
  PRICING_PLANS.ANNUAL,
];

/**
 * Resolves a plan canonical code safely from any input string.
 * Supports: 'NOTARYGO_MONTHLY', 'MONTHLY', '1 BULAN', etc.
 */
export function resolveCanonicalPlan(input?: string | null): PricingPlan | null {
  if (!input) return null;
  const cleaned = input.toUpperCase().trim();
  if (cleaned in CANONICAL_PLANS) {
    return CANONICAL_PLANS[cleaned as CanonicalPlanCode];
  }
  if (cleaned in PRICING_PLANS) {
    return PRICING_PLANS[cleaned as PlanTier];
  }
  if (cleaned.includes("ANNUAL") || cleaned.includes("TAHUN") || cleaned.includes("YEAR") || cleaned.includes("499")) {
    return CANONICAL_PLANS.NOTARYGO_ANNUAL;
  }
  if (cleaned.includes("QUARTER") || cleaned.includes("3 BULAN") || cleaned.includes("249")) {
    return CANONICAL_PLANS.NOTARYGO_QUARTERLY;
  }
  if (cleaned.includes("MONTH") || cleaned.includes("1 BULAN") || cleaned.includes("129")) {
    return CANONICAL_PLANS.NOTARYGO_MONTHLY;
  }
  return null;
}
