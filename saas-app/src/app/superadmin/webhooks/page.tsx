import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export default async function WebhooksPage() {
  const sb = await (SuperadminService as any).getSupabaseAdmin();
  const { data: webhooks } = await sb
    .from("provider_webhook_events")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(50);

  const list = webhooks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Riwayat Event Webhook (Webhook Events)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log penerimaan event callback dari Mayar Payment Gateway secara idempotent dan tersanitasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Endpoint: /api/webhooks/mayar (Aktif)</span>
          </span>
        </div>
      </div>

      {/* Webhooks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Provider &amp; Event ID</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Payment ID Provider</th>
                <th className="py-3.5 px-4">Status Pemrosesan</th>
                <th className="py-3.5 px-4">Retry Count</th>
                <th className="py-3.5 px-5">Waktu Diterima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-[#0B1F4D]">
                      {item.provider} &bull; {item.provider_event_id || item.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.event_type || "payment.success"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {item.provider_payment_id || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          item.status === "PROCESSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "DUPLICATE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.retry_count || 0}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(item.received_at).toLocaleDateString("id-ID", {
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada riwayat webhook tercatat di tabel log.
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
