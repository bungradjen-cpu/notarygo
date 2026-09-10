import { createClient } from "@/utils/supabase/server";
import { PricingSection } from "@/components/billing/PricingSection";
import { getEmailGrant } from "@/config/active_grants";

export default async function SettingsBillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("profile_id", user.id)
    .single();

  if (!member) return <div>No Organization found.</div>;
  if (
    member.role !== "OWNER" &&
    member.role !== "FINANCE" &&
    member.role !== "ADMIN"
  ) {
    return <div>You do not have permission to view Billing Settings.</div>;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, subscription_plans(name, price, interval)")
    .eq("org_id", member.org_id)
    .maybeSingle();

  const { data: events } = await supabase
    .from("subscription_events")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  const grant = getEmailGrant(user.email);
  const isActive = subscription?.status === "ACTIVE" || !!grant;
  const currentPlanName =
    grant?.planName || subscription?.subscription_plans?.name || "NOTARYGO™ Pro";
  const formattedPeriodEnd = grant
    ? new Date(grant.expiresAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Akses Percobaan (Trial)";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
          Status Langganan &amp; Pembayaran
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Kelola paket langganan NOTARYGO™ kantor Anda dengan transaksi instan Mayar.id.
        </p>
      </div>

      {/* Current Plan Overview Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Paket Aktif Saat Ini
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="text-xl font-extrabold text-[#001f3f]">
                {currentPlanName}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                  isActive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {isActive ? "ACTIVE" : subscription?.status || "TRIALING"}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-gray-500 font-medium">
              Masa Berlaku Hingga:
            </span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {formattedPeriodEnd}
            </p>
          </div>
        </div>

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">
              check_circle
            </span>
            <span>Akses Seluruh Modul Perkara &amp; Akta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">
              check_circle
            </span>
            <span>Checklist &amp; Signing Readiness Para Pihak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">
              check_circle
            </span>
            <span>Invoicing &amp; Backup Dokumen Terenkripsi</span>
          </div>
        </div>
      </div>

      {/* Available Plans & Mayar Upgrade Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#001f3f]">
            Perpanjang atau Upgrade Paket Kantor
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pilih durasi paket di bawah. Selesaikan pembayaran melalui Mayar untuk perpanjangan instan otomatis.
          </p>
        </div>

        <PricingSection showHeader={false} />
      </div>

      {/* Billing Events Audit Trail */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            Riwayat Transaksi &amp; Notifikasi Webhook
          </h3>
          <span className="text-[11px] text-gray-500 font-medium">
            Terverifikasi Real-Time
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {events && events.length > 0 ? (
            events.map((evt: any) => (
              <div
                key={evt.id}
                className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {evt.event_type}
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Status: <span className="font-medium text-emerald-700">{evt.new_status || "SUCCESS"}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right text-gray-500 text-[11px]">
                  <p>
                    {new Date(evt.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-xs text-gray-500">
              Belum ada riwayat transaksi atau webhook tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

