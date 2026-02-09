"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. KẾ TOÁN GỬI DUYỆT (Chuyển sang PENDING)
export async function submitPayroll(id: string) {
  try {
    await db.payroll.update({
      where: { id },
      data: { status: "PENDING" }
    });
    revalidatePath("/accountant"); // Làm mới trang kế toán
    revalidatePath("/director");   // Làm mới trang giám đốc (để hiện thông báo)
    return { success: "Đã gửi hồ sơ sang Giám đốc duyệt!" };
  } catch (e) {
    return { error: "Lỗi hệ thống!" };
  }
}

// 2. GIÁM ĐỐC DUYỆT (Chuyển sang APPROVED)
export async function approvePayroll(id: string) {
  try {
    await db.payroll.update({
      where: { id },
      data: { 
        status: "APPROVED", 
        rejectionReason: null // Xóa lý do từ chối cũ (nếu có)
      }
    });
    revalidatePath("/director");
    revalidatePath("/accountant");
    return { success: "Đã duyệt lương thành công!" };
  } catch (e) {
    return { error: "Lỗi không thể duyệt!" };
  }
}

// 3. GIÁM ĐỐC TỪ CHỐI (Chuyển sang REJECTED + Lý do)
export async function rejectPayroll(formData: FormData) {
  const id = formData.get("id") as string;
  const reason = formData.get("reason") as string;

  if (!reason) return { error: "Vui lòng nhập lý do từ chối!" };

  try {
    await db.payroll.update({
      where: { id },
      data: { 
        status: "REJECTED",
        rejectionReason: reason 
      }
    });
    revalidatePath("/director");
    revalidatePath("/accountant");
    return { success: "Đã trả hồ sơ về cho Kế toán!" };
  } catch (e) {
    return { error: "Lỗi hệ thống!" };
  }
}

// 4. TẠO LƯƠNG NHÁP ĐỂ TEST (Nếu cần dùng nút Test cũ)
export async function createTestPayroll() {
  const emp = await db.employee.findFirst();
  if (!emp) return { error: "Chưa có nhân viên nào!" };
  
  await db.payroll.create({
    data: {
      employeeId: emp.id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      baseSalary: emp.baseSalary,
      totalSalary: emp.baseSalary, // Tạm tính
      status: "DRAFT"
    }
  });
  revalidatePath("/accountant");
}