import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SigningManagementPage() {
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

  // Fetch matters with active signing status
  const { data: signingMatters } = await supabase
    .from("matters")
    .select("*, clients(name), profiles(full_name)")
    .eq("org_id", member.org_id)
    .in("status", ["OPEN", "IN_PROGRESS"])
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Jadwal Penandatanganan &amp; Signing Akta
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Manajemen agenda pertemuan, pembacaan, dan penandatanganan akta bersama para pihak.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-6 text-xs font-bold">
        <button className="text-[#001f3f] border-b-2 border-[#001f3f] pb-3 px-1">
          Semua Jadwal Signing
        </button>
      </div>

      {/* Cards Grid Layout (Stitch Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {signingMatters && signingMatters.length > 0 ? (
          signingMatters.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3498DB]"></div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#f3f4f5] text-[#001f3f] px-3 py-1.5 rounded-md flex flex-col items-center justify-center border border-[#E2E8F0]">
                      <span className="text-xs font-bold leading-none">10:00</span>
                      <span className="text-[9px] uppercase text-gray-500 mt-0.5">WIB</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#001f3f] leading-tight">
                        {m.title}
                      </h3>
                      <p className="text-xs text-[#43474e] mt-0.5">Ref: {m.matter_number}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#3498DB] text-[10px] font-bold uppercase border border-blue-200">
                    DIJADWALKAN
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                      Klien / Pihak
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-800 font-medium truncate">
                      <span className="material-symbols-outlined text-gray-400 text-sm">
                        person
                      </span>
                      <span>{(m.clients as any)?.name || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                      PIC Staff
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-800 font-medium truncate">
                      <span className="material-symbols-outlined text-gray-400 text-sm">
                        badge
                      </span>
                      <span>{(m.profiles as any)?.full_name || "Tanpa PIC"}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                      Lokasi Signing
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                      <span className="material-symbols-outlined text-gray-400 text-sm">
                        location_on
                      </span>
                      <span>Ruang Rapat Utama &bull; Kantor Notaris</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <Link
                  href={`/dashboard/matters/${m.id}`}
                  className="px-4 py-2 rounded bg-[#001f3f] text-white text-xs font-semibold hover:bg-[#000613] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Buka Berkas Perkara</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center bg-white rounded-xl border border-[#E2E8F0] text-gray-400">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
              event_available
            </span>
            <p className="text-sm font-medium">Tidak ada jadwal signing akta hari ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
