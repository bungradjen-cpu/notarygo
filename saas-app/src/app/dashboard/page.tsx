import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role, organizations(name, notary_name)")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!member) {
    redirect("/onboarding/create-org");
  }

  const orgId = member.org_id;
  const isOwnerOrAdmin = member.role === "OWNER" || member.role === "ADMIN";
  const adminClient = createAdminClient();

  // 1. Fetch Metrics
  const today = new Date().toISOString().split("T")[0];

  // Active matters
  const { count: activeMattersCount } = await supabase
    .from("matters")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .in("status", ["OPEN", "IN_PROGRESS"])
    .is("deleted_at", null);

  // Unassigned matters (Tanpa PIC)
  const { count: unassignedCount } = await supabase
    .from("matters")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .is("pic_id", null)
    .is("deleted_at", null);

  // Pending Items / Exceptions (using adminClient to fetch profiles across team members)
  const { data: pendingItems, count: pendingCount } = await adminClient
    .from("pending_items")
    .select("*, matters(id, matter_number, title, pic_id, profiles(full_name))", {
      count: "exact",
    })
    .eq("org_id", orgId)
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .limit(5);

  // Tasks due today
  const { count: dueTodayCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("deadline", today)
    .in("status", ["PENDING", "IN_PROGRESS"])
    .is("deleted_at", null);

  // Overdue tasks
  const { count: overdueCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .lt("deadline", today)
    .in("status", ["PENDING", "IN_PROGRESS"])
    .is("deleted_at", null);

  // Outstanding Invoices
  const { data: unpaidInvoices, count: unpaidInvoicesCount } = await supabase
    .from("invoices")
    .select("total, paid_amount, status", { count: "exact" })
    .eq("org_id", orgId)
    .neq("status", "PAID");

  const totalOutstanding = (unpaidInvoices || []).reduce((acc, inv) => {
    return acc + (Number(inv.total) - Number(inv.paid_amount || 0));
  }, 0);

  // Recent Matters (using adminClient so PIC profile is always visible to all office staff)
  const { data: recentMatters } = await adminClient
    .from("matters")
    .select(
      "id, matter_number, title, status, created_at, clients(name), profiles(full_name)"
    )
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(6);

  // My Tasks (for current staff user)
  const { data: myTasks } = await supabase
    .from("tasks")
    .select("*, matters(id, matter_number, title)")
    .eq("org_id", orgId)
    .eq("assigned_to", user.id)
    .in("status", ["PENDING", "IN_PROGRESS"])
    .is("deleted_at", null)
    .order("deadline", { ascending: true })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Dashboard Operasional Kantor
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Pusat kendali operasional perkara, deadline, dan exception kantor Notaris &amp; PPAT.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/matters/new"
            className="h-10 px-4 bg-[#000613] hover:bg-[#001f3f] text-white rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-[#fc8f34]">add</span>
            <span>+ Buat Perkara Baru</span>
          </Link>
        </div>
      </div>

      {/* 7 KPI Cards Section (Stitch Grid Layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* 1. Perkara Aktif */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
              Perkara Aktif
            </span>
            <span className="material-symbols-outlined text-[#3498DB] text-[18px]">
              folder_open
            </span>
          </div>
          <div className="text-2xl font-bold text-[#000613]">
            {activeMattersCount ?? 0}
          </div>
        </div>

        {/* 2. Perkara Terlambat */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between border-l-4 border-l-[#E74C3C]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
              Terlambat
            </span>
            <span className="material-symbols-outlined text-[#E74C3C] text-[18px]">
              warning
            </span>
          </div>
          <div className="text-2xl font-bold text-[#E74C3C]">
            {overdueCount ?? 0}
          </div>
        </div>

        {/* 3. Perkara Pending */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between border-l-4 border-l-[#E67E22]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
              Pending
            </span>
            <span className="material-symbols-outlined text-[#E67E22] text-[18px]">
              pending_actions
            </span>
          </div>
          <div className="text-2xl font-bold text-[#E67E22]">
            {pendingCount ?? 0}
          </div>
        </div>

        {/* 4. Deadline Hari Ini */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
              Deadline Hari Ini
            </span>
            <span className="material-symbols-outlined text-[#F1C40F] text-[18px]">
              event
            </span>
          </div>
          <div className="text-2xl font-bold text-[#000613]">
            {dueTodayCount ?? 0}
          </div>
        </div>

        {/* 5. Signing Hari Ini */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
              Signing Hari Ini
            </span>
            <span className="material-symbols-outlined text-[#944a00] text-[18px]">
              draw
            </span>
          </div>
          <div className="text-2xl font-bold text-[#000613]">0</div>
        </div>

        {/* 6. Tanpa PIC */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between border-l-4 border-l-[#E67E22]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
              Tanpa PIC
            </span>
            <span className="material-symbols-outlined text-[#E67E22] text-[18px]">
              person_off
            </span>
          </div>
          <div className="text-2xl font-bold text-[#E67E22]">
            {unassignedCount ?? 0}
          </div>
        </div>

        {/* 7. Outstanding Tagihan */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between col-span-2 sm:col-span-3 lg:col-span-1 bg-[#f3f4f5]/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#43474e] uppercase tracking-wider">
              Tagihan Tertunda
            </span>
            <span className="material-symbols-outlined text-[#10B981] text-[18px]">
              receipt_long
            </span>
          </div>
          <div className="text-lg font-bold text-[#000613] truncate" title={`Rp ${totalOutstanding.toLocaleString("id-ID")}`}>
            Rp {totalOutstanding > 0 ? (totalOutstanding / 1000000).toFixed(1) + " Jt" : "0"}
          </div>
        </div>
      </div>

      {/* Main Grid: Attention Required & Quick Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attention Required (Exception Monitor) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attention Required Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E74C3C] text-xl">
                  error
                </span>
                <h2 className="text-base font-bold text-[#000613]">
                  Attention Required (Kendala &amp; Exception)
                </h2>
              </div>
              <Link
                href="/dashboard/control"
                className="text-xs font-semibold text-[#3498DB] hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {pendingItems && pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-[#f8f9fa] transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-[#E74C3C]">
                          Pending
                        </span>
                        <span className="text-xs font-bold text-[#001f3f]">
                          {(item.matters as any)?.matter_number || "MATTER"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#191c1d] truncate">
                        {item.description}
                      </p>
                      <p className="text-xs text-[#43474e]">
                        Perkara: {(item.matters as any)?.title || "-"} &bull; PIC:{" "}
                        {(item.matters as any)?.profiles?.full_name || "Belum Ditugaskan"}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/matters/${(item.matters as any)?.id || ""}`}
                      className="px-3 py-1.5 rounded bg-white border border-[#E2E8F0] text-xs font-medium text-[#001f3f] hover:bg-[#f3f4f5] shadow-2xs shrink-0"
                    >
                      Buka Perkara
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[#43474e]">
                  <span className="material-symbols-outlined text-4xl text-[#10B981] mb-2">
                    check_circle
                  </span>
                  <p className="text-sm font-medium">Tidak ada kendala / exception operasional saat ini.</p>
                  <p className="text-xs text-gray-400 mt-1">Semua alur kerja perkara berjalan sesuai jadwal.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Matters Register */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#001f3f] text-xl">
                  assignment
                </span>
                <h2 className="text-base font-bold text-[#000613]">
                  Register Perkara Terbaru
                </h2>
              </div>
              <Link
                href="/dashboard/matters"
                className="text-xs font-semibold text-[#3498DB] hover:underline"
              >
                Ke Buku Register &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-semibold text-[#43474e] uppercase bg-[#f3f4f5]/60">
                    <th className="py-3 px-4">No. Perkara</th>
                    <th className="py-3 px-4">Nama Perkara / Akta</th>
                    <th className="py-3 px-4">Klien</th>
                    <th className="py-3 px-4">PIC</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {recentMatters && recentMatters.length > 0 ? (
                    recentMatters.map((m) => (
                      <tr key={m.id} className="hover:bg-[#f8f9fa] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#001f3f] whitespace-nowrap">
                          {m.matter_number}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#191c1d] max-w-[200px] truncate">
                          {m.title}
                        </td>
                        <td className="py-3 px-4 text-[#43474e] truncate">
                          {(m.clients as any)?.name || "-"}
                        </td>
                        <td className="py-3 px-4 text-[#43474e] truncate">
                          {(m.profiles as any)?.full_name || (
                            <span className="text-[#E67E22] font-semibold">Tanpa PIC</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              m.status === "OPEN"
                                ? "bg-blue-100 text-blue-800"
                                : m.status === "IN_PROGRESS"
                                ? "bg-amber-100 text-amber-800"
                                : m.status === "CLOSED"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/dashboard/matters/${m.id}`}
                            className="text-[#001f3f] font-semibold hover:underline"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400">
                        Belum ada data perkara. Klik &quot;+ Buat Perkara Baru&quot; untuk memulai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: My Tasks & Quick Signing Schedule */}
        <div className="space-y-6">
          {/* My Tasks Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#944a00] text-xl">
                  task_alt
                </span>
                <h2 className="text-base font-bold text-[#000613]">Tugas Saya</h2>
              </div>
              <span className="text-xs px-2 py-0.5 bg-[#f3f4f5] text-gray-700 font-semibold rounded-full">
                {myTasks?.length || 0} Aktif
              </span>
            </div>

            <div className="p-4 space-y-3">
              {myTasks && myTasks.length > 0 ? (
                myTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-md bg-[#f8f9fa] border border-[#E2E8F0] hover:border-gray-300 transition-colors flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#191c1d]">{t.title}</p>
                      <p className="text-[11px] text-[#43474e]">
                        {(t.matters as any)?.matter_number} &bull; Deadline: {t.deadline || "-"}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/matters/${t.matter_id}`}
                      className="text-xs text-[#001f3f] font-semibold hover:underline shrink-0"
                    >
                      Buka &rarr;
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  Tidak ada tugas pending yang ditugaskan kepada Anda saat ini.
                </div>
              )}
            </div>
          </div>

          {/* Quick Schedule / Signing Today */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#001f3f] text-xl">
                  calendar_today
                </span>
                <h2 className="text-base font-bold text-[#000613]">Jadwal Signing</h2>
              </div>
              <Link
                href="/dashboard/signing"
                className="text-xs font-semibold text-[#3498DB] hover:underline"
              >
                Kalender &rarr;
              </Link>
            </div>

            <div className="p-4">
              <div className="p-4 rounded-md border border-dashed border-gray-200 text-center text-xs text-gray-400">
                <span className="material-symbols-outlined text-2xl text-gray-300 mb-1">
                  event_busy
                </span>
                <p>Belum ada jadwal penandatanganan akta hari ini.</p>
                <Link
                  href="/dashboard/signing"
                  className="mt-2 inline-block text-xs font-semibold text-[#001f3f] hover:underline"
                >
                  + Jadwalkan Signing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
