"use server";

import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createEmployee(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const username = formData.get("username") as string;
  const position = formData.get("position") as string;
  const departmentId = formData.get("department") as string; // Đây là ID phòng ban
  const rawSalary = formData.get("baseSalary") as string;

  try {
    // 1. Mã hóa mật khẩu mặc định (123456)
    const hashedPassword = await hash("123456", 10);

    // 2. Lưu vào Database
    await db.employee.create({
      data: {
        fullName,
        username,
        password: hashedPassword,
        position,
        // SỬA LỖI TẠI ĐÂY: Dùng departmentId thay vì department
        departmentId: departmentId, 
        baseSalary: parseFloat(rawSalary) || 0,
        role: "EMPLOYEE",
        status: "ACTIVE",
      },
    });

    revalidatePath("/director");
    return { success: "Thêm nhân viên thành công!" };
  } catch (error) {
    console.error(error);
    return { error: "Không thể tạo nhân viên. Có thể tên đăng nhập đã tồn tại!" };
  }
}

// Hàm xóa nhân viên (Nếu bạn có dùng)
export async function deleteEmployee(id: string) {
  try {
    await db.employee.delete({ where: { id } });
    revalidatePath("/director");
    return { success: "Xóa thành công" };
  } catch (error) {
    return { error: "Lỗi khi xóa nhân viên" };
  }
}