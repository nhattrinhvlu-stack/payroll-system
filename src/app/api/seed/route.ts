import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    // 1. Tạo Cài đặt mặc định
    await db.globalSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        fuelPrice1to15: 3000,
        fuelPrice20to30: 4000,
        fuelPriceAbove30: 5000,
      },
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

    await db.employee.upsert({
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

    // 4. Tạo Tài khoản Kế Toán (ketoan/123456)
    await db.employee.upsert({
      where: { username: "ketoan" },
      update: {
        role: "ACCOUNTANT",
        password: hashedPassword,
      },
      create: {
        username: "ketoan",
        password: hashedPassword,
        fullName: "Nguyễn Thị Kế Toán",
        role: "ACCOUNTANT",
        baseSalary: 15000000,
        department: { connect: { name: "Phòng Kế Toán" } },
      },
    });

    return NextResponse.json({
      message: "✅ Khởi tạo thành công!",
      accounts: [
        { username: "admin", password: "123456", role: "Giám Đốc" },
        { username: "ketoan", password: "123456", role: "Kế Toán" },
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khởi tạo: " + error }, { status: 500 });
  }
}