export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { logout } from "@/actions/auth";
import AccountantPageClient from "./AccountantPageClient";

export default async function AccountantPage() {
  // Lấy tất cả nhân viên (Bỏ status vì schema không có)
  const employees = await db.employee.findMany({
    include: { department: true }
  });

  const payrolls = await db.payroll.findMany({
    include: { employee: true },
    orderBy: { createdAt: 'desc' }
  });

  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-indigo-900 tracking-tight">🏦 KẾ TOÁN LƯƠNG</h1>
        <form action={logout}>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md">
            Đăng xuất
          </button>
        </form>
      </div>

      <AccountantPageClient currentMonth={currentMonth} payrolls={payrolls as any} />
    </div>
  );
}