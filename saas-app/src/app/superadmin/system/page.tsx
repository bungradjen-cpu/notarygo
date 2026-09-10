import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export default async function SystemHealthPage() {
  const health = await SuperadminService.checkSystemHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Kesehatan Sistem &amp; Infrastruktur (System Health)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Diagnostik konektivitas real-time: Database Supabase, Auth, Storage, Mayar Gateway, dan Webhook Handler.
        </p>
      </div>

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Database */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">Supabase PostgreSQL</span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                health.database?.status === "HEALTHY"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {health.database?.status || "UNKNOWN"}
            </span>
          </div>
          <p className="text-xs text-slate-600">{health.database?.details}</p>
          <div className="text-[11px] font-mono text-slate-400">
            Latency: {health.database?.latencyMs}ms
          </div>
        </div>

        {/* Mayar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">Mayar Payment Gateway</span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                health.mayar?.status === "HEALTHY"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {health.mayar?.status || "UNKNOWN"}
            </span>
          </div>
          <p className="text-xs text-slate-600">{health.mayar?.details}</p>
          <div className="text-[11px] font-mono text-slate-400">API Endpoint: api.mayar.id / sandbox</div>
        </div>

        {/* Webhooks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">Webhook Route &amp; Secrets</span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                health.webhook?.status === "HEALTHY"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {health.webhook?.status || "UNKNOWN"}
            </span>
          </div>
          <p className="text-xs text-slate-600">{health.webhook?.details}</p>
          <div className="text-[11px] font-mono text-slate-400">Security Check: HMAC / Bearer Validated</div>
        </div>
      </div>
    </div>
  );
}
