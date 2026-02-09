"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createDepartment, createEmployee, updateSettings } from "@/actions/director";
import { approvePayroll, rejectPayroll } from "@/actions/payroll";
import { logout } from "@/actions/auth";

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
  pendingPayrolls: any[]; // Danh sách lương chờ duyệt
}

export default function DirectorDashboard({ departments, employees, settings, pendingPayrolls = [] }: Props) {
  
  const [stateDept, actionDept, isPendingDept] = useActionState(createDepartment, null);
  const [stateEmp, actionEmp, isPendingEmp] = useActionState(createEmployee, null);
  const [stateSet, actionSet, isPendingSet] = useActionState(updateSettings, null);

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

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KHU VỰC DUYỆT LƯƠNG (NẾU CÓ) --- */}
        {pendingPayrolls.length > 0 && (
          <div className="lg:col-span-3 bg-orange-50 p-6 rounded-xl shadow-md border border-orange-200 animate-pulse-slow">
            <h3 className="font-bold text-orange-800 text-lg mb-4 flex items-center gap-2">
              🔔 CẦN PHÊ DUYỆT ({pendingPayrolls.length})
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
                        if(res.success) toast.success(res.success);
                        else toast.error(res.error);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded text-sm font-bold hover:bg-green-700"
                    >
                      ✅ Duyệt ngay
                    </button>

                    <form action={async (formData) => {
                        const res = await rejectPayroll(formData);
                        if(res.success) toast.success(res.success);
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

        {/* --- CỘT 1: CÀI ĐẶT --- */}
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

        {/* --- CỘT 2 & 3: QUẢN LÝ --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Thêm Phòng Ban */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-2">Quản lý Phòng Ban</h3>
            <div className="flex gap-4 items-end">
              <form action={actionDept} className="flex-1 flex gap-2">
                <input name="name" placeholder="Nhập tên phòng mới..." className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                <button disabled={isPendingDept} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
                  {isPendingDept ? "..." : "+ Thêm"}
                </button>
              </form>
              <div className="text-sm text-gray-500 px-3 py-2 bg-gray-100 rounded">
                Tổng: <strong>{departments.length}</strong>
              </div>
            </div>
             <div className="mt-3 flex flex-wrap gap-2">
                {departments.map((d: any) => (
                    <span key={d.id} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-100">
                        {d.name}
                    </span>
                ))}
             </div>
          </div>

          {/* Thêm Nhân Viên */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">👤 Thêm Nhân Viên Mới</h3>
            <form action={actionEmp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-600">Họ và Tên (*)</label>
                  <input name="fullName" required placeholder="Nguyễn Văn A" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600">Username (*)</label>
                  <input name="username" required placeholder="user1" className="w-full border p-2 rounded bg-yellow-50 focus:ring-2 focus:ring-yellow-400 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600">Phòng ban</label>
                  <select name="departmentId" className="w-full border p-2 rounded bg-white">
                    <option value="">-- Chọn phòng --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-600">Lương cơ bản (*)</label>
                  <input name="baseSalary" type="number" required placeholder="10000000" className="w-full border p-2 rounded font-bold text-green-700 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-bold text-gray-600">Email</label>
                    <input name="email" type="email" className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">SĐT</label>
                    <input name="phone" type="text" className="w-full border p-2 rounded" />
                  </div>
                </div>
                 <div>
                    <label className="text-sm font-bold text-gray-600">Ngày sinh</label>
                    <input name="dob" type="date" className="w-full border p-2 rounded" />
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <button disabled={isPendingEmp} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 shadow disabled:opacity-50 transition-transform active:scale-95">
                   {isPendingEmp ? "Đang lưu hồ sơ..." : "+ Lưu Hồ Sơ Nhân Viên"}
                </button>
              </div>
            </form>
          </div>

          {/* Danh sách nhân viên */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-700 mb-4">Danh sách nhân sự ({employees.length})</h3>
             <div className="overflow-x-auto max-h-96 overflow-y-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-100 uppercase text-xs sticky top-0">
                   <tr>
                     <th className="p-2">Họ tên</th>
                     <th className="p-2">Phòng ban</th>
                     <th className="p-2">Lương CB</th>
                     <th className="p-2">Liên hệ</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {employees.map((emp: any) => (
                     <tr key={emp.id} className="hover:bg-gray-50">
                       <td className="p-2 font-medium">{emp.fullName} <br/><span className="text-xs text-gray-400">@{emp.username}</span></td>
                       <td className="p-2">{emp.department?.name || "-"}</td>
                       <td className="p-2 font-bold text-green-700">{new Intl.NumberFormat('vi-VN').format(emp.baseSalary)}</td>
                       <td className="p-2 text-gray-500">{emp.phone}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}