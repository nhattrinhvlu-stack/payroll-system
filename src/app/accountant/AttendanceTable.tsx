"use client";

import { upsertAttendance } from "@/actions/attendance";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AttendanceTable({ employees, dateStr }: { employees: any[], dateStr: string }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-600">
            <tr>
              <th className="p-3 min-w-[150px]">Nhân viên</th>
              <th className="p-3 w-20 text-center">Công</th>
              <th className="p-3 w-20 text-center">Tăng ca</th>
              <th className="p-3 w-20 text-center">Km</th>
              
              {/* Thêm 2 cột mới */}
              <th className="p-3 w-28 text-center text-green-700">Hỗ trợ +</th>
              <th className="p-3 w-28 text-center text-red-700">Ứng -</th>
              
              <th className="p-3 min-w-[100px]">Ghi chú</th>
              <th className="p-3 w-16 text-center">Lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((emp) => {
              const att = emp.attendances[0] || {}; 
              return <Row key={emp.id} emp={emp} att={att} dateStr={dateStr} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ emp, att, dateStr }: any) {
  const [loading, setLoading] = useState(false);

  async function handleSave(formData: FormData) {
    setLoading(true);
    const res = await upsertAttendance(formData);
    setLoading(false);
    
    if (res.success) toast.success(`Đã lưu ${emp.fullName}`);
    else toast.error("Lỗi!");
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-3 font-medium text-gray-800">
        {emp.fullName}
        <div className="text-xs text-gray-400">{emp.department?.name}</div>
      </td>
      
      <td colSpan={7} className="p-0">
        <form action={handleSave} className="flex w-full items-center">
          <input type="hidden" name="employeeId" value={emp.id} />
          <input type="hidden" name="date" value={dateStr} />

          {/* Công */}
          <div className="p-2 w-20">
            <input name="workingDays" type="number" step="0.5" max="1" min="0" defaultValue={att.workingDays ?? 1} 
              className="w-full border rounded p-1 text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          {/* Tăng ca */}
          <div className="p-2 w-20">
            <input name="overtime" type="number" step="0.5" min="0" defaultValue={att.overtime ?? 0} 
              className="w-full border rounded p-1 text-center font-bold text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          {/* Km */}
          <div className="p-2 w-20">
            <input name="kmTraveled" type="number" step="1" min="0" defaultValue={att.kmTraveled ?? 0} 
              className="w-full border rounded p-1 text-center text-gray-700 focus:ring-2 focus:ring-gray-500 outline-none" />
          </div>

          {/* --- CỘT HỖ TRỢ (Mới) --- */}
          <div className="p-2 w-28">
            <input name="dailyAllowance" type="number" step="1000" min="0" placeholder="0" defaultValue={att.dailyAllowance ?? 0} 
              className="w-full border border-green-200 bg-green-50 rounded p-1 text-center font-bold text-green-700 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {/* --- CỘT ỨNG TIỀN (Mới) --- */}
          <div className="p-2 w-28">
            <input name="dailyAdvance" type="number" step="1000" min="0" placeholder="0" defaultValue={att.dailyAdvance ?? 0} 
              className="w-full border border-red-200 bg-red-50 rounded p-1 text-center font-bold text-red-700 focus:ring-2 focus:ring-red-500 outline-none" />
          </div>

          {/* Ghi chú */}
          <div className="p-2 flex-1 min-w-[100px]">
            <input name="note" type="text" defaultValue={att.note ?? ""} placeholder="..."
              className="w-full border rounded p-1 text-gray-600 focus:ring-2 focus:ring-gray-400 outline-none" />
          </div>

          {/* Nút Lưu */}
          <div className="p-2 w-16 flex justify-center">
            <button disabled={loading} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 shadow disabled:opacity-50 transition-transform active:scale-95">
              {loading ? "..." : "💾"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}