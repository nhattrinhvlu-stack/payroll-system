"use client";

import { useState, useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateEmployee, toggleEmployeeActive, resetEmployeePassword } from "@/actions/director";

interface Props {
  employees: any[];
  departments: any[];
}

export default function EmployeeListCard({ employees, departments }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [editingEmp, setEditingEmp] = useState<any>(null);

  // States for actions
  const [stateEdit, actionEdit, isPendingEdit] = useActionState(updateEmployee, null);
  const [stateToggle, actionToggle, isPendingToggle] = useActionState(toggleEmployeeActive, null);
  const [stateReset, actionReset, isPendingReset] = useActionState(resetEmployeePassword, null);

  useEffect(() => {
    if (stateEdit?.success) {
      toast.success(stateEdit.success);
      setEditingEmp(null);
    }
    if (stateEdit?.error) toast.error(stateEdit.error);
  }, [stateEdit]);

  useEffect(() => {
    if (stateToggle?.success) toast.success(stateToggle.success);
    if (stateToggle?.error) toast.error(stateToggle.error);
  }, [stateToggle]);

  useEffect(() => {
    if (stateReset?.success) toast.success(stateReset.success);
    if (stateReset?.error) toast.error(stateReset.error);
  }, [stateReset]);

  // Lọc nhân viên
  const filteredEmployees = employees.filter((emp) => {
    const matchesName = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       emp.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? emp.departmentId === filterDept : true;
    return matchesName && matchesDept;
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700">Danh sách nhân sự ({filteredEmployees.length}/{employees.length})</h3>
      </div>
      
      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="Tìm theo tên, username..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
          value={filterDept} 
          onChange={(e) => setFilterDept(e.target.value)}
          className="border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map((d: any) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="p-2">Họ tên</th>
              <th className="p-2">Phòng ban</th>
              <th className="p-2">Lương CB</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y relative">
            {filteredEmployees.map((emp: any) => (
              <tr key={emp.id} className={`hover:bg-gray-50 ${!emp.isActive ? "opacity-60 bg-gray-50 bg-stripes" : ""}`}>
                <td className="p-2 font-medium">
                  {emp.fullName} <br/>
                  <span className="text-xs text-gray-400">@{emp.username}</span>
                </td>
                <td className="p-2">{emp.department?.name || "-"}</td>
                <td className="p-2 font-bold text-green-700">{new Intl.NumberFormat('vi-VN').format(emp.baseSalary)}</td>
                <td className="p-2">
                   {emp.isActive 
                     ? <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hoạt động</span> 
                     : <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Đã khóa</span>
                   }
                </td>
                <td className="p-2 text-right space-x-2">
                  <button onClick={() => setEditingEmp(emp)} className="text-blue-600 hover:text-blue-800 text-xs font-bold px-2 py-1 border border-blue-200 rounded">Sửa</button>
                  
                  {/* Status Toggle */}
                  <form action={actionToggle} className="inline-block">
                    <input type="hidden" name="id" value={emp.id} />
                    <input type="hidden" name="isActive" value={emp.isActive ? "true" : "false"} />
                    <button disabled={isPendingToggle} className={`text-xs font-bold px-2 py-1 border rounded ${emp.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}`}>
                      {emp.isActive ? "Khóa" : "Mở"}
                    </button>
                  </form>

                  {/* Reset PW */}
                  <form action={actionReset} className="inline-block" onSubmit={(e) => {
                    if(!confirm(`Bạn chắc chắn muốn đổi mật khẩu của ${emp.fullName} về "123456"?`)) e.preventDefault();
                  }}>
                    <input type="hidden" name="id" value={emp.id} />
                    <input type="hidden" name="empName" value={emp.fullName} />
                    <button disabled={isPendingReset} title="Reset mật khẩu về 123456" className="text-orange-600 border-orange-200 text-xs font-bold px-2 py-1 border rounded hover:bg-orange-50">
                      Reset PW
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && <div className="text-center p-4 text-xs text-gray-500">Không tìm thấy nhân viên nào!</div>}
      </div>

      {/* Modal Sửa Nhân Viên */}
      {editingEmp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <h3 className="font-bold text-lg mb-4">Sửa Nhân Viên: {editingEmp.fullName}</h3>
            <button onClick={() => setEditingEmp(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✖</button>
            <form action={actionEdit} className="space-y-4 text-sm">
               <input type="hidden" name="id" value={editingEmp.id} />
               
               <div>
                  <label className="font-bold text-gray-600 block mb-1">Họ và Tên</label>
                  <input name="fullName" defaultValue={editingEmp.fullName} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="font-bold text-gray-600 block mb-1">Lương cơ bản</label>
                    <input name="baseSalary" type="number" defaultValue={editingEmp.baseSalary} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="font-bold text-gray-600 block mb-1">Phòng ban</label>
                    <select name="departmentId" defaultValue={editingEmp.departmentId || ""} className="w-full border p-2 rounded bg-white">
                      <option value="">-- Trống --</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-600 block mb-1">Email</label>
                    <input name="email" type="email" defaultValue={editingEmp.email || ""} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="font-bold text-gray-600 block mb-1">SĐT</label>
                    <input name="phone" type="text" defaultValue={editingEmp.phone || ""} className="w-full border p-2 rounded" />
                  </div>
               </div>

               <div>
                  <label className="font-bold text-gray-600 block mb-1">Ngày sinh</label>
                  <input name="dob" type="date" defaultValue={editingEmp.dob ? new Date(editingEmp.dob).toISOString().split('T')[0] : ""} className="w-full border p-2 rounded" />
               </div>

               <button disabled={isPendingEdit} className="w-full bg-blue-600 text-white font-bold p-2 rounded mt-2 hover:bg-blue-700 disabled:opacity-50">
                 {isPendingEdit ? "Đang lưu..." : "Lưu thay đổi"}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
