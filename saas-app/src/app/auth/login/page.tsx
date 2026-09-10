"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { login } from "../actions";
import Link from "next/link";

const PAYMENT_GATEWAY_URL = "https://cuancepat.myr.id/m/notarygo-33257";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";

  const [error, setError] = useState<string | null>(null);
  const [isUnregistered, setIsUnregistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsUnregistered(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await login(formData);

      if (!result.success) {
        setLoading(false);
        const rawErr = result.error || "";
        
        if (
          rawErr.toLowerCase().includes("invalid login credentials") ||
          rawErr.toLowerCase().includes("user not found") ||
          rawErr.toLowerCase().includes("email not confirmed")
        ) {
          setError("Email atau kata sandi tidak cocok, atau akun Anda belum terdaftar di sistem.");
          setIsUnregistered(true);
        } else {
          setError(rawErr || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
        }
        return;
      }

      // Login Sukses
      setLoginSuccess(true);
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      // Jaga-jaga jika ada network error
      setLoading(false);
      setError("Terjadi kendala koneksi ke server. Silakan coba lagi beberapa saat lagi.");
    }
  };

  return (
    <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#2f486a] shadow-2xl bg-[#001f3f] text-white">
      {/* Header */}
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-[#2f486a] px-6 py-8 text-center bg-[#000613]/70">
        <Link href="/" className="flex items-center justify-center py-1">
          <img src="/logo-transparent-light.png" alt="NOTARYGO™" className="h-10 sm:h-11 w-auto object-contain" />
        </Link>
        <p className="text-xs text-[#afc8f0] font-medium tracking-wide">
          Sistem Kendali Operasional Kantor Notaris &amp; PPAT
        </p>
      </div>



      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 px-6 py-8 bg-[#001832]/80">
        <input type="hidden" name="next" value={next} />

        {/* Success Status Banner */}
        {loginSuccess && (
          <div className="rounded-xl bg-emerald-950/80 p-3.5 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 text-xs font-medium animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span>Sedang login... Mengalihkan ke dashboard kantor Anda</span>
          </div>
        )}

        {/* Error Banner */}
        {error && !loginSuccess && (
          <div className="rounded-xl bg-red-950/80 p-3.5 border border-red-500/50 space-y-1.5">
            <p className="text-xs text-red-300 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Unregistered / Direct to Payment Gateway Callout */}
        {isUnregistered && !loginSuccess && (
          <div className="rounded-xl bg-amber-950/70 p-3.5 border border-amber-500/40 space-y-2.5">
            <div className="flex items-start gap-2 text-amber-300 text-xs">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-amber-400">
                info
              </span>
              <p className="leading-relaxed">
                Belum memiliki akses atau belum berlangganan? Anda dapat melakukan pendaftaran &amp; pembayaran paket langganan kantor melalui gateway resmi:
              </p>
            </div>
            <a
              href={PAYMENT_GATEWAY_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 bg-[#fc8f34] hover:bg-[#ffa352] text-[#000613] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
            >
              <span>Buka Payment Gateway Langganan</span>
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            </a>
          </div>
        )}

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
            placeholder="nama@kantornotaris.com"
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
          disabled={loading || loginSuccess}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#fc8f34] hover:bg-[#ffa352] px-4 py-2 text-xs font-bold text-[#000613] shadow-md transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {loginSuccess ? (
            <>
              <span className="flex h-2 w-2 rounded-full bg-[#000613] animate-ping" />
              <span>Sedang login...</span>
            </>
          ) : loading ? (
            <>
              <span className="flex h-2 w-2 rounded-full bg-[#000613] animate-ping" />
              <span>Memeriksa Akun...</span>
            </>
          ) : (
            <span>Masuk ke Aplikasi</span>
          )}
        </button>

        <div className="pt-2 text-center space-y-2">
          <p className="text-center text-xs text-[#afc8f0]">
            Belum memiliki akun?{" "}
            <Link
              href="/auth/signup"
              className="font-bold text-[#fc8f34] hover:underline"
            >
              Daftar Sekarang
            </Link>
          </p>

          <p className="text-[11px] text-[#6f88ad]">
            Atau langganan langsung via{" "}
            <a
              href={PAYMENT_GATEWAY_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[#afc8f0] hover:text-white underline inline-flex items-center gap-0.5"
            >
              <span>Mayar Gateway</span>
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000613] p-4 font-sans selection:bg-[#fc8f34]/20 selection:text-white">
      <Suspense fallback={<div className="text-white text-xs">Memuat halaman login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

