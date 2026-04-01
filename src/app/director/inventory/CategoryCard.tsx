"use client";

import { useActionState, useState } from "react";
import {
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory,
} from "@/actions/inventory";
import toast from "react-hot-toast";
import { useEffect } from "react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count?: { materials: number };
}

interface CategoryCardProps {
  categories: Category[];
}

const initState = null;

export default function CategoryCard({ categories }: CategoryCardProps) {
  const [createState, createAction] = useActionState(createMaterialCategory, initState);
  const [updateState, updateAction] = useActionState(updateMaterialCategory, initState);
  const [deleteState, deleteAction] = useActionState(deleteMaterialCategory, initState);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    if (createState?.success) { toast.success(createState.success); }
    if (createState?.error) { toast.error(createState.error); }
  }, [createState]);

  useEffect(() => {
    if (updateState?.success) { toast.success(updateState.success); setEditing(null); }
    if (updateState?.error) { toast.error(updateState.error); }
  }, [updateState]);

  useEffect(() => {
    if (deleteState?.success) { toast.success(deleteState.success); }
    if (deleteState?.error) { toast.error(deleteState.error); }
  }, [deleteState]);

  return (
    <div className="space-y-6">
      {/* Form tạo mới */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-base font-bold text-gray-800 mb-4">Thêm Danh Mục Mới</h3>
        <form action={createAction} className="flex flex-col sm:flex-row gap-3">
          <input
            name="name"
            placeholder="Tên danh mục (VD: Văn phòng phẩm)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="description"
            placeholder="Mô tả (tuỳ chọn)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap"
          >
            + Thêm
          </button>
        </form>
      </div>

      {/* Danh sách */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Tên danh mục</th>
              <th className="px-4 py-3 text-left">Mô tả</th>
              <th className="px-4 py-3 text-center">Số vật tư</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  Chưa có danh mục nào
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.description || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {cat._count?.materials ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setEditing(cat)}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Sửa
                    </button>
                    <form action={deleteAction} className="inline">
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:underline text-xs font-medium"
                        onClick={(e) => {
                          if (!confirm(`Xóa danh mục "${cat.name}"?`)) e.preventDefault();
                        }}
                      >
                        Xóa
                      </button>
                    </form>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold mb-4">Sửa Danh Mục</h3>
            <form action={updateAction} className="space-y-3">
              <input type="hidden" name="id" value={editing.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input
                  name="name"
                  defaultValue={editing.name}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input
                  name="description"
                  defaultValue={editing.description || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
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
