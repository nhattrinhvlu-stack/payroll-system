export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { logout } from "@/actions/auth";
import ChangePasswordForm from "@/app/employee/ChangePasswordForm";
import AccountantPageClient from "./AccountantPageClient";
import DateSelector from "./DateSelector";
import AttendanceTable from "./AttendanceTable";

export default async function AccountantPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await search params in next 15+
  const params = await searchParams;

  // Xử lý ngày chọn (Mặc định hôm nay nếu không có url param)
  const dateStr = (params.date as string) || new Date().toISOString().split("T")[0];
  const selectedDate = new Date(dateStr);

  // Lấy tất cả nhân viên kèm phòng ban và theo dõi chấm công trong ngày được chọn
  const employees = await db.employee.findMany({
    include: {
      department: true,
      attendances: {
        where: {
          date: {
            gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
            lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
          }
        }
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { lte: new Date(selectedDate.setHours(23, 59, 59, 999)) },
          endDate: { gte: new Date(selectedDate.setHours(0, 0, 0, 0)) }
        }
      }
    }
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
        <h1 className="text-3xl font-black text-indigo-900 tracking-tight">🏦 QUẢN LÝ KẾ TOÁN</h1>
        <form action={logout}>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md">
            Đăng xuất
          </button>
        </form>
      </div>

      {/* --- PHẦN 1: CHẤM CÔNG HÀNG NGÀY --- */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">📅 Chấm công hàng ngày</h2>
      <div className="mb-8 space-y-4">
        <DateSelector date={dateStr} />
        <AttendanceTable employees={employees as any} dateStr={dateStr} />
      </div>

      {/* --- PHẦN 2: TÍNH LƯƠNG THÁNG --- */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">💰 Tính & Quản lý Lương tháng</h2>
      <AccountantPageClient currentMonth={currentMonth} payrolls={payrolls as any} />

      {/* --- PHẦN 2.5: BẢNG LƯƠNG NGÀY --- */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">📋 Lương ngày</h2>
        <a
          href="/accountant/daily-payroll"
          className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-md hover:border-green-300 transition group"
        >
          <div className="bg-green-100 text-green-700 text-2xl w-12 h-12 rounded-xl flex items-center justify-center font-bold group-hover:bg-green-600 group-hover:text-white transition">
            📋
          </div>
          <div>
            <div className="font-bold text-gray-800">Mở Bảng lương ngày</div>
            <div className="text-sm text-gray-500">Xem chi tiết tiền lương từng ngày & đánh dấu đã trả</div>
          </div>
          <span className="ml-auto text-gray-400 group-hover:text-green-600 text-lg">→</span>
        </a>
      </div>

      {/* --- PHẦN 3: QUẢN LÝ VẬT TƯ --- */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">📦 Quản lý Vật Tư</h2>
        <a
          href="/accountant/inventory"
          className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-md hover:border-blue-300 transition group"
        >
          <div className="bg-blue-100 text-blue-700 text-2xl w-12 h-12 rounded-xl flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition">
            📦
          </div>
          <div>
            <div className="font-bold text-gray-800">Mở trang Quản lý Vật Tư</div>
            <div className="text-sm text-gray-500">Nhập kho, xuất kho, xem tồn kho và lịch sử giao dịch</div>
          </div>
          <span className="ml-auto text-gray-400 group-hover:text-blue-600 text-lg">→</span>
        </a>
      </div>

      {/* --- PHẦN 4: TÀI KHOẢN --- */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">👤 Tài Khoản Của Tôi</h2>
        <div className="max-w-md">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}