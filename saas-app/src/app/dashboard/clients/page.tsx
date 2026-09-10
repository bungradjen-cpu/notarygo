import { createClient } from "@/utils/supabase/server";
import { upsertClientAction } from "../matters/actions";
import { ClientListTable } from "@/components/clients/ClientListTable";
import { redirect } from "next/navigation";

export default async function ClientsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
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

  const { search } = await searchParams;

  let query = supabase
    .from("clients")
    .select("*, matters(id)")
    .eq("org_id", member.org_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: clients } = await query;

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Direktori Klien &amp; Pihak Terkait
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Database kontak para penghadap, badan hukum, dan riwayat perkara klien kantor Notaris &amp; PPAT.
          </p>
        </div>
      </div>

      {/* Add New Client Form */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h2 className="text-sm font-bold text-[#000613] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#001f3f] text-lg">person_add</span>
          Tambah Klien Baru
        </h2>
        <form action={upsertClientAction} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input type="hidden" name="orgId" value={member.org_id} />
          <div>
            <input
              type="text"
              name="name"
              required
              placeholder="Nama Lengkap Klien / Badan Usaha *"
              className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              name="phone"
              placeholder="No. Telepon / WhatsApp..."
              className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              name="identifier"
              placeholder="NIK / NPWP..."
              className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full h-10 bg-[#001f3f] hover:bg-[#000613] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">add</span>
              <span>Simpan Klien</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Search & Stats */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="text-xs font-semibold text-[#43474e] uppercase">
          Total Terdaftar: {clients?.length || 0} Klien
        </div>

        <form method="GET" className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            name="search"
            defaultValue={search || ""}
            placeholder="Cari nama klien / kontak..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#f8f9fa] border border-[#E2E8F0] text-xs text-[#191c1d] focus:bg-white focus:outline-none focus:border-[#001f3f]"
          />
        </form>
      </div>

      {/* Interactive Clients Table with Edit Modal & Soft Delete */}
      <ClientListTable clients={clients || []} orgId={member.org_id} />
    </div>
  );
}
