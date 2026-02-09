"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

// --- 1. XỬ LÝ PHÒNG BAN ---
export async function createDepartment(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name) return { error: "Tên phòng ban không được để trống!" };

  try {
    await db.department.create({ data: { name } });
    revalidatePath("/director");
    return { success: "Đã thêm phòng ban mới!" };
  } catch (e) {
    return { error: "Lỗi: Tên phòng ban có thể đã tồn tại." };
  }
}

// --- 2. XỬ LÝ NHÂN SỰ ---
export async function createEmployee(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const username = formData.get("username") as string;
  const baseSalary = parseFloat(formData.get("baseSalary") as string) || 0;
  const departmentId = formData.get("departmentId") as string;
  
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const dobStr = formData.get("dob") as string;
  const dob = dobStr ? new Date(dobStr) : null;

  if (!username || !fullName) return { error: "Thiếu thông tin bắt buộc!" };

  const hashedPassword = await hash("123456", 10);

  try {
    await db.employee.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        phone,
        dob,
        baseSalary,
        departmentId: departmentId || null,
        role: "EMPLOYEE",
      },
    });
    revalidatePath("/director");
    return { success: "Đã thêm nhân viên thành công!" };
  } catch (e) {
    console.error(e);
    return { error: "Lỗi: Tài khoản hoặc Email đã tồn tại." };
  }
}

// --- 3. XỬ LÝ CÀI ĐẶT LUẬT LƯƠNG (CẬP NHẬT MỚI) ---
export async function updateSettings(prevState: any, formData: FormData) {
  const standardWorkDays = parseInt(formData.get("standardWorkDays") as string);
  const overtimeRatio = parseFloat(formData.get("overtimeRatio") as string);
  const fuelPricePerKm = parseFloat(formData.get("fuelPricePerKm") as string);
  
  // --- MỚI: Lấy % Bảo hiểm từ form ---
  const insurancePercent = parseFloat(formData.get("insurancePercent") as string) || 0;
  // -----------------------------------

  const responsibilityAmount = parseFloat(formData.get("responsibilityAmount") as string);
  const phoneAllowance = parseFloat(formData.get("phoneAllowance") as string);
  const otherAllowance = parseFloat(formData.get("otherAllowance") as string);

  try {
    await db.globalSettings.upsert({
      where: { id: "default" },
      update: {
        standardWorkDays,
        overtimeRatio,
        fuelPricePerKm,
        insurancePercent, // Cập nhật vào DB
        responsibilityAmount,
        phoneAllowance,
        otherAllowance
      },
      create: {
        id: "default",
        standardWorkDays,
        overtimeRatio,
        fuelPricePerKm,
        insurancePercent, // Lưu mới vào DB
        responsibilityAmount,
        phoneAllowance,
        otherAllowance
      }
    });

    revalidatePath("/director");
    return { success: "Cập nhật cấu hình thành công!" };
  } catch (e) {
    return { error: "Lỗi khi lưu cấu hình!" };
  }
}