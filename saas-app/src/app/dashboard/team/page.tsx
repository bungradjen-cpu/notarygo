import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { addStaffAction, removeStaffAction } from "../settings/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TeamManagementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role, organizations(*)")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!member) {
    redirect("/onboarding/create-org");
  }

  const org = member.organizations as any;
  const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(member.role);

  // Fetch team members with their profiles using adminClient to avoid RLS filtering other members' profiles
  const adminClient = createAdminClient();
  const { data: rawTeamMembers } = await adminClient
    .from("organization_members")
    .select("*, profiles(*)")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: true });

  // Auto-heal profiles if missing from profiles table
  const teamMembers = await Promise.all(
    (rawTeamMembers || []).map(async (tm: any) => {
      let p = Array.isArray(tm.profiles) ? tm.profiles[0] : tm.profiles;
      if (!p || !p.email || !p.full_name) {
        try {
          const { data: authUser } = await adminClient.auth.admin.getUserById(tm.profile_id);
          if (authUser?.user) {
            const authName = authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name;
            const authEmail = authUser.user.email;
            p = {
              ...(p || {}),
              id: tm.profile_id,
              full_name: p?.full_name || authName || "Staf Kantor",
              email: p?.email || authEmail || "-",
            };
            // Persist back to profiles table
            await adminClient.from("profiles").upsert({
              id: tm.profile_id,
              full_name: p.full_name,
              email: p.email,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn("Could not enrich profile for", tm.profile_id, e);
        }
      }
      return { ...tm, profiles: p };
    })
  );

  const totalMembers = teamMembers?.length || 0;
  const notaryCount = teamMembers?.filter((m) => m.role === "NOTARY" || m.role === "OWNER").length || 0;
  const staffCount = teamMembers?.filter((m) => m.role === "STAFF").length || 0;
  const financeCount = teamMembers?.filter((m) => m.role === "FINANCE").length || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Tim &amp; Staf Kantor Notaris
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Kelola seluruh asisten, notaris pengganti, staf administrasi berkas, dan kasir di kantor{" "}
            <strong className="text-[#001f3f]">{org?.name}</strong>.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#43474e] uppercase mb-1">
            Total Tim Kantor
          </div>
          <div className="text-2xl font-black text-[#001f3f]">{totalMembers} Orang</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs border-l-4 border-l-[#001f3f]">
          <div className="text-xs font-semibold text-[#43474e] uppercase mb-1">
            Notaris / PPAT
          </div>
          <div className="text-2xl font-black text-[#001f3f]">{notaryCount}</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs border-l-4 border-l-[#3498DB]">
          <div className="text-xs font-semibold text-[#43474e] uppercase mb-1">
            Staf Pemberkasan
          </div>
          <div className="text-2xl font-black text-[#3498DB]">{staffCount}</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs border-l-4 border-l-[#10B981]">
          <div className="text-xs font-semibold text-[#43474e] uppercase mb-1">
            Keuangan &amp; Kasir
          </div>
          <div className="text-2xl font-black text-[#10B981]">{financeCount}</div>
        </div>
      </div>

      {/* Add Staff Form (Only for Owner / Admin) */}
      {isOwnerOrAdmin ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fc8f34] text-xl">person_add</span>
              <h2 className="text-base font-bold text-[#000613]">
                Tambah / Undang Anggota Tim Baru
              </h2>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Masukkan nama lengkap dan email staf yang ingin Anda beri akses ke kantor ini. Staf dapat langsung login atau membuat kata sandi menggunakan email yang Anda daftarkan di sini.
            </p>

            <form action={addStaffAction} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input type="hidden" name="orgId" value={member.org_id} />
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Nama Lengkap Staf *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Contoh: Rina Anggraeni, S.H."
                  className="w-full h-10 px-3 border border-[#c4c6cf] rounded-lg text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Email Akun Staf *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="staf@gmail.com"
                  className="w-full h-10 px-3 border border-[#c4c6cf] rounded-lg text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Peran / Hak Akses
                </label>
                <select
                  name="role"
                  defaultValue="STAFF"
                  className="w-full h-10 px-3 border border-[#c4c6cf] rounded-lg text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
                >
                  <option value="STAFF">Staf Operasional / Pemberkasan</option>
                  <option value="NOTARY">Notaris / PPAT Pengganti</option>
                  <option value="FINANCE">Staf Keuangan &amp; Kasir</option>
                  <option value="ADMIN">Administrator Kantor</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-10 bg-[#001f3f] hover:bg-[#000613] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">
                    add_circle
                  </span>
                  <span>Daftarkan Staf</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
          <span>
            Hanya Notaris (Owner) atau Administrator Kantor yang dapat mendaftarkan atau mencabut akses staf kantor.
          </span>
        </div>
      )}

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#000613]">
            Daftar Anggota Tim Kantor ({totalMembers})
          </h2>
          <span className="text-xs text-gray-500 font-medium">Akses Kolaborasi Kantor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#43474e] uppercase">
                <th className="py-3.5 px-6 whitespace-nowrap">Nama Anggota</th>
                <th className="py-3.5 px-6 whitespace-nowrap">Email Akun</th>
                <th className="py-3.5 px-6 whitespace-nowrap">Peran / Jabatan</th>
                <th className="py-3.5 px-6 whitespace-nowrap">Waktu Bergabung</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#191c1d]">
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((tm: any) => {
                  const p = Array.isArray(tm.profiles) ? tm.profiles[0] : (tm.profiles || {});
                  const fullName = p?.full_name || "Anggota Kantor";
                  const email = p?.email || "-";
                  const isSelf = tm.profile_id === user.id;

                  return (
                    <tr key={tm.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-4 px-6 font-bold text-[#001f3f] whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#001f3f]/10 text-[#001f3f] flex items-center justify-center text-xs font-bold shrink-0">
                            {(fullName).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {fullName}
                            </p>
                            {isSelf && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Anda (Saat ini)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                        {email}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            tm.role === "OWNER"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : tm.role === "ADMIN"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : tm.role === "NOTARY"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : tm.role === "FINANCE"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {tm.role === "OWNER"
                            ? "NOTARIS (OWNER)"
                            : tm.role === "ADMIN"
                            ? "ADMINISTRATOR"
                            : tm.role === "NOTARY"
                            ? "NOTARIS PENGGANTI"
                            : tm.role === "FINANCE"
                            ? "KEUANGAN & KASIR"
                            : "STAF PEMBERKASAN"}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-gray-500 text-[11px]">
                        {tm.created_at
                          ? new Date(tm.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isOwnerOrAdmin && !isSelf && tm.role !== "OWNER" ? (
                          <form action={removeStaffAction}>
                            <input type="hidden" name="orgId" value={member.org_id} />
                            <input type="hidden" name="memberId" value={tm.id} />
                            <button
                              type="submit"
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded text-xs transition-colors"
                            >
                              Cabut Akses
                            </button>
                          </form>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Belum ada anggota tim terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions Card for Staff Onboarding */}
      <div className="bg-gradient-to-r from-[#001f3f]/5 to-[#3498DB]/10 border border-[#001f3f]/20 rounded-2xl p-6">
        <div className="flex items-start gap-3.5">
          <span className="material-symbols-outlined text-[#001f3f] text-2xl shrink-0 mt-0.5">
            help_outline
          </span>
          <div className="space-y-2 text-xs text-gray-700">
            <h3 className="font-bold text-sm text-[#001f3f]">
              Petunjuk Masuk untuk Staf Baru Kantor:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 leading-relaxed">
              <li>
                Pastikan Anda telah mendaftarkan email staf di formulir <strong>"Tambah / Undang Anggota Tim Baru"</strong> di atas.
              </li>
              <li>
                Minta staf untuk membuka link aplikasi:{" "}
                <strong className="text-[#001f3f] underline">https://notarygo-iota.vercel.app/auth/signup</strong>{" "}
                (atau klik tombol Masuk jika sudah memiliki password).
              </li>
              <li>
                Staf mendaftar menggunakan <strong>email yang persis sama</strong> dengan yang Anda daftarkan.
              </li>
              <li>
                Sistem NOTARYGO™ akan <strong>secara otomatis menautkan akun staf</strong> ke kantor Anda tanpa perlu membayar atau membuat kantor baru!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
