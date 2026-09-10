import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import Link from "next/link";

export default async function UsagePage() {
  const sb = await (SuperadminService as any).getSupabaseAdmin();

  const [
    { count: totalMatters },
    { count: totalClients },
    { count: totalDocuments },
    { count: totalTasks },
    { count: totalInvoices },
  ] = await Promise.all([
    sb.from("matters").select("*", { count: "exact", head: true }),
    sb.from("clients").select("*", { count: "exact", head: true }),
    sb.from("documents").select("*", { count: "exact", head: true }),
    sb.from("tasks").select("*", { count: "exact", head: true }),
    sb.from("invoices").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Perkara / Akta Dibuat", count: totalMatters || 0, icon: "work" },
    { label: "Klien Terdaftar", count: totalClients || 0, icon: "group" },
    { label: "Dokumen & Berkas", count: totalDocuments || 0, icon: "description" },
    { label: "Tugas Operasional", count: totalTasks || 0, icon: "task_alt" },
    { label: "Kuitansi & Tagihan Kantor", count: totalInvoices || 0, icon: "receipt_long" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Penggunaan Produk &amp; Adopsi (Usage &amp; Adoption)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Volume operasional riil seluruh kantor notaris di platform (agregasi tanpa membuka isi privat akta).
          </p>
        </div>

        <Link
          href="/superadmin/usage/features"
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
        >
          <span>Adopsi Fitur Detail</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>

      {/* Grid of Usage Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="material-symbols-outlined text-2xl text-[#0B1F4D]">{s.icon}</span>
            </div>
            <div className="text-2xl font-black text-[#0B1F4D]">{s.count.toLocaleString("id-ID")}</div>
            <div className="text-xs font-semibold text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
