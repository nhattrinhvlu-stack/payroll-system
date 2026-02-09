import { db } from "@/lib/db";
import { calculateMonthlyPayroll, approvePayroll } from "@/actions/payroll";
import { logout } from "@/actions/auth";

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
            <h2 className="text-sm font-black text-indigo-400 uppercase mb-4 tracking-widest">Tính lương tháng</h2>
            <form 
              action={async (formData: FormData) => {
                "use server";
                await calculateMonthlyPayroll(formData);
              }} 
              className="flex gap-2 items-end"
            >
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Tháng</label>
                <input name="month" type="number" defaultValue={currentMonth} min="1" max="12" className="w-full border-2 border-gray-100 p-2 rounded-xl focus:border-indigo-500 outline-none font-bold" />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl font-bold transition">
                Tính
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
           <div className="bg-white rounded-2xl shadow-sm border border-indigo-500/10 overflow-hidden text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900">
                    <th className="p-4 font-black uppercase">Nhân viên</th>
                    <th className="p-4 text-center font-black uppercase">Tháng</th>
                    <th className="p-4 text-right font-black uppercase">Thực lĩnh</th>
                    <th className="p-4 text-center font-black uppercase">Trạng thái</th>
                    <th className="p-4 text-right font-black uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-indigo-50/30">
                      <td className="p-4 font-bold text-gray-800">{p.employee.fullName}</td>
                      <td className="p-4 text-center text-gray-500">{p.month}/{p.year}</td>
                      <td className="p-4 text-right font-black text-indigo-600">
                        {new Intl.NumberFormat('vi-VN').format(p.totalSalary)}đ
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-gray-100">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {p.status === "DRAFT" && (
                          <form action={async (formData: FormData) => {
                            "use server";
                            await approvePayroll(formData);
                          }}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition">
                              Gửi duyệt
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}