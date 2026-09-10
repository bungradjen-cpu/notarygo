import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import Link from "next/link";

export default async function SuperadminDashboardPage() {
  const kpis = await SuperadminService.getOverviewMetrics();
  const attentionItems = await SuperadminService.getAttentionItems();
  const transactions = await SuperadminService.getTransactionsList({ status: "ALL" });
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kendali operasional SaaS, metrik pendapatan terverifikasi, dan monitoring tenant aktif NOTARYGO™.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/superadmin/attention"
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Attention Center ({attentionItems.length})</span>
          </Link>

          <Link
            href="/superadmin/transactions"
            className="px-3 py-2 bg-[#0B1F4D] hover:bg-[#07152F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#E89A0C]">payments</span>
            <span>Semua Transaksi</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Revenue This Month */}
        <Link
          href="/superadmin/transactions"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#E89A0C] transition-all group"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1F4D]">
            Revenue Bulan Ini
          </div>
          <div className="text-xl font-extrabold text-[#0B1F4D] mt-1.5 truncate">
            Rp {(kpis.revenueThisMonth || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            <span>Verified Paid</span>
          </div>
        </Link>

        {/* Active Subscriptions */}
        <Link
          href="/superadmin/subscriptions?status=ACTIVE"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all group"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700">
            Langganan Aktif
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1.5">
            {kpis.activeSubscriptionsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Kantor Berlangganan</div>
        </Link>

        {/* New Paying Customers */}
        <Link
          href="/superadmin/organizations"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all group"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-700">
            Pelanggan Berbayar
          </div>
          <div className="text-xl font-extrabold text-blue-700 mt-1.5">
            {kpis.newPayingCustomersThisMonth}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Bulan Berjalan</div>
        </Link>

        {/* Active Offices */}
        <Link
          href="/superadmin/organizations"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#0B1F4D] transition-all group"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1F4D]">
            Kantor Aktif
          </div>
          <div className="text-xl font-extrabold text-[#0B1F4D] mt-1.5">
            {kpis.activeOfficesCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Dari {kpis.totalOrganizationsCount} terdaftar
          </div>
        </Link>

        {/* Renewal Rate */}
        <Link
          href="/superadmin/renewals"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all group"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-700">
            Renewal Rate
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-1.5">
            {kpis.renewalRatePercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Retensi Berlangganan</div>
        </Link>

        {/* Payment Success Rate */}
        <Link
          href="/superadmin/transactions"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all group"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-700">
            Mayar Success
          </div>
          <div className="text-xl font-extrabold text-indigo-600 mt-1.5">
            {kpis.paymentSuccessRatePercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Payment Gateway</div>
        </Link>
      </div>

      {/* Attention Required Banner (if any) */}
      {attentionItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-red-200/80">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-xl">warning</span>
              <h2 className="text-xs font-bold text-red-950 uppercase tracking-wider">
                Attention Required ({attentionItems.length} Masalah Perlu Tindakan)
              </h2>
            </div>
            <Link
              href="/superadmin/attention"
              className="text-[11px] font-bold text-red-700 hover:text-red-900 underline"
            >
              Lihat Detail &amp; Selesaikan &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {attentionItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-lg border border-red-200/70 text-xs shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-800">
                    {item.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.reference}
                  </span>
                </div>
                <div className="font-bold text-[#10213D] truncate">
                  {item.customerName} ({item.customerEmail})
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {item.reason}
                </p>
                <div className="pt-1 text-[10px] text-red-600 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  <span>{item.recommendedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Financial Transactions Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-[#0B1F4D]">
                Transaksi Pembayaran Terbaru
              </h2>
              <p className="text-[11px] text-slate-500">
                Log pembayaran otomatis Mayar &amp; status klaim kantor
              </p>
            </div>
            <Link
              href="/superadmin/transactions"
              className="text-xs font-semibold text-[#0B1F4D] hover:underline"
            >
              Lihat Semua Transaksi &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Referensi</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Paket</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Klaim</th>
                  <th className="py-3 px-5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#0B1F4D]">
                        {tx.internalReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{tx.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tx.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {tx.planCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        Rp {tx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            tx.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : tx.status === "MAYAR_PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            tx.claimStatus === "CLAIMED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {tx.claimStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Belum ada riwayat transaksi tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick System Diagnostics & Unclaimed Watch */}
        <div className="space-y-6">
          {/* Unclaimed Payments Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider">
                Unclaimed Payments
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {kpis.unclaimedPaymentsCount} Pending Klaim
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pelanggan yang sudah membayar di Mayar namun belum membuat kantor atau belum mendaftar dengan email terverifikasi yang sama.
            </p>
            <div className="pt-2">
              <Link
                href="/superadmin/unclaimed-payments"
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Kelola Antrean Klaim</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Quick System Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <h2 className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider">
              Status Infrastruktur Platform
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[17px]">dns</span>
                  <span className="font-semibold text-slate-700">Supabase PostgreSQL</span>
                </div>
                <span className="text-emerald-600 font-bold text-[10px] uppercase">Online</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[17px]">hub</span>
                  <span className="font-semibold text-slate-700">Mayar Payment API</span>
                </div>
                <span className="text-emerald-600 font-bold text-[10px] uppercase">Connected</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[17px]">sync_alt</span>
                  <span className="font-semibold text-slate-700">Webhook Listener</span>
                </div>
                <span className="text-emerald-600 font-bold text-[10px] uppercase">Active</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[17px]">security</span>
                  <span className="font-semibold text-slate-700">Single Admin Auth</span>
                </div>
                <span className="text-emerald-600 font-bold text-[10px] uppercase">Enforced</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/superadmin/system"
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Lihat Diagnostik Lengkap</span>
                <span className="material-symbols-outlined text-[15px]">tune</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
