"use server";

import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs"; // Import cả compare và hash
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// --- 1. XỬ LÝ ĐĂNG NHẬP ---
export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Vui lòng nhập đầy đủ thông tin!" };
  }

  try {
    // 1. Tìm người dùng trong Database
    const user = await db.employee.findUnique({
      where: { username },
    });

    // 2. Kiểm tra mật khẩu (Mặc định là 123456 nếu chưa đổi)
    if (!user || !(await compare(password, user.password))) {
      return { error: "Sai tên đăng nhập hoặc mật khẩu!" };
    }

    // 3. Lưu thông tin phiên làm việc vào Cookie
    const sessionData = JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.fullName,
      role: user.role, // Để phân quyền
      departmentId: user.departmentId
    });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
      path: "/",
    });

    // 4. Phân quyền điều hướng (Router Guard)
    if (user.role === "DIRECTOR") {
      redirect("/director");
    } else if (user.role === "ACCOUNTANT") {
      redirect("/accountant");
    } else {
      // Mặc định là nhân viên thường
      redirect("/employee");
    }

  } catch (error) {
    // Fix lỗi redirect của Next.js
    if ((error as Error).message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error(error);
    return { error: "Lỗi hệ thống đăng nhập!" };
  }
}

// --- 2. XỬ LÝ ĐĂNG XUẤT ---
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

// --- 3. XỬ LÝ ĐỔI MẬT KHẨU (MỚI) ---
export async function changePassword(prevState: any, formData: FormData) {
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate dữ liệu đầu vào
  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: "Vui lòng nhập đầy đủ thông tin!" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Mật khẩu mới không khớp!" };
  }

  if (newPassword.length < 6) {
    return { error: "Mật khẩu mới phải có ít nhất 6 ký tự!" };
  }

  // 1. Lấy thông tin người dùng đang đăng nhập từ Cookie
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  
  if (!session) {
    return { error: "Phiên đăng nhập hết hạn!" };
  }
  
  const currentUser = JSON.parse(session.value);

  try {
    // 2. Lấy mật khẩu hiện tại trong DB để so sánh
    const userInDb = await db.employee.findUnique({
      where: { id: currentUser.id }
    });

    if (!userInDb || !(await compare(oldPassword, userInDb.password))) {
      return { error: "Mật khẩu cũ không đúng!" };
    }

    // 3. Mã hóa mật khẩu mới
    const hashedPassword = await hash(newPassword, 10);

    // 4. Cập nhật vào Database
    await db.employee.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword }
    });

    return { success: "Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới." };

  } catch (error) {
    console.error(error);
    return { error: "Lỗi hệ thống khi đổi mật khẩu!" };
  }
}