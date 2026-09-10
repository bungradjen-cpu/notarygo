import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { PRICING_PLAN_LIST } from "@/config/pricing";

export default async function SaasMetricsPage() {
  const kpis = await SuperadminService.getOverviewMetrics();
  const txs = await SuperadminService.getTransactionsList();

  const paidTxs = txs.filter((t) => t.status === "PAID" || t.status === "CLAIMED");

  // Plan Breakdown
  const planDistribution: Record<string, { count: number; totalRevenue: number }> = {};
  for (const p of PRICING_PLAN_LIST) {
    planDistribution[p.code] = { count: 0, totalRevenue: 0 };
  }

  for (const tx of paidTxs) {
    const code = tx.planCode || "NOTARYGO_MONTHLY";
    if (!planDistribution[code]) {
      planDistribution[code] = { count: 0, totalRevenue: 0 };
    }
    planDistribution[code].count += 1;
    planDistribution[code].totalRevenue += tx.amount;
  }

  const averageOrderValue =
    paidTxs.length > 0 ? Math.round(kpis.revenueThisMonth / paidTxs.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Metrik SaaS &amp; Pertumbuhan (SaaS Metrics)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Laporan finansial authoritative, nilai transaksi rata-rata, dan komposisi paket langganan.
        </p>
      </div>

      {/* Primary Financial Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Authoritative Paid Revenue
          </div>
          <div className="text-2xl font-black text-[#0B1F4D] mt-1 truncate">
            Rp {(kpis.revenueThisMonth || 0).toLocaleString("id-ID")}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Bulan berjalan (Hanya transaksi lunas terverifikasi)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Average Order Value (AOV)
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            Rp {averageOrderValue.toLocaleString("id-ID")}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rata-rata pendapatan per transaksi
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Kantor Terbayar
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {kpis.newPayingCustomersThisMonth} Kantor
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Akun kantor dengan status aktif membayar
          </p>
        </div>
      </div>

      {/* Plan Breakdown Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Distribusi Paket Berlangganan (Plan Breakdown)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRICING_PLAN_LIST.map((plan) => {
            const stats = planDistribution[plan.code] || { count: 0, totalRevenue: 0 };
            return (
              <div key={plan.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{plan.name}</span>
                  <span className="text-[11px] font-bold text-[#0B1F4D]">{plan.formattedPrice}</span>
                </div>
                <div className="text-2xl font-black text-[#0B1F4D]">{stats.count} Pembelian</div>
                <div className="text-xs text-slate-500 font-semibold">
                  Total Nilai: Rp {stats.totalRevenue.toLocaleString("id-ID")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
