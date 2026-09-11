import { createClient } from "@/utils/supabase/server";
import {
  addStaffAction,
  removeStaffAction,
  updateOfficeProfileAction,
  adminResetPasswordAction,
} from "./actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OfficeSettingsPage() {
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

  // Fetch team members
  const { data: teamMembers } = await supabase
    .from("organization_members")
    .select("*, profiles(*)")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: true });

  // Fetch subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, subscription_plans(*)")
    .eq("org_id", member.org_id)
    .maybeSingle();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
          Pengaturan Kantor Notaris &amp; PPAT
        </h1>
        <p className="text-sm text-[#43474e] mt-1">
          Kelola profil identitas kantor, tim kerja, hak akses, dan paket langganan NOTARYGO™.
        </p>
      </div>

      {/* Section 1: Profil Kantor */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#001f3f] text-xl">
              account_balance
            </span>
            <h2 className="text-base font-bold text-[#000613]">
              Informasi &amp; Legalitas Kantor
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
            <div className="space-y-1">
              <span className="font-semibold text-[#43474e] uppercase text-[10px]">
                Nama Kantor
              </span>
              <p className="text-sm font-bold text-[#191c1d]">{org?.name || "-"}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-[#43474e] uppercase text-[10px]">
                Nama Notaris / PPAT
              </span>
              <p className="text-sm font-bold text-[#191c1d]">{org?.notary_name || "-"}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-[#43474e] uppercase text-[10px]">
                Kota / Wilayah Kerja
              </span>
              <p className="text-sm font-medium text-[#191c1d]">{org?.city || "-"}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-[#43474e] uppercase text-[10px]">
                Email Operasional
              </span>
              <p className="text-sm font-medium text-[#191c1d]">{org?.email || "-"}</p>
            </div>

            <div className="md:col-span-2 space-y-1">
              <span className="font-semibold text-[#43474e] uppercase text-[10px]">
                Alamat Lengkap Kantor
              </span>
              <p className="text-sm font-medium text-[#191c1d]">{org?.address || "-"}</p>
            </div>
          </div>

          {/* Quick Edit Office Profile Form */}
          {isOwnerOrAdmin && (
            <details className="pt-4 border-t border-gray-100">
              <summary className="text-xs font-semibold text-[#3498DB] cursor-pointer hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit Informasi Kantor</span>
              </summary>
              <form
                action={updateOfficeProfileAction}
                className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#f8f9fa] rounded-lg border border-[#E2E8F0]"
              >
                <input type="hidden" name="orgId" value={member.org_id} />
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Nama Kantor Notaris
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={org?.name || ""}
                    required
                    className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Nama Notaris / PPAT
                  </label>
                  <input
                    type="text"
                    name="notaryName"
                    defaultValue={org?.notary_name || ""}
                    required
                    className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={org?.city || ""}
                    className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Email Operasional Kantor
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={org?.email || ""}
                    className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    defaultValue={org?.address || ""}
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-5 bg-[#001f3f] text-white text-xs font-semibold rounded shadow-xs hover:bg-[#000613] transition-colors"
                  >
                    Simpan Perubahan Kantor
                  </button>
                </div>
              </form>
            </details>
          )}
        </div>
      </div>

      {/* Section 2: Anggota Tim & Staf */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#001f3f] text-xl">
              group
            </span>
            <h2 className="text-base font-bold text-[#000613]">
              Tim &amp; Staf Kantor ({teamMembers?.length || 0})
            </h2>
          </div>
        </div>

        {/* Add Staff Form (Only for Owner / Admin) */}
        {isOwnerOrAdmin && (
          <div className="p-6 bg-[#f8f9fa] border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#000613] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#fc8f34] text-[18px]">
                person_add
              </span>
              Tambah / Undang Staf Baru ke Kantor
            </h3>
            <form action={addStaffAction} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input type="hidden" name="orgId" value={member.org_id} />
              <div>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Nama Lengkap Staf *"
                  className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email Akun Staf *"
                  className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
                />
              </div>
              <div>
                <select
                  name="role"
                  defaultValue="STAFF"
                  className="w-full h-10 px-3 border border-[#c4c6cf] rounded-md text-xs text-[#191c1d] focus:border-[#001f3f] focus:outline-none bg-white"
                >
                  <option value="STAFF">Staf Operasional / Pemberkasan</option>
                  <option value="NOTARY">Notaris / PPAT Pengganti</option>
                  <option value="FINANCE">Staf Keuangan &amp; Kasir</option>
                  <option value="ADMIN">Administrator Kantor</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full h-10 bg-[#001f3f] hover:bg-[#000613] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">
                    add
                  </span>
                  <span>+ Tambah Staf</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-[#E2E8F0] text-xs">
          {teamMembers?.map((tm) => {
            const profile = Array.isArray(tm.profiles) ? tm.profiles[0] : tm.profiles;
            const fullName = profile?.full_name || "User";
            const email = profile?.email;

            return (
            <div key={tm.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#001f3f] text-[#fc8f34] flex items-center justify-center font-bold text-xs">
                    {(fullName).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#191c1d]">
                      {fullName}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      tm.role === "OWNER"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : tm.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : tm.role === "NOTARY"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {tm.role}
                  </span>

                  {/* Remove Staff Button (Cannot remove OWNER) */}
                  {isOwnerOrAdmin && tm.role !== "OWNER" && tm.profile_id !== user.id && (
                    <form action={removeStaffAction}>
                      <input type="hidden" name="orgId" value={member.org_id} />
                      <input type="hidden" name="memberId" value={tm.id} />
                      <button
                        type="submit"
                        title="Hapus Staf dari Kantor"
                        className="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Reset Password Form (Owner/Admin Only) */}
              {isOwnerOrAdmin && (tm.role !== "OWNER" || tm.profile_id === user.id) && (
                <details className="ml-11 mt-1 group">
                  <summary className="text-[10px] font-semibold text-[#3498DB] cursor-pointer hover:underline flex items-center gap-1 list-none">
                    <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                    <span>Ubah Kata Sandi</span>
                  </summary>
                  <form action={adminResetPasswordAction} className="mt-2 flex items-center gap-2 bg-[#f8f9fa] p-2 rounded border border-[#E2E8F0]">
                    <input type="hidden" name="orgId" value={member.org_id} />
                    <input type="hidden" name="userId" value={tm.profile_id} />
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={6}
                      placeholder="Kata Sandi Baru"
                      className="h-8 px-2 border border-gray-300 rounded text-[11px] focus:outline-none focus:border-[#001f3f]"
                    />
                    <button
                      type="submit"
                      className="h-8 px-3 bg-[#001f3f] text-white text-[10px] font-bold rounded hover:bg-[#000613]"
                    >
                      Simpan Sandi
                    </button>
                  </form>
                </details>
              )}
            </div>
          )})}
        </div>
      </div>

      {/* Section 3: Paket Langganan */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10B981] text-xl">
              verified
            </span>
            <h2 className="text-base font-bold text-[#000613]">
              Status Langganan NOTARYGO™
            </h2>
          </div>
          <Link
            href="/dashboard/settings/billing"
            className="text-xs text-[#3498DB] font-semibold hover:underline"
          >
            Kelola Langganan &rarr;
          </Link>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">
              Paket Aktif
            </span>
            <h3 className="text-lg font-bold text-[#000613]">
              {(subscription?.subscription_plans as any)?.name ||
                "NOTARYGO™ Professional"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Status:{" "}
              <span className="font-bold text-[#10B981]">
                {subscription?.status || "ACTIVE"}
              </span>
            </p>
          </div>

          <Link
            href="/dashboard/settings/billing"
            className="px-4 py-2 bg-[#001f3f] text-white text-xs font-semibold rounded-md shadow-xs"
          >
            Lihat Detail Paket &amp; Tagihan
          </Link>
        </div>
      </div>
    </div>
  );
}
