import { PRICING_PLAN_LIST } from "@/config/pricing";

export default function PlansPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Paket Langganan &amp; Entitlement (Plans &amp; Entitlements)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi paket kanonikal resmi NOTARYGO™ dan batasan hak operasional tenant.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 flex items-center gap-2">
        <span className="material-symbols-outlined text-slate-500 text-[18px]">lock</span>
        <span>
          Rencana harga dikunci dalam mode read-only untuk melindungi konsistensi pembayaran Mayar dan mencegah perubahan harga yang tidak disengaja.
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_PLAN_LIST.map((p) => (
          <div
            key={p.code}
            className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between relative ${
              p.popular ? "border-[#E89A0C] ring-1 ring-[#E89A0C]" : "border-slate-200"
            }`}
          >
            {p.badge && (
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E89A0C] text-[#07152F]">
                {p.badge}
              </span>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {p.code}
                </span>
                <h2 className="text-lg font-bold text-[#0B1F4D] mt-0.5">{p.name}</h2>
                <div className="text-2xl font-black text-[#0B1F4D] mt-2">
                  {p.formattedPrice}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ {p.durationLabel}</span>
                </div>
                {p.annualEquivalentPrice && (
                  <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                    {p.annualEquivalentPrice}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">{p.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fitur &amp; Entitlement:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-[15px]">
                        check
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[10px]">Durasi: {p.durationMonths} Bulan</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                AKTIF
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
