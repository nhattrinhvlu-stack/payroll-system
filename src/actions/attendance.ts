"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertAttendance(formData: FormData) {
  const employeeId = formData.get("employeeId") as string;
  const dateStr = formData.get("date") as string;
  
  const workingDays = parseFloat(formData.get("workingDays") as string) || 0;
  const overtime = parseFloat(formData.get("overtime") as string) || 0;
  const kmTraveled = parseFloat(formData.get("kmTraveled") as string) || 0;
  
  // --- LẤY THÊM DỮ LIỆU TIỀN ---
  const dailyAllowance = parseFloat(formData.get("dailyAllowance") as string) || 0;
  const dailyAdvance = parseFloat(formData.get("dailyAdvance") as string) || 0;
  // -----------------------------

  const note = formData.get("note") as string;

  if (!employeeId || !dateStr) return { error: "Thiếu thông tin!" };

  try {
    const date = new Date(dateStr);

    await db.attendance.upsert({
      where: {
        employeeId_date: { employeeId, date },
      },
      update: {
        workingDays,
        overtime,
        kmTraveled,
        dailyAllowance, // Cập nhật
        dailyAdvance,   // Cập nhật
        note,
      },
      create: {
        employeeId,
        date,
        workingDays,
        overtime,
        kmTraveled,
        dailyAllowance, // Tạo mới
        dailyAdvance,   // Tạo mới
        note,
      },
    });

    revalidatePath("/accountant");
    return { success: "Đã lưu!" };
  } catch (error) {
    console.error(error);
    return { error: "Lỗi lưu dữ liệu" };
  }
}