import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import Link from "next/link";

export default async function CustomerHealthPage() {
  const { organizations } = await SuperadminService.getOrganizationsList({ limit: 100 });

  const healthy = organizations.filter((o) => o.healthStatus === "HEALTHY");
  const watch = organizations.filter((o) => o.healthStatus === "WATCH");
  const atRisk = organizations.filter((o) => o.healthStatus === "AT_RISK");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Kesehatan Pelanggan (Customer Health)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indikator status retensi berbasis aturan transparan (masa aktif langganan, pembuatan akta perkara, dan keaktifan tim).
          </p>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-500">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Kondisi Sehat (Healthy)
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {healthy.length} Kantor
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Langganan aktif &gt; 14 hari, operasional berjalan normal
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Perlu Perhatian (Watch)
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {watch.length} Kantor
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Langganan berakhir dalam 4 - 14 hari kedepan
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-red-500">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Risiko Berhenti (At Risk)
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">
            {atRisk.length} Kantor
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Expired atau berakhir dalam &le; 3 hari
          </div>
        </div>
      </div>

      {/* Organizations Health Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daftar Skor Kesehatan Kantor
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Kantor Notaris</th>
                <th className="py-3.5 px-4">Notaris</th>
                <th className="py-3.5 px-4">Status Langganan</th>
                <th className="py-3.5 px-4">Sisa Hari</th>
                <th className="py-3.5 px-4">Jumlah Perkara</th>
                <th className="py-3.5 px-4">Health Status</th>
                <th className="py-3.5 px-5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">
                    {org.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{org.notaryName}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {org.subscriptionStatus}
                  </td>
                  <td className="py-3.5 px-4">
                    {org.daysRemaining !== null ? `${org.daysRemaining} Hari` : "-"}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {org.mattersCount} Berkas
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        org.healthStatus === "HEALTHY"
                          ? "bg-emerald-100 text-emerald-800"
                          : org.healthStatus === "WATCH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {org.healthStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/superadmin/renewals`}
                      className="text-xs font-semibold text-[#0B1F4D] hover:underline"
                    >
                      Buka CRM &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
