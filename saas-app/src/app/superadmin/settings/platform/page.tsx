import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import { requireSuperadmin, logPlatformAdminAudit } from "@/lib/auth/superadmin";
import { revalidatePath } from "next/cache";

export default async function PlatformSettingsPage() {
  const sb = await (SuperadminService as any).getSupabaseAdmin();
  const { data: settings } = await sb.from("platform_settings").select("*");

  const map: Record<string, any> = {};
  if (settings) {
    for (const s of settings) {
      map[s.key] = s.value;
    }
  }

  const renewalDays = map.renewal_thresholds?.expiring_soon_days ?? 7;
  const inactiveDays = map.health_thresholds?.inactive_days_warning ?? 14;

  async function handleSaveSettings(formData: FormData) {
    "use server";
    const admin = await requireSuperadmin();
    const newRenewalDays = parseInt(formData.get("renewalDays") as string, 10) || 7;
    const newInactiveDays = parseInt(formData.get("inactiveDays") as string, 10) || 14;

    const sb = await (SuperadminService as any).getSupabaseAdmin();
    await sb.from("platform_settings").upsert({
      key: "renewal_thresholds",
      value: { expiring_soon_days: newRenewalDays },
      updated_by: admin.userId,
      updated_at: new Date().toISOString(),
    });

    await sb.from("platform_settings").upsert({
      key: "health_thresholds",
      value: { inactive_days_warning: newInactiveDays },
      updated_by: admin.userId,
      updated_at: new Date().toISOString(),
    });

    await logPlatformAdminAudit({
      adminUserId: admin.userId,
      action: "CONFIG_CHANGED",
      targetType: "PLATFORM_SETTINGS",
      targetId: "operational_thresholds",
      reason: `Ambang batas diubah: renewal=${newRenewalDays}d, inaktivitas=${newInactiveDays}d`,
    });

    revalidatePath("/superadmin/settings/platform");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Konfigurasi Operasional Platform (Platform Settings)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pengaturan ambang batas reminder perpanjangan, ambang batas inaktivitas tenant, dan parameter kalkulasi kesehatan.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-xl">
        <form action={handleSaveSettings} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
              Ambang Batas Peringatan Renewal (Hari)
            </label>
            <input
              type="number"
              name="renewalDays"
              defaultValue={renewalDays}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Kantor yang masa aktifnya tersisa kurang dari atau sama dengan jumlah hari ini akan otomatis masuk Attention Center.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
              Ambang Batas Inaktivitas Tenant (Hari)
            </label>
            <input
              type="number"
              name="inactiveDays"
              defaultValue={inactiveDays}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Kantor yang tidak memiliki aktivitas berkas selama jumlah hari ini akan diberi tanda status WATCH.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B1F4D] hover:bg-[#07152F] text-white font-bold rounded-lg text-xs transition-colors"
            >
              Simpan Perubahan &amp; Catat Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
