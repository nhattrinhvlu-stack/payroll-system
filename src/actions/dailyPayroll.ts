"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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

// Đánh dấu 1 ngày công của nhân viên lương ngày là đã trả / chưa trả.
export async function setAttendancePaid(formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["ACCOUNTANT", "DIRECTOR"].includes(role)) {
    return { error: "Không có quyền thực hiện!" };
  }

  const attendanceId = formData.get("attendanceId") as string;
  const isPaid = formData.get("isPaid") === "true";

  if (!attendanceId) return { error: "Thiếu thông tin!" };

  try {
    const att = await db.attendance.update({
      where: { id: attendanceId },
      data: { isPaid, paidAt: isPaid ? new Date() : null },
      include: { employee: { select: { fullName: true } } },
    });

    await db.auditLog.create({
      data: {
        actorName,
        action: isPaid ? "Trả lương ngày" : "Hủy đánh dấu trả lương ngày",
        target: `Nhân viên: ${att.employee.fullName} - Ngày: ${new Date(att.date).toLocaleDateString("vi-VN")}`,
      },
    });

    revalidatePath("/accountant/daily-payroll");
    revalidatePath("/director/daily-payroll");
    return { success: isPaid ? "Đã đánh dấu đã trả!" : "Đã bỏ đánh dấu!" };
  } catch (error) {
    console.error(error);
    return { error: "Lỗi khi cập nhật trạng thái trả lương!" };
  }
}
