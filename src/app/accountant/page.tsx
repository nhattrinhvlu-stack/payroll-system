import { db } from "@/lib/db";
import AttendanceTable from "./AttendanceTable";
import DateSelector from "./DateSelector";
import { logout } from "@/actions/auth";
import { submitPayroll } from "@/actions/payroll";
import { calculateMonthlyPayroll } from "@/actions/calculate"; // Import action tính lương

export default async function AccountantPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ date?: string, month?: string, year?: string }> 
}) {
  
  const params = await searchParams;
  const today = new Date();
  
  // 1. Xử lý ngày chấm công (Mặc định hôm nay)
  const selectedDateStr = params?.date || today.toISOString().split('T')[0];
  const selectedDate = new Date(selectedDateStr);

  // 2. Xử lý tháng tính lương (Mặc định tháng hiện tại)
  const currentMonth = params?.month ? parseInt(params.month) : today.getMonth() + 1;
  const currentYear = params?.year ? parseInt(params.year) : today.getFullYear();

  // 3. Lấy dữ liệu chấm công ngày
  const employees = await db.employee.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      department: true,
      attendances: { where: { date: selectedDate } }
    }
  });

  // 4. Lấy bảng lương của THÁNG ĐANG CHỌN
  const payrolls = await db.payroll.findMany({
    where: { month: currentMonth, year: currentYear },
    include: { employee: true },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-indigo-900 text-white p-6 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-bold">👩‍💼 KẾ TOÁN</h1>
          <p className="text-indigo-200 text-sm">Quản lý lương & Chấm công</p>
        </div>
        <form action={logout}>
           <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold shadow">Đăng xuất</button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- PHẦN 1: CHẤM CÔNG HÀNG NGÀY --- */}
        <div className="lg:col-span-2">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex justify-between items-center">
             <DateSelector date={selectedDateStr} />
             <div className="text-sm text-gray-500">Đang chấm cho ngày: <strong>{selectedDateStr}</strong></div>
           </div>
           
           <AttendanceTable employees={employees} dateStr={selectedDateStr} />
        </div>

        {/* --- PHẦN 2: TÍNH LƯƠNG THÁNG (NÚT TÍNH LƯƠNG Ở ĐÂY) --- */}
        <div className="lg:col-span-2 mt-8 pt-8 border-t-2 border-dashed border-gray-300">
           <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                💰 BẢNG LƯƠNG THÁNG {currentMonth}/{currentYear}
              </h2>
              
              {/* Form chọn tháng & nút Tính lương */}
              <form action={calculateMonthlyPayroll} className="flex gap-2 items-end bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block uppercase mb-1">Tháng</label>
                    <input name="month" type="number" defaultValue={currentMonth} min="1" max="12" className="w-16 border-2 border-gray-200 p-2 rounded-lg text-center font-bold text-indigo-900 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block uppercase mb-1">Năm</label>
                    <input name="year" type="number" defaultValue={currentYear} className="w-20 border-2 border-gray-200 p-2 rounded-lg text-center font-bold text-indigo-900 focus:border-indigo-500 outline-none" />
                  </div>
                  
                  {/* ĐÂY LÀ NÚT BẠN ĐANG TÌM */}
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 h-full shadow-md active:scale-95 transition-transform flex items-center gap-2">
                    ⚡ TÍNH LƯƠNG NGAY
                  </button>
              </form>
           </div>

           {/* Bảng hiển thị kết quả lương */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-600">
                 <tr>
                   <th className="p-3">Nhân viên</th>
                   <th className="p-3 text-center">Công TT</th>
                   <th className="p-3 text-center">Tăng ca</th>
                   <th className="p-3 text-right">Thực lãnh</th>
                   <th className="p-3 text-center">Trạng thái</th>
                   <th className="p-3 text-center">Hành động</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {payrolls.length === 0 ? (
                   <tr><td colSpan={6} className="p-8 text-center text-gray-400 italic">
                     Chưa có dữ liệu lương tháng này. <br/>Hãy chọn tháng và bấm nút <strong>"TÍNH LƯƠNG NGAY"</strong>.
                   </td></tr>
                 ) : (
                   payrolls.map((p) => (
                     <tr key={p.id} className="hover:bg-gray-50">
                       <td className="p-3 font-medium">{p.employee.fullName}</td>
                       <td className="p-3 text-center">{p.actualWorkDays} / {p.standardDays}</td>
                       <td className="p-3 text-center">{p.overtimeHours}h</td>
                       <td className="p-3 text-right font-bold text-blue-800 text-base">
                         {new Intl.NumberFormat('vi-VN').format(p.totalSalary)} ₫
                       </td>
                       <td className="p-3 text-center">
                         {p.status === "DRAFT" && <span className="bg-gray-100 text-xs px-2 py-1 rounded font-bold border border-gray-300">📝 Nháp</span>}
                         {p.status === "PENDING" && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded font-bold border border-orange-200">⏳ Chờ duyệt</span>}
                         {p.status === "APPROVED" && <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded font-bold border border-green-200">✅ Đã duyệt</span>}
                         {p.status === "REJECTED" && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold border border-red-200">❌ Bị trả về</span>}
                       </td>
                       <td className="p-3 text-center">
                         {(p.status === "DRAFT" || p.status === "REJECTED") ? (
                           <form action={async () => {
                             "use server";
                             await submitPayroll(p.id);
                           }}>
                             <button className="text-blue-600 hover:text-blue-800 font-bold text-xs underline">🚀 Gửi duyệt</button>
                           </form>
                         ) : (
                           <span className="text-gray-300 text-xs">🔒 Đã khóa</span>
                         )}
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}