"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "../actions";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [officeName, setOfficeName] = useState("");
  const [notaryName, setNotaryName] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await createOrganization(formData);
    } catch (err: any) {
      if (err.message && err.message.includes("NEXT_REDIRECT")) {
        // Successful redirect
        return;
      }
      setError(err.message || "Gagal membuat kantor baru. Silakan coba kembali.");
      setLoading(false);
    }
  };

  // Sync office name automatically when notary name is typed if office name was empty
  const handleNotaryNameChange = (val: string) => {
    setNotaryName(val);
    if (!officeName || officeName.startsWith("Kantor Notaris & PPAT ")) {
      setOfficeName(val ? `Kantor Notaris & PPAT ${val}` : "");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000613] p-4 sm:p-6 font-sans selection:bg-[#fc8f34]/20 selection:text-white">
      {/* Background Glow Effect */}
      <div className="absolute w-96 h-96 bg-[#001f3f]/40 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
      <div className="absolute w-96 h-96 bg-[#fc8f34]/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#2f486a] shadow-2xl bg-[#001f3f] text-white backdrop-blur-md">
        {/* Card Header with Official NOTARYGO Logo */}
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-[#2f486a] px-6 py-8 text-center bg-[#000613]/70">
          <div className="flex items-center justify-center py-1">
            <img src="/logo-transparent-light.png" alt="NOTARYGO™" className="h-10 sm:h-11 w-auto object-contain" />
          </div>


          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fc8f34]/15 border border-[#fc8f34]/30 text-[#fc8f34] text-[11px] font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#fc8f34] animate-pulse" />
            Langkah Terakhir &bull; Setup Kantor
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Inisialisasi Workspace Kantor
          </h2>
          <p className="text-xs text-[#afc8f0] max-w-xs sm:max-w-sm leading-relaxed">
            Daftarkan identitas resmi kantor Notaris &amp; PPAT Anda untuk memulai manajemen perkara akta.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-5 px-6 py-8 sm:px-8 bg-[#001832]/80">
          {error && (
            <div className="rounded-xl bg-red-950/80 p-4 border border-red-500/40 text-red-200 text-xs font-medium flex items-center gap-2.5 animate-shake">
              <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="rounded-xl bg-emerald-950/80 p-4 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2.5 animate-pulse">
              <span className="material-symbols-outlined text-[18px] text-emerald-400 shrink-0 animate-spin">sync</span>
              <span>Menyiapkan database kantor &amp; mengalihkan ke Dashboard...</span>
            </div>
          )}

          {/* Field: Notary Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="notary_name"
              className="block text-[11px] font-extrabold text-[#afc8f0] uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px] text-[#fc8f34]">badge</span>
              <span>Nama Lengkap &amp; Gelar Notaris</span>
            </label>
            <input
              id="notary_name"
              name="notary_name"
              type="text"
              value={notaryName}
              onChange={(e) => handleNotaryNameChange(e.target.value)}
              placeholder="Contoh: Dr. Santo Anggles, S.H., M.Kn."
              required
              disabled={loading}
              className="block w-full rounded-xl border border-[#2f486a] bg-[#000d20] px-4 py-3 text-sm text-white placeholder-[#6f88ad] shadow-inner focus:border-[#fc8f34] focus:outline-none focus:ring-1 focus:ring-[#fc8f34] transition-all disabled:opacity-50"
            />
          </div>

          {/* Field: Office Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-[11px] font-extrabold text-[#afc8f0] uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px] text-[#fc8f34]">account_balance</span>
              <span>Nama Kantor / Organisasi</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              placeholder="Contoh: Kantor Notaris & PPAT Dr. Santo Anggles, S.H., M.Kn."
              required
              disabled={loading}
              className="block w-full rounded-xl border border-[#2f486a] bg-[#000d20] px-4 py-3 text-sm text-white placeholder-[#6f88ad] shadow-inner focus:border-[#fc8f34] focus:outline-none focus:ring-1 focus:ring-[#fc8f34] transition-all disabled:opacity-50"
            />
          </div>

          {/* Value Security Bullets */}
          <div className="p-3.5 rounded-xl bg-[#000f24] border border-[#2f486a]/50 text-[11px] text-[#8ea8cb] space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
              <span>Database terisolasi aman dengan enkripsi RLS Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#fc8f34]">folder_managed</span>
              <span>Langsung aktif untuk pendaftaran berkas akta &amp; signing schedule</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#fc8f34] hover:bg-[#f97316] text-[#000613] text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Menginisialisasi Workspace...</span>
              </>
            ) : (
              <>
                <span>Buat Workspace &amp; Buka Dashboard</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-[#000613]/90 border-t border-[#2f486a] text-center text-[11px] text-[#6f88ad]">
          &copy; {new Date().getFullYear()} NOTARYGO™. Notary Office Operational Control System.
        </div>
      </div>
    </div>
  );
}
