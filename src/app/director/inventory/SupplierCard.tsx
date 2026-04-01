"use client";

import { useActionState, useState, useEffect } from "react";
import { createSupplier, updateSupplier, toggleSupplierActive } from "@/actions/inventory";
import toast from "react-hot-toast";

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  contactName: string | null;
  note: string | null;
  isActive: boolean;
}

interface SupplierCardProps {
  suppliers: Supplier[];
  isDirector: boolean;
}

const initState = null;

export default function SupplierCard({ suppliers, isDirector }: SupplierCardProps) {
  const [createState, createAction] = useActionState(createSupplier, initState);
  const [updateState, updateAction] = useActionState(updateSupplier, initState);
  const [toggleState, toggleAction] = useActionState(toggleSupplierActive, initState);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (createState?.success) { toast.success(createState.success); setShowForm(false); }
    if (createState?.error) toast.error(createState.error);
  }, [createState]);

  useEffect(() => {
    if (updateState?.success) { toast.success(updateState.success); setEditing(null); }
    if (updateState?.error) toast.error(updateState.error);
  }, [updateState]);

  useEffect(() => {
    if (toggleState?.success) toast.success(toggleState.success);
    if (toggleState?.error) toast.error(toggleState.error);
  }, [toggleState]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-gray-800">Danh Sách Nhà Cung Cấp</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Thêm NCC
        </button>
      </div>

      {/* Form thêm mới */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h4 className="font-semibold text-sm mb-3">Thêm Nhà Cung Cấp Mới</h4>
          <form action={createAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Tên nhà cung cấp *" required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="phone" placeholder="Số điện thoại"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="contactName" placeholder="Người liên hệ"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="address" placeholder="Địa chỉ"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="note" placeholder="Ghi chú"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                Lưu
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Tên NCC</th>
              <th className="px-4 py-3 text-left">Điện thoại</th>
              <th className="px-4 py-3 text-left">Người liên hệ</th>
              <th className="px-4 py-3 text-left">Địa chỉ</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Chưa có nhà cung cấp</td></tr>
            )}
            {suppliers.map((sup) => (
              <tr key={sup.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{sup.name}</td>
                <td className="px-4 py-3 text-gray-600">{sup.phone || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{sup.contactName || "—"}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{sup.address || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sup.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {sup.isActive ? "Hoạt động" : "Ngừng"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setEditing(sup)}
                      className="text-blue-600 hover:underline text-xs font-medium">
                      Sửa
                    </button>
                    {isDirector && (
                      <form action={toggleAction} className="inline">
                        <input type="hidden" name="id" value={sup.id} />
                        <button type="submit"
                          className={`text-xs font-medium hover:underline ${sup.isActive ? "text-orange-500" : "text-green-600"}`}>
                          {sup.isActive ? "Vô hiệu" : "Kích hoạt"}
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal sửa */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-base font-bold mb-4">Sửa Nhà Cung Cấp</h3>
            <form action={updateAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="hidden" name="id" value={editing.id} />
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên NCC *</label>
                <input name="name" defaultValue={editing.name} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Điện thoại</label>
                <input name="phone" defaultValue={editing.phone || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Người liên hệ</label>
                <input name="contactName" defaultValue={editing.contactName || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input name="address" defaultValue={editing.address || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                <input name="note" defaultValue={editing.note || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-1">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                  Lưu
                </button>
                <button type="button" onClick={() => setEditing(null)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
