import { db } from "@/lib/db";
import DirectorDashboard from "./DirectorDashboard";

export default async function DirectorPage() {
  // 1. Lấy danh sách phòng ban
  const departments = await db.department.findMany({ 
    orderBy: { createdAt: 'desc' } 
  });

  // 2. Lấy danh sách nhân viên
  const employees = await db.employee.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Lấy cài đặt lương
  const settings = await db.globalSettings.findUnique({ 
    where: { id: "default" } 
  });

  // --- 4. QUAN TRỌNG: Lấy danh sách lương ĐANG CHỜ DUYỆT (PENDING) ---
  const pendingPayrolls = await db.payroll.findMany({
    where: { status: "PENDING" }, // Chỉ lấy phiếu lương có trạng thái này
    include: { employee: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DirectorDashboard
      departments={departments}
      employees={employees}
      settings={settings}
      pendingPayrolls={pendingPayrolls} // Truyền danh sách này vào Dashboard
    />
  );
}