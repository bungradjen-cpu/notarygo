"use client";

import { useState } from "react";
import Link from "next/link";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full max-w-full h-16 sm:h-20 bg-[#001f3f]/95 backdrop-blur-md border-b border-[#2f486a] px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-50 transition-all box-border">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group py-1 shrink-0">
          <img
            src="/logo-transparent-light.png"
            alt="NOTARYGO™"
            className="h-7 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#afc8f0]">
          <a href="#fitur" className="hover:text-white transition-colors">
            Fitur
          </a>
          <a href="#manfaat" className="hover:text-white transition-colors">
            Manfaat
          </a>
          <a href="#harga" className="hover:text-white transition-colors">
            Harga
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/auth/login"
            className="text-xs sm:text-sm font-bold text-[#afc8f0] hover:text-white px-2.5 sm:px-3 py-2 transition-colors"
          >
            Masuk
          </Link>
          <a
            href="#fitur"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-[#fc8f34] text-[#000613] text-xs sm:text-sm font-extrabold hover:bg-[#f97316] transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            <span>Lihat Cara Kerja</span>
            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#afc8f0] hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Menu Navigasi"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu & Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-50 flex flex-col w-full max-w-full">
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs transition-opacity w-full max-w-full"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative bg-[#001f3f] border-b border-[#2f486a] p-5 shadow-2xl z-10 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200 w-full max-w-full box-border">
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[#afc8f0] hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#fc8f34]">view_kanban</span>
              <span>Fitur Utama</span>
            </a>
            <a
              href="#manfaat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[#afc8f0] hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#fc8f34]">verified_user</span>
              <span>Manfaat &amp; Solusi</span>
            </a>
            <a
              href="#harga"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[#afc8f0] hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#fc8f34]">payments</span>
              <span>Pilihan Harga</span>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[#afc8f0] hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#fc8f34]">help</span>
              <span>FAQ / Tanya Jawab</span>
            </a>

            <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-white/10 hover:bg-white/20 active:scale-[0.99] transition-all"
              >
                Masuk ke Akun
              </Link>
              <a
                href="#harga"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl text-center text-sm font-extrabold text-[#000613] bg-[#fc8f34] hover:bg-[#f97316] active:scale-[0.99] transition-all shadow-md"
              >
                Pilih Paket Berlangganan
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
