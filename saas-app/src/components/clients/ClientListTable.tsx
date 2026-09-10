"use client";

import { useState } from "react";
import Link from "next/link";
import { upsertClientAction, deleteClientAction } from "@/app/dashboard/matters/actions";

export interface ClientItem {
  id: string;
  name: string;
  client_type?: string | null;
  identifier?: string | null;
  phone?: string | null;
  email?: string | null;
  matters?: { id: string }[] | null;
}

interface ClientListTableProps {
  clients: ClientItem[];
  orgId: string;
}

export function ClientListTable({ clients, orgId }: ClientListTableProps) {
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#43474e] uppercase">
                <th className="py-3.5 px-4 whitespace-nowrap">Nama Klien / Penghadap</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tipe</th>
                <th className="py-3.5 px-4 whitespace-nowrap">No. Identitas / NIK / NPWP</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Kontak</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Total Perkara</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#191c1d]">
              {clients && clients.length > 0 ? (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#001f3f] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#001f3f]/10 text-[#001f3f] flex items-center justify-center text-xs font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                        {c.client_type || "INDIVIDUAL"}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-600">
                      {c.identifier || "-"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="text-gray-900 font-medium">{c.phone || "-"}</p>
                        <p className="text-gray-500 text-[11px]">{c.email || "-"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-[#3498DB]">
                      {c.matters?.length || 0} Perkara
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/matters?search=${encodeURIComponent(c.name)}`}
                          className="px-2.5 py-1 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#001f3f] font-semibold rounded text-xs transition-colors"
                        >
                          Perkara
                        </Link>

                        <button
                          type="button"
                          onClick={() => setEditingClient(c)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded text-xs transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Ubah</span>
                        </button>

                        <form
                          action={async (formData) => {
                            if (confirm(`Apakah Anda yakin ingin menghapus data klien "${c.name}"?`)) {
                              setDeletingId(c.id);
                              await deleteClientAction(formData);
                              setDeletingId(null);
                            }
                          }}
                        >
                          <input type="hidden" name="clientId" value={c.id} />
                          <button
                            type="submit"
                            disabled={deletingId === c.id}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>{deletingId === c.id ? "Menghapus..." : "Hapus"}</span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                      group_off
                    </span>
                    <p className="text-sm font-medium">Belum ada klien yang terdaftar.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#001f3f] text-xl">edit_note</span>
                <h3 className="text-base font-bold text-[#000613]">Koreksi / Ubah Data Klien</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                await upsertClientAction(formData);
                setIsSubmitting(false);
                setEditingClient(null);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="orgId" value={orgId} />
              <input type="hidden" name="clientId" value={editingClient.id} />

              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Nama Lengkap Klien / Penghadap *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingClient.name}
                  required
                  placeholder="Contoh: Ahmad Syahrir"
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#001f3f] focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Tipe Klien
                  </label>
                  <select
                    name="client_type"
                    defaultValue={editingClient.client_type || "INDIVIDUAL"}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#001f3f] focus:outline-none bg-white"
                  >
                    <option value="INDIVIDUAL">Perorangan (Individual)</option>
                    <option value="CORPORATE">Badan Hukum (PT / CV / Yayasan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    NIK / NPWP
                  </label>
                  <input
                    type="text"
                    name="identifier"
                    defaultValue={editingClient.identifier || ""}
                    placeholder="3201..."
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#001f3f] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    No. WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingClient.phone || ""}
                    placeholder="0812..."
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#001f3f] focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Email Kontak
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingClient.email || ""}
                    placeholder="klien@email.com"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#001f3f] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#001f3f] hover:bg-[#000613] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#fc8f34]">save</span>
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
