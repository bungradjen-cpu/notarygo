import { createClient } from "@/utils/supabase/server";
import { createMatterAction } from "../actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewMatterPage() {
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

  // Fetch clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("org_id", orgId)
    .order("name", { ascending: true });

  // Fetch service types
  const { data: serviceTypes } = await supabase
    .from("service_types")
    .select("id, code, name")
    .eq("org_id", orgId)
    .order("name", { ascending: true });

  // Fetch team members
  const { data: teamMembers } = await supabase
    .from("organization_members")
    .select("profile_id, profiles(id, full_name, email)")
    .eq("org_id", orgId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#43474e] mb-1">
            <Link href="/dashboard/matters" className="hover:underline">
              Register Perkara
            </Link>
            <span>&rsaquo;</span>
            <span className="text-[#001f3f] font-semibold">Buat Baru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Buat Perkara Baru
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Registrasi informasi dasar dan parameter pengendalian operasional perkara akta.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form action={createMatterAction} className="space-y-6">
        <input type="hidden" name="orgId" value={orgId} />

        {/* Section 1: Informasi Dasar */}
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#001f3f] text-xl">
              info
            </span>
            <h2 className="text-base font-bold text-[#000613]">
              1. Informasi Dasar Perkara
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Input (Direct text typing + optional datalist suggestions) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#43474e] block uppercase tracking-wider">
                Nama Klien Pemohon *
              </label>
              <input
                type="text"
                name="clientName"
                list="client-suggestions"
                required
                placeholder="Ketik langsung nama klien (misal: PT Maju Jaya, Budi Santoso)..."
                className="w-full h-11 border border-[#c4c6cf] rounded-md px-3 text-sm text-[#191c1d] focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] focus:outline-none bg-white placeholder-gray-400"
              />
              <datalist id="client-suggestions">
                {clients?.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            {/* Service Type Input (Direct text typing + optional datalist suggestions) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#43474e] block uppercase tracking-wider">
                Jenis Layanan / Akta *
              </label>
              <input
                type="text"
                name="serviceTypeName"
                list="service-suggestions"
                required
                placeholder="Ketik langsung jenis akta (misal: Akta Jual Beli, SKMHT, APHT, PT)..."
                className="w-full h-11 border border-[#c4c6cf] rounded-md px-3 text-sm text-[#191c1d] focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] focus:outline-none bg-white placeholder-gray-400"
              />
              <datalist id="service-suggestions">
                {serviceTypes?.map((st) => (
                  <option key={st.id} value={st.name} />
                ))}
                <option value="Akta Jual Beli (AJB)" />
                <option value="Surat Kuasa Membebankan Hak Tanggungan (SKMHT)" />
                <option value="Akta Pemberian Hak Tanggungan (APHT)" />
                <option value="Pendirian Perseroan Terbatas (PT)" />
                <option value="Perjanjian Pengikatan Jual Beli (PPJB)" />
                <option value="Akta Hibah" />
                <option value="Akta Wasiat & Keterangan Waris" />
                <option value="Sertifikat Hak Milik (SHM)" />
              </datalist>
            </div>

            {/* Title */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-[#43474e] block uppercase tracking-wider">
                Judul / Objek Perkara *
              </label>
              <input
                name="title"
                required
                placeholder="Contoh: AJB Rumah Tinggal Jl. Sudirman Kav 12 - Ibu Ida Rosdiana"
                className="w-full h-11 border border-[#c4c6cf] rounded-md px-3 text-sm text-[#191c1d] focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] focus:outline-none bg-white"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-[#43474e] block uppercase tracking-wider">
                Deskripsi &amp; Catatan Khusus
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Detail identitas pihak, nomor sertifikat awal, nilai transaksi, atau catatan berkas..."
                className="w-full border border-[#c4c6cf] rounded-md p-3 text-sm text-[#191c1d] focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] focus:outline-none bg-white resize-none"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Penanggung Jawab & Pengendalian */}
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#001f3f] text-xl">
              assignment_ind
            </span>
            <h2 className="text-base font-bold text-[#000613]">
              2. Penanggung Jawab &amp; Deadline
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PIC */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#43474e] block uppercase tracking-wider">
                PIC Staff Penanggung Jawab
              </label>
              <select
                name="picId"
                className="w-full h-11 border border-[#c4c6cf] rounded-md px-3 text-sm text-[#191c1d] focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] focus:outline-none bg-white"
              >
                <option value={user.id}>Saya Sendiri ({user.email})</option>
                {teamMembers?.map((tm) => (
                  <option key={tm.profile_id} value={tm.profile_id}>
                    {(tm.profiles as any)?.full_name || (tm.profiles as any)?.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Deadline */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#43474e] block uppercase tracking-wider">
                Target Deadline Penyelesaian
              </label>
              <input
                type="date"
                name="deadline"
                className="w-full h-11 border border-[#c4c6cf] rounded-md px-3 text-sm text-[#191c1d] focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] focus:outline-none bg-white"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Link
            href="/dashboard/matters"
            className="h-11 px-6 rounded-md bg-white border border-[#E2E8F0] text-sm font-semibold text-gray-700 hover:bg-[#f3f4f5] transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="h-11 px-8 rounded-md bg-[#001f3f] hover:bg-[#000613] text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px] text-[#fc8f34]">
              check_circle
            </span>
            <span>Registrasikan Perkara</span>
          </button>
        </div>
      </form>
    </div>
  );
}
