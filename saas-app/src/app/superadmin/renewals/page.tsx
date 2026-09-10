import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { requireSuperadmin, logPlatformAdminAudit } from "@/lib/auth/superadmin";
import { revalidatePath } from "next/cache";

interface PageProps {
  searchParams: Promise<{ queue?: string }>;
}

export default async function RenewalsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const queue = params.queue || "7D";

  const { organizations } = await SuperadminService.getOrganizationsList({ limit: 100 });
  const now = new Date();

  // Categorize organizations into renewal pipelines
  const pipeline = organizations.filter((org) => {
    if (!org.periodEnd) return false;
    const end = new Date(org.periodEnd);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (queue === "TODAY") return diffDays <= 1 && diffDays >= 0;
    if (queue === "7D") return diffDays <= 7 && diffDays >= 0;
    if (queue === "14D") return diffDays <= 14 && diffDays > 7;
    if (queue === "30D") return diffDays <= 30 && diffDays > 14;
    if (queue === "EXPIRED_1_7D") return diffDays < 0 && diffDays >= -7;
    if (queue === "EXPIRED_8_30D") return diffDays < -7 && diffDays >= -30;
    return true;
  });

  // Action to log contact attempt
  async function handleContact(formData: FormData) {
    "use server";
    const admin = await requireSuperadmin();
    const orgId = formData.get("orgId") as string;
    const status = formData.get("status") as string;
    const note = formData.get("note") as string;

    const sb = await (SuperadminService as any).getSupabaseAdmin();
    await sb.from("renewal_activities").insert({
      organization_id: orgId,
      subscription_id: orgId, // linked to org
      contact_status: status,
      note,
      channel: "WHATSAPP",
      created_at: new Date().toISOString(),
    });

    await logPlatformAdminAudit({
      adminUserId: admin.userId,
      action: "RENEWAL_CONTACT_LOGGED",
      targetType: "ORGANIZATION",
      targetId: orgId,
      reason: `Follow-up renewal: ${status}. Catatan: ${note}`,
    });

    revalidatePath("/superadmin/renewals");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Operasi Perpanjangan Langganan (Renewal Operations)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            CRM penjangkauan kantor notaris menjelang habis masa aktif untuk memaksimalkan retensi dan revenue renewal.
          </p>
        </div>
      </div>

      {/* Queue Pipelines Tabs */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs">
        {[
          { label: "Kedaluwarsa Hari Ini (< 24 Jam)", val: "TODAY" },
          { label: "Habis Dalam 7 Hari", val: "7D" },
          { label: "Habis Dalam 14 Hari", val: "14D" },
          { label: "Habis Dalam 30 Hari", val: "30D" },
          { label: "Expired 1 - 7 Hari", val: "EXPIRED_1_7D" },
          { label: "Expired 8 - 30 Hari", val: "EXPIRED_8_30D" },
        ].map((tab) => (
          <a
            key={tab.val}
            href={`/superadmin/renewals?queue=${tab.val}`}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              queue === tab.val
                ? "bg-[#0B1F4D] text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Kantor Notaris</th>
                <th className="py-3.5 px-4">Kontak Notaris / Owner</th>
                <th className="py-3.5 px-4">Tanggal Berakhir</th>
                <th className="py-3.5 px-4">Sisa Hari</th>
                <th className="py-3.5 px-4">Health Status</th>
                <th className="py-3.5 px-5 text-right">Tindak Lanjut WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pipeline.length > 0 ? (
                pipeline.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">
                      {org.name}
                      <div className="text-[10px] text-slate-400 font-normal">{org.city}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{org.notaryName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{org.ownerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {new Date(org.periodEnd!).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          org.daysRemaining! <= 3
                            ? "text-red-600"
                            : org.daysRemaining! <= 7
                            ? "text-amber-600"
                            : "text-slate-800"
                        }`}
                      >
                        {org.daysRemaining! > 0
                          ? `${org.daysRemaining} Hari Lagi`
                          : `Lewat ${Math.abs(org.daysRemaining!)} Hari`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          org.healthStatus === "HEALTHY"
                            ? "bg-emerald-100 text-emerald-800"
                            : org.healthStatus === "WATCH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {org.healthStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <details className="inline-block text-left">
                        <summary className="px-2.5 py-1 text-[11px] font-bold text-[#0B1F4D] hover:bg-slate-100 rounded border border-slate-200 cursor-pointer select-none">
                          Catat Tindak Lanjut
                        </summary>
                        <div className="absolute right-6 mt-2 w-80 bg-white p-4 rounded-xl shadow-xl border border-slate-200 z-50 text-xs space-y-3">
                          <div className="font-bold text-slate-900 border-b pb-1.5">
                            Status Kontak Renewal
                          </div>
                          <form action={handleContact} className="space-y-2.5">
                            <input type="hidden" name="orgId" value={org.id} />
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Status Respon
                              </label>
                              <select
                                name="status"
                                className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 text-xs"
                              >
                                <option value="WHATSAPP_SENT">Pesan WhatsApp Terkirim</option>
                                <option value="INTERESTED">Berminat Perpanjang</option>
                                <option value="RENEWED">Sudah Perpanjang</option>
                                <option value="NO_RESPONSE">Belum Ada Balasan</option>
                                <option value="DECLINED">Menolak Perpanjang</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Catatan Hasil Komunikasi
                              </label>
                              <textarea
                                name="note"
                                rows={2}
                                placeholder="Contoh: Sudah konfirmasi ke sekretaris kantor..."
                                className="w-full p-2 text-xs rounded border border-slate-200"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full py-1.5 bg-[#0B1F4D] hover:bg-[#07152F] text-white font-bold rounded text-xs transition-colors"
                            >
                              Simpan Catatan
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
                    Tidak ada kantor dalam antrean perpanjangan pipa ini.
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
