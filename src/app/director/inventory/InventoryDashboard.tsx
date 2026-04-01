"use client";

import { useState } from "react";
import StatsCards from "./StatsCards";
import MaterialListCard from "./MaterialListCard";
import ImportMaterialForm from "./ImportMaterialForm";
import ExportMaterialForm from "./ExportMaterialForm";
import TransactionHistoryCard from "./TransactionHistoryCard";
import SupplierCard from "./SupplierCard";
import CategoryCard from "./CategoryCard";
import AdjustStockForm from "./AdjustStockForm";

interface Category { id: string; name: string; description: string | null; _count?: { materials: number }; }
interface Supplier { id: string; name: string; phone: string | null; address: string | null; contactName: string | null; note: string | null; isActive: boolean; }
interface Material {
  id: string; code: string; name: string; unit: string; description: string | null;
  categoryId: string | null; category: Category | null; currentStock: number;
  minStockLevel: number; unitPrice: number; isActive: boolean;
}
interface Employee { id: string; fullName: string; department: { name: string } | null; }
interface Transaction {
  id: string; type: "IMPORT" | "EXPORT" | "ADJUST" | "RETURN"; status: "CONFIRMED" | "CANCELLED";
  quantity: number; unitPrice: number; stockBefore: number; stockAfter: number;
  transactionDate: Date; reference: string | null; reason: string | null; note: string | null;
  createdByName: string; createdAt: Date;
  material: { code: string; name: string; unit: string };
  supplier: { name: string } | null;
  receivedBy: { fullName: string } | null;
}

interface InventoryDashboardProps {
  categories: Category[];
  suppliers: Supplier[];
  materials: Material[];
  employees: Employee[];
  transactions: Transaction[];
  stats: {
    totalMaterials: number;
    lowStockCount: number;
    importThisMonth: number;
    exportThisMonth: number;
    totalStockValue: number;
  };
  isDirector: boolean;
}

const TABS = [
  { id: "overview", label: "Tổng Quan" },
  { id: "materials", label: "Danh Mục Vật Tư" },
  { id: "transactions", label: "Nhập / Xuất Kho" },
  { id: "history", label: "Lịch Sử Giao Dịch" },
  { id: "suppliers", label: "Nhà Cung Cấp" },
  { id: "categories", label: "Loại Vật Tư" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function InventoryDashboard({
  categories,
  suppliers,
  materials,
  employees,
  transactions,
  stats,
  isDirector,
}: InventoryDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const activeMaterials = materials.filter((m) => m.isActive);
  const lowStockMaterials = activeMaterials.filter(
    (m) => m.minStockLevel > 0 && m.currentStock <= m.minStockLevel
  );
  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Quản Lý Vật Tư</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi nhập xuất kho, tồn kho và lịch sử giao dịch</p>
      </div>

      {/* Tab menu */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            // Ẩn tab categories nếu không phải Director
            if (!isDirector && tab.id === "categories") return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.id === "overview" && stats.lowStockCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {stats.lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <StatsCards {...stats} />

          {/* Cảnh báo tồn thấp */}
          {lowStockMaterials.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                <span>⚠</span> Vật Tư Cần Nhập Thêm ({lowStockMaterials.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockMaterials.map((m) => (
                  <div key={m.id} className="bg-white border border-red-200 rounded-lg px-4 py-3">
                    <div className="font-bold text-sm text-gray-800">[{m.code}] {m.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Tồn: <span className="text-red-600 font-bold">{m.currentStock}</span> / Tối thiểu: {m.minStockLevel} {m.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Giao dịch gần đây */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-800 mb-4">Giao Dịch Gần Đây</h3>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Chưa có giao dịch nào</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => {
                  const cfg = { IMPORT: { label: "Nhập", color: "text-emerald-600", sign: "+" }, EXPORT: { label: "Xuất", color: "text-orange-500", sign: "-" }, ADJUST: { label: "Điều chỉnh", color: "text-blue-600", sign: "~" }, RETURN: { label: "Trả", color: "text-teal-600", sign: "+" } }[tx.type];
                  const d = new Date(tx.transactionDate);
                  return (
                    <div key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-xs w-20 ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-gray-700">[{tx.material.code}] {tx.material.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className={`font-bold ${cfg.color}`}>{cfg.sign}{tx.quantity} {tx.material.unit}</span>
                        <span className="text-gray-400 text-xs">{d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}</span>
                        <span className="text-gray-400 text-xs">{tx.createdByName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "materials" && (
        <MaterialListCard
          materials={materials}
          categories={categories}
          isDirector={isDirector}
        />
      )}

      {activeTab === "transactions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImportMaterialForm
            materials={activeMaterials}
            suppliers={suppliers}
          />
          <div className="space-y-6">
            <ExportMaterialForm
              materials={activeMaterials}
              employees={employees}
            />
            {isDirector && (
              <AdjustStockForm materials={activeMaterials} />
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <TransactionHistoryCard transactions={transactions} />
      )}

      {activeTab === "suppliers" && (
        <SupplierCard suppliers={suppliers} isDirector={isDirector} />
      )}

      {isDirector && activeTab === "categories" && (
        <CategoryCard categories={categories} />
      )}
    </div>
  );
}
