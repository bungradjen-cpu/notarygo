export function ComparisonTable() {
  const rows = [
    { feature: "Dashboard Operasional & Exception Alert", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "My Work & Task Management Staf", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Register Perkara & Berkas Akta Tanpa Batas", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Workflow 9-Tahap Akta & Monitoring PIC", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Checklist Kelengkapan Dokumen Para Pihak", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Document Center & Version Control PDF", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Signing Readiness & Validasi Saksi/Penghadap", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Invoicing Honorarium & Cetak Kuitansi Resmi", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Akses Penuh Multi-Device (Desktop & Mobile)", m1: "✓", m3: "✓", m12: "✓" },
    { feature: "Role-Based Access (Owner, Supervisor, Staf, Finance)", m1: "✓", m3: "✓", m12: "✓" },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden min-w-0 box-border">
      {/* Mobile Swipe Cue */}
      <div className="md:hidden flex items-center justify-center gap-1.5 text-xs text-gray-600 mb-3 bg-gray-100/90 py-1.5 px-3.5 rounded-full w-fit mx-auto border border-gray-200 shadow-2xs">
        <span className="material-symbols-outlined text-[16px] text-[#fc8f34]">swipe</span>
        <span>Geser tabel ke samping untuk melihat semua paket</span>
        <span className="material-symbols-outlined text-[16px] text-gray-400">arrow_forward</span>
      </div>

      <div className="w-full max-w-full overflow-x-auto rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-xl scroll-smooth min-w-0 box-border">
        <table className="w-full min-w-[540px] text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/90">
              <th className="p-3.5 sm:p-6 font-extrabold text-[#001f3f] w-[40%]">
                Fitur Sistem
              </th>
              <th className="p-3.5 sm:p-6 font-bold text-gray-700 text-center w-[20%]">
                Paket 1 Bulan
              </th>
              <th className="p-3.5 sm:p-6 font-bold text-gray-700 text-center w-[20%]">
                Paket 3 Bulan
              </th>
              <th className="p-3.5 sm:p-6 font-extrabold text-[#fc8f34] text-center w-[20%] bg-[#001f3f] text-white">
                <div className="inline-block px-2 py-0.5 rounded-full bg-[#fc8f34] text-[#000613] text-[9px] sm:text-[10px] font-extrabold uppercase mb-1">
                  BEST VALUE
                </div>
                <div>Paket 1 Tahun</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="bg-gray-50/40 font-semibold">
              <td className="p-3.5 sm:p-5 text-gray-900 font-bold">Harga Ditagihkan</td>
              <td className="p-3.5 sm:p-5 text-center text-gray-900 font-extrabold">Rp 129.000</td>
              <td className="p-3.5 sm:p-5 text-center text-gray-900 font-extrabold">Rp 249.000</td>
              <td className="p-3.5 sm:p-5 text-center text-emerald-700 font-extrabold bg-[#001f3f]/5">
                Rp 499.000
              </td>
            </tr>
            <tr className="bg-gray-50/20 font-medium">
              <td className="p-3.5 sm:p-5 text-gray-600">Durasi Akses</td>
              <td className="p-3.5 sm:p-5 text-center text-gray-600">1 Bulan</td>
              <td className="p-3.5 sm:p-5 text-center text-gray-600">3 Bulan</td>
              <td className="p-3.5 sm:p-5 text-center font-bold text-[#001f3f] bg-[#001f3f]/5">
                12 Bulan Penuh
              </td>
            </tr>
            <tr className="bg-amber-50/30">
              <td className="p-3.5 sm:p-5 text-gray-900 font-semibold">Biaya Ekuivalen / Bulan</td>
              <td className="p-3.5 sm:p-5 text-center text-gray-700">Rp 129.000 / bln</td>
              <td className="p-3.5 sm:p-5 text-center text-amber-800 font-semibold">
                Rp 83.000 / bln <span className="text-[10px] block text-emerald-600 font-bold">(Hemat 35%)</span>
              </td>
              <td className="p-3.5 sm:p-5 text-center text-emerald-700 font-extrabold bg-[#001f3f]/5">
                ± Rp 41.500 / bln <span className="text-[10px] block text-emerald-600 font-extrabold">(Hemat 68%)</span>
              </td>
            </tr>

            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-3.5 sm:p-5 text-gray-800">{row.feature}</td>
                <td className="p-3.5 sm:p-5 text-center text-emerald-600 font-bold">{row.m1}</td>
                <td className="p-3.5 sm:p-5 text-center text-emerald-600 font-bold">{row.m3}</td>
                <td className="p-3.5 sm:p-5 text-center text-emerald-700 font-extrabold bg-[#001f3f]/5">
                  {row.m12}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
