"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signup } from "../actions";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await signup(formData);
      if (!result.success) {
        setError(result.error || "Gagal mendaftarkan akun. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      router.push(result.redirectUrl || "/onboarding/create-org");
      router.refresh();
    } catch (err: any) {
      setError("Terjadi kendala saat mendaftar. Silakan coba kembali.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 px-6 py-8 bg-[#001832]/80">
      {emailParam && (
        <div className="rounded-xl bg-[#fc8f34]/15 p-3.5 border border-[#fc8f34]/30 flex items-start gap-2 text-[#fc8f34] text-xs">
          <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">verified</span>
          <span>
            Email pembayaran terdeteksi! Gunakan <strong>{emailParam}</strong> agar paket langganan Anda langsung terhubung otomatis.
          </span>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-950/80 p-3.5 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 text-xs font-medium animate-pulse">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span>Akun berhasil dibuat! Menyiapkan kantor Anda...</span>
        </div>
      )}

      {error && !success && (
        <div className="rounded-xl bg-red-950/80 p-3.5 border border-red-500/50">
          <p className="text-xs text-red-300 font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="full_name"
          className="block text-[11px] font-semibold text-[#afc8f0] uppercase tracking-wider"
        >
          Nama Lengkap &amp; Gelar
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="H. Budi Santoso, S.H., M.Kn."
          required
          className="block w-full rounded-lg border border-[#2f486a] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 bg-[#000613] focus:border-[#fc8f34] focus:outline-none focus:ring-1 focus:ring-[#fc8f34]"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-[11px] font-semibold text-[#afc8f0] uppercase tracking-wider"
        >
          Email Akun
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="notaris@kantor.com"
          autoComplete="email"
          required
          className="block w-full rounded-lg border border-[#2f486a] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 bg-[#000613] focus:border-[#fc8f34] focus:outline-none focus:ring-1 focus:ring-[#fc8f34]"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-[11px] font-semibold text-[#afc8f0] uppercase tracking-wider"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          className="block w-full rounded-lg border border-[#2f486a] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 bg-[#000613] focus:border-[#fc8f34] focus:outline-none focus:ring-1 focus:ring-[#fc8f34]"
        />
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="w-full rounded-lg bg-gradient-to-r from-[#fc8f34] to-[#f97316] py-2.5 text-xs font-bold text-[#000613] hover:from-[#f97316] hover:to-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#fc8f34] focus:ring-offset-2 focus:ring-offset-[#001f3f] disabled:opacity-50 transition-all shadow-md active:scale-[0.98] mt-2"
      >
        {loading ? "Membuat Akun..." : "Daftar Akun Notaris"}
      </button>

      <div className="text-center pt-2">
        <Link href="/auth/login" className="text-xs text-[#afc8f0] hover:text-white transition-colors">
          Sudah memiliki akun? <span className="font-semibold text-[#fc8f34] underline">Masuk</span>
        </Link>
      </div>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000613] p-4 font-sans selection:bg-[#fc8f34]/20 selection:text-white">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#2f486a] shadow-2xl bg-[#001f3f] text-white">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-[#2f486a] px-6 py-8 text-center bg-[#000613]/70">
          <Link href="/" className="flex items-center justify-center py-1">
            <img src="/logo-transparent-light.png" alt="NOTARYGO™" className="h-10 sm:h-11 w-auto object-contain" />
          </Link>
          <p className="text-xs text-[#afc8f0] font-medium tracking-wide">
            Daftarkan akun baru untuk mengelola kantor Notaris &amp; PPAT
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-[#afc8f0] flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#fc8f34] border-t-transparent rounded-full animate-spin" />
              <span>Memuat formulir...</span>
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
