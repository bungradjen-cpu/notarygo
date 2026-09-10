export function DashboardPreviewMockup() {
  return (
    <div className="w-full max-w-full rounded-2xl sm:rounded-3xl border border-[#2f486a] bg-[#001f3f] text-white shadow-2xl overflow-hidden text-left min-w-0 box-border">
      {/* Browser Bar Header */}
      <div className="w-full max-w-full flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-[#000613] border-b border-[#2f486a]/60 box-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 sm:ml-3 text-[10px] sm:text-[11px] text-[#6f88ad] font-mono truncate max-w-[160px] sm:max-w-none">
            app.notarygo.id/dashboard/control
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#afc8f0]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">Control Active</span>
        </div>
      </div>

      {/* Mockup Dashboard Content */}
      <div className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-gradient-to-b from-[#001f3f] to-[#001428]">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8ea8cb] truncate">Perkara Aktif</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">28</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-red-300 truncate">Terlambat</span>
            <span className="text-xl sm:text-2xl font-extrabold text-red-400 mt-1 block">3</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-300 truncate">Pending</span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1 block">5</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-300 truncate">Hari Ini</span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-400 mt-1 block">4</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-300 truncate">Signing</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 block">2</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-300 truncate">Tanpa PIC</span>
            <span className="text-xl sm:text-2xl font-extrabold text-purple-400 mt-1 block">1</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-[#fc8f34]/15 border border-[#fc8f34]/30 col-span-2 sm:col-span-1 flex items-center justify-between sm:flex-col sm:items-start sm:justify-between">
            <span className="text-[10px] uppercase font-bold text-[#fc8f34] truncate">Outstanding</span>
            <span className="text-base sm:text-lg font-extrabold text-[#fc8f34] block truncate">
              Rp 18.750.000
            </span>
          </div>
        </div>

        {/* Attention Required Card (Exception-Based) */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#000d20] border-2 border-[#fc8f34]/60 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[#2f486a]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[9px] sm:text-[10px] font-extrabold uppercase animate-pulse">
                PERHATIAN KRITIS
              </span>
              <span className="text-xs sm:text-sm font-bold text-white">AJB-2026-0012 &bull; Ibu Ida</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#fc8f34] font-semibold">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              <span>Deadline: 10.30 WIB</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
                Draft Akta Jual Beli harus direview internal &amp; konfirmasi validasi NIK/PBB para pihak.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-[#8ea8cb]">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">PIC: <strong className="text-white font-semibold">Dimas S.</strong></span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Tahap: <strong className="text-blue-300 font-semibold">Drafting</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">Checklist: <strong className="text-emerald-400 font-semibold">8/10 Selesai</strong></span>
              </div>
            </div>

            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#fc8f34] hover:bg-[#f97316] text-[#000613] text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm active:scale-[0.98]"
            >
              <span>Tindak Lanjut</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Live Matters Snapshot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs">
          {/* Card 1: Signing Readiness */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-white text-xs sm:text-sm truncate">APHT-2026-0008 &bull; PT Karya Makmur</span>
              <span className="self-start sm:self-auto px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                SIGNING READY (100%)
              </span>
            </div>
            <p className="text-[#8ea8cb] text-[11px] sm:text-xs leading-relaxed">
              Jadwal: Besok, 14.00 WIB di Ruang Rapat Notaris. Seluruh dokumen identitas debitur &amp; sertifikat telah diverifikasi.
            </p>
          </div>

          {/* Card 2: Document Missing */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-white text-xs sm:text-sm truncate">SKMHT-2026-0034 &bull; Bpk. Hendra</span>
              <span className="self-start sm:self-auto px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                PENDING DOKUMEN (80%)
              </span>
            </div>
            <p className="text-[#8ea8cb] text-[11px] sm:text-xs leading-relaxed">
              Menunggu upload Surat Persetujuan Suami/Istri asli. Follow-up terakhir oleh staf jam 09.00 tadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
