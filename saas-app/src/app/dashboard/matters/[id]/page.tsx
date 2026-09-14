import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { completeTaskAction, updateMatterAction, deleteMatterAction } from "../actions";
import { uploadDocumentAction, deleteDocumentAction } from "../../documents/actions";
import Link from "next/link";

export default async function MatterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const { id: matterId } = await params;
  const { tab = "ringkasan" } = await searchParams;
  const adminClient = createAdminClient();

  const { data: matter } = await adminClient
    .from("matters")
    .select("*, clients(id, name, phone, email), service_types(id, name, code), profiles(id, full_name, email)")
    .eq("id", matterId)
    .single();

  if (!matter) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#E2E8F0] max-w-xl mx-auto my-12">
        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
          folder_off
        </span>
        <h2 className="text-lg font-bold text-gray-900">Perkara Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500 mt-1">
          Perkara yang Anda cari tidak tersedia atau Anda tidak memiliki izin akses.
        </p>
        <Link
          href="/dashboard/matters"
          className="mt-4 inline-block px-4 py-2 bg-[#001f3f] text-white text-xs font-semibold rounded-md"
        >
          &larr; Kembali ke Register Perkara
        </Link>
      </div>
    );
  }

  // Fetch team members for PIC reassignment (using adminClient to fetch colleagues' profiles)
  const { data: teamMembers } = await adminClient
    .from("organization_members")
    .select("profile_id, profiles(id, full_name, email)")
    .eq("org_id", matter.org_id);

  // Fetch tasks
  const { data: tasks } = await adminClient
    .from("tasks")
    .select("*, profiles(id, full_name)")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: true });

  // Fetch checklist items
  const { data: checklist } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("matter_id", matterId);

  // Fetch documents
  const { data: documents } = await adminClient
    .from("documents")
    .select("*")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });

  // Fetch invoices for this matter
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("matter_id", matterId);

  // Fetch activity logs
  const { data: logs } = await adminClient
    .from("activity_logs")
    .select("*, profiles(full_name)")
    .eq("entity_type", "matters")
    .eq("entity_id", matterId)
    .order("created_at", { ascending: false });

  const completedTasksCount = tasks?.filter((t) => t.status === "COMPLETED").length || 0;
  const totalTasksCount = tasks?.length || 0;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#43474e]">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <span>&rsaquo;</span>
          <Link href="/dashboard/matters" className="hover:underline">
            Register Perkara
          </Link>
          <span>&rsaquo;</span>
          <span className="font-bold text-[#001f3f]">{matter.matter_number}</span>
        </div>

        {/* Delete Matter Button */}
        <form action={deleteMatterAction}>
          <input type="hidden" name="matterId" value={matter.id} />
          <button
            type="submit"
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-md border border-red-200 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Hapus Perkara</span>
          </button>
        </form>
      </div>

      {/* Matter Header Bar & Edit Form */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                  matter.status === "OPEN"
                    ? "bg-blue-100 text-[#3498DB] border border-blue-200"
                    : matter.status === "IN_PROGRESS"
                    ? "bg-amber-100 text-[#E67E22] border border-amber-200"
                    : matter.status === "CLOSED"
                    ? "bg-green-100 text-[#10B981] border border-green-200"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {matter.status}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                {(matter.service_types as any)?.name || "Layanan Notaris"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
              {matter.matter_number} &mdash; {matter.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <Link
              href={`/dashboard/signing`}
              className="h-10 px-4 bg-white border border-[#E2E8F0] hover:bg-[#f8f9fa] text-[#001f3f] rounded-md text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#944a00]">draw</span>
              <span>Jadwal Signing</span>
            </Link>
            <Link
              href={`/dashboard/matters/${matterId}/billing`}
              className="h-10 px-4 bg-[#001f3f] hover:bg-[#000613] text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">receipt</span>
              <span>Buat Invoice</span>
            </Link>
          </div>
        </div>

        {/* Quick Edit Matter Details Form */}
        <details className="pt-3 border-t border-gray-100">
          <summary className="text-xs font-semibold text-[#3498DB] cursor-pointer hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit Informasi &amp; Status Perkara</span>
          </summary>
          <form action={updateMatterAction} className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#f8f9fa] rounded-lg border border-[#E2E8F0]">
            <input type="hidden" name="matterId" value={matter.id} />
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Judul Perkara</label>
              <input
                type="text"
                name="title"
                defaultValue={matter.title}
                required
                className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Status Perkara</label>
              <select
                name="status"
                defaultValue={matter.status}
                className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
              >
                <option value="OPEN">OPEN / BARU</option>
                <option value="IN_PROGRESS">IN_PROGRESS / BERJALAN</option>
                <option value="CLOSED">CLOSED / SELESAI</option>
                <option value="CANCELED">CANCELED / BATAL</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">PIC Staff</label>
              <select
                name="picId"
                defaultValue={matter.pic_id || ""}
                className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
              >
                <option value="">-- Tanpa PIC --</option>
                {teamMembers?.map((tm) => (
                  <option key={tm.profile_id} value={tm.profile_id}>
                    {(tm.profiles as any)?.full_name || (tm.profiles as any)?.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="h-9 px-5 bg-[#001f3f] text-white text-xs font-semibold rounded shadow-xs hover:bg-[#000613] transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </details>
      </div>

      {/* Key Info Bento Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#43474e] mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">person</span>
            Klien Pemohon
          </span>
          <span className="text-sm font-bold text-[#000613] truncate">
            {(matter.clients as any)?.name || "-"}
          </span>
        </div>

        <div className="flex flex-col border-l border-[#E2E8F0] pl-4">
          <span className="text-[11px] font-semibold text-[#43474e] mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">assignment_ind</span>
            PIC Penanggung Jawab
          </span>
          <span className="text-sm font-bold text-[#000613] truncate">
            {(matter.profiles as any)?.full_name || "Tanpa PIC"}
          </span>
        </div>

        <div className="flex flex-col border-l border-[#E2E8F0] pl-4">
          <span className="text-[11px] font-semibold text-[#43474e] mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">checklist</span>
            Progress Workflow
          </span>
          <span className="text-sm font-bold text-[#3498DB]">
            {progressPercent}% ({completedTasksCount}/{totalTasksCount} Selesai)
          </span>
        </div>

        <div className="flex flex-col border-l border-[#E2E8F0] pl-4">
          <span className="text-[11px] font-semibold text-[#43474e] mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            Tanggal Dibuat
          </span>
          <span className="text-sm font-bold text-[#000613]">
            {new Date(matter.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* 5 Tab Navigation Bar (Stitch Design) */}
      <div className="flex gap-4 border-b border-[#E2E8F0] overflow-x-auto">
        {[
          { key: "ringkasan", label: "Ringkasan", icon: "dashboard" },
          { key: "pekerjaan", label: `Pekerjaan & Tasks (${totalTasksCount})`, icon: "work" },
          { key: "dokumen", label: `Dokumen & Berkas (${documents?.length || 0})`, icon: "description" },
          { key: "keuangan", label: `Keuangan & Biaya (${invoices?.length || 0})`, icon: "payments" },
          { key: "riwayat", label: "Riwayat Aktivitas", icon: "history" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/matters/${matterId}?tab=${t.key}`}
            className={`pb-3 px-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
              tab === t.key
                ? "border-[#001f3f] text-[#001f3f]"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>

      {/* TAB CONTENT: 1. Ringkasan */}
      {tab === "ringkasan" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Workflow Timeline Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#000613] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#001f3f]">account_tree</span>
                Tahapan Alur Kerja (Workflow)
              </h2>

              <div className="space-y-4">
                {tasks && tasks.length > 0 ? (
                  tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="mt-1 shrink-0">
                        {task.status === "COMPLETED" ? (
                          <span className="material-symbols-outlined text-[#10B981] text-xl">
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[#3498DB] text-xl">
                            radio_button_unchecked
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-semibold ${
                              task.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-900"
                            }`}
                          >
                            {idx + 1}. {task.title}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          PIC: {(task.profiles as any)?.full_name || "Belum ditugaskan"} &bull;{" "}
                          Deadline: {task.deadline || "Tidak ada"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Belum ada tahapan workflow.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Checklist Progress */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#000613] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#944a00]">checklist</span>
                Kelengkapan Berkas Dokumen
              </h3>
              <div className="space-y-2">
                {checklist && checklist.length > 0 ? (
                  checklist.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-xs p-2 rounded bg-[#f8f9fa]"
                    >
                      <span className="font-medium text-gray-800">{c.item_name}</span>
                      <span
                        className={`font-bold ${
                          c.is_completed ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {c.is_completed ? "Lengkap" : "Kurang"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Belum ada checklist berkas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. Pekerjaan & Tasks */}
      {tab === "pekerjaan" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#000613]">Daftar Tugas &amp; Pekerjaan</h2>
          </div>

          <ul className="divide-y divide-gray-100">
            {tasks?.map((task) => (
              <li key={task.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.description}</p>
                  <p className="text-[11px] text-gray-400">
                    PIC: {(task.profiles as any)?.full_name || "Unassigned"} &bull; Deadline:{" "}
                    {task.deadline || "Tidak ada"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      task.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.status !== "COMPLETED" && (
                    <form action={completeTaskAction.bind(null, task.id, matterId)}>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                      >
                        Selesai
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB CONTENT: 3. Dokumen */}
      {tab === "dokumen" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#000613]">Dokumen &amp; Berkas Perkara</h2>
          </div>

          {/* Quick Upload to this matter */}
          <form action={uploadDocumentAction} className="flex flex-col sm:flex-row gap-2 p-4 bg-[#f8f9fa] rounded-lg border border-[#E2E8F0]">
            <input type="hidden" name="orgId" value={matter.org_id} />
            <input type="hidden" name="matterId" value={matter.id} />
            <input
              type="text"
              name="title"
              required
              placeholder="Nama Berkas / Dokumen baru..."
              className="flex-1 h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
            />
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="h-9 px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f] file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-[#001f3f]/10 file:text-[#001f3f]"
            />
            <button
              type="submit"
              className="h-9 px-4 bg-[#001f3f] text-white text-xs font-semibold rounded shadow-xs hover:bg-[#000613] transition-colors shrink-0 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] text-[#fc8f34]">upload</span>
              <span>+ Unggah Berkas</span>
            </button>
          </form>

          {documents && documents.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((d) => (
                  <div key={d.id} className="p-4 rounded-lg border border-gray-200 bg-[#f8f9fa] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#001f3f]">description</span>
                        <h3 className="text-xs font-bold text-gray-900 truncate">{d.title}</h3>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">Status: <span className="font-semibold text-blue-700">{d.status}</span></p>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                      {d.current_version_id ? (
                        <a
                          href={`/api/documents/${d.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#001f3f] hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px] text-[#fc8f34]">download</span>
                          <span>Unduh File</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Draf Teks</span>
                      )}
                      <form action={deleteDocumentAction}>
                        <input type="hidden" name="documentId" value={d.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:underline font-semibold"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/dashboard/matters/${matter.id}/documents`}
                  className="text-xs font-semibold text-[#001f3f] hover:underline flex items-center gap-1"
                >
                  <span>Buka Kelola Riwayat Versi Dokumen</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              Belum ada berkas dokumen yang diunggah untuk perkara ini.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. Keuangan */}
      {tab === "keuangan" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#000613]">Tagihan &amp; Biaya Perkara</h2>
            <Link
              href={`/dashboard/matters/${matterId}/billing`}
              className="px-3 py-1.5 bg-[#001f3f] text-white text-xs font-semibold rounded-md"
            >
              + Buat Invoice Baru
            </Link>
          </div>
          {invoices && invoices.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{inv.invoice_number}</p>
                    <p className="text-[11px] text-gray-500">
                      Total: Rp {Number(inv.total).toLocaleString("id-ID")} &bull; Terbayar: Rp{" "}
                      {Number(inv.paid_amount || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              Belum ada invoice/tagihan yang dibuat untuk perkara ini.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. Riwayat */}
      {tab === "riwayat" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#000613]">Riwayat Aktivitas &amp; Audit Log</h2>
          {logs && logs.length > 0 ? (
            <ul className="divide-y divide-gray-100 text-xs">
              {logs.map((log) => (
                <li key={log.id} className="py-3 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#001f3f] text-base mt-0.5">
                    history
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{log.action}</p>
                    <p className="text-gray-500 text-[11px]">
                      Oleh {(log.profiles as any)?.full_name || "Sistem"} pada{" "}
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              Belum ada catatan aktivitas untuk perkara ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
