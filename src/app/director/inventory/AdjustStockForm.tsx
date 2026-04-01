"use client";

import { useActionState, useEffect, useState } from "react";
import { adjustStock } from "@/actions/inventory";
import toast from "react-hot-toast";

interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
}

interface AdjustStockFormProps {
  materials: Material[];
}

const initState = null;

export default function AdjustStockForm({ materials }: AdjustStockFormProps) {
  const [state, action] = useActionState(adjustStock, initState);
  const [selectedMat, setSelectedMat] = useState<Material | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setSelectedMat(null);
      setFormKey((k) => k + 1);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
      <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">ĐIỀU CHỈNH</span>
        Điều Chỉnh Tồn Kho (Kiểm Kê)
      </h3>
      <p className="text-xs text-gray-500 mb-4">Chỉ dùng khi kiểm kê phát hiện sai lệch thực tế</p>

      <form key={formKey} action={action} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Vật tư *</label>
          <select
            name="materialId"
            required
            onChange={(e) => {
              const mat = materials.find((m) => m.id === e.target.value) || null;
              setSelectedMat(mat);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn vật tư --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.code}] {m.name} — Tồn: {m.currentStock} {m.unit}
              </option>
            ))}
          </select>
        </div>

        {selectedMat && (
          <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
            <span className="text-blue-700 font-medium">Tồn kho hệ thống:</span>{" "}
            <span className="font-bold text-blue-800">{selectedMat.currentStock} {selectedMat.unit}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng thực tế (mới) *</label>
          <input
            name="newQuantity"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Nhập số lượng thực tế sau kiểm kê"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Lý do điều chỉnh *</label>
          <input
            name="reason"
            required
            placeholder="VD: Kiểm kê tháng 1/2024, sai lệch do..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
          >
            Xác Nhận Điều Chỉnh Tồn Kho
          </button>
        </div>
      </form>
    </div>
  );
}
