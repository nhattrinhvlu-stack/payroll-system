"use client";

import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createDepartment, createEmployee, updateSettings, deleteDepartment } from "@/actions/director";
import { approvePayroll, rejectPayroll } from "@/actions/payroll";
import { logout } from "@/actions/auth";
import ChangePasswordForm from "@/app/employee/ChangePasswordForm";
import EmployeeListCard from "./EmployeeListCard";
import ContractListCard from "./ContractListCard";
import AuditLogCard from "./AuditLogCard";
import LeaveRequestCard from "./LeaveRequestCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Hàm hiển thị thông báo
const useNotification = (state: any) => {
  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);
};

interface Props {
  departments: any[];
  employees: any[];
  settings: any;
  pendingPayrolls: any[];
  leaveRequests: any[];
  contracts: any[];
  auditLogs: any[];
  monthlyPayrolls: any[];
  currentMonth: number;
  currentYear: number;
}

export default function DirectorDashboard({
  departments, employees, settings, pendingPayrolls = [],
  leaveRequests = [], contracts = [], auditLogs = [],
  monthlyPayrolls = [], currentMonth, currentYear
}: Props) {

  const [stateDept, actionDept, isPendingDept] = useActionState(createDepartment, null);
  const [stateEmp, actionEmp, isPendingEmp] = useActionState(createEmployee, null);
  const [stateSet, actionSet, isPendingSet] = useActionState(updateSettings, null);

  const [activeTab, setActiveTab] = useState("overview");

  useNotification(stateDept);
  useNotification(stateEmp);
  useNotification(stateSet);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-blue-900 text-white p-6 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold">🏛️ TRUNG TÂM ĐIỀU HÀNH</h1>
          <p className="text-blue-200 text-sm">Xin chào Giám Đốc</p>
        </div>
        <button onClick={() => logout()} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold shadow">
          Đăng xuất
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border-b shadow-sm mb-6 sticky top-[72px] z-10 px-6 overflow-x-auto flex gap-6">
        {[
          { id: "overview", label: "📊 Tổng quan" },
          { id: "hr", label: "👥 Nhân sự & Hợp đồng" },
          { id: "payroll", label: "💰 Lương & Phép" },
          { id: "settings", label: "⚙️ Cài đặt & Lịch sử" },
          { id: "account", label: "👤 Tài Khoản" },
          { id: "attendance", label: "🕒 Chấm công", href: "/director/attendance" },
          { id: "inventory", label: "📦 Vật Tư", href: "/director/inventory" }
        ].map(tab => (
          "href" in tab ? (
            <a
              key={tab.id}
              href={tab.href}
              className="py-4 px-2 font-bold whitespace-nowrap border-b-4 border-transparent text-gray-500 hover:text-gray-800 transition-colors"
            >
              {tab.label}
            </a>
          ) : (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 font-bold whitespace-nowrap border-b-4 transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
            >
              {tab.label}
            </button>
          )
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === "overview" && (
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard Stats (TBD) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-500 text-white p-6 rounded-xl shadow">
                <h3 className="text-blue-100 font-bold uppercase text-xs mb-1">Tổng Nhân Sự</h3>
                <p className="text-4xl font-black">{employees.length}</p>
              </div>
              <div className="bg-green-600 text-white p-6 rounded-xl shadow">
                <h3 className="text-green-100 font-bold uppercase text-xs mb-1">Chi Phí Lương Tháng {currentMonth}</h3>
                <p className="text-4xl font-black">
                  {new Intl.NumberFormat('vi-VN').format(monthlyPayrolls.reduce((sum, p) => sum + p.totalSalary, 0))} đ
                </p>
              </div>
              <div className="bg-orange-500 text-white p-6 rounded-xl shadow">
                {/* TBD: Ca tăng ca */}
                <h3 className="text-orange-100 font-bold uppercase text-xs mb-1">Cần Duyệt (Lương)</h3>
                <p className="text-4xl font-black">{pendingPayrolls.length}</p>
              </div>
            </div>

            {/* Biểu đồ lương theo tháng */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Biểu Đồ Chi Phí Lương (6 tháng gần đây)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: `Tháng ${currentMonth}`, uv: monthlyPayrolls.reduce((sum, p) => sum + p.totalSalary, 0) }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} />
                    <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + " đ"} />
                    <Bar dataKey="uv" fill="#2563eb" name="Tổng chi phí" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: NHÂN SỰ & HỢP ĐỒNG --- */}
        {activeTab === "hr" && (
          <>
            {/* Cột trái: Thêm nhân viên / Phòng ban (Thu gọn phần thêm NV nếu dài) */}
            <div className="lg:col-span-1 border border-gray-200 bg-white p-6 rounded-xl shadow-sm h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">👤 Thêm Nhân Viên Mới</h3>
              {/* Form thêm nhân viên */}
              <form action={actionEmp} className="space-y-4">
                <div>
                  <input name="fullName" required placeholder="Họ và Tên (*)" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="username" required placeholder="User (*)" className="w-full border p-2 rounded bg-yellow-50 focus:ring-2 focus:ring-yellow-400 outline-none text-sm" />
                  <input name="baseSalary" type="number" required placeholder="Lương Cbản (*)" className="w-full border p-2 rounded text-green-700 outline-none text-sm font-bold" />
                </div>

                {/* Loại lương */}
                <div className="grid grid-cols-2 gap-2">
                  <select name="salaryType" defaultValue="MONTHLY" className="w-full border p-2 rounded bg-white text-sm">
                    <option value="MONTHLY">Lương theo tháng</option>
                    <option value="DAILY">Lương theo ngày</option>
                  </select>
                  <input name="dailyWage" type="number" placeholder="Lương/ngày (nếu trả theo ngày)" className="w-full border p-2 rounded text-green-700 outline-none text-sm font-bold" />
                </div>

                {/* Phụ cấp cá nhân */}
                <div className="bg-gray-50 p-3 rounded border border-gray-100 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Phụ cấp & Cấu hình</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <input name="responsibilityAmount" type="number" placeholder="PC Trách nhiệm" className="w-full border p-2 rounded" />
                    <input name="phoneAllowance" type="number" placeholder="PC Điện thoại" className="w-full border p-2 rounded" />
                  </div>
                  <input name="otherAllowance" type="number" placeholder="PC Khác (cố định hàng tháng)" className="w-full border p-2 rounded text-sm" />

                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer pt-1">
                    <input type="checkbox" name="hasInsurance" value="true" className="w-4 h-4 text-blue-600 rounded" />
                    Đóng Bảo Hiểm Xã Hội (BHXH)
                  </label>
                </div>

                <select name="departmentId" className="w-full border p-2 rounded bg-white text-sm">
                  <option value="">-- Chọn phòng / Trống --</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <input name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" />
                  <input name="phone" type="text" placeholder="SĐT" className="w-full border p-2 rounded" />
                </div>
                <button disabled={isPendingEmp} className="w-full bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700 shadow disabled:opacity-50 mt-2">
                  {isPendingEmp ? "Đang lưu..." : "+ Lưu Nhân Viên"}
                </button>
              </form>

              <div className="mt-8">
                <h3 className="font-bold text-gray-700 mb-2">Phòng Ban ({departments.length})</h3>
                <form action={actionDept} className="flex gap-2">
                  <input name="name" placeholder="Tên phòng..." className="flex-1 border p-2 rounded text-sm" required />
                  <button disabled={isPendingDept} className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold disabled:opacity-50">+</button>
                </form>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {departments.map((d: any) => (
                    <form
                      key={d.id}
                      action={async (fd) => {
                        const res = await deleteDepartment(null, fd);
                        if (res?.error) toast.error(res.error);
                        if (res?.success) toast.success(res.success);
                      }}
                      onSubmit={(e) => {
                        if (!confirm(`Bạn có chắc muốn xóa phòng ${d.name}?`)) {
                          e.preventDefault();
                        }
                      }}
                      className="inline-flex items-center bg-blue-50 text-blue-800 rounded border border-blue-200 overflow-hidden group"
                    >
                      <span className="px-2 py-1 select-none">{d.name}</span>
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className="bg-blue-100 hover:bg-red-500 hover:text-white px-2 py-1 transition-colors border-l border-blue-200 text-gray-500"
                        title="Xóa phòng ban"
                      >
                        ×
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột phải: Danh sách và Hợp đồng */}
            <div className="lg:col-span-2 space-y-6">
              <EmployeeListCard employees={employees} departments={departments} />
              <ContractListCard contracts={contracts} employees={employees} />
            </div>
          </>
        )}

        {/* --- TAB: PAYROLL --- */}
        {activeTab === "payroll" && (
          <div className="lg:col-span-3">
            {/* Lối vào bảng lương ngày */}
            <a
              href="/director/daily-payroll"
              className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-green-300 transition group mb-6"
            >
              <div className="bg-green-100 text-green-700 text-xl w-10 h-10 rounded-lg flex items-center justify-center font-bold group-hover:bg-green-600 group-hover:text-white transition">
                📋
              </div>
              <div>
                <div className="font-bold text-gray-800">Bảng lương ngày</div>
                <div className="text-xs text-gray-500">Xem chi tiết lương ngày & trạng thái đã trả</div>
              </div>
              <span className="ml-auto text-gray-400 group-hover:text-green-600 text-lg">→</span>
            </a>

            {/* Duyệt lương */}
            {pendingPayrolls.length > 0 && (
              <div className="bg-orange-50 p-6 rounded-xl shadow-md border border-orange-200 animate-pulse-slow mb-6">
                <h3 className="font-bold text-orange-800 text-lg mb-4 flex items-center gap-2">
                  🔔 CẦN PHÊ DUYỆT LƯƠNG ({pendingPayrolls.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingPayrolls.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{p.employee.fullName}</p>
                          <p className="text-xs text-gray-500">Tháng {p.month}/{p.year}</p>
                        </div>
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">Chờ duyệt</span>
                      </div>

                      <div className="text-2xl font-black text-blue-900 mb-3 border-b pb-3 border-gray-50">
                        {new Intl.NumberFormat('vi-VN').format(p.totalSalary)} đ
                      </div>

                      {/* --- CHI TIẾT CHẤM CÔNG --- */}
                      <details className="mb-4 group">
                        <summary className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline list-none flex items-center gap-1">
                          <span className="group-open:rotate-90 transition-transform">▶</span> Xem chi tiết chấm công & phụ cấp
                        </summary>
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-[11px] space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-bold">Lương cơ bản:</span>
                            <span className="font-black text-gray-700">{new Intl.NumberFormat('vi-VN').format(p.baseSalary)}đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-bold">Ngày công thực/chuẩn:</span>
                            <span className="font-black text-blue-600">{p.actualWorkDays} / {p.standardDays}</span>
                          </div>
                          {p.overtimeHours > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-bold">Tăng ca:</span>
                              <span className="font-black text-orange-600">{p.overtimeHours}h (+{new Intl.NumberFormat('vi-VN').format(p.overtimeSalary)}đ)</span>
                            </div>
                          )}
                          {p.kmTraveled > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-bold">Di chuyển (xăng):</span>
                              <span className="font-black text-gray-700">{p.kmTraveled} km (+{new Intl.NumberFormat('vi-VN').format(p.fuelAllowance)}đ)</span>
                            </div>
                          )}
                          {(p.responsibility > 0 || p.phoneAllowance > 0) && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-bold">Phụ cấp cố định:</span>
                              <span className="font-black text-gray-700">+{new Intl.NumberFormat('vi-VN').format(p.responsibility + p.phoneAllowance)}đ</span>
                            </div>
                          )}
                          {p.otherAllowance > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-600 font-bold">Tiền Hỗ trợ (+):</span>
                              <span className="font-black text-green-700">+{new Intl.NumberFormat('vi-VN').format(p.otherAllowance)}đ</span>
                            </div>
                          )}
                          {p.advancePayment > 0 && (
                            <div className="flex justify-between">
                              <span className="text-red-500 font-bold">Đã Ứng trước (-):</span>
                              <span className="font-black text-red-600">-{new Intl.NumberFormat('vi-VN').format(p.advancePayment)}đ</span>
                            </div>
                          )}
                          {p.insurance > 0 && (
                            <div className="flex justify-between border-t border-red-100 pt-1 mt-1">
                              <span className="text-red-500 font-bold">Trừ BHXH (-):</span>
                              <span className="font-black text-red-600">-{new Intl.NumberFormat('vi-VN').format(p.insurance)}đ</span>
                            </div>
                          )}
                        </div>
                      </details>

                      {/* --- CHI TIẾT CHẤM CÔNG HÀNG NGÀY --- */}
                      {p.attendances && p.attendances.length > 0 && (
                        <details className="mb-4 group">
                          <summary className="text-xs font-bold text-gray-600 cursor-pointer hover:underline list-none flex items-center gap-1">
                            <span className="group-open:rotate-90 transition-transform">▶</span> Xem lịch sử chấm công từng ngày
                          </summary>
                          <div className="mt-3 bg-white p-2 text-[10px] rounded border border-gray-200 shadow-inner max-h-48 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-gray-100 text-gray-500 sticky top-0">
                                <tr>
                                  <th className="p-1 border-b">Ngày</th>
                                  <th className="p-1 border-b text-center">Công</th>
                                  <th className="p-1 border-b text-center">TC(h)</th>
                                  <th className="p-1 border-b text-right">Km</th>
                                  <th className="p-1 border-b text-right text-green-600">Hỗ trợ</th>
                                  <th className="p-1 border-b text-right text-red-500">Ứng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.attendances.map((att: any) => (
                                  <tr key={att.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-1 font-bold">{new Date(att.date).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-1 text-center font-bold text-blue-600">{att.workingDays}</td>
                                    <td className="p-1 text-center font-bold text-orange-600">{att.overtime > 0 ? att.overtime : "-"}</td>
                                    <td className="p-1 text-right text-gray-600">{att.kmTraveled > 0 ? att.kmTraveled : "-"}</td>
                                    <td className="p-1 text-right font-bold text-green-600">{att.dailyAllowance > 0 ? new Intl.NumberFormat('vi-VN').format(att.dailyAllowance) : "-"}</td>
                                    <td className="p-1 text-right font-bold text-red-500">{att.dailyAdvance > 0 ? new Intl.NumberFormat('vi-VN').format(att.dailyAdvance) : "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {p.attendances.some((att: any) => att.note) && (
                              <div className="mt-2 border-t pt-2 space-y-1">
                                <p className="font-bold text-gray-500 mb-1">📋 Ghi chú trong tháng:</p>
                                {p.attendances.filter((att: any) => att.note).map((att: any) => (
                                  <div key={`note-${att.id}`} className="flex gap-2 text-gray-600">
                                    <span className="font-bold shrink-0">{new Date(att.date).toLocaleDateString('vi-VN')}:</span>
                                    <span>{att.note}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      )}

                      <div className="flex flex-col gap-2 mt-auto">
                        <button
                          onClick={async () => {
                            const res = await approvePayroll(p.id);
                            if (res.success) toast.success(res.success);
                            else toast.error(res.error || "Có lỗi xảy ra khi duyệt");
                          }}
                          className="w-full bg-green-600 text-white py-2 rounded text-sm font-bold hover:bg-green-700"
                        >
                          ✅ Duyệt ngay
                        </button>

                        <form action={async (formData) => {
                          const res = await rejectPayroll(formData);
                          if (res.success) toast.success(res.success);
                          else toast.error(res.error);
                        }} className="flex gap-2">
                          <input type="hidden" name="id" value={p.id} />
                          <input name="reason" placeholder="Lý do từ chối..." className="flex-1 text-xs border p-2 rounded bg-gray-50" required />
                          <button className="bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-bold hover:bg-red-200 border border-red-200">
                            ❌ Trả về
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duyệt Nghỉ Phép */}
            <LeaveRequestCard leaveRequests={leaveRequests} />
          </div>
        )}

        {/* --- TAB: SETTINGS & AUDIT --- */}
        {activeTab === "settings" && (
          <>
            {/* Cột 1: Cấu hình */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">⚙️ Cấu Hình Lương</h2>
              <form action={actionSet} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Ngày công chuẩn</label>
                  <input name="standardWorkDays" type="number" defaultValue={settings?.standardWorkDays ?? 26} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Hệ số Tăng ca</label>
                    <input name="overtimeRatio" type="number" step="0.1" defaultValue={settings?.overtimeRatio ?? 1.5} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Ô BẢO HIỂM MỚI */}
                  <div>
                    <label className="text-xs font-bold text-red-500 uppercase">% Trừ BHXH</label>
                    <input name="insurancePercent" type="number" step="0.1" defaultValue={settings?.insurancePercent ?? 0} className="w-full border border-red-200 p-2 rounded outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-600" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hỗ trợ Xăng xe (VNĐ / ngày đi làm)</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-20 shrink-0">1 – 15 km</span>
                      <input name="fuelPrice1to15" type="number" defaultValue={settings?.fuelPrice1to15 ?? 30000} className="flex-1 border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-20 shrink-0">16 – 30 km</span>
                      <input name="fuelPrice20to30" type="number" defaultValue={settings?.fuelPrice20to30 ?? 50000} className="flex-1 border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-20 shrink-0">Trên 30 km</span>
                      <input name="fuelPriceAbove30" type="number" defaultValue={settings?.fuelPriceAbove30 ?? 80000} className="flex-1 border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t mt-4">
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 font-medium">
                    ℹ️ Chú ý: Các khoản phụ cấp (Trách nhiệm, Điện thoại, Khác) và cấu hình đóng BHXH nay đã được chuyển vào mục <b>"Thêm / Sửa Nhân Viên"</b> để cấu hình riêng cho từng cá nhân.
                  </p>
                </div>

                <button disabled={isPendingSet} className="w-full bg-gray-800 text-white p-3 rounded font-bold hover:bg-black mt-4 disabled:opacity-50 transition-colors">
                  {isPendingSet ? "Đang lưu..." : "💾 Lưu Cấu Hình"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <AuditLogCard auditLogs={auditLogs} />
            </div>
          </>
        )}

        {/* --- TAB: TÀI KHOẢN --- */}
        {activeTab === "account" && (
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Tài Khoản Của Tôi</h2>
            <div className="max-w-md">
              <ChangePasswordForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}