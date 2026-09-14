import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ControlExceptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!member) {
    redirect("/onboarding/create-org");
  }

  const orgId = member.org_id;
  const adminClient = createAdminClient();

  // Pending Items (using adminClient to fetch profiles across team members)
  const { data: pendingItems } = await adminClient
    .from("pending_items")
    .select("*, matters(id, matter_number, title, profiles(full_name))")
    .eq("org_id", orgId)
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  // Unassigned matters
  const { data: unassignedMatters } = await adminClient
    .from("matters")
    .select("id, matter_number, title, created_at, clients(name)")
    .eq("org_id", orgId)
    .is("pic_id", null)
    .is("deleted_at", null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Pusat Kendali &amp; Kontrol Operasional
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Monitoring kendala, perkara tanpa PIC, dan exception yang memerlukan eskalasi pimpinan kantor.
          </p>
        </div>
      </div>

      {/* Exception Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Pending Items / Kendala Aktif */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E74C3C] text-xl">
                error
              </span>
              <h2 className="text-base font-bold text-[#000613]">
                Kendala Perkara (Pending Items)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-[#E74C3C]">
              {pendingItems?.length || 0} Perkara
            </span>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {pendingItems && pendingItems.length > 0 ? (
              pendingItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-[#f8f9fa] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#001f3f]">
                      {(item.matters as any)?.matter_number}
                    </span>
                    <Link
                      href={`/dashboard/matters/${(item.matters as any)?.id}`}
                      className="text-xs text-[#3498DB] font-semibold hover:underline"
                    >
                      Buka Perkara &rarr;
                    </Link>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    Perkara: {(item.matters as any)?.title} &bull; PIC:{" "}
                    {(item.matters as any)?.profiles?.full_name || "Tanpa PIC"}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs">
                Tidak ada kendala aktif saat ini.
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Perkara Tanpa PIC */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E67E22] text-xl">
                person_off
              </span>
              <h2 className="text-base font-bold text-[#000613]">
                Perkara Belum Ada PIC
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-[#E67E22]">
              {unassignedMatters?.length || 0} Perkara
            </span>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {unassignedMatters && unassignedMatters.length > 0 ? (
              unassignedMatters.map((m) => (
                <div key={m.id} className="p-4 hover:bg-[#f8f9fa] transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#001f3f]">{m.matter_number}</span>
                    <Link
                      href={`/dashboard/matters/${m.id}`}
                      className="px-2.5 py-1 rounded bg-[#001f3f] text-white text-xs font-semibold"
                    >
                      Tugaskan PIC
                    </Link>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-500">
                    Klien: {(m.clients as any)?.name || "-"}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs">
                Semua perkara telah memiliki penanggung jawab (PIC).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
