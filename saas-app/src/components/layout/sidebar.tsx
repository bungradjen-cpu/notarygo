"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export function Sidebar({ userRole = "STAFF", userName = "User" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: "dashboard",
      exact: true,
    },
    {
      label: "Perkara / Akta",
      href: "/dashboard/matters",
      icon: "work",
      badge: null,
    },
    {
      label: "Jadwal Signing",
      href: "/dashboard/signing",
      icon: "draw",
    },
    {
      label: "Dokumen & Berkas",
      href: "/dashboard/documents",
      icon: "description",
    },
    {
      label: "Keuangan & Tagihan",
      href: "/dashboard/billing",
      icon: "payments",
    },
    {
      label: "Kontrol Operasional",
      href: "/dashboard/control",
      icon: "settings_accessibility",
    },
    {
      label: "Klien & Rekanan",
      href: "/dashboard/clients",
      icon: "group",
    },
    {
      label: "Tim & Staf Kantor",
      href: "/dashboard/team",
      icon: "badge",
    },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#001f3f] border-r border-[#2f486a] shadow-md justify-between z-50">
      <div className="flex flex-col">
        {/* Brand Logo Header */}
        <div className="px-5 py-5 flex items-center border-b border-[#2f486a]/50">
          <Link href="/dashboard" className="bg-white px-3.5 py-2.5 rounded-xl flex items-center justify-center shadow-md w-full hover:shadow-lg transition-all hover:scale-[1.01]">
            <img src="/logo.png" alt="NOTARYGO™" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>
        </div>



        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-semibold text-[#6f88ad] uppercase tracking-wider">
            Menu Operasional
          </div>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#6f88ad]/25 text-white border-l-4 border-[#fc8f34] shadow-sm"
                    : "text-[#afc8f0] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile, Settings & Logout */}
      <div className="p-4 border-t border-[#2f486a]/60 flex flex-col gap-2 bg-[#001832]/40">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            pathname.startsWith("/dashboard/settings")
              ? "bg-[#6f88ad]/20 text-white"
              : "text-[#afc8f0] hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>Pengaturan Kantor</span>
        </Link>

        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#afc8f0] text-[#001f3f] font-bold flex items-center justify-center text-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-[#fc8f34] font-medium uppercase tracking-wider truncate">
                {userRole}
              </p>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              title="Keluar / Logout"
              className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
