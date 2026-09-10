import { SuperadminService } from "@/lib/superadmin/SuperadminService";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ search?: string; filter?: string; page?: string }>;
}

export default async function OrganizationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const filter = params.filter || "ALL";
  const page = parseInt(params.page || "1", 10);

  const { organizations, totalCount } = await SuperadminService.getOrganizationsList({
    search,
    filter,
    page,
    limit: 50,
  });

  // Client-side quick filter
  const filteredOrgs = organizations.filter((org) => {
    if (filter === "ACTIVE") return org.subscriptionStatus === "ACTIVE";
    if (filter === "EXPIRING_SOON") return org.daysRemaining !== null && org.daysRemaining <= 7 && org.daysRemaining >= 0;
    if (filter === "EXPIRED") return org.subscriptionStatus === "EXPIRED";
    if (filter === "AT_RISK") return org.healthStatus === "AT_RISK";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Kantor Notaris &amp; PPAT (Organizations)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direktori multi-tenant, kontrol masa aktif langganan, dan pemantauan beban kerja per kantor.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total: <strong className="text-[#0B1F4D]">{totalCount} Kantor</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
          {[
            { label: "Semua Kantor", val: "ALL" },
            { label: "Langganan Aktif", val: "ACTIVE" },
            { label: "Segera Kedaluwarsa (< 7 Hari)", val: "EXPIRING_SOON" },
            { label: "Expired", val: "EXPIRED" },
            { label: "At Risk", val: "AT_RISK" },
          ].map((tab) => (
            <Link
              key={tab.val}
              href={`/superadmin/organizations?filter=${tab.val}${search ? `&search=${search}` : ""}`}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                filter === tab.val
                  ? "bg-[#0B1F4D] text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form method="GET" className="w-full md:w-72">
          <input type="hidden" name="filter" value={filter} />
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cari nama kantor, notaris, kota..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0B1F4D] focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Kantor / Organisasi</th>
                <th className="py-3.5 px-4">Nama Notaris</th>
                <th className="py-3.5 px-4">Owner Email</th>
                <th className="py-3.5 px-4">Status Langganan</th>
                <th className="py-3.5 px-4">Sisa Waktu</th>
                <th className="py-3.5 px-4">Anggota</th>
                <th className="py-3.5 px-4">Perkara</th>
                <th className="py-3.5 px-4">Health</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">
                      {org.name}
                      <div className="text-[10px] text-slate-400 font-normal">{org.city}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {org.notaryName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {org.ownerEmail}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          org.subscriptionStatus === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : org.subscriptionStatus === "EXPIRED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {org.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {org.daysRemaining !== null ? (
                        <span
                          className={`font-semibold ${
                            org.daysRemaining <= 3
                              ? "text-red-600 font-bold"
                              : org.daysRemaining <= 7
                              ? "text-amber-600 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {org.daysRemaining > 0 ? `${org.daysRemaining} Hari` : "Kedaluwarsa"}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {org.memberCount} User
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {org.mattersCount} Perkara
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          org.healthStatus === "HEALTHY"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : org.healthStatus === "WATCH"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {org.healthStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/superadmin/subscriptions?orgId=${org.id}`}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#0B1F4D] hover:bg-slate-100 rounded border border-slate-200 transition-colors inline-block"
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada kantor yang cocok dengan kriteria pencarian.
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
