export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { computeDailyPay } from "@/lib/salary";
import DailyPayrollClient from "./DailyPayrollClient";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) return JSON.parse(session.value);
  } catch { }
  return null;
}

export default async function DailyPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session || !["ACCOUNTANT", "DIRECTOR"].includes(session.role)) {
    redirect("/login");
  }
  const homePath = session.role === "DIRECTOR" ? "/director" : "/accountant";

  const params = await searchParams;
  const now = new Date();
  const month = parseInt((params.month as string) || "") || now.getMonth() + 1;
  const year = parseInt((params.year as string) || "") || now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const settings = await db.globalSettings.findUnique({ where: { id: "default" } });
  const fuelSettings = {
    fuelPrice1to15: settings?.fuelPrice1to15 ?? 0,
    fuelPrice20to30: settings?.fuelPrice20to30 ?? 0,
    fuelPriceAbove30: settings?.fuelPriceAbove30 ?? 0,
    overtimeRatio: settings?.overtimeRatio ?? 1.5,
  };

  const employees = await db.employee.findMany({
    where: { salaryType: "DAILY", isActive: true },
    include: {
      department: { select: { name: true } },
      attendances: {
        where: { date: { gte: startDate, lt: endDate } },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { fullName: "asc" },
  });

  // Tính sẵn thành tiền từng ngày để truyền xuống client
  const data = employees.map((emp) => {
    const days = emp.attendances.map((att) => {
      const bd = computeDailyPay(
        {
          dailyWage: emp.dailyWage,
          workingDays: att.workingDays,
          overtime: att.overtime,
          kmTraveled: att.kmTraveled,
          dailyAllowance: att.dailyAllowance,
          dailyAdvance: att.dailyAdvance,
        },
        fuelSettings
      );
      return {
        id: att.id,
        date: att.date,
        workingDays: att.workingDays,
        overtime: att.overtime,
        kmTraveled: att.kmTraveled,
        fuel: bd.fuel,
        dailyAllowance: att.dailyAllowance,
        dailyAdvance: att.dailyAdvance,
        total: bd.total,
        isPaid: att.isPaid,
      };
    });
    const totalAll = days.reduce((s, d) => s + d.total, 0);
    const totalPaid = days.filter((d) => d.isPaid).reduce((s, d) => s + d.total, 0);
    return {
      id: emp.id,
      fullName: emp.fullName,
      department: emp.department?.name || "-",
      dailyWage: emp.dailyWage,
      days,
      totalAll,
      totalPaid,
      totalUnpaid: totalAll - totalPaid,
    };
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <a
        href={homePath}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
      >
        ← Quay lại trang chủ
      </a>

      <h1 className="text-3xl font-black text-indigo-900 tracking-tight mb-6">
        📋 BẢNG LƯƠNG NGÀY
      </h1>

      <DailyPayrollClient data={data} month={month} year={year} />
    </div>
  );
}
