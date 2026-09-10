import Link from "next/link";
import { PricingSection } from "@/components/billing/PricingSection";

export const metadata = {
  title: "Pilihan Paket Harga & Langganan — NOTARYGO™",
  description:
    "Pilihan paket berlangganan NOTARYGO™ untuk kantor Notaris & PPAT. Transaksi instan dan aman via Mayar.id.",
};

export default function PricingPage() {
  const faqs = [
    {
      q: "Bagaimana cara kerja aktivasi akun setelah pembayaran?",
      a: "Setelah Anda menyelesaikan pembayaran melalui gerbang pembayaran Mayar, sistem webhook kami akan memverifikasi transaksi secara server-side dan langsung mengaktifkan masa langganan kantor Notaris Anda tanpa perlu konfirmasi manual.",
    },
    {
      q: "Apakah saya bisa berganti paket di tengah masa langganan?",
      a: "Ya, Anda dapat melakukan perpanjangan atau upgrade paket kapan saja melalui menu Pengaturan Billing di Dashboard. Sisa masa aktif Anda akan otomatis diakumulasikan.",
    },
    {
      q: "Metode pembayaran apa saja yang didukung oleh Mayar?",
      a: "Mayar mendukung QRIS (BCA, GoPay, OVO, Dana, ShopeePay), Virtual Account seluruh bank nasional (BCA, Mandiri, BNI, BRI, Permata), dan Kartu Kredit/Debit.",
    },
    {
      q: "Apakah ada batasan jumlah staf atau berkas perkara akta?",
      a: "Tidak ada batasan. Seluruh paket NOTARYGO™ memberikan akses tanpa batas untuk pendaftaran perkara akta, checklist para pihak, serta penambahan staf kantor.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#191c1d] selection:bg-[#fc8f34]/20 selection:text-[#001f3f]">
      {/* Top Navbar */}
      <header className="h-20 bg-[#001f3f]/95 backdrop-blur-md border-b border-[#2f486a] px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-12 px-3.5 py-1.5 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]">
            <img src="/logo.png" alt="NOTARYGO™" className="h-8 sm:h-9 w-auto object-contain" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#afc8f0]">
          <Link href="/" className="hover:text-white transition-colors">
            Beranda
          </Link>
          <Link href="/pricing" className="text-white font-bold border-b-2 border-[#fc8f34] pb-1">
            Paket Harga
          </Link>
          <a
            href="https://cuancepat.myr.id/m/notarygo-33257"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#fc8f34] transition-colors flex items-center gap-1"
          >
            <span>Mayar Gateway</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-xs sm:text-sm font-bold text-[#afc8f0] hover:text-white px-3 py-2 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-[#fc8f34] text-[#000613] text-xs sm:text-sm font-extrabold hover:bg-[#f97316] transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            <span>Daftar Kantor Baru</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        {/* Pricing Cards Section */}
        <PricingSection />

        {/* Security & Feature Highlights */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#001f3f] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Aktivasi Otomatis</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Integrasi webhook Mayar server-side menjamin aktivasi lisensi langsung seketika setelah pembayaran terkonfirmasi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Enkripsi &amp; Keamanan Data</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Data perkara dan identitas klien dilindungi dengan arsitektur Row Level Security (RLS) dan enkripsi 256-bit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Dukungan Kantor Prioritas</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Tim spesialis siap membantu onboarding notaris, migrasi data perkara, dan asistensi teknis berkas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-[#001f3f]">Pertanyaan yang Sering Diajukan (FAQ)</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Segala hal yang perlu Anda ketahui mengenai skema langganan NOTARYGO™.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-[#fc8f34]/50 transition-colors"
              >
                <h5 className="text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-[#fc8f34]">&bull;</span>
                  <span>{faq.q}</span>
                </h5>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-100">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#2f486a] bg-[#000613] text-[#8ea8cb] py-10 px-6 sm:px-12 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 px-2 bg-white rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="NOTARYGO™" className="h-5 w-auto object-contain" />
            </div>
            <span>&copy; {new Date().getFullYear()} NOTARYGO™. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <Link href="/pricing" className="text-white font-semibold">
              Paket Harga
            </Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Masuk Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
