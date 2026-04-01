"use client";

import { useActionState, useState, useEffect } from "react";
import { createMaterial, updateMaterial, toggleMaterialActive } from "@/actions/inventory";
import toast from "react-hot-toast";

interface Category { id: string; name: string; }

interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  description: string | null;
  categoryId: string | null;
  category: Category | null;
  currentStock: number;
  minStockLevel: number;
  unitPrice: number;
  isActive: boolean;
}

interface MaterialListCardProps {
  materials: Material[];
  categories: Category[];
  isDirector: boolean;
}

const initState = null;

export default function MaterialListCard({ materials, categories, isDirector }: MaterialListCardProps) {
  const [createState, createAction] = useActionState(createMaterial, initState);
  const [updateState, updateAction] = useActionState(updateMaterial, initState);
  const [toggleState, toggleAction] = useActionState(toggleMaterialActive, initState);
  const [editing, setEditing] = useState<Material | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

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

  const fmt = (n: number) => n.toLocaleString("vi-VN");

  const filtered = materials.filter((m) => {
    const matchSearch =
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? m.categoryId === filterCat : true;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-1">
          <input
            placeholder="Tìm theo mã, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap"
        >
          + Thêm Vật Tư
        </button>
      </div>

      {/* Form thêm mới */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h4 className="font-semibold text-sm mb-3">Thêm Vật Tư Mới</h4>
          <form action={createAction} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <input name="code" placeholder="Mã vật tư * (VD: VT-001)" required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="name" placeholder="Tên vật tư *" required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="unit" placeholder="Đơn vị * (cái, kg, m...)" required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select name="categoryId"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input name="unitPrice" type="number" min="0" step="100" placeholder="Đơn giá (đ)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="minStockLevel" type="number" min="0" step="0.1" placeholder="Tồn kho tối thiểu"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="description" placeholder="Mô tả"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-2">
              <button type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                Lưu
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-100 transition">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Mã</th>
              <th className="px-4 py-3 text-left">Tên vật tư</th>
              <th className="px-4 py-3 text-left">Danh mục</th>
              <th className="px-4 py-3 text-center">ĐVT</th>
              <th className="px-4 py-3 text-right">Tồn kho</th>
              <th className="px-4 py-3 text-right">Tồn tối thiểu</th>
              <th className="px-4 py-3 text-right">Đơn giá</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">Không có vật tư nào</td></tr>
            )}
            {filtered.map((mat) => {
              const isLow = mat.currentStock <= mat.minStockLevel && mat.minStockLevel > 0;
              return (
                <tr key={mat.id} className={`border-t border-gray-100 hover:bg-gray-50 ${!mat.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{mat.code}</td>
                  <td className="px-4 py-3 font-medium">{mat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{mat.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{mat.unit}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${isLow ? "text-red-600" : "text-gray-800"}`}>
                      {fmt(mat.currentStock)}
                      {isLow && (
                        <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">⚠ Thấp</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{fmt(mat.minStockLevel)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(mat.unitPrice)}đ</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${mat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {mat.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => setEditing(mat)}
                        className="text-blue-600 hover:underline text-xs font-medium">
                        Sửa
                      </button>
                      {isDirector && (
                        <form action={toggleAction} className="inline">
                          <input type="hidden" name="id" value={mat.id} />
                          <button type="submit"
                            className={`text-xs font-medium hover:underline ${mat.isActive ? "text-orange-500" : "text-green-600"}`}>
                            {mat.isActive ? "Vô hiệu" : "Kích hoạt"}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal sửa */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-base font-bold mb-4">Sửa Vật Tư — {editing.code}</h3>
            <form action={updateAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="hidden" name="id" value={editing.id} />
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên vật tư *</label>
                <input name="name" defaultValue={editing.name} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị tính *</label>
                <input name="unit" defaultValue={editing.unit} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục</label>
                <select name="categoryId" defaultValue={editing.categoryId || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Không có --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Đơn giá (đ)</label>
                <input name="unitPrice" type="number" min="0" step="100" defaultValue={editing.unitPrice}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tồn kho tối thiểu</label>
                <input name="minStockLevel" type="number" min="0" step="0.1" defaultValue={editing.minStockLevel}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
                <input name="description" defaultValue={editing.description || ""}
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
