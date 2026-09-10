import { createClient } from "@/utils/supabase/server";
import {
  createDraftInvoiceAction,
  addInvoiceItemAction,
  deleteInvoiceItemAction,
  updateInvoiceTaxAction,
  issueInvoiceAction,
  recordPaymentAction,
} from "./actions";
import Link from "next/link";

export default async function MatterBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id: matterId } = await params;

  const { data: matter } = await supabase
    .from("matters")
    .select("org_id, matter_number, title, clients(name)")
    .eq("id", matterId)
    .single();

  if (!matter) {
    return (
      <div className="p-8 text-center text-gray-500">
        Perkara tidak ditemukan.
      </div>
    );
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, invoice_items(*), payments(*)")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });

  const createDraft = createDraftInvoiceAction.bind(null, matterId, matter.org_id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#43474e]">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <span>&rsaquo;</span>
        <Link href="/dashboard/matters" className="hover:underline">
          Register Perkara
        </Link>
        <span>&rsaquo;</span>
        <Link href={`/dashboard/matters/${matterId}`} className="hover:underline font-bold text-[#001f3f]">
          {matter.matter_number}
        </Link>
        <span>&rsaquo;</span>
        <span>Keuangan &amp; Tagihan</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000613] tracking-tight">
            Tagihan: {matter.matter_number}
          </h1>
          <p className="text-sm text-[#43474e] mt-1">
            {matter.title} &bull; Klien: <span className="font-semibold text-gray-900">{(matter.clients as any)?.name || "-"}</span>
          </p>
        </div>
        <div>
          <form action={createDraft}>
            <button
              type="submit"
              className="px-4 py-2 bg-[#001f3f] hover:bg-[#000613] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px] text-[#fc8f34]">add</span>
              <span>+ Buat Draf Invoice Baru</span>
            </button>
          </form>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-6">
        {invoices && invoices.length > 0 ? (
          invoices.map((invoice) => {
            const isDraft = invoice.status === "DRAFT";
            const isPaid = invoice.status === "PAID";
            const balanceDue = Number(invoice.balance_due || invoice.total_amount || 0);

            return (
              <div
                key={invoice.id}
                className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden"
              >
                {/* Invoice Card Header */}
                <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-[#000613]">
                        {isDraft ? "Draf Invoice" : `Invoice: ${invoice.invoice_number}`}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPaid
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : isDraft
                            ? "bg-gray-100 text-gray-800 border border-gray-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Dibuat pada: {new Date(invoice.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-[#001f3f]">
                        Total: Rp {Number(invoice.total_amount || 0).toLocaleString("id-ID")}
                      </p>
                      <p className={`text-xs font-semibold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                        Sisa Tagihan: Rp {balanceDue.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {!isDraft && (
                      <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] border border-gray-300 text-[#001f3f] text-xs font-bold rounded-md flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-red-600">
                          picture_as_pdf
                        </span>
                        <span>Buka / Unduh PDF</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                  <table className="w-full text-left border-collapse mb-6">
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#43474e] uppercase">
                        <th className="py-2.5 px-4">Uraian Jasa / Biaya</th>
                        <th className="py-2.5 px-4">Qty</th>
                        <th className="py-2.5 px-4">Harga Satuan</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                        {isDraft && <th className="py-2.5 px-4 text-center w-14">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#191c1d]">
                      {invoice.invoice_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 font-semibold text-gray-900">{item.description}</td>
                          <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                          <td className="py-3 px-4 text-gray-600">Rp {Number(item.unit_price).toLocaleString("id-ID")}</td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">Rp {Number(item.total_price).toLocaleString("id-ID")}</td>
                          {isDraft && (
                            <td className="py-3 px-4 text-center">
                              <form action={deleteInvoiceItemAction.bind(null, item.id, invoice.id, matterId)}>
                                <button
                                  type="submit"
                                  title="Hapus baris item"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </form>
                            </td>
                          )}
                        </tr>
                      ))}
                      {(!invoice.invoice_items || invoice.invoice_items.length === 0) && (
                        <tr>
                          <td colSpan={isDraft ? 5 : 4} className="py-4 text-center text-gray-400">
                            Belum ada rincian item tagihan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Summary & PPN Block */}
                  <div className="flex flex-col sm:flex-row justify-end mb-6">
                    <div className="w-full sm:w-88 bg-[#f8f9fa] p-4 rounded-xl border border-[#E2E8F0] space-y-3 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal Biaya &amp; Jasa:</span>
                        <span className="font-semibold text-gray-900">
                          Rp {Number(invoice.subtotal || 0).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* PPN / Pajak Row with Manual Override for Finance */}
                      <div className="pt-2.5 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-700">PPN (11%) / Jasa:</span>
                          <span className="font-bold text-[#001f3f]">
                            Rp {Number(invoice.tax_amount || 0).toLocaleString("id-ID")}
                          </span>
                        </div>

                        {isDraft ? (
                          <form
                            action={updateInvoiceTaxAction.bind(null, invoice.id, matterId)}
                            className="mt-2 p-2.5 bg-white rounded-lg border border-gray-200 space-y-2"
                          >
                            <label className="text-[10px] font-bold text-gray-600 uppercase block">
                              Input PPN Manual (Rp) oleh Role Finance:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                name="taxAmount"
                                defaultValue={Number(invoice.tax_amount || 0)}
                                step="1000"
                                placeholder="0"
                                className="w-full h-8 px-2.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                              />
                              <button
                                type="submit"
                                className="h-8 px-3 bg-[#001f3f] text-white text-[11px] font-semibold rounded hover:bg-[#000613] transition-colors whitespace-nowrap"
                              >
                                Simpan PPN
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-tight">
                              *Role Finance bebas mengisi nominal PPN secara manual sesuai komponen jasa kena pajak (atau diisi 0 jika bebas PPN/non-BKP).
                            </p>
                          </form>
                        ) : null}
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">Total Tagihan:</span>
                        <span className="font-bold text-[#001f3f] text-sm">
                          Rp {Number(invoice.total_amount || 0).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {Number(invoice.paid_amount || 0) > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Sudah Dibayar / DP:</span>
                          <span className="font-semibold">
                            Rp {Number(invoice.paid_amount || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs pt-1.5 border-t border-gray-200">
                        <span className="font-semibold text-gray-700">Sisa Tagihan:</span>
                        <span className={`font-bold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                          Rp {balanceDue.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DRAFT: Add Item & Issue Actions */}
                  {isDraft ? (
                    <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#E2E8F0] space-y-4">
                      <h3 className="text-xs font-bold text-[#000613] uppercase tracking-wider">
                        + Tambah Rincian Item Tagihan
                      </h3>
                      <form
                        action={addInvoiceItemAction.bind(null, invoice.id, matterId)}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                      >
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                            Uraian Jasa / Pengurusan
                          </label>
                          <input
                            type="text"
                            name="description"
                            required
                            placeholder="Contoh: Honorarium Notaris Akta Jual Beli, Validasi Pajak..."
                            className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                            Jumlah (Qty)
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            defaultValue="1"
                            min="1"
                            required
                            className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                            Harga Satuan (Rp)
                          </label>
                          <input
                            type="number"
                            name="unitPrice"
                            step="1000"
                            placeholder="Contoh: 5000000"
                            required
                            className="w-full h-9 px-3 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#001f3f]"
                          />
                        </div>
                        <div className="sm:col-span-4 flex justify-end">
                          <button
                            type="submit"
                            className="h-9 px-4 bg-[#001f3f] text-white text-xs font-semibold rounded shadow-xs hover:bg-[#000613] transition-colors"
                          >
                            + Tambahkan ke Tagihan
                          </button>
                        </div>
                      </form>

                      {invoice.invoice_items?.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 flex justify-end">
                          <form action={issueInvoiceAction.bind(null, invoice.id, matter.org_id, matterId)}>
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                receipt_long
                              </span>
                              <span>Terbitkan Invoice Resmi &amp; Generate PDF</span>
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ISSUED: Payments list & Record Payment Form */
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Payments List */}
                      <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#E2E8F0]">
                        <h3 className="text-xs font-bold text-[#000613] uppercase tracking-wider mb-3">
                          Riwayat Pembayaran Klien
                        </h3>
                        {invoice.payments && invoice.payments.length > 0 ? (
                          <ul className="divide-y divide-gray-200 text-xs">
                            {invoice.payments.map((p: any) => (
                              <li key={p.id} className="py-2.5 flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Rp {Number(p.amount).toLocaleString("id-ID")}
                                  </p>
                                  <p className="text-gray-500 text-[11px]">
                                    {new Date(p.payment_date).toLocaleDateString("id-ID")} &bull; {p.method}
                                  </p>
                                </div>
                                <a
                                  href={`/api/payments/${p.id}/receipt`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 rounded text-[11px] font-semibold text-blue-700 flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    print
                                  </span>
                                  <span>Kwitansi</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-400">Belum ada pembayaran yang tercatat.</p>
                        )}
                      </div>

                      {/* Record Payment Form */}
                      {balanceDue > 0 && (
                        <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                          <h3 className="text-xs font-bold text-[#000613] uppercase tracking-wider">
                            + Catat Pembayaran Masuk
                          </h3>
                          <form
                            action={recordPaymentAction.bind(null, invoice.id, matter.org_id, matterId)}
                            className="space-y-3 text-xs"
                          >
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                                Jumlah Diterima (Rp)
                              </label>
                              <input
                                type="number"
                                name="amount"
                                step="1000"
                                max={balanceDue}
                                defaultValue={balanceDue}
                                required
                                className="w-full h-9 px-3 border border-gray-300 rounded bg-white focus:outline-none focus:border-[#001f3f]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                                Metode Pembayaran
                              </label>
                              <select
                                name="method"
                                className="w-full h-9 px-3 border border-gray-300 rounded bg-white focus:outline-none focus:border-[#001f3f]"
                              >
                                <option value="BANK_TRANSFER">Transfer Bank</option>
                                <option value="CASH">Tunai (Cash)</option>
                                <option value="QRIS">QRIS / E-Wallet</option>
                                <option value="GIRO_CHEQUE">Cek / Giro</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                                No. Referensi / Rekening Pengirim
                              </label>
                              <input
                                type="text"
                                name="reference"
                                placeholder="Contoh: BCA Transfer ref #883920"
                                className="w-full h-9 px-3 border border-gray-300 rounded bg-white focus:outline-none focus:border-[#001f3f]"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full h-9 bg-[#001f3f] hover:bg-[#000613] text-white font-semibold rounded shadow-xs transition-colors"
                            >
                              Simpan Pembayaran &amp; Buat Kwitansi
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
              receipt_long
            </span>
            <p className="text-sm font-medium">Belum ada tagihan / invoice untuk perkara ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
