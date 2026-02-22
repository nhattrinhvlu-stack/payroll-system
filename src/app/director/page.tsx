export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import DirectorDashboard from "./DirectorDashboard";

export default async function DirectorPage() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [departments, employees, settings, pendingPayrolls, leaveRequests, contracts, auditLogs, monthlyPayrolls] = await Promise.all([
    db.department.findMany({ orderBy: { createdAt: "desc" } }),
    db.employee.findMany({ include: { department: true }, orderBy: { createdAt: "desc" } }),
    db.globalSettings.findUnique({ where: { id: "default" } }),
    db.payroll.findMany({ where: { status: "PENDING" }, include: { employee: true }, orderBy: { createdAt: "desc" } }),
    db.leaveRequest.findMany({ include: { employee: { include: { department: true } } }, orderBy: { createdAt: "desc" } }),
    db.contract.findMany({ include: { employee: true }, orderBy: { createdAt: "desc" } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.payroll.findMany({
      where: { status: "APPROVED", month: currentMonth, year: currentYear },
      include: { employee: { include: { department: true } } },
    }),
  ]);

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
