"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Helper: lấy thông tin người dùng hiện tại từ session
async function getActor(): Promise<{ name: string; role: string }> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) {
      const user = JSON.parse(session.value);
      return {
        name: user.name || user.username || "Unknown",
        role: user.role || "",
      };
    }
  } catch { }
  return { name: "System", role: "" };
}

export async function upsertAttendance(formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["ACCOUNTANT", "DIRECTOR"].includes(role)) {
    return { error: "Không có quyền chấm công!" };
  }

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

    // KẾ TOÁN KHÔNG ĐƯỢC PHÉP CHẤM CÔNG VƯỢT QUÁ QUY ĐỊNH NẾU NHÂN VIÊN ĐÓ ĐÃ CÓ ĐƠN XIN NGHỈ (ĐƯỢC DUYỆT)
    const approvedLeave = await db.leaveRequest.findFirst({
      where: {
        employeeId,
        status: "APPROVED",
        startDate: { lte: date },
        endDate: { gte: date },
      }
    });

    let finalWorkingDays = workingDays;
    let finalOvertime = overtime;

    if (approvedLeave) {
      const leaveSession = (approvedLeave as any).session;
      if (leaveSession === "ALL_DAY") {
        finalWorkingDays = 0;
        finalOvertime = 0;
      } else if (leaveSession === "MORNING" || leaveSession === "AFTERNOON") {
        if (finalWorkingDays > 0.5) finalWorkingDays = 0.5;
        if (finalOvertime > 0) finalOvertime = 0; // Thường nghỉ nửa ngày không cho chấm tăng ca, hoặc tuỳ logic cty. Ở đây ta giới hạn chặt.
      }
    }

    await db.attendance.upsert({
      where: {
        employeeId_date: { employeeId, date },
      },
      update: {
        workingDays: finalWorkingDays,
        overtime: finalOvertime,
        kmTraveled,
        dailyAllowance, // Cập nhật
        dailyAdvance,   // Cập nhật
        note,
      },
      create: {
        employeeId,
        date,
        workingDays: finalWorkingDays,
        overtime: finalOvertime,
        kmTraveled,
        dailyAllowance, // Tạo mới
        dailyAdvance,   // Tạo mới
        note,
      },
    });

    const emp = await db.employee.findUnique({
      where: { id: employeeId },
      select: { fullName: true }
    });
    const empName = emp ? emp.fullName : employeeId;

    await db.auditLog.create({
      data: {
        actorName,
        action: "Cập nhật chấm công",
        target: `Nhân viên: ${empName} - Ngày: ${new Date(dateStr).toLocaleDateString('vi-VN')}`,
        detail: `Công: ${finalWorkingDays} | TC: ${finalOvertime}h | Km: ${kmTraveled} | Hỗ trợ: ${dailyAllowance} | Ứng: ${dailyAdvance}${note ? ` | Ghi chú: ${note}` : ""}`
      }
    });

    revalidatePath("/accountant");
    revalidatePath("/director"); // Ensure director sees the new audit log
    revalidatePath("/director/attendance");

    return { success: "Đã lưu!" };
  } catch (error) {
    console.error(error);
    return { error: "Lỗi lưu dữ liệu" };
  }
}