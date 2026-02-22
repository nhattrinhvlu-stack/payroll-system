import { db } from "@/lib/db";
import { createPayroll } from "@/actions/payroll";

export default async function PayrollPage() {
  const employees = await db.employee.findMany({ where: { status: "ACTIVE" } });
  
  const payrolls = await db.payroll.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">💰 Bảng Lương Chi Tiết</h1>

      {/* --- FORM NHẬP LIỆU --- */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">📝 Nhập liệu tháng</h3>
        
        <form action={createPayroll} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Hàng 1: Thông tin chung */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Nhân viên</label>
            <select name="employeeId" className="w-full border p-2 rounded mt-1 bg-gray-50" required>
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Tháng</label>
            <input name="month" type="number" defaultValue={new Date().getMonth() + 1} className="w-full border p-2 rounded mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Năm</label>
            <input name="year" type="number" defaultValue={2026} className="w-full border p-2 rounded mt-1" />
          </div>

          <div className="md:col-span-4 h-px bg-gray-200 my-2"></div>

          {/* Hàng 2: Lương & Công */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Ngày công (Chuẩn 26)</label>
            <input name="workingDays" type="number" step="0.5" placeholder="VD: 26" required className="w-full border p-2 rounded mt-1 font-bold text-blue-600" />
          </div>
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase">Trách nhiệm (VNĐ)</label>
             <input name="responsibility" type="number" placeholder="0" className="w-full border p-2 rounded mt-1" />
          </div>

          {/* Hàng 3: Phụ cấp */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Hỗ trợ Xăng</label>
            <input name="fuelAllowance" type="number" placeholder="0" className="w-full border p-2 rounded mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Hỗ trợ ĐT</label>
            <input name="phoneAllowance" type="number" placeholder="0" className="w-full border p-2 rounded mt-1" />
          </div>
          
          {/* Hàng 4: Khác & Trừ */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Hỗ trợ Khác</label>
            <input name="otherAllowance" type="number" placeholder="0" className="w-full border p-2 rounded mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-red-500 uppercase">Đã Ứng (Tổng)</label>
            <input name="advancePayment" type="number" placeholder="0" className="w-full border border-red-200 bg-red-50 p-2 rounded mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-red-500 uppercase">Trừ BHXH</label>
            <input name="insurance" type="number" placeholder="0" className="w-full border border-red-200 bg-red-50 p-2 rounded mt-1" />
          </div>

          {/* Nút bấm */}
          <div className="md:col-span-1 flex items-end">
            <button type="submit" className="w-full bg-blue-700 text-white p-2.5 rounded hover:bg-blue-800 font-bold shadow-lg">
              💾 Lưu Phiếu
            </button>
          </div>
        </form>
      </div>

      {/* --- BẢNG HIỂN THỊ KẾT QUẢ --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-3 border-b">Nhân viên</th>
              <th className="p-3 border-b">Công</th>
              <th className="p-3 border-b text-right">Lương + TN</th>
              <th className="p-3 border-b text-right text-green-600">Phụ cấp</th>
              <th className="p-3 border-b text-right text-red-500">Ứng/BHXH</th>
              <th className="p-3 border-b text-right bg-blue-50 text-blue-800 border-l">THỰC LÃNH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payrolls.map((p) => {
              const totalAllowance = p.fuelAllowance + p.phoneAllowance + p.otherAllowance;
              const totalDeduction = p.advancePayment + p.insurance;
              const salaryPlusResp = (p.baseSalary / 26 * p.workingDays) + p.responsibility;

              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium">
                    <div className="text-gray-900">{p.employee.fullName}</div>
                    <div className="text-gray-500 text-xs">Tháng {p.month}/{p.year}</div>
                  </td>
                  <td className="p-3 font-bold">{p.workingDays}</td>
                  <td className="p-3 text-right">
                    {new Intl.NumberFormat('vi-VN').format(Math.round(salaryPlusResp))}
                  </td>
                  <td className="p-3 text-right text-green-600 font-medium">
                    +{new Intl.NumberFormat('vi-VN').format(totalAllowance)}
                  </td>
                  <td className="p-3 text-right text-red-500 font-medium">
                    -{new Intl.NumberFormat('vi-VN').format(totalDeduction)}
                  </td>
                  <td className="p-3 text-right font-bold text-blue-700 bg-blue-50 text-base border-l border-blue-100">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.totalSalary)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {payrolls.length === 0 && <p className="text-center p-8 text-gray-500">Chưa có dữ liệu lương tháng này.</p>}
      </div>
    </div>
  );
}