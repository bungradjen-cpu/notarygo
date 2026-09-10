import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MattersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
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

  const { status: filterStatus, search } = await searchParams;

  let query = supabase
    .from("matters")
    .select(
      "id, matter_number, title, status, created_at, clients(id, name), service_types(id, name), profiles(id, full_name)"
    )
    .eq("org_id", member.org_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filterStatus && filterStatus !== "ALL") {
    query = query.eq("status", filterStatus);
  }

  if (search) {
    query = query.or(`matter_number.ilike.%${search}%,title.ilike.%${search}%`);
  }

  const { data: matters } = await query;

  return (
    <div className="space-y-6">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Register Perkara &amp; Akta
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Buku register kendali operasional seluruh perkara aktif dan arsip akta kantor.
          </p>
        </div>
        <Link
          href="/dashboard/matters/new"
          className="h-10 px-5 bg-[#001f3f] hover:bg-[#000613] text-white rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[20px] text-[#fc8f34]">
            add_task
          </span>
          <span>+ Buat Perkara Baru</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap gap-4 items-center justify-between">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <Link
            href="/dashboard/matters"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              !filterStatus || filterStatus === "ALL"
                ? "bg-[#001f3f] text-white"
                : "text-[#43474e] hover:bg-[#f3f4f5]"
            }`}
          >
            Semua ({matters?.length || 0})
          </Link>
          <Link
            href="/dashboard/matters?status=OPEN"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterStatus === "OPEN"
                ? "bg-[#001f3f] text-white"
                : "text-[#43474e] hover:bg-[#f3f4f5]"
            }`}
          >
            Open / Baru
          </Link>
          <Link
            href="/dashboard/matters?status=IN_PROGRESS"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterStatus === "IN_PROGRESS"
                ? "bg-[#001f3f] text-white"
                : "text-[#43474e] hover:bg-[#f3f4f5]"
            }`}
          >
            Sedang Berjalan
          </Link>
          <Link
            href="/dashboard/matters?status=CLOSED"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterStatus === "CLOSED"
                ? "bg-[#001f3f] text-white"
                : "text-[#43474e] hover:bg-[#f3f4f5]"
            }`}
          >
            Selesai / Arsip
          </Link>
        </div>

        {/* Search Input */}
        <form method="GET" className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            name="search"
            defaultValue={search || ""}
            placeholder="Cari no. perkara, judul..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#f8f9fa] border border-[#E2E8F0] text-xs text-[#191c1d] focus:bg-white focus:outline-none focus:border-[#001f3f]"
          />
        </form>
      </div>

      {/* Register Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">No. Perkara</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Judul Perkara / Akta</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Klien</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Jenis Layanan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">PIC</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#191c1d]">
              {matters && matters.length > 0 ? (
                matters.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-[#f8f9fa] transition-colors group"
                  >
                    <td className="py-4 px-4 font-bold text-[#001f3f] whitespace-nowrap">
                      <Link
                        href={`/dashboard/matters/${m.id}`}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          folder
                        </span>
                        <span>{m.matter_number}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#191c1d] max-w-xs truncate">
                      {m.title}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#001f3f]/10 text-[#001f3f] flex items-center justify-center text-[10px] font-bold">
                          {((m.clients as any)?.name || "K").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[150px]">
                          {(m.clients as any)?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#43474e] whitespace-nowrap">
                      {(m.service_types as any)?.name || "Layanan Notaris"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {(m.profiles as any)?.full_name || (
                        <span className="text-[#E67E22] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            person_off
                          </span>
                          Tanpa PIC
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.status === "OPEN"
                            ? "bg-blue-100 text-[#3498DB] border border-blue-200"
                            : m.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-[#E67E22] border border-amber-200"
                            : m.status === "CLOSED"
                            ? "bg-green-100 text-[#10B981] border border-green-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/matters/${m.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#001f3f] font-semibold text-xs transition-colors"
                      >
                        <span>Buka</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                      folder_off
                    </span>
                    <p className="text-sm font-medium">Belum ada data perkara yang ditemukan.</p>
                    <Link
                      href="/dashboard/matters/new"
                      className="mt-3 inline-block px-4 py-2 bg-[#001f3f] text-white rounded-md text-xs font-semibold shadow-sm"
                    >
                      + Buat Perkara Baru
                    </Link>
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
