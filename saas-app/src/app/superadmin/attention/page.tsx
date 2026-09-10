import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import Link from "next/link";

export default async function AttentionCenterPage() {
  const items = await SuperadminService.getAttentionItems();

  const criticalCount = items.filter((i) => i.severity === "CRITICAL").length;
  const highCount = items.filter((i) => i.severity === "HIGH").length;
  const mediumCount = items.filter((i) => i.severity === "MEDIUM").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
              Attention Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pusat agregasi anomali operasional, pembayaran tak bertuan, kegagalan webhook, dan langganan mendekati batas kedaluwarsa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            {criticalCount} Critical
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {highCount} High
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {mediumCount} Medium
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daftar Anomali Memerlukan Tindakan ({items.length})
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Diurutkan berdasarkan tingkat keparahan
          </span>
        </div>

        {items.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        item.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : item.severity === "HIGH"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {item.severity} &bull; {item.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Ref: {item.reference}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Terdeteksi: {new Date(item.detectedTime).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-[#10213D]">
                    {item.customerName} &bull;{" "}
                    <span className="text-slate-500 font-normal font-mono text-xs">
                      {item.customerEmail}
                    </span>
                    {item.organizationName && (
                      <span className="text-slate-600 font-semibold text-xs ml-1">
                        ({item.organizationName})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.reason}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F4D] pt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#E89A0C]">
                      recommend
                    </span>
                    <span>Tindakan Disarankan: {item.recommendedAction}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {item.type === "UNCLAIMED_PAYMENT" && (
                    <Link
                      href="/superadmin/unclaimed-payments"
                      className="px-3.5 py-2 bg-[#0B1F4D] hover:bg-[#07152F] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Selesaikan Klaim</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  )}
                  {item.type.includes("EXPIRING") && (
                    <Link
                      href="/superadmin/renewals"
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Follow-up Renewal</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  )}
                  {item.type === "PAYMENT_PENDING_TOO_LONG" && (
                    <Link
                      href="/superadmin/transactions"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Periksa Transaksi
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-emerald-500">
              check_circle
            </span>
            <div className="text-sm font-bold text-slate-700">
              Semua Operasional Terkendali
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ditemukan anomali pembayaran, webhook gagal, maupun peringatan kedaluwarsa mendesak saat ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
