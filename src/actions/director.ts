"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { cookies } from "next/headers";

// Helper: lấy tên người dùng hiện tại từ session để ghi audit log
async function getActorName(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) {
      const user = JSON.parse(session.value);
      return user.name || user.username || "Unknown";
    }
  } catch { }
  return "System";
}

// Helper: ghi audit log
async function logAudit(actorName: string, action: string, target: string, detail?: string) {
  try {
    await db.auditLog.create({ data: { actorName, action, target, detail } });
  } catch { }
}

// --- 1. XỬ LÝ PHÒNG BAN ---
export async function createDepartment(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;

  if (!name) return { error: "Tên phòng ban không được để trống!" };

  try {
    await db.department.create({ data: { name } });
    const actor = await getActorName();
    await logAudit(actor, "Tạo phòng ban", name);
    revalidatePath("/director");
    return { success: "Đã thêm phòng ban mới!" };
  } catch (e) {
    return { error: "Lỗi: Tên phòng ban có thể đã tồn tại." };
  }
}

export async function deleteDepartment(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "Không tìm thấy phòng ban cần xóa!" };

  try {
    // 1. Kiểm tra xem phòng ban này có nhân viên nào không
    const dept = await db.department.findUnique({
      where: { id },
      include: { employees: true }
    });

    if (!dept) return { error: "Phòng ban không tồn tại!" };
    if (dept.employees.length > 0) {
      return { error: `Không thể xóa! Đang có ${dept.employees.length} nhân viên trong phòng ban này.` };
    }

    // 2. Xóa
    await db.department.delete({ where: { id } });
    const actor = await getActorName();
    await logAudit(actor, "Xóa phòng ban", dept.name);
    revalidatePath("/director");
    return { success: "Đã xóa phòng ban thành công!" };
  } catch (e) {
    return { error: "Lỗi khi xóa phòng ban." };
  }
}

// --- 2. TẠO NHÂN VIÊN ---
export async function createEmployee(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const username = formData.get("username") as string;
  const baseSalary = parseFloat(formData.get("baseSalary") as string) || 0;
  const departmentId = formData.get("departmentId") as string;

  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const dobStr = formData.get("dob") as string;
  const dob = dobStr ? new Date(dobStr) : null;

  // Cấu hình phụ cấp & BHXH cá nhân
  const responsibilityAmount = parseFloat(formData.get("responsibilityAmount") as string) || 0;
  const phoneAllowance = parseFloat(formData.get("phoneAllowance") as string) || 0;
  const otherAllowance = parseFloat(formData.get("otherAllowance") as string) || 0;
  const hasInsurance = formData.get("hasInsurance") === "true";

  if (!username || !fullName) return { error: "Thiếu thông tin bắt buộc!" };

  const hashedPassword = await hash("123456", 10);

  try {
    await db.employee.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email: email || null,
        phone: phone || null,
        dob,
        baseSalary,
        responsibilityAmount,
        phoneAllowance,
        otherAllowance,
        hasInsurance,
        departmentId: departmentId || null,
        role: "EMPLOYEE",
      },
    });
    const actor = await getActorName();
    await logAudit(actor, "Tạo nhân viên", fullName, `Username: ${username}`);
    revalidatePath("/director");
    return { success: "Đã thêm nhân viên thành công!" };
  } catch (e) {
    console.error(e);
    return { error: "Lỗi: Tài khoản hoặc Email đã tồn tại." };
  }
}

// --- 3. SỬA NHÂN VIÊN ---
export async function updateEmployee(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const fullName = formData.get("fullName") as string;
  const baseSalary = parseFloat(formData.get("baseSalary") as string) || 0;
  const departmentId = formData.get("departmentId") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const dobStr = formData.get("dob") as string;
  const dob = dobStr ? new Date(dobStr) : null;

  // Cấu hình phụ cấp & BHXH cá nhân
  const responsibilityAmount = parseFloat(formData.get("responsibilityAmount") as string) || 0;
  const phoneAllowance = parseFloat(formData.get("phoneAllowance") as string) || 0;
  const otherAllowance = parseFloat(formData.get("otherAllowance") as string) || 0;
  const hasInsurance = formData.get("hasInsurance") === "true";

  if (!id || !fullName) return { error: "Thiếu thông tin bắt buộc!" };

  try {
    await db.employee.update({
      where: { id },
      data: {
        fullName,
        baseSalary,
        responsibilityAmount,
        phoneAllowance,
        otherAllowance,
        hasInsurance,
        departmentId: departmentId || null,
        email: email || null,
        phone: phone || null,
        dob,
      },
    });
    const actor = await getActorName();
    await logAudit(actor, "Cập nhật nhân viên", fullName, `Lương: ${baseSalary.toLocaleString("vi-VN")}`);
    revalidatePath("/director");
    return { success: "Đã cập nhật thông tin nhân viên!" };
  } catch (e) {
    return { error: "Lỗi khi cập nhật nhân viên." };
  }
}

// --- 4. VÔ HIỆU HÓA / KÍCH HOẠT NHÂN VIÊN ---
export async function toggleEmployeeActive(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const currentActive = formData.get("isActive") === "true";

  try {
    const emp = await db.employee.update({
      where: { id },
      data: { isActive: !currentActive },
    });
    const actor = await getActorName();
    const action = !currentActive ? "Kích hoạt nhân viên" : "Vô hiệu hóa nhân viên";
    await logAudit(actor, action, emp.fullName);
    revalidatePath("/director");
    return { success: !currentActive ? "Đã kích hoạt tài khoản!" : "Đã vô hiệu hóa tài khoản!" };
  } catch (e) {
    return { error: "Lỗi khi thay đổi trạng thái nhân viên." };
  }
}

// --- 5. RESET MẬT KHẨU NHÂN VIÊN ---
export async function resetEmployeePassword(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const empName = formData.get("empName") as string;

  try {
    const hashedPassword = await hash("123456", 10);
    await db.employee.update({
      where: { id },
      data: { password: hashedPassword },
    });
    const actor = await getActorName();
    await logAudit(actor, "Reset mật khẩu", empName, "Mật khẩu đặt lại về: 123456");
    revalidatePath("/director");
    return { success: `Đã reset mật khẩu của ${empName} về "123456"` };
  } catch (e) {
    return { error: "Lỗi khi reset mật khẩu." };
  }
}

// --- 6. TẠO HỢP ĐỒNG ---
export async function createContract(prevState: any, formData: FormData) {
  const employeeId = formData.get("employeeId") as string;
  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const note = formData.get("note") as string;

  if (!employeeId || !type || !startDateStr) return { error: "Thiếu thông tin hợp đồng!" };

  try {
    const emp = await db.employee.findUnique({ where: { id: employeeId } });
    await db.contract.create({
      data: {
        employeeId,
        type: type as any,
        startDate: new Date(startDateStr),
        endDate: endDateStr ? new Date(endDateStr) : null,
        note: note || null,
      },
    });
    const actor = await getActorName();
    await logAudit(actor, "Tạo hợp đồng", emp?.fullName || employeeId, `Loại: ${type}`);
    revalidatePath("/director");
    return { success: "Đã tạo hợp đồng thành công!" };
  } catch (e) {
    return { error: "Lỗi khi tạo hợp đồng." };
  }
}

// --- 7. CẬP NHẬT CÀI ĐẶT LƯƠNG ---
export async function updateSettings(prevState: any, formData: FormData) {
  const standardWorkDays = parseInt(formData.get("standardWorkDays") as string);
  const overtimeRatio = parseFloat(formData.get("overtimeRatio") as string);
  const insurancePercent = parseFloat(formData.get("insurancePercent") as string) || 0;
  const fuelPrice1to15 = parseFloat(formData.get("fuelPrice1to15") as string) || 0;
  const fuelPrice20to30 = parseFloat(formData.get("fuelPrice20to30") as string) || 0;
  const fuelPriceAbove30 = parseFloat(formData.get("fuelPriceAbove30") as string) || 0;

  try {
    await db.globalSettings.upsert({
      where: { id: "default" },
      update: {
        standardWorkDays,
        overtimeRatio,
        insurancePercent,
        fuelPrice1to15,
        fuelPrice20to30,
        fuelPriceAbove30,
      },
      create: {
        id: "default",
        standardWorkDays,
        overtimeRatio,
        insurancePercent,
        fuelPrice1to15,
        fuelPrice20to30,
        fuelPriceAbove30,
      },
    });
    const actor = await getActorName();
    await logAudit(actor, "Cập nhật cấu hình lương", "GlobalSettings");
    revalidatePath("/director");
    return { success: "Cập nhật cấu hình thành công!" };
  } catch (e) {
    return { error: "Lỗi khi lưu cấu hình!" };
  }
}

// --- 8. LẤY CHI TIẾT NHÂN VIÊN THEO THÁNG ---
export async function getEmployeeDetailByMonth(employeeId: string, month: number, year: number) {
  try {
    const employee = await db.employee.findUnique({
      where: { id: employeeId },
      include: { department: true }
    });

    if (!employee) return { error: "Không tìm thấy nhân viên" };

    const firstDay = new Date(year, month - 1, 1);
    const nextMonthFirstDay = new Date(year, month, 1);

    const attendances = await db.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: firstDay,
          lt: nextMonthFirstDay
        }
      },
      orderBy: { date: "asc" }
    });

    const leaves = await db.leaveRequest.findMany({
      where: {
        employeeId,
        AND: [
          { startDate: { lt: nextMonthFirstDay } },
          { endDate: { gte: firstDay } }
        ]
      },
      orderBy: { startDate: "asc" }
    });

    const payroll = await db.payroll.findFirst({
      where: { employeeId, month, year }
    });

    return { success: true, employee, attendances, leaves, payroll };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết NV:", error);
    return { error: "Lỗi kết nối CSDL hoặc tham số không hợp lệ" };
  }
}
