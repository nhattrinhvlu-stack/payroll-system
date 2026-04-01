"use client";

import { useActionState, useEffect, useState } from "react";
import { importMaterial } from "@/actions/inventory";
import toast from "react-hot-toast";

interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  unitPrice: number;
}

interface Supplier {
  id: string;
  name: string;
  isActive: boolean;
}

interface ImportMaterialFormProps {
  materials: Material[];
  suppliers: Supplier[];
}

const initState = null;

export default function ImportMaterialForm({ materials, suppliers }: ImportMaterialFormProps) {
  const [state, action] = useActionState(importMaterial, initState);
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">NHẬP KHO</span>
        Phiếu Nhập Vật Tư
      </h3>
      <form key={formKey} action={action} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chọn vật tư */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Vật tư *</label>
          <select
            name="materialId"
            required
            onChange={(e) => {
              const mat = materials.find((m) => m.id === e.target.value) || null;
              setSelectedMat(mat);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Chọn vật tư --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.code}] {m.name} — Tồn: {m.currentStock} {m.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Hiển thị tồn kho hiện tại */}
        {selectedMat && (
          <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
            <span className="text-emerald-700 font-medium">Tồn kho hiện tại:</span>{" "}
            <span className="font-bold text-emerald-800">{selectedMat.currentStock} {selectedMat.unit}</span>
            {" | "}
            <span className="text-emerald-700 font-medium">Đơn giá tham khảo:</span>{" "}
            <span className="font-bold">{selectedMat.unitPrice.toLocaleString("vi-VN")}đ</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng nhập *</label>
          <input
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Đơn giá nhập (đ)</label>
          <input
            name="unitPrice"
            type="number"
            min="0"
            step="100"
            placeholder="0"
            defaultValue={selectedMat?.unitPrice || 0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nhà cung cấp</label>
          <select
            name="supplierId"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Không xác định --</option>
            {suppliers.filter((s) => s.isActive).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ngày nhập</label>
          <input
            name="transactionDate"
            type="date"
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Số phiếu / Số đơn hàng</label>
          <input
            name="reference"
            placeholder="PN-2024-001"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
          <input
            name="note"
            placeholder="Ghi chú thêm..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
          >
            Xác Nhận Nhập Kho
          </button>
        </div>
      </form>
    </div>
  );
}
