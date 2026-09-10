"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

interface HeaderProps {
  officeName?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

export function Header({
  officeName = "Kantor Notaris & PPAT",
  userEmail = "",
  userName = "User",
  userRole = "STAFF",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mobileNavItems = [
    { label: "Overview", href: "/dashboard", icon: "dashboard" },
    { label: "Perkara / Akta", href: "/dashboard/matters", icon: "work" },
    { label: "Jadwal Signing", href: "/dashboard/signing", icon: "draw" },
    { label: "Dokumen", href: "/dashboard/documents", icon: "description" },
    { label: "Keuangan & Tagihan", href: "/dashboard/billing", icon: "payments" },
    { label: "Kontrol", href: "/dashboard/control", icon: "settings_accessibility" },
    { label: "Klien", href: "/dashboard/clients", icon: "group" },
    { label: "Pengaturan", href: "/dashboard/settings", icon: "settings" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-16 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
      {/* Left: Mobile Toggle & Office Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#001f3f] text-xl hidden sm:inline-block">
            account_balance
          </span>
          <span className="text-sm sm:text-base font-bold text-[#001f3f] truncate max-w-[200px] sm:max-w-md">
            {officeName}
          </span>
        </div>
      </div>

      {/* Right: Quick Search, Notif, Action Button, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Global Quick Search */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nomor perkara, klien, akta..."
            className="h-9 pl-9 pr-4 rounded-full bg-[#f3f4f5] border border-transparent text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#001f3f] focus:outline-none w-64 transition-all"
          />
        </div>

        {/* Notifications Icon */}
        <Link
          href="/dashboard/control"
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:text-[#001f3f] hover:bg-gray-100 transition-colors relative"
          title="Notifikasi & Kontrol Operasional"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E74C3C] rounded-full ring-2 ring-white"></span>
        </Link>

        {/* Quick Action Button */}
        <Link
          href="/dashboard/matters/new"
          className="h-9 px-3.5 bg-[#000613] hover:bg-[#001f3f] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">add</span>
          <span>Buat Perkara</span>
        </Link>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#001f3f] text-[#fc8f34] font-bold flex items-center justify-center text-xs shadow-xs" title={userEmail}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
              title="Logout / Keluar Akun"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-[#001f3f] border-b border-[#2f486a] p-4 shadow-xl z-50 flex flex-col gap-1">
          <div className="pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-[#6f88ad] uppercase">
            Menu Operasional
          </div>
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                pathname === item.href
                  ? "bg-[#6f88ad]/30 text-white border-l-4 border-[#fc8f34]"
                  : "text-[#afc8f0] hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-white/10">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Keluar Akun (Logout)</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
