import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { requireSuperadmin, logPlatformAdminAudit } from "@/lib/auth/superadmin";
import { revalidatePath } from "next/cache";

interface PageProps {
  searchParams: Promise<{ filter?: string; orgId?: string }>;
}

export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter || "ALL";
  const orgIdFilter = params.orgId || "";

  const { organizations } = await SuperadminService.getOrganizationsList({
    limit: 100,
  });

  const now = new Date();

  // Filter subscriptions
  const subs = organizations.filter((org) => {
    if (orgIdFilter && org.id !== orgIdFilter) return false;
    if (filter === "ACTIVE") return org.subscriptionStatus === "ACTIVE";
    if (filter === "EXPIRING_7D") return org.daysRemaining !== null && org.daysRemaining <= 7 && org.daysRemaining >= 0;
    if (filter === "EXPIRING_14D") return org.daysRemaining !== null && org.daysRemaining <= 14 && org.daysRemaining >= 0;
    if (filter === "EXPIRING_30D") return org.daysRemaining !== null && org.daysRemaining <= 30 && org.daysRemaining >= 0;
    if (filter === "EXPIRED") return org.subscriptionStatus === "EXPIRED";
    return true;
  });

  // Server Action for Controlled Subscription Extension
  async function handleExtendSubscription(formData: FormData) {
    "use server";
    const admin = await requireSuperadmin();
    const orgId = formData.get("organizationId") as string;
    const daysToAdd = parseInt(formData.get("days") as string, 10) || 30;
    const reason = formData.get("reason") as string;

    if (!reason || reason.trim().length < 5) {
      throw new Error("Alasan perpanjangan wajib diisi minimal 5 karakter untuk audit log.");
    }

    const sb = await (SuperadminService as any).getSupabaseAdmin();
    const { data: currentSub } = await sb
      .from("subscriptions")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();

    if (!currentSub) throw new Error("Langganan tidak ditemukan");

    const currentEnd = currentSub.current_period_end ? new Date(currentSub.current_period_end) : new Date();
    const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + daysToAdd * 24 * 60 * 60 * 1000);

    const { data: updatedSub, error: updateErr } = await sb
      .from("subscriptions")
      .update({
        status: "ACTIVE",
        current_period_end: newEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentSub.id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    await logPlatformAdminAudit({
      adminUserId: admin.userId,
      action: "SUBSCRIPTION_OVERRIDE",
      targetType: "SUBSCRIPTION",
      targetId: currentSub.id,
      reason,
      beforeState: currentSub,
      afterState: updatedSub,
      metadata: { daysAdded: daysToAdd, newEnd: newEnd.toISOString() },
    });

    revalidatePath("/superadmin/subscriptions");
    revalidatePath("/superadmin");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Manajemen Langganan SaaS (Subscriptions)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Status periode aktif, kontrol penangguhan/perpanjangan teraudit, dan antrean kedaluwarsa.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs">
        {[
          { label: "Semua Langganan", val: "ALL" },
          { label: "Aktif", val: "ACTIVE" },
          { label: "Expiring 7 Hari", val: "EXPIRING_7D" },
          { label: "Expiring 14 Hari", val: "EXPIRING_14D" },
          { label: "Expiring 30 Hari", val: "EXPIRING_30D" },
          { label: "Expired", val: "EXPIRED" },
        ].map((tab) => (
          <a
            key={tab.val}
            href={`/superadmin/subscriptions?filter=${tab.val}`}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === tab.val
                ? "bg-[#0B1F4D] text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Subscriptions Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Kantor Notaris</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Kedaluwarsa</th>
                <th className="py-3.5 px-4">Sisa Hari</th>
                <th className="py-3.5 px-5 text-right">Aksi Terkontrol (Audit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.length > 0 ? (
                subs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">
                      {sub.name}
                      <div className="text-[10px] text-slate-400 font-normal">{sub.notaryName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{sub.ownerName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{sub.ownerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sub.subscriptionStatus === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : sub.subscriptionStatus === "EXPIRED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {sub.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {sub.periodEnd
                        ? new Date(sub.periodEnd).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Tidak Berbatas"}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.daysRemaining !== null ? (
                        <span
                          className={`font-semibold ${
                            sub.daysRemaining <= 3
                              ? "text-red-600 font-bold"
                              : sub.daysRemaining <= 7
                              ? "text-amber-600 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {sub.daysRemaining > 0 ? `${sub.daysRemaining} Hari` : "Kedaluwarsa"}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <details className="inline-block text-left">
                        <summary className="px-2.5 py-1 text-[11px] font-bold text-[#0B1F4D] hover:bg-slate-100 rounded border border-slate-200 cursor-pointer select-none">
                          Perpanjang / Override
                        </summary>
                        <div className="absolute right-6 mt-2 w-80 bg-white p-4 rounded-xl shadow-xl border border-slate-200 z-50 text-xs space-y-3">
                          <div className="font-bold text-slate-900 border-b pb-2">
                            Perpanjang Akses Kantor
                          </div>
                          <form action={handleExtendSubscription} className="space-y-2.5">
                            <input type="hidden" name="organizationId" value={sub.id} />
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Tambah Durasi
                              </label>
                              <select
                                name="days"
                                className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 text-xs"
                              >
                                <option value="30">+30 Hari (1 Bulan)</option>
                                <option value="90">+90 Hari (3 Bulan)</option>
                                <option value="365">+365 Hari (1 Tahun)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Alasan Perubahan (Wajib Masuk Audit Log)
                              </label>
                              <textarea
                                name="reason"
                                required
                                placeholder="Contoh: Konfirmasi pembayaran manual perpanjangan rekening BNI..."
                                rows={2}
                                className="w-full p-2 text-xs rounded border border-slate-200 focus:outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full py-1.5 bg-[#0B1F4D] hover:bg-[#07152F] text-white font-bold rounded text-xs transition-colors"
                            >
                              Simpan &amp; Catat Log
                            </button>
                          </form>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data langganan yang cocok dengan filter.
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
