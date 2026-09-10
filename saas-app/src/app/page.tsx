import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { DashboardPreviewMockup } from "@/components/landing/DashboardPreviewMockup";
import { PricingSection } from "@/components/billing/PricingSection";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { StickyMobileBar } from "@/components/landing/StickyMobileBar";
import { WhatsAppToggle } from "@/components/landing/WhatsAppToggle";

export const metadata = {
  title: "NOTARYGO™ — Notary Office Operational Control System",
  description:
    "Sistem operasional kantor Notaris & PPAT untuk mengendalikan register perkara, checklist dokumen para pihak, jadwal signing, dan tagihan dari satu pusat kontrol.",
};

export default function HomePage() {
  const conversationalCards = [
    {
      quote: "“Perkara Ibu Ida sekarang sudah sampai mana?”",
      detail: "Mencari status berkas tanpa harus memanggil staf atau membuka file manual.",
      icon: "chat",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      quote: "“Dokumen AJB ini sudah lengkap belum?”",
      detail: "Mencegah penundaan signing karena 1 syarat penting luput diverifikasi.",
      icon: "checklist",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      quote: "“Siapa yang follow-up klien?”",
      detail: "Menghindari perkara mangkrak karena tidak ada PIC yang bertanggung jawab.",
      icon: "person_alert",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      quote: "“Signing besok sudah benar-benar siap?”",
      detail: "Memastikan kehadiran para pihak dan kelengkapan berkas akta H-1 penandatanganan.",
      icon: "draw",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      quote: "“Ada pekerjaan yang sudah lewat deadline?”",
      detail: "Deteksi dini exception sebelum menjadi komplain dari pihak bank atau klien.",
      icon: "alarm",
      color: "text-red-600 bg-red-50 border-red-200",
    },
    {
      quote: "“Invoice perkara ini sudah dibayar atau belum?”",
      detail: "Memantau honorarium, titipan pajak BPHTB/PPh, dan saldo piutang outstanding.",
      icon: "receipt_long",
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
  ];

  const workflowStages = [
    { num: "01", name: "Masuk", desc: "Registrasi berkas & data awal klien" },
    { num: "02", name: "Pemeriksaan", desc: "Verifikasi checklist syarat dokumen" },
    { num: "03", name: "Drafting", desc: "Penyusunan draft minuta akta" },
    { num: "04", name: "Review Internal", desc: "Pengecekan klausul & legalitas" },
    { num: "05", name: "Persetujuan", desc: "Validasi akhir oleh Notaris/PPAT" },
    { num: "06", name: "Klien Approval", desc: "Konfirmasi draft kepada para pihak" },
    { num: "07", name: "Signing", desc: "Penandatanganan akta resmi" },
    { num: "08", name: "Processing", desc: "Pendaftaran BPN / AHU / Pajak" },
    { num: "09", name: "Selesai", desc: "Penyerahan salinan akta & arsip" },
  ];

  const onboardingSteps = [
    {
      step: "1",
      title: "Lengkapi Profil Kantor",
      desc: "Masukkan nama kantor, nama Notaris & PPAT, wilayah jabatan, dan kop resmi.",
    },
    {
      step: "2",
      title: "Tambahkan Tim Staf",
      desc: "Undang staf, supervisor, dan finance dengan hak akses terisolasi aman.",
    },
    {
      step: "3",
      title: "Pilih Jenis Layanan",
      desc: "Aktifkan template perkara (AJB, APHT, Pendirian PT, Waris, SKMHT, dll).",
    },
    {
      step: "4",
      title: "Atur Workflow & PIC",
      desc: "Tentukan standar checklist dokumen dan alur tahapan penyelesaian kantor Anda.",
    },
    {
      step: "5",
      title: "Buat Perkara Pertama",
      desc: "Daftarkan perkara aktif dan rasakan kendali operasional langsung di Dashboard.",
    },
  ];

  const faqs = [
    {
      q: "Apakah NOTARYGO™ hanya untuk Owner Notaris?",
      a: "Tidak. Owner mengontrol ringkasan exception dan performa kantor melalui Dashboard. Staf mengerjakan tugas harian melalui menu My Work. Supervisor memantau beban kerja, dan Finance mengelola invoice serta kuitansi sesuai hak akses (role-based access).",
    },
    {
      q: "Apakah aplikasi bisa digunakan melalui smartphone / HP?",
      a: "Ya. NOTARYGO™ dirancang penuh untuk desktop (sebagai Control Center) dan mobile (sebagai Action Center untuk update progres, follow-up, upload berkas, dan cek checklist di lapangan).",
    },
    {
      q: "Apakah semua staf bisa melihat data keuangan dan honorarium?",
      a: "Tidak. Hak akses data keuangan (invoice, titipan pajak, dan fee) diproteksi ketat dan hanya dapat diakses oleh peran OWNER, ADMIN, atau FINANCE.",
    },
    {
      q: "Apakah dokumen disimpan secara aman di cloud?",
      a: "Ya. Setiap berkas akta dan dokumen identitas disimpan di penyimpanan cloud terenkripsi dengan arsitektur Row Level Security (RLS) Supabase yang terisolasi khusus untuk kantor Anda.",
    },
    {
      q: "Apakah paket 1 tahun dibayar Rp 41.500 setiap bulan?",
      a: "Tidak. Paket 1 tahun dibayarkan sebesar Rp 499.000 sekaligus di awal untuk masa aktif 12 bulan penuh. Angka ±Rp 41.500/bulan merupakan perbandingan nilai ekuivalen untuk melihat tingkat penghematannya.",
    },
    {
      q: "Apakah ada perbedaan fitur antara paket 1 Bulan, 3 Bulan, dan 1 Tahun?",
      a: "Seluruh paket mendapatkan akses fitur inti NOTARYGO™ yang lengkap (Dashboard, Perkara, Workflow, Checklist, Signing, Document Center, Invoicing, PDF, Mobile). Perbedaannya terletak pada durasi masa aktif dan tingkat penghematan harga.",
    },
    {
      q: "Apa yang terjadi setelah masa langganan berakhir?",
      a: "Anda dapat memperpanjang paket kapan saja melalui Dashboard. Data perkara dan dokumen kantor Anda tetap aman dan tidak langsung dihapus.",
    },
    {
      q: "Apakah NOTARYGO™ menggantikan sistem AHU atau ATR/BPN?",
      a: "Tidak. NOTARYGO™ adalah sistem operasional internal kantor Notaris & PPAT untuk mengelola alur kerja, staf, dokumen, dan klien sebelum dan sesudah proses pendaftaran resmi di instansi pemerintah.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#191c1d] selection:bg-[#fc8f34]/20 selection:text-[#001f3f] font-sans w-full max-w-full overflow-x-hidden min-w-0 box-border relative">
      {/* 1. Navbar */}
      <LandingHeader />

      {/* 2. SECTION 1 — HERO */}
      <section className="relative pt-8 pb-12 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto text-center flex flex-col items-center overflow-hidden min-w-0 box-border">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#001f3f]/5 border border-[#001f3f]/15 text-[#001f3f] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#fc8f34]">gavel</span>
          <span>Untuk Kantor Notaris &amp; PPAT</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#000613] tracking-tight leading-[1.22] sm:leading-[1.18] max-w-4xl mx-auto mb-4 sm:mb-6">
          Semakin Banyak Perkara Berjalan, Semakin Sulit Memastikan Tidak Ada yang Terlewat.
        </h1>

        {/* Supporting Copy */}
        <div className="text-xs sm:text-base lg:text-lg text-[#475569] max-w-3xl mx-auto leading-relaxed space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <p>
            Perkara baru masuk. Dokumen masih kurang. Staf menunggu revisi. Follow-up belum dilakukan. Jadwal penandatanganan semakin dekat.
          </p>
          <p className="font-semibold text-gray-800">
            Masalahnya bukan selalu karena tim Anda tidak bekerja.
          </p>
          <p>
            Masalah mulai muncul ketika <strong className="text-gray-900">status pekerjaan, PIC, deadline, dokumen, dan tindak lanjut tersebar di terlalu banyak tempat.</strong>
          </p>
          <p className="text-[#001f3f] font-medium pt-1">
            NOTARYGO™ membantu kantor Notaris &amp; PPAT melihat pekerjaan yang sedang berjalan dari satu sistem operasional.
          </p>
        </div>

        {/* Mechanism Strip - Responsive Flow */}
        <div className="w-full max-w-4xl p-2.5 sm:p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs mb-6 sm:mb-8 overflow-hidden box-border">
          {/* Mobile Mechanism Flow (Wrapped Grid / Pills) */}
          <div className="flex sm:hidden flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold text-[#001f3f]">
            {["Perkara", "PIC", "Workflow", "Deadline", "Dokumen", "Follow-Up", "Signing", "Tagihan"].map((step, idx, arr) => (
              <span key={idx} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                <span className="text-[#fc8f34] text-[8px]">&bull;</span>
                <span>{step}</span>
                {idx < arr.length - 1 && <span className="text-gray-300 ml-0.5">&rarr;</span>}
              </span>
            ))}
          </div>

          {/* Desktop Mechanism Flow */}
          <div className="hidden sm:flex items-center justify-between text-xs font-extrabold text-[#001f3f] gap-2 px-2">
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> Perkara</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> PIC</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> Workflow</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> Deadline</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> Dokumen</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> Follow-Up</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> Signing</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="flex items-center gap-1"><span className="text-[#fc8f34]">&bull;</span> Tagihan</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto mb-3 sm:mb-4">
          <a
            href="#cara-kerja"
            className="w-full sm:w-auto h-12 px-6 sm:px-8 bg-[#001f3f] hover:bg-[#000613] active:scale-[0.99] text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Lihat Cara NOTARYGO™ Bekerja</span>
            <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">arrow_downward</span>
          </a>

          <a
            href="#preview-dashboard"
            className="w-full sm:w-auto h-12 px-6 sm:px-8 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] text-[#001f3f] rounded-xl text-sm font-bold shadow-2xs hover:shadow-md transition-all inline-flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-[#001f3f]">visibility</span>
            <span>Lihat Tampilan Aplikasi</span>
          </a>
        </div>

        <p className="text-[11px] sm:text-xs text-[#6f88ad] font-medium">
          Tidak perlu mengubah seluruh cara kerja kantor sekaligus.
        </p>

        {/* Hero Visual: Realistic Dashboard Preview */}
        <div id="preview-dashboard" className="w-full max-w-full mt-8 sm:mt-14 overflow-hidden min-w-0 box-border">
          <DashboardPreviewMockup />
        </div>
      </section>

      {/* 3. SECTION 2 — PROBLEM RECOGNITION & BENEFIT */}
      <section id="manfaat" className="py-12 sm:py-24 bg-white border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#944a00] bg-[#fc8f34]/15 px-3 py-1 rounded-full border border-[#fc8f34]/30">
              Manfaat &amp; Solusi Nyata
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#001f3f] tracking-tight mt-3">
              Apakah Kondisi Seperti Ini Masih Terjadi di Kantor Anda?
            </h2>

            <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-gray-600">
              Pertanyaan rutin harian yang sering kali harus dijawab langsung oleh Notaris atau pimpinan kantor:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {conversationalCards.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-50/80 border border-gray-200 shadow-2xs hover:shadow-md transition-all hover:border-[#fc8f34]/40 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5 sm:space-y-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{item.icon}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    {item.quote}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-200/60 pt-2.5 sm:pt-3">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 p-5 sm:p-8 rounded-2xl bg-[#001f3f] text-white text-center max-w-3xl mx-auto shadow-lg">
            <p className="text-xs sm:text-base text-[#afc8f0] leading-relaxed">
              Satu per satu pertanyaan tersebut terlihat sederhana. Tetapi ketika puluhan pekerjaan berjalan bersamaan, Owner akhirnya menjadi:
            </p>
            <h4 className="text-base sm:text-xl font-extrabold text-[#fc8f34] mt-2">
              “Pusat pencarian informasi untuk seluruh kantor.”
            </h4>
          </div>
        </div>
      </section>

      {/* 4. SECTION 3 — CONSEQUENCE (Proactive vs Reactive) */}
      <section className="py-12 sm:py-20 bg-gray-50 border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#001f3f] tracking-tight">
              Yang Sulit Dikendalikan Bukan Hanya Banyaknya Pekerjaan.
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
              Yang jauh lebih berisiko bagi reputasi kantor adalah pekerjaan yang luput dari pengawasan:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            {[
              "Tidak jelas siapa staf yang menjadi PIC penanggung jawab",
              "Belum mempunyai langkah tindak lanjut (Next Action)",
              "Sedang pending tetapi tidak terpantau batas waktunya",
              "Mendekati deadline tanpa ada peringatan dini",
              "Dokumen syarat para pihak belum lengkap",
              "Klien belum di-follow-up tepat waktu",
              "Hari penandatanganan akta sudah dekat tetapi berkas belum siap",
              "Tagihan honorarium / titipan pajak belum ditindaklanjuti",
            ].map((risk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 mt-0.5">warning</span>
                <span className="text-gray-800 font-medium leading-snug">{risk}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              Ketika informasi seperti ini baru diketahui setelah seseorang bertanya atau komplain, kantor sedang bekerja secara <strong>reaktif</strong>.
            </p>
            <p className="text-xs sm:text-sm text-[#001f3f] font-extrabold mt-1">
              NOTARYGO™ dirancang agar masalah tersebut terlihat sebelum menjadi masalah yang lebih besar.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECTION 5 — INTRODUCE SOLUTION */}
      <section id="solusi" className="py-12 sm:py-24 bg-[#001f3f] text-white w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#fc8f34]">
            Solusi Terintegrasi
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2 text-white">
            Inilah NOTARYGO™
          </h2>
          <p className="text-sm sm:text-xl text-[#afc8f0] font-medium mt-1.5 sm:mt-2">
            Notary Office Operational Control System
          </p>

          <p className="mt-4 sm:mt-6 text-xs sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed">
            NOTARYGO™ bukan sekadar aplikasi pencatatan perkara. Bukan sekadar task manager. Bukan sekadar tempat menyimpan dokumen. NOTARYGO™ menyatukan aktivitas operasional kantor ke dalam satu alur kendali:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto my-8 sm:my-10">
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[11px] text-[#fc8f34] font-bold">01</span>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">DATA</h4>
              <p className="text-[10px] sm:text-[11px] text-[#8ea8cb] mt-0.5">Register &amp; Berkas</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[11px] text-[#fc8f34] font-bold">02</span>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">VISIBILITY</h4>
              <p className="text-[10px] sm:text-[11px] text-[#8ea8cb] mt-0.5">Dashboard Alert</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[11px] text-[#fc8f34] font-bold">03</span>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">ACTION</h4>
              <p className="text-[10px] sm:text-[11px] text-[#8ea8cb] mt-0.5">Task &amp; Follow-up</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[11px] text-[#fc8f34] font-bold">04</span>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">CONTROL</h4>
              <p className="text-[10px] sm:text-[11px] text-[#8ea8cb] mt-0.5">Signing &amp; Invoicing</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300">
            Pekerjaan tidak hanya tercatat. Pekerjaan menjadi <strong className="text-white">terlihat dan dapat dikendalikan.</strong>
          </p>
        </div>
      </section>

      {/* 6. SECTION 6 — OWNER VS STAFF (One System, Two Views) */}
      <section id="perbandingan-role" className="py-12 sm:py-24 bg-white border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#001f3f] tracking-tight">
              Satu Sistem. Dua Pertanyaan yang Berbeda.
            </h2>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-gray-600">
              Memberikan pengalaman kerja yang dirancang khusus sesuai tanggung jawab masing-masing peran di kantor:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Card 1: Owner */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#001f3f] text-white border border-[#2f486a] shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fc8f34]/20 text-[#fc8f34] text-[11px] sm:text-xs font-extrabold uppercase mb-4">
                  <span className="material-symbols-outlined text-[16px]">shield_person</span>
                  <span>Untuk Notaris / Pimpinan Kantor</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 leading-snug">
                  “Apa yang membutuhkan perhatian saya?”
                </h3>
                <p className="text-xs text-[#afc8f0] mb-5 sm:mb-6 leading-relaxed">
                  Pusat kendali eksekutif untuk melihat titik hambatan tanpa harus memeriksa berkas satu per satu.
                </p>

                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-200">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#fc8f34] text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Executive Dashboard &amp; Ringkasan Seluruh Perkara</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#fc8f34] text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Alert Pekerjaan Overdue &amp; Pending Tak Tertangani</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#fc8f34] text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Signing Readiness &amp; Peringatan Dokumen Kurang</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#fc8f34] text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Deteksi Perkara Tanpa PIC &amp; Saldo Piutang Klien</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Staff */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gray-50 text-gray-900 border border-gray-200 shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] sm:text-xs font-extrabold uppercase mb-4">
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  <span>Untuk Staf &amp; Pelaksana</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-[#001f3f] mb-2 leading-snug">
                  “Apa yang harus saya kerjakan sekarang?”
                </h3>
                <p className="text-xs text-gray-500 mb-5 sm:mb-6 leading-relaxed">
                  Daftar kerja terstruktur agar staf langsung tahu prioritas tugas hari ini dan langkah berikutnya.
                </p>

                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Menu My Work — Tugas Khusus yang Ditugaskan ke Saya</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Pengingat Deadline &amp; Jadwal Follow-Up Para Pihak</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Checklist Dokumen Syarat per Jenis Akta</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Upload &amp; Riwayat Versi Draft Minuta Akta</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 7, 8, 9, 10, 11, 12 — CORE FEATURE MODULES */}
      <section id="fitur" className="py-12 sm:py-24 bg-gray-50 border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-20">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#944a00] bg-[#fc8f34]/15 px-3 py-1 rounded-full border border-[#fc8f34]/30">
              Modul Kontrol Utama
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#001f3f] tracking-tight mt-3">
              Fitur Lengkap untuk Kendali Penuh Kantor Notaris &amp; PPAT
            </h2>
          </div>

          {/* Feature 1: Matter Control & 5-Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center" id="cara-kerja">
            <div className="space-y-3 sm:space-y-4 min-w-0">
              <span className="text-xs font-extrabold text-[#fc8f34] uppercase tracking-wider">
                01 &bull; Matter Control Center
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#001f3f]">
                Setiap Perkara Mempunyai Satu Tempat untuk Melihat Semuanya.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Tidak perlu lagi mencari riwayat perkara di banyak folder, spreadsheet, dan chat WhatsApp terpisah. Setiap berkas memiliki kartu perkara terintegrasi dengan 5 tab informasi:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 pt-2 text-[11px] sm:text-xs font-semibold">
                <span className="p-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-center">1. Ringkasan</span>
                <span className="p-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-center">2. Pekerjaan</span>
                <span className="p-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-center">3. Dokumen</span>
                <span className="p-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-center">4. Keuangan</span>
                <span className="p-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-center col-span-2 sm:col-span-1">5. Riwayat Log</span>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-200 shadow-md space-y-3 sm:space-y-4 text-xs min-w-0 box-border">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 pb-2.5 sm:pb-3 border-b border-gray-100">
                <div>
                  <span className="font-extrabold text-[#001f3f] text-xs sm:text-sm">AJB-2026-0012</span>
                  <p className="text-gray-500 text-[11px] sm:text-xs">Akta Jual Beli Tanah &amp; Bangunan</p>
                </div>
                <span className="self-start xs:self-auto px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px] sm:text-xs">
                  Tahap: Drafting
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-600">
                <div>Klien: <strong className="text-gray-900 block truncate">Ibu Ida Rosdiana</strong></div>
                <div>PIC Staf: <strong className="text-gray-900 block truncate">Dimas Sucipto</strong></div>
                <div>Prioritas: <strong className="text-red-600 block truncate">Tinggi (Bank BTN)</strong></div>
                <div>Deadline: <strong className="text-gray-900 block truncate">30 Ags 2026</strong></div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium text-[11px] sm:text-xs leading-relaxed">
                Next Action: Konfirmasi revisi draft klausul pasal 4 dengan pihak pembeli.
              </div>
            </div>
          </div>

          {/* Feature 2: 9-Stage Workflow */}
          <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-extrabold text-[#fc8f34] uppercase tracking-wider">
                02 &bull; Workflow Akta 9-Tahap
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#001f3f] mt-1">
                Perkara Tidak Hanya Berstatus “Sedang Diproses”.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Lacak posisi perkara di setiap fase pembuatan akta dengan terstruktur:
              </p>
            </div>

            {/* 3-Column Symmetrical Mobile Grid (3x3 = 9) / 9-Col Desktop */}
            <div className="grid grid-cols-3 lg:grid-cols-9 gap-1.5 sm:gap-2 w-full max-w-full">
              {workflowStages.map((st, idx) => (
                <div key={idx} className="p-2 sm:p-3 rounded-xl bg-white border border-gray-200 shadow-2xs text-center space-y-0.5 sm:space-y-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-[#fc8f34] block">{st.num}</span>
                  <h5 className="font-bold text-gray-900 text-[11px] sm:text-xs truncate">{st.name}</h5>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 leading-tight hidden sm:block">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3: Checklist & Document Center */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-200 shadow-md space-y-3 sm:space-y-4 text-xs order-last lg:order-first min-w-0 box-border">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 pb-2.5 sm:pb-3 border-b border-gray-100">
                <span className="font-extrabold text-gray-900 text-xs sm:text-sm">Checklist Dokumen Syarat</span>
                <span className="self-start xs:self-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] sm:text-xs">
                  8 / 10 Lengkap (80%)
                </span>
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900">
                  <span className="truncate">&bull; KTP &amp; KK Penjual / Pembeli</span>
                  <span className="font-bold shrink-0 text-emerald-700">Terverifikasi</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900">
                  <span className="truncate">&bull; Sertifikat Hak Milik (Asli)</span>
                  <span className="font-bold shrink-0 text-emerald-700">Terverifikasi</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50 text-amber-900">
                  <span className="truncate">&bull; Bukti Lunas PBB 5 Thn</span>
                  <span className="font-bold text-amber-700 shrink-0">Perlu Revisi</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-red-50 text-red-900">
                  <span className="truncate">&bull; Surat Persetujuan Pasangan</span>
                  <span className="font-bold text-red-700 shrink-0">Belum Ada</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 min-w-0">
              <span className="text-xs font-extrabold text-[#fc8f34] uppercase tracking-wider">
                03 &bull; Checklist &amp; Document Control
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#001f3f]">
                Tidak Perlu Menebak Lagi Dokumen Mana yang Masih Kurang.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Dokumen tidak lagi hanya “ada di Drive”. NOTARYGO™ mencatat versi berkas secara kronologis (Draft V1 &rarr; V2 &rarr; Reviewed V3 &rarr; Final V4 &rarr; Signed) sehingga seluruh tim selalu bekerja menggunakan draf akta yang paling mutakhir.
              </p>
            </div>
          </div>

          {/* Feature 4: Signing Readiness & Operational Billing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-3 sm:space-y-4 min-w-0">
              <span className="text-xs font-extrabold text-[#fc8f34] uppercase tracking-wider">
                04 &bull; Signing Readiness &amp; Billing
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#001f3f]">
                Jangan Menunggu Hari Penandatanganan untuk Mengetahui Ada yang Belum Siap.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Sistem secara otomatis memverifikasi kelengkapan berkas H-1 penandatanganan akta. Terhubung langsung dengan pencatatan invoice honorarium, titipan pajak (BPHTB/PPh), dan penerbitan kuitansi resmi kantor.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#001f3f] text-white border border-[#2f486a] shadow-md space-y-3 sm:space-y-4 text-xs min-w-0 box-border">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#2f486a]">
                <span className="font-bold text-white text-xs sm:text-sm truncate">INV/NG/2026/00041</span>
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-[#fc8f34] text-[#000613] shrink-0">
                  OPERASIONAL
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                <div className="p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] sm:text-[10px] text-[#8ea8cb] block">Tagihan</span>
                  <span className="font-extrabold text-white text-xs sm:text-sm mt-0.5 block truncate">Rp 5.000.000</span>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[9px] sm:text-[10px] text-emerald-300 block">Dibayar</span>
                  <span className="font-extrabold text-emerald-400 text-xs sm:text-sm mt-0.5 block truncate">Rp 2.000.000</span>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                  <span className="text-[9px] sm:text-[10px] text-amber-300 block">Sisa</span>
                  <span className="font-extrabold text-amber-400 text-xs sm:text-sm mt-0.5 block truncate">Rp 3.000.000</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#afc8f0] text-center">
                Billing operasional kantor kepada klien terpisah dari subscription NOTARYGO™.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 14 & 15 — PRODUCT INTEGRITY & CREDIBILITY */}
      <section className="py-12 sm:py-20 bg-white border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 sm:p-10 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-4 sm:space-y-6 min-w-0 box-border">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                Integritas &amp; Batasan Sistem
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#001f3f] mt-1">
                NOTARYGO™ Tidak Menggantikan Profesi Anda.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Ia membantu mengendalikan koordinasi, kepemilikan berkas (ownership), workflow, deadline, dokumen, dan tindak lanjut di sekitarnya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-slate-200 text-xs text-gray-600">
              <div className="space-y-1.5 sm:space-y-2">
                <span className="font-bold text-gray-900 block">Bukan Pengganti Layanan Pemerintah:</span>
                <p>&bull; Tidak menggantikan kewenangan diskresi hukum Notaris</p>
                <p>&bull; Tidak menggantikan portal resmi AHU Online / ATR-BPN</p>
                <p>&bull; Menjaga protokol dan etika profesi kenotariatan</p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <span className="font-bold text-gray-900 block">Teruji oleh Pengguna Nyata:</span>
                <p>&bull; Dikembangkan dari versi awal yang mencatat <strong>108 Pembelian</strong></p>
                <p>&bull; Kini hadir dalam arsitektur SaaS multi-user terpusat</p>
                <p>&bull; Menyediakan backup aman dan akses mobile fleksibel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION 16 — WHO IS IT FOR */}
      <section id="untuk-siapa" className="py-12 sm:py-20 bg-gray-50 border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#001f3f] tracking-tight">
              NOTARYGO™ Cocok untuk Kantor yang Mulai Mengalami Masalah Kontrol karena Volume Bertambah.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2.5 sm:space-y-3 min-w-0">
              <span className="font-extrabold text-emerald-800 text-xs sm:text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Sangat Cocok Jika Kantor Anda:</span>
              </span>
              <ul className="space-y-2 text-gray-700 text-xs sm:text-sm">
                <li>&bull; Mempunyai beberapa staf pelaksana akta</li>
                <li>&bull; Menangani puluhan perkara bersamaan setiap bulannya</li>
                <li>&bull; Masih mengandalkan grup WhatsApp sebagai pusat koordinasi</li>
                <li>&bull; Menangani transaksi rekanan Bank / Developer properti</li>
                <li>&bull; Owner masih sering menanyakan progres satu per satu</li>
              </ul>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2.5 sm:space-y-3 min-w-0">
              <span className="font-bold text-gray-700 text-xs sm:text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-gray-400">info</span>
                <span>Mungkin Belum Diperlukan Jika:</span>
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Kantor hanya menangani sangat sedikit pekerjaan (1–2 berkas per bulan) dan seluruh informasi masih sangat mudah dikontrol secara langsung oleh satu orang tanpa delegasi staf.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECTION 17 & 18 — PRICING & MAYAR CHECKOUT EMBED */}
      <section id="harga" className="py-12 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto border-t border-gray-200 overflow-hidden min-w-0 box-border">
        <PricingSection />
      </section>

      {/* 11. SECTION 19 — FULL COMPARISON TABLE */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto border-t border-gray-200 overflow-hidden min-w-0 box-border">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-[#001f3f]">
            Tabel Perbandingan Fitur Paket
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
            Seluruh paket mendapatkan fitur operasional lengkap tanpa pemotongan fungsionalitas inti.
          </p>
        </div>

        <ComparisonTable />
      </section>

      {/* 12. SECTION 20 — ONBOARDING PROCESS */}
      <section className="py-12 sm:py-20 bg-white border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#fc8f34]">
              Kemudahan Implementasi
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-[#001f3f] mt-1">
              Tidak Perlu Mengerti Semua Fitur di Hari Pertama.
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
              Mulai gunakan dalam 5 langkah sederhana tanpa instalasi rumit:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {onboardingSteps.map((st, idx) => (
              <div key={idx} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5 sm:space-y-2 text-center min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#001f3f] text-[#fc8f34] font-extrabold text-xs flex items-center justify-center mx-auto shadow-2xs">
                  {st.step}
                </div>
                <h5 className="font-bold text-gray-900 text-xs sm:text-sm">{st.title}</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. SECTION 21 — FAQ */}
      <section id="faq" className="py-12 sm:py-24 bg-gray-50 border-t border-gray-200 w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
              Pusat Bantuan
            </span>
            <h3 className="text-xl sm:text-4xl font-extrabold text-[#001f3f] mt-1">
              Pertanyaan yang Sering Diajukan
            </h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-[#fc8f34]/50 transition-colors min-w-0"
              >
                <h5 className="text-xs sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 flex items-start gap-2">
                  <span className="text-[#fc8f34] font-extrabold mt-0.5">&bull;</span>
                  <span>{faq.q}</span>
                </h5>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-100">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. SECTION 22 — FINAL LOSS-AVERSION CLOSE */}
      <section className="py-12 sm:py-24 bg-[#001f3f] text-white text-center w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#fc8f34]">
            Kesimpulan Operasional
          </span>
          <h2 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Masalah Operasional Jarang Terlihat Besar di Awal.
          </h2>
          <p className="text-xs sm:text-sm text-[#afc8f0] max-w-2xl mx-auto leading-relaxed">
            Satu follow-up terlambat. Satu dokumen tidak diperbarui. Satu perkara tidak jelas PIC-nya. Satu deadline terlewat. Masing-masing terlihat kecil, tetapi ketika pekerjaan bertambah, hal kecil seperti itulah yang membuat Owner harus kembali mengecek semuanya sendiri.
          </p>

          <h3 className="text-base sm:text-2xl font-bold text-[#fc8f34] pt-1 sm:pt-2">
            NOTARYGO™ Membantu Membuat Pekerjaan yang Berjalan Menjadi Terlihat Sebelum Harus Ditanyakan.
          </h3>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <a
              href="#harga"
              className="w-full sm:w-auto h-12 px-6 sm:px-8 bg-[#fc8f34] hover:bg-[#f97316] text-[#000613] rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Mulai dengan NOTARYGO™</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto h-12 px-6 sm:px-8 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center active:scale-[0.99]"
            >
              Daftarkan Kantor Baru
            </Link>
          </div>

          <p className="text-[11px] sm:text-xs text-[#8ea8cb]">
            Pilih durasi yang paling sesuai dengan kebutuhan kantor Anda.
          </p>
        </div>
      </section>

      {/* 15. SECTION 23 — TRUST STRIP */}
      <div className="bg-[#001428] border-t border-[#2f486a] py-4 sm:py-6 px-4 text-center w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-[11px] sm:text-xs font-semibold text-[#8ea8cb]">
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">&bull;</span> Akses Online 24/7</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">&bull;</span> Multi-User Role</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">&bull;</span> Desktop &amp; Mobile</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">&bull;</span> Document Control</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">&bull;</span> Role-Based Security</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">&bull;</span> Langganan Fleksibel</span>
        </div>
      </div>

      {/* 16. FOOTER - with pb-24 for mobile sticky bar clearance */}
      <footer className="bg-[#000613] text-[#8ea8cb] py-10 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 border-t border-[#2f486a] w-full max-w-full overflow-hidden min-w-0 box-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-white/10">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center">
              <img src="/logo-transparent-light.png" alt="NOTARYGO™" className="h-7 sm:h-9 w-auto object-contain" />
            </Link>
            <p className="text-xs text-[#6f88ad]">Notary Office Operational Control System</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium text-[#afc8f0]">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#manfaat" className="hover:text-white transition-colors">Manfaat</a>
            <a href="#harga" className="hover:text-white transition-colors">Harga</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/auth/login" className="hover:text-white transition-colors">Masuk</Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[10px] sm:text-[11px] text-[#6f88ad]">
          <p>&copy; {new Date().getFullYear()} NOTARYGO™. All rights reserved.</p>
          <p className="max-w-md">
            NOTARYGO™ adalah sistem operasional internal kantor Notaris &amp; PPAT dan bukan pengganti aplikasi atau layanan resmi pemerintah.
          </p>
        </div>
      </footer>

      {/* 17. Sticky Mobile Bar */}
      <StickyMobileBar />

      {/* 18. Floating WhatsApp Toggle Widget */}
      <WhatsAppToggle />
    </div>
  );
}


