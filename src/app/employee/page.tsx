export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import ChangePasswordForm from "./ChangePasswordForm";
import LeaveRequestForm from "./LeaveRequestForm";
import PrintablePayslip from "@/components/PrintablePayslip";
import Link from "next/link";
import EmployeePageClient from "./EmployeePageClient";

export default async function EmployeePage({
  searchParams
}: {
  searchParams: Promise<{ month?: string, year?: string }>
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) redirect("/login");

  const user = JSON.parse(session.value);

  // 1. XÁC ĐỊNH THÁNG CẦN XEM
  const today = new Date();
  const viewMonth = params?.month ? parseInt(params.month) : today.getMonth() + 1;
  const viewYear = params?.year ? parseInt(params.year) : today.getFullYear();

  // 2. LẤY PHIẾU LƯƠNG (Chỉ lấy đã duyệt)
  const rawPayroll = await db.payroll.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: user.id,
        month: viewMonth,
        year: viewYear
      }
    },
    include: {
      employee: {
        include: { department: true }
      }
    }
  });

  const currentPayroll = rawPayroll?.status === "APPROVED" ? rawPayroll : null;

  // 3. LẤY CHẤM CÔNG THÁNG ĐÓ
  const startDate = new Date(viewYear, viewMonth - 1, 1);
  const endDate = new Date(viewYear, viewMonth, 1);

  const attendances = await db.attendance.findMany({
    where: {
      employeeId: user.id,
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    orderBy: { date: 'desc' }
  });

  // 4. LẤY DANH SÁCH THÁNG CÓ LƯƠNG (Để làm menu)
  const historyPayrolls = await db.payroll.findMany({
    where: {
      employeeId: user.id,
      status: "APPROVED"
    },
    select: { month: true, year: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });

  // 5. LẤY LỊCH SỬ XIN NGHỈ PHÉP
  const myLeaves = await db.leaveRequest.findMany({
    where: { employeeId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-green-700 text-white p-6 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">📱 CỔNG NHÂN VIÊN</h1>
          <p className="text-green-100 text-sm">Chào, {user.name}</p>
        </div>
        <form action={logout}>
          <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-bold border border-white/30 transition">
            Đăng xuất
          </button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        {/* --- MENU CHỌN THÁNG --- */}
        {historyPayrolls.length > 0 && (
          <div className="overflow-x-auto pb-2 flex justify-center">
            <div className="flex gap-2">
              {historyPayrolls.map((p) => {
                const isActive = p.month === viewMonth && p.year === viewYear;
                return (
                  <Link
                    key={`${p.month}-${p.year}`}
                    href={`/employee?month=${p.month}&year=${p.year}`}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${isActive
                      ? "bg-green-600 text-white border-green-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    Tháng {p.month}/{p.year}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-xl lg:text-2xl font-black text-gray-800 tracking-tight">Dữ liệu Tháng {viewMonth}/{viewYear}</h2>
        </div>

        {/* --- GRID BAN ĐẦU --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* CỘT TRÁI (8/12) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* --- PHẦN 1: PHIẾU LƯƠNG CHI TIẾT --- */}
            {currentPayroll ? (
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                  Đã thanh toán
                </div>

                {/* In nút */}
                <div className="absolute top-2 left-2">
                  <EmployeePageClient />
                </div>

                {/* Tổng thực lĩnh */}
                <div className="p-6 text-center border-b border-gray-100 bg-green-50">
                  <p className="text-green-800 text-sm uppercase tracking-wide font-bold">Thực Lĩnh</p>
                  <p className="text-4xl font-bold text-green-700 mt-1">
                    {new Intl.NumberFormat('vi-VN').format(currentPayroll.totalSalary)}
                    <span className="text-sm text-gray-500 font-normal align-top">₫</span>
                  </p>
                </div>

                {/* Chi tiết từng khoản */}
                <div className="p-5 bg-white text-sm space-y-3">

                  {/* 1. Lương & Công */}
                  <div className="pb-3 border-b border-gray-100 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Lương cứng:</span>
                      <b className="text-gray-900">{new Intl.NumberFormat('vi-VN').format(currentPayroll.baseSalary)}</b>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Công chuẩn:</span>
                      <b className="text-gray-900">{currentPayroll.standardDays} ngày</b>
                    </div>
                    <div className="flex justify-between text-blue-700 bg-blue-50 p-2 rounded">
                      <span>Lương theo công ({currentPayroll.actualWorkDays} ngày):</span>
                      <b>{new Intl.NumberFormat('vi-VN').format((currentPayroll.baseSalary / currentPayroll.standardDays) * currentPayroll.actualWorkDays)}</b>
                    </div>
                  </div>

                  {/* 2. Tăng ca */}
                  {currentPayroll.overtimeSalary > 0 && (
                    <div className="flex justify-between text-orange-600 font-bold border-b border-gray-100 pb-3">
                      <span>Tăng ca ({currentPayroll.overtimeHours}h):</span>
                      <b>+{new Intl.NumberFormat('vi-VN').format(currentPayroll.overtimeSalary)}</b>
                    </div>
                  )}

                  {/* 3. Phụ cấp (Tách lẻ) */}
                  <div className="space-y-2 pb-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase">Các khoản phụ cấp:</p>

                    {currentPayroll.responsibility > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>• Trách nhiệm:</span>
                        <b>+{new Intl.NumberFormat('vi-VN').format(currentPayroll.responsibility)}</b>
                      </div>
                    )}

                    {currentPayroll.phoneAllowance > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>• Điện thoại:</span>
                        <b>+{new Intl.NumberFormat('vi-VN').format(currentPayroll.phoneAllowance)}</b>
                      </div>
                    )}

                    {currentPayroll.fuelAllowance > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>• Xăng ({currentPayroll.kmTraveled} km):</span>
                        <b>+{new Intl.NumberFormat('vi-VN').format(currentPayroll.fuelAllowance)}</b>
                      </div>
                    )}

                    {currentPayroll.otherAllowance > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>• Hỗ trợ khác (Cơm/Nước...):</span>
                        <b>+{new Intl.NumberFormat('vi-VN').format(currentPayroll.otherAllowance)}</b>
                      </div>
                    )}

                    {(currentPayroll.responsibility + currentPayroll.phoneAllowance + currentPayroll.fuelAllowance + currentPayroll.otherAllowance) === 0 && (
                      <div className="text-gray-400 italic text-xs">Không có khoản phụ cấp nào.</div>
                    )}
                  </div>

                  {/* 4. Khấu trừ */}
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-gray-400 font-bold uppercase">Các khoản khấu trừ:</p>

                    {currentPayroll.insurance > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>• Trừ BHXH:</span>
                        <b>-{new Intl.NumberFormat('vi-VN').format(currentPayroll.insurance)}</b>
                      </div>
                    )}

                    {currentPayroll.advancePayment > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>• Đã tạm ứng:</span>
                        <b>-{new Intl.NumberFormat('vi-VN').format(currentPayroll.advancePayment)}</b>
                      </div>
                    )}

                    {(currentPayroll.insurance === 0 && currentPayroll.advancePayment === 0) && (
                      <div className="text-gray-400 italic text-xs">Không có khoản trừ nào.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow text-center border-dashed border-2 border-gray-200">
                <p className="text-gray-400 italic">Tháng này chưa có phiếu lương được duyệt.</p>
              </div>
            )}

            {/* --- PHẦN 2: CHI TIẾT CHẤM CÔNG (CẬP NHẬT GIAO DIỆN MỚI) --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 p-3 font-bold text-gray-700 text-sm border-b flex justify-between">
                <span>📅 Chi tiết công</span>
                <span>T{viewMonth}/{viewYear}</span>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {attendances.map((att) => (
                  <div key={att.id} className="p-3 hover:bg-gray-50 transition-colors">

                    {/* Dòng 1: Ngày + Tags (Công/Tăng ca) */}
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-gray-800 text-sm">
                        {new Date(att.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex gap-1 text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">
                          Công: {att.workingDays}
                        </span>
                        {att.overtime > 0 && (
                          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-100">
                            TC: {att.overtime}h
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dòng 2: Hiển thị Ghi chú & Tiền (Nổi bật) */}
                    <div className="flex justify-between items-center mt-2 text-sm">

                      {/* Cột Ghi chú: Nếu có tiền hỗ trợ -> Hiện màu xanh nổi bật */}
                      <div className="flex-1 pr-2">
                        {att.dailyAllowance > 0 ? (
                          <div className="text-green-800 font-medium flex items-center gap-1 bg-green-50 p-2 rounded-lg border border-green-100">
                            <span className="text-lg">💰</span>
                            <span>{att.note || "Hỗ trợ (Không ghi chú)"}</span>
                          </div>
                        ) : (
                          // Ghi chú bình thường
                          <span className="text-gray-400 italic text-xs pl-1">{att.note || "..."}</span>
                        )}
                      </div>

                      {/* Cột Tiền: Hỗ trợ hoặc Ứng */}
                      <div className="text-right flex flex-col items-end gap-1 min-w-[80px]">
                        {att.dailyAllowance > 0 && (
                          <span className="text-green-600 font-bold bg-white px-1 rounded shadow-sm border border-green-100">
                            +{new Intl.NumberFormat('vi-VN').format(att.dailyAllowance)}
                          </span>
                        )}
                        {att.dailyAdvance > 0 && (
                          <span className="text-red-500 font-bold bg-red-50 px-1 rounded border border-red-100">
                            -{new Intl.NumberFormat('vi-VN').format(att.dailyAdvance)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {attendances.length === 0 && <div className="p-8 text-center text-xs text-gray-400">Không có dữ liệu chấm công.</div>}
              </div>
            </div>

          </div>{/* Kết thúc Cột Trái */}

          {/* ========================================================= */}
          {/* CỘT PHẢI: Tiện ích & Form (Xin nghỉ, Đổi pass, Lịch sử) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* --- PHẦN 3: FORM XIN NGHỈ --- */}
            <LeaveRequestForm />

            {/* --- PHẦN 3.5: LỊCH SỬ XIN NGHỈ PHÉP --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-orange-50 p-4 font-bold text-orange-800 text-sm border-b">
                📋 Lịch sử Xin Nghỉ Phép
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {myLeaves.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">Bạn chưa có đơn xin nghỉ nào.</div>
                ) : (
                  myLeaves.map((l: any) => (
                    <div key={l.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800 text-sm">
                          {l.type === "ANNUAL" && "Phép năm"}
                          {l.type === "SICK" && "Nghỉ ốm"}
                          {l.type === "UNPAID" && "Không lương"}
                          {l.type === "OTHER" && "Khác"}
                          <span className="text-gray-500 font-normal ml-2">({l.totalDays} ngày)</span>
                        </div>
                        <div>
                          {l.status === "PENDING" && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-200">Chờ duyệt</span>}
                          {l.status === "APPROVED" && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200">Đã duyệt</span>}
                          {l.status === "REJECTED" && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold border border-red-200">Từ chối</span>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        <b>Thời gian:</b> {new Date(l.startDate).toLocaleDateString("vi-VN")} - {new Date(l.endDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100">
                        "{l.reason}"
                      </div>
                      {l.approverNote && (
                        <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                          <b>Giám đốc nhắn:</b> {l.approverNote}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* --- PHẦN 4: FORM ĐỔI MẬT KHẨU --- */}
            <ChangePasswordForm />

          </div>{/* Kết thúc Cột Phải */}
        </div>{/* Kết thúc Grid */}

      </div>

      {/* --- VÙNG IN BẢN PDF --- */}
      {currentPayroll && (
        <PrintablePayslip payroll={currentPayroll} />
      )}
    </div>
  );
}