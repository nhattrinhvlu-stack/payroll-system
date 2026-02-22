"use client";

import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createDepartment, createEmployee, updateSettings } from "@/actions/director";
import { approvePayroll, rejectPayroll } from "@/actions/payroll";
import { logout } from "@/actions/auth";
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
          { id: "settings", label: "⚙️ Cài đặt & Lịch sử" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-2 font-bold whitespace-nowrap border-b-4 transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
          >
            {tab.label}
          </button>
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
              {/* Form thêm nhân viên giữ nguyên */}
              <form action={actionEmp} className="space-y-4">
                <div>
                  <input name="fullName" required placeholder="Họ và Tên (*)" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="username" required placeholder="User (*)" className="w-full border p-2 rounded bg-yellow-50 focus:ring-2 focus:ring-yellow-400 outline-none text-sm" />
                  <input name="baseSalary" type="number" required placeholder="Lương (*)" className="w-full border p-2 rounded text-green-700 outline-none text-sm" />
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
                <div className="mt-3 flex flex-wrap gap-1">
                  {departments.map((d: any) => (
                    <span key={d.id} className="text-[10px] bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-100">{d.name}</span>
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
            {/* Duyệt lương */}
            {pendingPayrolls.length > 0 && (
              <div className="bg-orange-50 p-6 rounded-xl shadow-md border border-orange-200 animate-pulse-slow mb-6">
                <h3 className="font-bold text-orange-800 text-lg mb-4 flex items-center gap-2">
                  🔔 CẦN PHÊ DUYỆT LƯƠNG ({pendingPayrolls.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingPayrolls.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{p.employee.fullName}</p>
                          <p className="text-xs text-gray-500">Tháng {p.month}/{p.year}</p>
                        </div>
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">Chờ duyệt</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900 mb-4">
                        {new Intl.NumberFormat('vi-VN').format(p.totalSalary)} đ
                      </div>

                      <div className="flex flex-col gap-2">
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
                  <label className="text-xs font-bold text-gray-500 uppercase">Giá xăng (VNĐ/km)</label>
                  <input name="fuelPricePerKm" type="number" defaultValue={settings?.fuelPricePerKm ?? 5000} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-gray-400 mb-2">Phụ cấp mặc định:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Trách nhiệm</label>
                      <input name="responsibilityAmount" type="number" defaultValue={settings?.responsibilityAmount ?? 0} className="w-full border p-2 rounded text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Điện thoại</label>
                      <input name="phoneAllowance" type="number" defaultValue={settings?.phoneAllowance ?? 0} className="w-full border p-2 rounded text-sm" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs font-bold text-gray-500">Tăng thêm khác</label>
                    <input name="otherAllowance" type="number" defaultValue={settings?.otherAllowance ?? 0} className="w-full border p-2 rounded text-sm" />
                  </div>
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
      </div>
    </div>
  );
}