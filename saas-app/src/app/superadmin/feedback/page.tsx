import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { requireSuperadmin, logPlatformAdminAudit } from "@/lib/auth/superadmin";
import { revalidatePath } from "next/cache";

export default async function FeedbackPage() {
  const sb = await (SuperadminService as any).getSupabaseAdmin();
  const { data: feedback } = await sb
    .from("feedback_items")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false });

  const list = feedback || [];

  async function handleUpdateStatus(formData: FormData) {
    "use server";
    const admin = await requireSuperadmin();
    const itemId = formData.get("itemId") as string;
    const status = formData.get("status") as string;

    const sb = await (SuperadminService as any).getSupabaseAdmin();
    await sb
      .from("feedback_items")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    await logPlatformAdminAudit({
      adminUserId: admin.userId,
      action: "FEEDBACK_STATUS_UPDATED",
      targetType: "FEEDBACK_ITEM",
      targetId: itemId,
      reason: `Status feedback diubah menjadi ${status}`,
    });

    revalidatePath("/superadmin/feedback");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Aspirasi &amp; Umpan Balik Notaris (Feedback &amp; Feature Requests)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kotak saran dan usulan pengembangan fitur (&ldquo;Fitur apa yang Anda harapkan untuk aplikasi ini?&rdquo;).
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Pesan Masukan / Usulan Fitur</th>
                <th className="py-3.5 px-4">Kantor Pengirim</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Status Roadmap</th>
                <th className="py-3.5 px-4">Waktu Dikirim</th>
                <th className="py-3.5 px-5 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-900 max-w-md">
                      &ldquo;{item.message}&rdquo;
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.organizations?.name || "Anonim"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          item.status === "PLANNED"
                            ? "bg-purple-100 text-purple-800"
                            : item.status === "RELEASED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <form action={handleUpdateStatus} className="inline-flex items-center gap-1.5">
                        <input type="hidden" name="itemId" value={item.id} />
                        <select
                          name="status"
                          defaultValue={item.status}
                          className="h-7 px-1.5 rounded border border-slate-200 text-[11px] bg-slate-50"
                        >
                          <option value="REQUESTED">REQUESTED</option>
                          <option value="UNDER_REVIEW">UNDER REVIEW</option>
                          <option value="PLANNED">PLANNED</option>
                          <option value="IN_DEVELOPMENT">IN DEV</option>
                          <option value="RELEASED">RELEASED</option>
                          <option value="REJECTED">REJECTED</option>
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada masukan atau usulan fitur tercatat.
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
