export default function PaymentProviderSettingsPage() {
  const mayarEnv = process.env.MAYAR_ENVIRONMENT || "sandbox";
  const hasApiKey = !!process.env.MAYAR_API_KEY && !process.env.MAYAR_API_KEY.includes("your-");
  const hasWebhookSecret = !!process.env.MAYAR_WEBHOOK_SECRET && !process.env.MAYAR_WEBHOOK_SECRET.includes("your-");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Pengaturan Payment Provider (Mayar Gateway)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Status konfigurasi payment gateway Mayar dan verifikasi webhook (rahasia sensitif disembunyikan demi keamanan).
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-2xl space-y-4">
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-700">Nama Provider</span>
            <span className="font-bold text-slate-900">Mayar (PT Mayar Solusi Nusantara)</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-700">Lingkungan (Environment)</span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 font-mono">
              {mayarEnv}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-700">API Key</span>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                hasApiKey ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}
            >
              {hasApiKey ? "Terkonfigurasi (Tersimpan Aman)" : "Belum Dikonfigurasi"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-700">Webhook Secret</span>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                hasWebhookSecret ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}
            >
              {hasWebhookSecret ? "Tervalidasi & Aman" : "Belum Dikonfigurasi"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="font-semibold text-slate-700">Endpoint Callback Webhook</span>
            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded">
              /api/webhooks/mayar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
