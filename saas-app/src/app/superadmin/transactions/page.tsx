import { SuperadminService } from "@/lib/superadmin/SuperadminService";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "ALL";

  const transactions = await SuperadminService.getTransactionsList({ search, status });

  const totalAmount = transactions
    .filter((t) => t.status === "PAID" || t.status === "CLAIMED")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Riwayat Transaksi &amp; Pembayaran (Transactions)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data transaksi pembayaran gateway Mayar, nominal terverifikasi, dan status klaim akun kantor.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total Terverifikasi: <strong className="text-emerald-700 font-bold">Rp {totalAmount.toLocaleString("id-ID")}</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
          {[
            { label: "Semua Status", val: "ALL" },
            { label: "Berhasil (PAID)", val: "PAID" },
            { label: "Pending (MAYAR)", val: "MAYAR_PENDING" },
            { label: "Gagal / Expired", val: "FAILED" },
          ].map((tab) => (
            <a
              key={tab.val}
              href={`/superadmin/transactions?status=${tab.val}${search ? `&search=${search}` : ""}`}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                status === tab.val
                  ? "bg-[#0B1F4D] text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        <form method="GET" className="w-full md:w-72">
          <input type="hidden" name="status" value={status} />
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cari NGPAY, nama, email, ID Mayar..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0B1F4D] focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Referensi Transaksi</th>
                <th className="py-3.5 px-4">Nama Customer</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Paket Langganan</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Provider ID</th>
                <th className="py-3.5 px-4">Status Pembayaran</th>
                <th className="py-3.5 px-4">Status Klaim</th>
                <th className="py-3.5 px-5">Waktu Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#0B1F4D]">
                      {tx.internalReference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {tx.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {tx.customerEmail}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {tx.planCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                      {tx.providerPaymentId !== "-" ? tx.providerPaymentId.substring(0, 16) + "..." : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
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
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
