import { db } from "@/lib/db";
import AddEmployeeForm from "@/components/AddEmployeeForm";

// Đây là trang chủ (Server Component)
export default async function Home() {
  // 1. Lấy dữ liệu từ Database, sắp xếp người mới nhất lên đầu
  const employees = await db.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // 2. Hiển thị giao diện
  return (
    <div className="max-w-5xl mx-auto p-8 font-sans bg-gray-50 min-h-screen">
      {/* --- PHẦN TIÊU ĐỀ --- */}
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold text-blue-800">Quản lý Lương & Nhân sự</h1>
         <span className="bg-white border border-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
           Tổng nhân sự: <strong>{employees.length}</strong>
         </span>
      </div>

      {/* --- PHẦN FORM NHẬP LIỆU (COMPONENT CON) --- */}
      <AddEmployeeForm />

      {/* --- PHẦN BẢNG DANH SÁCH --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 border-b font-semibold">Họ tên</th>
                <th className="p-4 border-b font-semibold">Chức vụ</th>
                <th className="p-4 border-b font-semibold">Phòng ban</th>
                <th className="p-4 border-b font-semibold">Lương cơ bản</th>
                <th className="p-4 border-b font-semibold">Ngày vào làm</th>
                <th className="p-4 border-b font-semibold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((nv) => (
                <tr key={nv.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="p-4 font-medium text-gray-900 group-hover:text-blue-700">
                    {nv.fullName}
                  </td>
                  <td className="p-4 text-gray-600">{nv.position}</td>
                  <td className="p-4 text-gray-600">{nv.department}</td>
                  <td className="p-4 text-green-600 font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(nv.baseSalary)}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(nv.joinDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      nv.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {nv.status === 'ACTIVE' ? 'Đang làm' : 'Đã nghỉ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trạng thái khi chưa có dữ liệu */}
        {employees.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">Chưa có nhân viên nào.</p>
            <p className="text-gray-400 text-sm mt-1">Hãy nhập thông tin vào form bên trên để bắt đầu quản lý.</p>
          </div>
        )}
      </div>
      
      <div className="text-center text-gray-400 text-xs mt-8 pb-4">
        Hệ thống Quản lý Lương &copy; 2026
      </div>
    </div>
  );
}