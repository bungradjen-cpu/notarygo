import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { requireSuperadmin, logPlatformAdminAudit } from "@/lib/auth/superadmin";
import { revalidatePath } from "next/cache";

export default async function ReconciliationPage() {
  const sb = await (SuperadminService as any).getSupabaseAdmin();
  const { data: reconItems } = await sb
    .from("reconciliation_items")
    .select("*")
    .order("detected_at", { ascending: false });

  const items = reconItems || [];

  // Server Action to Resolve Reconciliation Item
  async function handleResolve(formData: FormData) {
    "use server";
    const admin = await requireSuperadmin();
    const itemId = formData.get("itemId") as string;
    const note = formData.get("note") as string;

    const sb = await (SuperadminService as any).getSupabaseAdmin();
    const { data: updated } = await sb
      .from("reconciliation_items")
      .update({
        status: "RESOLVED",
        resolved_at: new Date().toISOString(),
        resolution_note: note || "Diselesaikan manual oleh Superadmin",
      })
      .eq("id", itemId)
      .select()
      .single();

    await logPlatformAdminAudit({
      adminUserId: admin.userId,
      action: "PAYMENT_RECONCILED",
      targetType: "RECONCILIATION",
      targetId: itemId,
      reason: note || "Diselesaikan melalui antrean rekonsiliasi",
      afterState: updated,
    });

    revalidatePath("/superadmin/reconciliation");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Antrean Rekonsiliasi (Reconciliation Queue)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deteksi otomatis ketidaksinkronan status pembayaran Mayar vs aktivasi langganan database internal.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Antrean Terbuka: <strong className="text-red-600">{items.filter((i: any) => i.status === "OPEN").length} Kasus</strong>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Tipe Selisih / Kasus</th>
                <th className="py-3.5 px-4">Tingkat Urgensi</th>
                <th className="py-3.5 px-4">Waktu Terdeteksi</th>
                <th className="py-3.5 px-4">Status Kasus</th>
                <th className="py-3.5 px-4">Catatan Penyelesaian</th>
                <th className="py-3.5 px-5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length > 0 ? (
                items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">
                      {item.type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          item.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {new Date(item.detected_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          item.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {item.resolution_note || "-"}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {item.status !== "RESOLVED" && (
                        <form action={handleResolve} className="inline-block">
                          <input type="hidden" name="itemId" value={item.id} />
                          <button
                            type="submit"
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          >
                            Tandai Selesai
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada anomali rekonsiliasi yang belum terselesaikan. Seluruh transaksi dan hak langganan dalam kondisi selaras.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
