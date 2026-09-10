"use client";

import { useEffect, useState } from "react";

export function StickyMobileBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past ~500px
      if (window.scrollY > 500) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 w-full max-w-full bg-[#000613]/95 backdrop-blur-md border-t border-[#2f486a] px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-2 duration-200 box-border">
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white tracking-wide">NOTARYGO™</span>
          <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-extrabold bg-[#fc8f34] text-[#000613] shrink-0">
            HEMAT 68%
          </span>
        </div>
        <p className="text-[11px] text-[#afc8f0] font-medium leading-tight truncate">
          Mulai <strong className="text-white">Rp 129rb</strong> <span className="text-gray-400">atau</span> <strong className="text-[#fc8f34]">±Rp41.500/bln</strong>
        </p>
      </div>

      <a
        href="#harga"
        className="h-9 px-3.5 rounded-xl bg-[#fc8f34] hover:bg-[#f97316] text-[#000613] text-xs font-extrabold shadow-md flex items-center gap-1 transition-all active:scale-95 shrink-0 ml-2"
      >
        <span>Lihat Paket</span>
        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
      </a>
    </div>
  );
}


