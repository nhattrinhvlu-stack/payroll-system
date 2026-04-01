"use client";

interface StatsCardsProps {
  totalMaterials: number;
  lowStockCount: number;
  importThisMonth: number;
  exportThisMonth: number;
  totalStockValue: number;
}

export default function StatsCards({
  totalMaterials,
  lowStockCount,
  importThisMonth,
  exportThisMonth,
  totalStockValue,
}: StatsCardsProps) {
  const fmt = (n: number) => n.toLocaleString("vi-VN");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-blue-600 text-white p-5 rounded-xl shadow">
        <p className="text-blue-100 text-xs font-bold uppercase mb-1">Tổng Vật Tư</p>
        <p className="text-3xl font-black">{totalMaterials}</p>
        <p className="text-blue-200 text-xs mt-1">danh mục đang hoạt động</p>
      </div>

      <div className={`${lowStockCount > 0 ? "bg-red-500" : "bg-green-600"} text-white p-5 rounded-xl shadow`}>
        <p className="text-xs font-bold uppercase mb-1 opacity-80">Tồn Kho Thấp</p>
        <p className="text-3xl font-black">{lowStockCount}</p>
        <p className="text-xs mt-1 opacity-70">{lowStockCount > 0 ? "cần nhập thêm" : "ổn định"}</p>
      </div>

      <div className="bg-emerald-600 text-white p-5 rounded-xl shadow">
        <p className="text-emerald-100 text-xs font-bold uppercase mb-1">Nhập Tháng Này</p>
        <p className="text-3xl font-black">{fmt(importThisMonth)}</p>
        <p className="text-emerald-200 text-xs mt-1">giao dịch nhập kho</p>
      </div>

      <div className="bg-orange-500 text-white p-5 rounded-xl shadow">
        <p className="text-orange-100 text-xs font-bold uppercase mb-1">Xuất Tháng Này</p>
        <p className="text-3xl font-black">{fmt(exportThisMonth)}</p>
        <p className="text-orange-200 text-xs mt-1">giao dịch xuất kho</p>
      </div>

      <div className="bg-purple-600 text-white p-5 rounded-xl shadow col-span-2 lg:col-span-1">
        <p className="text-purple-100 text-xs font-bold uppercase mb-1">Giá Trị Tồn Kho</p>
        <p className="text-2xl font-black">{fmt(Math.round(totalStockValue))}đ</p>
        <p className="text-purple-200 text-xs mt-1">tổng giá trị ước tính</p>
      </div>
    </div>
  );
}
