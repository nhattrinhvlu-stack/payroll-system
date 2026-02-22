"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getActor(): Promise<{ id: string; name: string }> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) {
      const user = JSON.parse(session.value);
      return { id: user.id, name: user.name || user.username || "Unknown" };
    }
  } catch { }
  return { id: "", name: "System" };
}

async function logAudit(actorName: string, action: string, target: string, detail?: string) {
  try {
    await db.auditLog.create({ data: { actorName, action, target, detail } });
  } catch { }
}

// --- 1. NHÂN VIÊN XIN NGHỈ PHÉP ---
export async function createLeaveRequest(prevState: any, formData: FormData) {
  const actor = await getActor();
  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const reason = formData.get("reason") as string;

  if (!type || !startDateStr || !endDateStr || !reason) {
    return { error: "Vui lòng điền đầy đủ thông tin đơn nghỉ!" };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (endDate < startDate) {
    return { error: "Ngày kết thúc phải sau ngày bắt đầu!" };
  }

  // Tính số ngày nghỉ (bao gồm cả ngày đầu và cuối)
  const diffTime = endDate.getTime() - startDate.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  try {
    await db.leaveRequest.create({
      data: {
        employeeId: actor.id,
        type: type as any,
        startDate,
        endDate,
        totalDays,
        reason,
      },
    });
    await logAudit(actor.name, "Xin nghỉ phép", actor.name, `Loại: ${type}, ${totalDays} ngày`);
    revalidatePath("/employee");
    return { success: "Đã gửi đơn xin nghỉ thành công!" };
  } catch (e) {
    return { error: "Lỗi khi gửi đơn nghỉ phép." };
  }
}

// --- 2. DUYỆT / TỪ CHỐI ĐƠN NGHỈ ---
export async function updateLeaveStatus(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const approverNote = formData.get("approverNote") as string;
  const actor = await getActor();

  if (!id || !status) return { error: "Thiếu thông tin!" };

  try {
    const leave = await db.leaveRequest.update({
      where: { id },
      data: {
        status: status as any,
        approverNote: approverNote || null,
      },
      include: { employee: true },
    });

    // TỰ ĐỘNG TRỪ CÔNG NẾU DUYỆT NGHỈ (UNPAID hoặc SICK, hoặc ngay cả ANNUAL nếu không tính lương theo ngày)
    // Ở đây ta set workingDays = 0 cho các ngày nằm trong khoảng nghỉ phép
    if (status === "APPROVED" && (leave.type === "UNPAID" || leave.type === "SICK" || leave.type === "OTHER")) {
      const dates = [];
      let currentDate = new Date(leave.startDate);
      currentDate.setHours(0, 0, 0, 0);
      const end = new Date(leave.endDate);
      end.setHours(0, 0, 0, 0);

      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const d of dates) {
        await db.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: leave.employeeId,
              date: d
            }
          },
          update: {
            workingDays: 0,
            note: `Đã duyệt nghỉ: ${leave.type === "UNPAID" ? "Không lương" : "Nghỉ ốm"}`
          },
          create: {
            employeeId: leave.employeeId,
            date: d,
            workingDays: 0,
            note: `Đã duyệt nghỉ: ${leave.type === "UNPAID" ? "Không lương" : "Nghỉ ốm"}`
          }
        });
      }
    }

    const action = status === "APPROVED" ? "Duyệt đơn nghỉ phép" : "Từ chối đơn nghỉ phép";
    await logAudit(actor.name, action, leave.employee.fullName, approverNote || undefined);
    revalidatePath("/director");
    revalidatePath("/employee");
    return { success: status === "APPROVED" ? "Đã duyệt đơn nghỉ phép!" : "Đã từ chối đơn nghỉ phép!" };
  } catch (e) {
    return { error: "Lỗi khi cập nhật trạng thái đơn nghỉ." };
  }
}
