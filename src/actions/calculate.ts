"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function calculateMonthlyPayroll(formData: FormData) {
  const month = parseInt(formData.get("month") as string);
  const year = parseInt(formData.get("year") as string);

  if (!month || !year) return { error: "Vui lòng chọn tháng năm!" };

  try {
    const settings = await db.globalSettings.findUnique({ where: { id: "default" } });
    if (!settings) return { error: "Chưa cấu hình cài đặt chung!" };

    const employees = await db.employee.findMany();

    for (const emp of employees) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const attendances = await db.attendance.findMany({
        where: { employeeId: emp.id, date: { gte: startDate, lt: endDate } }
      });

      let totalWorkDays = 0;
      let totalOvertime = 0;
      let totalKm = 0;
      let totalDailyAllowance = 0;
      let totalDailyAdvance = 0;

      for (const att of attendances) {
        totalWorkDays += att.workingDays;
        totalOvertime += att.overtime;
        totalKm += att.kmTraveled;
        totalDailyAllowance += att.dailyAllowance;
        totalDailyAdvance += att.dailyAdvance;
      }

      // --- TÍNH TOÁN ---
      const dailySalary = emp.baseSalary / settings.standardWorkDays;
      const hourlySalary = dailySalary / 8;

      const salaryByWorkDays = dailySalary * totalWorkDays;
      const salaryOvertime = hourlySalary * totalOvertime * settings.overtimeRatio;
      const salaryFuel = totalKm * settings.fuelPricePerKm;
      
      // TÍNH BẢO HIỂM (MỚI)
      // Công thức: Lương Cơ Bản * (% Bảo hiểm / 100)
      const insuranceAmount = emp.baseSalary * (settings.insurancePercent / 100);

      const responsibility = settings.responsibilityAmount;
      const phone = settings.phoneAllowance;
      const other = settings.otherAllowance;

      // CÔNG THỨC TỔNG (Đã trừ bảo hiểm)
      const totalSalary = 
          salaryByWorkDays + 
          salaryOvertime + 
          salaryFuel + 
          (totalDailyAllowance + responsibility + phone + other) - 
          totalDailyAdvance - 
          insuranceAmount; // <--- Trừ bảo hiểm ở đây

      const existingPayroll = await db.payroll.findUnique({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } }
      });

      if (existingPayroll?.status === "APPROVED") continue;

      await db.payroll.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
        update: {
          baseSalary: emp.baseSalary,
          standardDays: settings.standardWorkDays,
          actualWorkDays: totalWorkDays,
          overtimeHours: totalOvertime,
          overtimeSalary: salaryOvertime,
          kmTraveled: totalKm,
          fuelAllowance: salaryFuel,
          responsibility: responsibility,
          phoneAllowance: phone,
          otherAllowance: other + totalDailyAllowance,
          advancePayment: totalDailyAdvance,
          
          insurance: insuranceAmount, // Lưu số tiền bảo hiểm
          
          totalSalary: Math.round(totalSalary),
        },
        create: {
          employeeId: emp.id,
          month,
          year,
          baseSalary: emp.baseSalary,
          standardDays: settings.standardWorkDays,
          actualWorkDays: totalWorkDays,
          overtimeHours: totalOvertime,
          overtimeSalary: salaryOvertime,
          kmTraveled: totalKm,
          fuelAllowance: salaryFuel,
          responsibility: responsibility,
          phoneAllowance: phone,
          otherAllowance: other + totalDailyAllowance,
          advancePayment: totalDailyAdvance,
          
          insurance: insuranceAmount, // Lưu số tiền bảo hiểm
          
          totalSalary: Math.round(totalSalary),
          status: "DRAFT"
        }
      });
    }

    revalidatePath("/accountant");
    return { success: `Đã tính lương tháng ${month}/${year} thành công!` };
  } catch (error) {
    console.error(error);
    return { error: "Lỗi tính toán hệ thống!" };
  }
}