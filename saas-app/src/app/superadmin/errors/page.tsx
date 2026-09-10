import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export default async function ErrorsPage() {
  const sb = await (SuperadminService as any).getSupabaseAdmin();
  const { data: incidents } = await sb
    .from("system_incidents")
    .select("*")
    .order("detected_at", { ascending: false });

  const list = incidents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Insiden &amp; Log Error Tersanitasi (Errors &amp; Incidents)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pencatatan gangguan teknis tanpa mengekspos token otorisasi, rahasia gateway, maupun data rahasia akta.
        </p>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Layanan</th>
                <th className="py-3.5 px-4">Keparahan</th>
                <th className="py-3.5 px-4">Pesan Error (Tersanitasi)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5">Waktu Terdeteksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">{inc.service}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          inc.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 max-w-md truncate">
                      {inc.message_sanitized}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700">
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                      {new Date(inc.detected_at).toLocaleDateString("id-ID", {
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
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada insiden teknis atau error sistem yang tercatat. Sistem berjalan stabil.
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
