import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export default async function CustomerLifecyclePage() {
  const kpis = await SuperadminService.getOverviewMetrics();
  const txs = await SuperadminService.getTransactionsList();

  const checkoutStarted = txs.length;
  const paidCount = txs.filter((t) => t.status === "PAID" || t.status === "CLAIMED").length;
  const unclaimedCount = kpis.unclaimedPaymentsCount;
  const activatedOffices = kpis.activeOfficesCount;
  const expiringSoon = kpis.expiringSoonCount;

  const stages = [
    {
      title: "1. CHECKOUT STARTED",
      count: checkoutStarted,
      desc: "Transaksi dibuat di sistem pembayaran Mayar",
      color: "border-slate-300 text-slate-700",
    },
    {
      title: "2. PAID (MAYAR SUCCESS)",
      count: paidCount,
      desc: "Pembayaran terverifikasi lunas oleh webhook Mayar",
      color: "border-blue-400 text-blue-800",
    },
    {
      title: "3. PAID UNCLAIMED",
      count: unclaimedCount,
      desc: "Customer sudah bayar, menunggu registrasi akun kantor",
      color: "border-amber-400 text-amber-800",
    },
    {
      title: "4. OFFICE CREATED & ACTIVATED",
      count: activatedOffices,
      desc: "Kantor dibuat dan paket langganan aktif",
      color: "border-emerald-500 text-emerald-800",
    },
    {
      title: "5. EXPIRING SOON (< 7 HARI)",
      count: expiringSoon,
      desc: "Mendekati masa akhir masa berlangganan",
      color: "border-red-400 text-red-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Corong Siklus Hidup Pelanggan (Customer Lifecycle)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tahapan perjalanan pelanggan NOTARYGO™ tanpa trial: dari checkout &rarr; lunas &rarr; aktivasi kantor &rarr; aktif &rarr; renewal.
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <div
            key={stage.title}
            className={`bg-white p-5 rounded-xl border-l-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${stage.color}`}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">{stage.title}</div>
              <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{stage.count}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Volume Entitas</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
