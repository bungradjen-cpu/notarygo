import { requireSuperadmin } from "@/lib/auth/superadmin";
import { SuperadminNav } from "@/components/superadmin/SuperadminNav";
import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { logout } from "@/app/auth/actions";
import Link from "next/link";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Strict Server-Side Single Superadmin Authorization
  const adminContext = await requireSuperadmin();

  // 2. Fetch live badge counts for Attention Center & Unclaimed Payments
  const attentionItems = await SuperadminService.getAttentionItems().catch(() => []);
  const kpis = await SuperadminService.getOverviewMetrics().catch(() => ({
    unclaimedPaymentsCount: 0,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-[#10213D]">
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#07152F] text-white flex flex-col z-50 border-r border-slate-800/80 shadow-xl">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-[#0B1F4D]/40">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-lg shadow-sm flex items-center">
              <img src="/logo.png" alt="NOTARYGO™" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-wider uppercase text-[#E89A0C]">
                COMMAND CENTER
              </div>
              <div className="text-[9px] text-slate-400 font-medium">Platform Superadmin</div>
            </div>
          </div>
        </div>

        {/* Live Platform Pulse */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-semibold">Mayar &amp; Supabase</span>
          </div>
          <span className="text-emerald-400 font-bold text-[10px] uppercase">Active</span>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <SuperadminNav
            attentionCount={attentionItems.length}
            unclaimedCount={kpis.unclaimedPaymentsCount}
          />
        </div>

        {/* Superadmin Identity Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-800/60">
            <div className="truncate">
              <div className="text-[11px] font-bold text-white truncate">
                {adminContext.fullName}
              </div>
              <div className="text-[10px] text-[#E89A0C] font-mono truncate">
                {adminContext.email}
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                title="Keluar (Logout)"
                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">logout</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Command Center Viewport */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-16 w-full flex items-center justify-between px-6 shadow-xs">
          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari organisasi, email, nomor NGPAY, atau ID Mayar..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0B1F4D] focus:ring-1 focus:ring-[#0B1F4D] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Tenant View</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0B1F4D] text-[#E89A0C] font-bold text-xs flex items-center justify-center shadow-xs">
                SA
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#10213D]">
                  {adminContext.fullName}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  Platform Admin
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
