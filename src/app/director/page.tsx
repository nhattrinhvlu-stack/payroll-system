export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import DirectorDashboard from "./DirectorDashboard";

export default async function DirectorPage() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [departments, employees, settings, leaveRequests, contracts, auditLogs, monthlyPayrolls] = await Promise.all([
    db.department.findMany({ orderBy: { createdAt: "desc" } }),
    db.employee.findMany({ include: { department: true }, orderBy: { createdAt: "desc" } }),
    db.globalSettings.findUnique({ where: { id: "default" } }),
    db.leaveRequest.findMany({ include: { employee: { include: { department: true } } }, orderBy: { createdAt: "desc" } }),
    db.contract.findMany({ include: { employee: true }, orderBy: { createdAt: "desc" } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.payroll.findMany({
      where: { status: "APPROVED", month: currentMonth, year: currentYear },
      include: { employee: { include: { department: true } } },
    }),
  ]);

  const rawPendingPayrolls = await db.payroll.findMany({
    where: { status: "PENDING" },
    include: { employee: true },
    orderBy: { createdAt: "desc" }
  });

  const pendingPayrolls = await Promise.all(
    rawPendingPayrolls.map(async (payroll) => {
      const startDate = new Date(payroll.year, payroll.month - 1, 1);
      const endDate = new Date(payroll.year, payroll.month, 1);

      const attendances = await db.attendance.findMany({
        where: {
          employeeId: payroll.employeeId,
          date: { gte: startDate, lt: endDate },
        },
        orderBy: { date: "asc" }
      });
      return { ...payroll, attendances };
    })
  );

  return (
    <DirectorDashboard
      departments={departments}
      employees={employees}
      settings={settings}
      pendingPayrolls={pendingPayrolls}
      leaveRequests={leaveRequests}
      contracts={contracts}
      auditLogs={auditLogs}
      monthlyPayrolls={monthlyPayrolls}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  );
}
