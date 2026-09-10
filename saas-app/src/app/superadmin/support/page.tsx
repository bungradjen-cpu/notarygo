import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { requireSuperadmin, logPlatformAdminAudit } from "@/lib/auth/superadmin";
import { revalidatePath } from "next/cache";

export default async function SupportPage() {
  const sb = await (SuperadminService as any).getSupabaseAdmin();
  const { data: tickets } = await sb
    .from("support_tickets")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false });

  const list = tickets || [];

  // Server Action to Update Ticket Status
  async function handleUpdateTicket(formData: FormData) {
    "use server";
    const admin = await requireSuperadmin();
    const ticketId = formData.get("ticketId") as string;
    const newStatus = formData.get("status") as string;

    const sb = await (SuperadminService as any).getSupabaseAdmin();
    await sb
      .from("support_tickets")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        resolved_at: newStatus === "RESOLVED" || newStatus === "CLOSED" ? new Date().toISOString() : null,
      })
      .eq("id", ticketId);

    await logPlatformAdminAudit({
      adminUserId: admin.userId,
      action: "SUPPORT_TICKET_UPDATED",
      targetType: "SUPPORT_TICKET",
      targetId: ticketId,
      reason: `Status tiket diubah menjadi ${newStatus}`,
    });

    revalidatePath("/superadmin/support");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Bantuan &amp; Tiket Layanan (Support)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penanganan kendala teknis, pembayaran, dan operasional kantor notaris.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Tiket Terbuka: <strong className="text-amber-600">{list.filter((t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS").length}</strong>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Subjek / Masalah</th>
                <th className="py-3.5 px-4">Kantor Notaris</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Status Tiket</th>
                <th className="py-3.5 px-4">Waktu Dibuat</th>
                <th className="py-3.5 px-5 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#0B1F4D]">{t.subject}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{t.description}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.organizations?.name || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {t.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          t.priority === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : t.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          t.status === "OPEN"
                            ? "bg-blue-100 text-blue-800"
                            : t.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(t.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <form action={handleUpdateTicket} className="inline-flex items-center gap-1.5">
                        <input type="hidden" name="ticketId" value={t.id} />
                        <select
                          name="status"
                          defaultValue={t.status}
                          className="h-7 px-1.5 rounded border border-slate-200 text-[11px] bg-slate-50"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                        <button
                          type="submit"
                          className="px-2 py-1 bg-[#0B1F4D] text-white rounded text-[10px] font-bold"
                        >
                          OK
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada tiket support yang diajukan oleh pengguna.
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
