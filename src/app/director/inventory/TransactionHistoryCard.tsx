"use client";

import { useState } from "react";

interface Transaction {
  id: string;
  type: "IMPORT" | "EXPORT" | "ADJUST" | "RETURN";
  status: "CONFIRMED" | "CANCELLED";
  quantity: number;
  unitPrice: number;
  stockBefore: number;
  stockAfter: number;
  transactionDate: Date;
  reference: string | null;
  reason: string | null;
  note: string | null;
  createdByName: string;
  createdAt: Date;
  material: { code: string; name: string; unit: string };
  supplier: { name: string } | null;
  receivedBy: { fullName: string } | null;
}

interface TransactionHistoryCardProps {
  transactions: Transaction[];
}

const TYPE_CONFIG = {
  IMPORT: { label: "Nhập kho", color: "bg-emerald-100 text-emerald-700", sign: "+" },
  EXPORT: { label: "Xuất kho", color: "bg-orange-100 text-orange-700", sign: "-" },
  ADJUST: { label: "Điều chỉnh", color: "bg-blue-100 text-blue-700", sign: "~" },
  RETURN: { label: "Trả kho", color: "bg-teal-100 text-teal-700", sign: "+" },
};

export default function TransactionHistoryCard({ transactions }: TransactionHistoryCardProps) {
  const [filterType, setFilterType] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fmt = (n: number) => n.toLocaleString("vi-VN");

  const filtered = transactions.filter((t) => {
    if (filterType && t.type !== filterType) return false;
    if (filterMaterial) {
      const q = filterMaterial.toLowerCase();
      if (!t.material.code.toLowerCase().includes(q) && !t.material.name.toLowerCase().includes(q)) return false;
    }
    if (dateFrom && new Date(t.transactionDate) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.transactionDate) > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Bộ lọc */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại GD</option>
            <option value="IMPORT">Nhập kho</option>
            <option value="EXPORT">Xuất kho</option>
            <option value="RETURN">Trả kho</option>
            <option value="ADJUST">Điều chỉnh</option>
          </select>
          <input
            placeholder="Tìm vật tư..."
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Hiển thị {filtered.length} / {transactions.length} giao dịch</p>
      </div>

      {/* Bảng giao dịch */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Ngày</th>
              <th className="px-4 py-3 text-left">Vật tư</th>
              <th className="px-4 py-3 text-center">Loại GD</th>
              <th className="px-4 py-3 text-right">Số lượng</th>
              <th className="px-4 py-3 text-right">Tồn trước</th>
              <th className="px-4 py-3 text-right">Tồn sau</th>
              <th className="px-4 py-3 text-right">Đơn giá</th>
              <th className="px-4 py-3 text-left">NCC / Người nhận</th>
              <th className="px-4 py-3 text-left">Lý do / Số phiếu</th>
              <th className="px-4 py-3 text-left">Người thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-400">
                  Không có giao dịch nào
                </td>
              </tr>
            )}
            {filtered.map((tx) => {
              const cfg = TYPE_CONFIG[tx.type];
              const date = new Date(tx.transactionDate);
              const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
              return (
                <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dateStr}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-blue-700 font-bold">{tx.material.code}</span>
                    <span className="ml-1 text-gray-800">{tx.material.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span className={tx.type === "EXPORT" ? "text-orange-600" : "text-emerald-600"}>
                      {cfg.sign}{fmt(tx.quantity)} {tx.material.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{fmt(tx.stockBefore)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(tx.stockAfter)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{tx.unitPrice > 0 ? `${fmt(tx.unitPrice)}đ` : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {tx.supplier?.name || tx.receivedBy?.fullName || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {tx.reason && <div className="text-xs">{tx.reason}</div>}
                    {tx.reference && <div className="text-xs text-blue-600 font-mono">{tx.reference}</div>}
                    {!tx.reason && !tx.reference && "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{tx.createdByName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
