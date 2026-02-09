import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    // 1. Tạo Cài đặt mặc định
    await db.globalSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    // 2. Tạo Phòng ban mẫu
    const depts = ["Ban Giám Đốc", "Phòng Kế Toán", "Phòng Kỹ Thuật", "Phòng Nhân Sự"];
    for (const name of depts) {
      // Upsert: Có rồi thì thôi, chưa có thì tạo
      const existing = await db.department.findUnique({ where: { name } });
      if (!existing) {
        await db.department.create({ data: { name } });
      }
    }

    // 3. Tạo Tài khoản Giám Đốc (admin/123456)
    const directorRole = "DIRECTOR"; // Khớp với Enum trong Schema
    const hashedPassword = await hash("123456", 10); // Mật khẩu là 123456

    const director = await db.employee.upsert({
      where: { username: "admin" },
      update: {
        role: directorRole,
        password: hashedPassword,
      },
      create: {
        username: "admin",
        password: hashedPassword,
        fullName: "Nguyễn Văn Giám Đốc",
        role: directorRole,
        baseSalary: 50000000,
        department: { connect: { name: "Ban Giám Đốc" } },
      },
    });

    return NextResponse.json({ message: "✅ Khởi tạo thành công! Tài khoản: admin / 123456" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khởi tạo: " + error }, { status: 500 });
  }
}