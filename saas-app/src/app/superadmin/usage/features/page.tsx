export default async function FeatureUsagePage() {
  const modules = [
    { name: "Register Perkara & Berkas Akta", code: "MATTERS", adoption: "Tinggi", activeUsage: "95% Kantor" },
    { name: "Checklist Kelengkapan Para Pihak", code: "CHECKLISTS", adoption: "Tinggi", activeUsage: "88% Kantor" },
    { name: "Jadwal Signing Readiness", code: "SIGNING", adoption: "Sedang", activeUsage: "64% Kantor" },
    { name: "Document Center & Generator PDF", code: "DOCUMENTS", adoption: "Tinggi", activeUsage: "91% Kantor" },
    { name: "Invoicing Honorarium & Kuitansi", code: "BILLING", adoption: "Sedang", activeUsage: "52% Kantor" },
    { name: "Daily Brief & Task Delegation", code: "TASKS", adoption: "Sedang", activeUsage: "58% Kantor" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Adopsi Fitur Operasional (Feature Usage)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Penetrasi fitur harian kantor notaris dalam platform NOTARYGO™.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {modules.map((m) => (
            <div key={m.code} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-sm font-bold text-[#10213D]">{m.name}</div>
                <div className="text-[11px] font-mono text-slate-400">Modul: {m.code}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#0B1F4D]">{m.activeUsage}</div>
                <span className="text-[10px] font-bold uppercase text-emerald-600">Adopsi {m.adoption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
