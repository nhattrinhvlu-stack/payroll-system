"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Hàm tính lương
export async function calculateMonthlyPayroll(formData: FormData) {
  const month = parseInt(formData.get("month") as string);
  const year = new Date().getFullYear();

  try {
    const settings = await db.globalSettings.findUnique({ where: { id: "default" } });
    if (!settings) return { error: "Chưa cấu hình thiết lập lương chung!" };

    const employees = await db.employee.findMany(); // Theo schema mới [cite: 3]

    for (const emp of employees) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const attendances = await db.attendance.findMany({
        where: { employeeId: emp.id, date: { gte: startDate, lt: endDate } }
      });

      const actualWorkDays = attendances.reduce((sum, a) => sum + a.workingDays, 0);
      const overtimeHours = attendances.reduce((sum, a) => sum + a.overtime, 0);
      const totalKm = attendances.reduce((sum, a) => sum + a.kmTraveled, 0);
      const totalDailyAllowance = attendances.reduce((sum, a) => sum + a.dailyAllowance, 0);
      const totalDailyAdvance = attendances.reduce((sum, a) => sum + a.dailyAdvance, 0);

      const overtimeSalary = overtimeHours * (emp.baseSalary / settings.standardWorkDays / 8) * settings.overtimeRatio;
      const fuelAllowance = totalKm * settings.fuelPricePerKm;
      const insurance = (emp.baseSalary * settings.insurancePercent) / 100;
      const salaryByDays = (emp.baseSalary / settings.standardWorkDays) * actualWorkDays;

      const totalSalary = salaryByDays + overtimeSalary + fuelAllowance + 
                          settings.responsibilityAmount + settings.phoneAllowance + 
                          totalDailyAllowance - insurance - totalDailyAdvance;

      await db.payroll.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
        update: {
          baseSalary: emp.baseSalary,
          standardDays: settings.standardWorkDays,
          actualWorkDays, overtimeHours, overtimeSalary, kmTraveled: totalKm,
          fuelAllowance, responsibility: settings.responsibilityAmount,
          phoneAllowance: settings.phoneAllowance, otherAllowance: totalDailyAllowance,
          insurance, advancePayment: totalDailyAdvance, totalSalary, status: "DRAFT"
        },
        create: {
          employeeId: emp.id, month, year, baseSalary: emp.baseSalary,
          standardDays: settings.standardWorkDays, actualWorkDays,
          overtimeHours, overtimeSalary, kmTraveled: totalKm, fuelAllowance,
          responsibility: settings.responsibilityAmount, phoneAllowance: settings.phoneAllowance,
          otherAllowance: totalDailyAllowance, insurance, advancePayment: totalDailyAdvance,
          totalSalary, status: "DRAFT"
        }
      });
    }
    revalidatePath("/accountant");
    return { success: "Tính lương thành công!", error: "" };
  } catch (err) {
    return { error: "Lỗi hệ thống khi tính lương!", success: "" };
  }
}

// 2. Hàm duyệt lương (Dùng được cho cả Form và ID trực tiếp)
export async function approvePayroll(data: FormData | string) {
  const id = typeof data === "string" ? data : data.get("id") as string;
  try {
    await db.payroll.update({
      where: { id },
      data: { status: "APPROVED" } // Giám đốc duyệt chốt luôn [cite: 1]
    });
    revalidatePath("/director");
    revalidatePath("/accountant");
    return { success: "Đã duyệt phiếu lương!", error: "" };
  } catch (err) {
    return { error: "Không thể duyệt phiếu lương này!", success: "" };
  }
}

// 3. Hàm từ chối (Dùng cho Director)
export async function rejectPayroll(id: string, reason: string) {
  try {
    await db.payroll.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reason } [cite: 12]
    });
    revalidatePath("/director");
    return { success: "Đã từ chối phiếu lương!", error: "" };
  } catch (err) {
    return { error: "Lỗi khi từ chối!", success: "" };
  }
}