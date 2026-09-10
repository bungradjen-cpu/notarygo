import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export default async function UnclaimedPaymentsPage() {
  const transactions = await SuperadminService.getTransactionsList({ status: "ALL" });
  const users = await SuperadminService.getUsersList();

  const userEmailMap = new Set(users.map((u) => u.email.toLowerCase()));

  const now = new Date();

  const unclaimedList = transactions
    .filter((tx) => (tx.status === "PAID" || tx.status === "CLAIMED") && tx.claimStatus === "UNCLAIMED")
    .map((tx) => {
      const email = tx.customerEmail.toLowerCase();
      const accountExists = userEmailMap.has(email);
      const paidDate = tx.paidAt ? new Date(tx.paidAt) : new Date(tx.createdAt);
      const daysSince = Math.floor((now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...tx,
        accountExists,
        daysSince,
      };
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
            Pembayaran Belum Diklaim (Unclaimed Payments)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pelanggan yang sudah membayar di Mayar namun belum mengklaim akun kantor Notaris &amp; PPAT.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
          {unclaimedList.length} Pembayaran Menunggu Registrasi
        </span>
      </div>

      {/* Info Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1 shadow-2xs">
        <div className="font-bold flex items-center gap-1.5 text-blue-950">
          <span className="material-symbols-outlined text-[17px]">info</span>
          <span>Prinsip Keamanan Klaim Otomatis:</span>
        </div>
        <p className="leading-relaxed text-blue-800">
          Pelanggan cukup mendaftar/login di <strong>/auth/login</strong> menggunakan <strong>email yang persis sama</strong> saat checkout di Mayar. Sistem akan memverifikasi email dan otomatis mengaktifkan paket langganan secara aman tanpa perlu tindakan manual yang berisiko.
        </p>
      </div>

      {/* Unclaimed List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Customer &amp; Kontak</th>
                <th className="py-3.5 px-4">Paket Dipilih</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Waktu Bayar</th>
                <th className="py-3.5 px-4">Usia Bayar</th>
                <th className="py-3.5 px-4">Akun Terdaftar?</th>
                <th className="py-3.5 px-5 text-right">Instruksi Pendaftaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unclaimedList.length > 0 ? (
                unclaimedList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#0B1F4D]">{tx.customerName}</div>
                      <div className="text-[11px] font-mono text-slate-600">{tx.customerEmail}</div>
                      <div className="text-[10px] text-slate-400">{tx.customerPhone || "-"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {tx.planCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(tx.paidAt || tx.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          tx.daysSince >= 3 ? "text-red-600 font-bold" : "text-slate-700"
                        }`}
                      >
                        {tx.daysSince === 0 ? "Hari ini" : `${tx.daysSince} hari lalu`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.accountExists ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800">
                          Sudah Registrasi (Belum Buat Kantor)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                          Belum Bikin Akun
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <details className="inline-block text-left">
                        <summary className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0B1F4D] font-bold rounded text-[11px] cursor-pointer select-none">
                          Teks WhatsApp
                        </summary>
                        <div className="absolute right-6 mt-2 w-96 bg-white p-4 rounded-xl shadow-xl border border-slate-200 z-50 text-xs space-y-2.5">
                          <div className="font-bold text-slate-900 border-b pb-1.5 flex items-center justify-between">
                            <span>Instruksi Klaim Akun</span>
                            <span className="text-[10px] text-slate-400 font-mono">{tx.internalReference}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans bg-slate-50 p-2.5 rounded-lg border border-slate-200 select-all">
                            Halo Bapak/Ibu {tx.customerName}, terima kasih telah berlangganan NOTARYGO™ ({tx.planCode}). Pembayaran Anda telah terverifikasi. Silakan lengkapi pendaftaran kantor notaris Anda melalui tautan: https://notarygo.id/auth/login menggunakan email Anda: {tx.customerEmail}. Sistem akan otomatis mengaktifkan paket kantor Anda!
                          </p>
                          <div className="text-[10px] text-slate-400 italic">
                            Klik di dalam kotak di atas untuk memilih seluruh teks dan salin ke WhatsApp.
                          </div>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada pembayaran berstatus unclaimed saat ini. Seluruh pembayaran telah berhasil diklaim oleh kantor terdaftar!
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
