"use client";

import { useActionState, useEffect, useState } from "react";
import { exportMaterial, returnMaterial } from "@/actions/inventory";
import toast from "react-hot-toast";

interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
}

interface Employee {
  id: string;
  fullName: string;
  department: { name: string } | null;
}

interface ExportMaterialFormProps {
  materials: Material[];
  employees: Employee[];
}

const initState = null;

export default function ExportMaterialForm({ materials, employees }: ExportMaterialFormProps) {
  const [exportState, exportAction] = useActionState(exportMaterial, initState);
  const [returnState, returnAction] = useActionState(returnMaterial, initState);
  const [mode, setMode] = useState<"export" | "return">("export");
  const [selectedMat, setSelectedMat] = useState<Material | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (exportState?.success) {
      toast.success(exportState.success);
      setSelectedMat(null);
      setFormKey((k) => k + 1);
    }
    if (exportState?.error) toast.error(exportState.error);
  }, [exportState]);

  useEffect(() => {
    if (returnState?.success) {
      toast.success(returnState.success);
      setSelectedMat(null);
      setFormKey((k) => k + 1);
    }
    if (returnState?.error) toast.error(returnState.error);
  }, [returnState]);

  const today = new Date().toISOString().split("T")[0];
  const currentAction = mode === "export" ? exportAction : returnAction;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => { setMode("export"); setFormKey((k) => k + 1); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${mode === "export" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Xuất Kho
        </button>
        <button
          type="button"
          onClick={() => { setMode("return"); setFormKey((k) => k + 1); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${mode === "return" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Trả Lại Kho
        </button>
      </div>

      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${mode === "export" ? "bg-orange-100 text-orange-700" : "bg-teal-100 text-teal-700"}`}>
          {mode === "export" ? "XUẤT KHO" : "TRẢ KHO"}
        </span>
        {mode === "export" ? "Phiếu Xuất Vật Tư" : "Phiếu Trả Lại Kho"}
      </h3>

      <form key={formKey} action={currentAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">-- Chọn vật tư --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.code}] {m.name} — Tồn: {m.currentStock} {m.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Hiển thị tồn kho */}
        {selectedMat && (
          <div className={`sm:col-span-2 border rounded-lg px-4 py-3 text-sm ${
            mode === "export" && selectedMat.currentStock <= 0
              ? "bg-red-50 border-red-200"
              : "bg-orange-50 border-orange-200"
          }`}>
            <span className="font-medium">Tồn kho hiện tại:</span>{" "}
            <span className={`font-bold ${selectedMat.currentStock <= 0 ? "text-red-600" : "text-orange-700"}`}>
              {selectedMat.currentStock} {selectedMat.unit}
            </span>
            {mode === "export" && selectedMat.currentStock <= 0 && (
              <span className="ml-2 text-red-600 text-xs font-bold">⚠ Hết hàng!</span>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Số lượng {mode === "export" ? "xuất" : "trả"} *
          </label>
          <input
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            max={mode === "export" && selectedMat ? selectedMat.currentStock : undefined}
            required
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {mode === "export" && selectedMat && (
            <p className="text-xs text-gray-500 mt-0.5">Tối đa: {selectedMat.currentStock} {selectedMat.unit}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {mode === "export" ? "Người nhận" : "Người trả lại"}
          </label>
          <select
            name="receivedById"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">-- Không xác định --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}{emp.department ? ` (${emp.department.name})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Lý do {mode === "export" ? "xuất kho" : "trả kho"} *
          </label>
          <input
            name="reason"
            required
            placeholder={mode === "export" ? "VD: Sử dụng cho dự án A, phòng IT..." : "VD: Vật tư còn thừa, không dùng đến..."}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ngày</label>
          <input
            name="transactionDate"
            type="date"
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Số phiếu</label>
          <input
            name="reference"
            placeholder="PX-2024-001"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
          <input
            name="note"
            placeholder="Ghi chú thêm..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition text-white ${
              mode === "export" ? "bg-orange-500 hover:bg-orange-600" : "bg-teal-500 hover:bg-teal-600"
            }`}
          >
            {mode === "export" ? "Xác Nhận Xuất Kho" : "Xác Nhận Trả Kho"}
          </button>
        </div>
      </form>
    </div>
  );
}
