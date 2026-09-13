import { createClient } from "@/utils/supabase/server";
import {
  uploadDocumentAction,
  updateDocumentStatusAction,
  deleteDocumentAction,
} from "./actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DocumentCenterPage({
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

  // Fetch real matters for document association
  const { data: matters } = await supabase
    .from("matters")
    .select("id, matter_number, title")
    .eq("org_id", member.org_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  let query = supabase
    .from("documents")
    .select("*, matters(id, matter_number, title, clients(name))")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data: documents } = await query;

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Pusat Dokumen &amp; Berkas (Document Center)
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Repositori terpusat draf akta, berkas pendukung para pihak, dan riwayat revisi dokumen.
          </p>
        </div>
      </div>

      {/* Upload Document Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h2 className="text-sm font-bold text-[#000613] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#001f3f] text-lg">upload_file</span>
          Unggah Dokumen Baru
        </h2>
        <form action={uploadDocumentAction} className="flex flex-col gap-3">
          <input type="hidden" name="orgId" value={member.org_id} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                Nama Dokumen *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Draf AJB, KTP Penghadap, Sertifikat..."
                className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                Kaitkan Perkara (Opsional)
              </label>
              <select
                name="matterId"
                className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
              >
                <option value="">-- Dokumen / Berkas Umum Kantor --</option>
                {matters?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matter_number} - {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                File Berkas (Opsional)
              </label>
              <input
                type="file"
                name="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full h-10 px-2 py-1.5 border border-[#c4c6cf] rounded-md text-xs text-gray-600 focus:border-[#001f3f] focus:outline-none bg-white file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-[#001f3f]/10 file:text-[#001f3f] hover:file:bg-[#001f3f]/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="h-10 px-6 bg-[#001f3f] hover:bg-[#000613] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">add</span>
              <span>Simpan &amp; Unggah Dokumen</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="text-xs font-semibold text-[#43474e] uppercase">
          Total Berkas Tersimpan: {documents?.length || 0}
        </div>

        <form method="GET" className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            name="search"
            defaultValue={search || ""}
            placeholder="Cari nama dokumen..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#f8f9fa] border border-[#E2E8F0] text-xs text-[#191c1d] focus:bg-white focus:outline-none focus:border-[#001f3f]"
          />
        </form>
      </div>

      {/* Document Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#43474e] uppercase">
                <th className="py-3.5 px-4 whitespace-nowrap">Nama Dokumen</th>
                <th className="py-3.5 px-4 whitespace-nowrap">No. Perkara</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Klien</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status Verifikasi</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tanggal Unggah</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#191c1d]">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#001f3f] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#001f3f] text-base">
                          description
                        </span>
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {(doc.matters as any)?.matter_number || "-"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-medium">
                      {(doc.matters as any)?.clients?.name || "-"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {/* Update Status Form Inline */}
                      <form action={updateDocumentStatusAction} className="inline-flex items-center gap-1">
                        <input type="hidden" name="documentId" value={doc.id} />
                        <select
                          name="status"
                          defaultValue={doc.status}
                          onChange={(e) => e.target.form?.requestSubmit()}
                          className="h-7 px-2 border border-gray-200 rounded text-[11px] font-semibold bg-white cursor-pointer focus:outline-none"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="REVIEW">REVIEW</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="FINAL">FINAL</option>
                          <option value="SIGNED">SIGNED</option>
                        </select>
                      </form>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {doc.matter_id && (
                          <Link
                            href={`/dashboard/matters/${doc.matter_id}?tab=dokumen`}
                            className="px-2.5 py-1 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#001f3f] font-semibold rounded text-xs"
                          >
                            Buka
                          </Link>
                        )}
                        <form action={deleteDocumentAction}>
                          <input type="hidden" name="documentId" value={doc.id} />
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded text-xs transition-colors"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                      description
                    </span>
                    <p className="text-sm font-medium">Belum ada berkas dokumen yang tersimpan.</p>
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
