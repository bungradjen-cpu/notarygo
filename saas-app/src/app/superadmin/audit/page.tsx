import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export default async function AuditLogsPage() {
  const sb = (SuperadminService as any).getSupabaseAdmin();
  const { data: logs } = await sb
    .from("platform_admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = logs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Log Audit Platform (Audit Logs)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Catatan audit immutable atas setiap tindakan administratif Superadmin (perpanjangan langganan, rekonsiliasi, dll.).
        </p>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Tindakan (Action)</th>
                <th className="py-3.5 px-4">Tipe Target</th>
                <th className="py-3.5 px-4">ID Target</th>
                <th className="py-3.5 px-4">Alasan &amp; Keterangan</th>
                <th className="py-3.5 px-5">Waktu Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-[#0B1F4D] border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{log.target_type}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                      {log.target_id?.substring(0, 16) || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                      {log.reason || "-"}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Belum ada riwayat audit log platform yang tercatat.
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
