"use server";

import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createEmployee(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const username = formData.get("username") as string;
  const departmentId = formData.get("department") as string; 
  const rawSalary = formData.get("baseSalary") as string;

  try {
    const hashedPassword = await hash("123456", 10);

    await db.employee.create({
      data: {
        fullName,
        username,
        password: hashedPassword,
        departmentId: departmentId, 
        baseSalary: parseFloat(rawSalary) || 0,
        role: "EMPLOYEE",
      },
    });

    revalidatePath("/director");
    return { success: "Thêm nhân viên thành công!" };
  } catch (error) {
    console.error(error);
    return { error: "Lỗi khi tạo nhân viên!" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await db.employee.delete({ where: { id } });
    revalidatePath("/director");
    return { success: "Xóa thành công" };
  } catch (error) {
    return { error: "Lỗi khi xóa nhân viên" };
  }
}