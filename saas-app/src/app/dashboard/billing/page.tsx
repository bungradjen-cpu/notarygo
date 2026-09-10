import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BillingFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
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

  const { status: filterStatus } = await searchParams;

  let query = supabase
    .from("invoices")
    .select("*, matters(matter_number, title), clients(name, email, phone)")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  if (filterStatus && filterStatus !== "ALL") {
    query = query.eq("status", filterStatus);
  }

  const { data: invoices } = await query;

  // Compute stats
  const allInvoices = invoices || [];
  const totalBilled = allInvoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);
  const totalPaid = allInvoices.reduce((acc, inv) => acc + Number(inv.paid_amount || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Keuangan, Tagihan &amp; Kuitansi
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            Pusat monitoring tagihan jasa notaris/PPAT, pembayaran klien, dan pelunasan titipan biaya.
          </p>
        </div>
      </div>

      {/* Financial Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#43474e] uppercase mb-2">
            <span>Total Nilai Tagihan</span>
            <span className="material-symbols-outlined text-[#3498DB]">receipt_long</span>
          </div>
          <div className="text-2xl font-bold text-[#000613]">
            Rp {totalBilled.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between border-l-4 border-l-[#10B981]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#43474e] uppercase mb-2">
            <span>Total Terbayar / Masuk</span>
            <span className="material-symbols-outlined text-[#10B981]">payments</span>
          </div>
          <div className="text-2xl font-bold text-[#10B981]">
            Rp {totalPaid.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between border-l-4 border-l-[#E74C3C]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#43474e] uppercase mb-2">
            <span>Outstanding / Piutang</span>
            <span className="material-symbols-outlined text-[#E74C3C]">pending</span>
          </div>
          <div className="text-2xl font-bold text-[#E74C3C]">
            Rp {totalOutstanding.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-2 overflow-x-auto">
        <Link
          href="/dashboard/billing"
          className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
            !filterStatus || filterStatus === "ALL"
              ? "bg-[#001f3f] text-white"
              : "text-[#43474e] hover:bg-[#f3f4f5]"
          }`}
        >
          Semua Invoice ({allInvoices.length})
        </Link>
        <Link
          href="/dashboard/billing?status=UNPAID"
          className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
            filterStatus === "UNPAID"
              ? "bg-[#001f3f] text-white"
              : "text-[#43474e] hover:bg-[#f3f4f5]"
          }`}
        >
          Belum Lunas
        </Link>
        <Link
          href="/dashboard/billing?status=PAID"
          className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
            filterStatus === "PAID"
              ? "bg-[#001f3f] text-white"
              : "text-[#43474e] hover:bg-[#f3f4f5]"
          }`}
        >
          Lunas
        </Link>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#43474e] uppercase">
                <th className="py-3.5 px-4 whitespace-nowrap">No. Invoice</th>
                <th className="py-3.5 px-4 whitespace-nowrap">No. Perkara</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Klien</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Total Tagihan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Terbayar</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#191c1d]">
              {allInvoices && allInvoices.length > 0 ? (
                allInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#001f3f] whitespace-nowrap">
                      {inv.invoice_number}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {(inv.matters as any)?.matter_number || "-"}
                    </td>
                    <td className="py-4 px-4 font-medium whitespace-nowrap">
                      {(inv.clients as any)?.name || "-"}
                    </td>
                    <td className="py-4 px-4 font-bold whitespace-nowrap">
                      Rp {Number(inv.total).toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-green-700 font-semibold whitespace-nowrap">
                      Rp {Number(inv.paid_amount || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : inv.status === "PARTIAL"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/matters/${inv.matter_id}?tab=keuangan`}
                        className="px-3 py-1 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#001f3f] font-semibold rounded text-xs"
                      >
                        Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                      receipt
                    </span>
                    <p className="text-sm font-medium">Belum ada invoice tagihan yang diterbitkan.</p>
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
