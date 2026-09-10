import { SuperadminService } from "@/lib/superadmin/SuperadminService";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const users = await SuperadminService.getUsersList({ search });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Pengguna &amp; Keanggotaan Kantor (Users)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh profil pengguna terdaftar dan perannya di kantor Notaris/PPAT.
          </p>
        </div>

        <form method="GET" className="w-full sm:w-72">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cari nama, email, kantor..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0B1F4D] focus:outline-none shadow-xs"
            />
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">No. Telepon</th>
                <th className="py-3.5 px-4">Kantor / Organisasi</th>
                <th className="py-3.5 px-4">Role Kantor</th>
                <th className="py-3.5 px-5">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.membershipId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">
                      {u.fullName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.phone || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {u.organizationName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          u.role === "OWNER"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : u.role === "ADMIN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(u.joinedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada pengguna yang sesuai dengan kriteria pencarian.
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
