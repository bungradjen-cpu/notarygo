import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export default async function StoragePage() {
  const { organizations } = await SuperadminService.getOrganizationsList({ limit: 100 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Penggunaan Penyimpanan Dokumen (Storage Usage)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitoring kuota penyimpanan fisik berkas per kantor notaris tanpa menyediakan fasilitas penelusuran isi privat dokumen.
        </p>
      </div>

      {/* Storage Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Kantor Notaris</th>
                <th className="py-3.5 px-4">Nama Notaris</th>
                <th className="py-3.5 px-4">Jumlah Dokumen</th>
                <th className="py-3.5 px-4">Kuota Paket</th>
                <th className="py-3.5 px-4">Status Kuota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#0B1F4D]">{org.name}</td>
                  <td className="py-3.5 px-4 text-slate-700">{org.notaryName}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{org.mattersCount} Berkas Terdaftar</td>
                  <td className="py-3.5 px-4 text-slate-600">10 GB &ndash; 100 GB (Sesuai Paket)</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Normal (&lt; 20%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
