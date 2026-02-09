"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createEmployee(formData: FormData) {
  // 1. Lấy dữ liệu từ Form gửi lên
  const fullName = formData.get("fullName") as string;
  const position = formData.get("position") as string;
  const department = formData.get("department") as string;
  const rawSalary = formData.get("baseSalary") as string;

  // 2. Lưu vào Database
  await db.employee.create({
    data: {
      fullName,
      position,
      department,
      baseSalary: parseFloat(rawSalary) || 0, // Chuyển chữ thành số
      status: "ACTIVE",
    },
  });

  // 3. F5 lại dữ liệu trang chủ ngay lập tức
  revalidatePath("/");
}