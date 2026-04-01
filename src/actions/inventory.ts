"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Helper: lấy thông tin người dùng hiện tại
async function getActor(): Promise<{ name: string; role: string }> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) {
      const user = JSON.parse(session.value);
      return {
        name: user.name || user.username || "Unknown",
        role: user.role || "",
      };
    }
  } catch {}
  return { name: "System", role: "" };
}

// Helper: ghi audit log
async function logAudit(actorName: string, action: string, target: string, detail?: string) {
  try {
    await db.auditLog.create({ data: { actorName, action, target, detail } });
  } catch {}
}

function revalidateAll() {
  revalidatePath("/director");
  revalidatePath("/director/inventory");
  revalidatePath("/accountant");
  revalidatePath("/accountant/inventory");
}

// ============================================================
// DANH MỤC LOẠI VẬT TƯ
// ============================================================

export async function createMaterialCategory(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (role !== "DIRECTOR") return { error: "Chỉ Giám Đốc mới có quyền quản lý danh mục!" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!name) return { error: "Tên danh mục không được để trống!" };

  try {
    await db.materialCategory.create({ data: { name, description: description || null } });
    await logAudit(actorName, "Tạo danh mục vật tư", name);
    revalidateAll();
    return { success: "Đã thêm danh mục vật tư!" };
  } catch {
    return { error: "Lỗi: Tên danh mục có thể đã tồn tại." };
  }
}

export async function updateMaterialCategory(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (role !== "DIRECTOR") return { error: "Chỉ Giám Đốc mới có quyền sửa danh mục!" };

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!id || !name) return { error: "Dữ liệu không hợp lệ!" };

  try {
    await db.materialCategory.update({
      where: { id },
      data: { name, description: description || null },
    });
    await logAudit(actorName, "Sửa danh mục vật tư", name);
    revalidateAll();
    return { success: "Đã cập nhật danh mục!" };
  } catch {
    return { error: "Lỗi: Tên danh mục có thể đã tồn tại." };
  }
}

export async function deleteMaterialCategory(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (role !== "DIRECTOR") return { error: "Chỉ Giám Đốc mới có quyền xóa danh mục!" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Không tìm thấy danh mục!" };

  try {
    const cat = await db.materialCategory.findUnique({
      where: { id },
      include: { materials: { where: { isActive: true } } },
    });
    if (!cat) return { error: "Danh mục không tồn tại!" };
    if (cat.materials.length > 0)
      return { error: `Không thể xóa! Đang có ${cat.materials.length} vật tư thuộc danh mục này.` };

    await db.materialCategory.delete({ where: { id } });
    await logAudit(actorName, "Xóa danh mục vật tư", cat.name);
    revalidateAll();
    return { success: "Đã xóa danh mục!" };
  } catch {
    return { error: "Lỗi khi xóa danh mục." };
  }
}

// ============================================================
// NHÀ CUNG CẤP
// ============================================================

export async function createSupplier(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["DIRECTOR", "ACCOUNTANT"].includes(role)) return { error: "Không có quyền thực hiện!" };

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const contactName = (formData.get("contactName") as string)?.trim();
  const note = (formData.get("note") as string)?.trim();

  if (!name) return { error: "Tên nhà cung cấp không được để trống!" };

  try {
    await db.supplier.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
        contactName: contactName || null,
        note: note || null,
      },
    });
    await logAudit(actorName, "Thêm nhà cung cấp", name);
    revalidateAll();
    return { success: "Đã thêm nhà cung cấp!" };
  } catch {
    return { error: "Lỗi khi thêm nhà cung cấp." };
  }
}

export async function updateSupplier(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["DIRECTOR", "ACCOUNTANT"].includes(role)) return { error: "Không có quyền thực hiện!" };

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const contactName = (formData.get("contactName") as string)?.trim();
  const note = (formData.get("note") as string)?.trim();

  if (!id || !name) return { error: "Dữ liệu không hợp lệ!" };

  try {
    await db.supplier.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        address: address || null,
        contactName: contactName || null,
        note: note || null,
      },
    });
    await logAudit(actorName, "Sửa nhà cung cấp", name);
    revalidateAll();
    return { success: "Đã cập nhật nhà cung cấp!" };
  } catch {
    return { error: "Lỗi khi cập nhật nhà cung cấp." };
  }
}

export async function toggleSupplierActive(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (role !== "DIRECTOR") return { error: "Chỉ Giám Đốc mới có quyền thực hiện!" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Không tìm thấy nhà cung cấp!" };

  try {
    const supplier = await db.supplier.findUnique({ where: { id } });
    if (!supplier) return { error: "Nhà cung cấp không tồn tại!" };
    await db.supplier.update({ where: { id }, data: { isActive: !supplier.isActive } });
    await logAudit(actorName, supplier.isActive ? "Vô hiệu NCC" : "Kích hoạt NCC", supplier.name);
    revalidateAll();
    return { success: `Đã ${supplier.isActive ? "vô hiệu hóa" : "kích hoạt"} nhà cung cấp!` };
  } catch {
    return { error: "Lỗi khi cập nhật nhà cung cấp." };
  }
}

// ============================================================
// DANH MỤC VẬT TƯ (MASTER DATA)
// ============================================================

export async function createMaterial(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["DIRECTOR", "ACCOUNTANT"].includes(role)) return { error: "Không có quyền thực hiện!" };

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const name = (formData.get("name") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const categoryId = (formData.get("categoryId") as string)?.trim();
  const minStockLevel = parseFloat(formData.get("minStockLevel") as string) || 0;
  const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0;

  if (!code || !name || !unit) return { error: "Mã, tên và đơn vị tính không được để trống!" };

  try {
    await db.material.create({
      data: {
        code,
        name,
        unit,
        description: description || null,
        categoryId: categoryId || null,
        minStockLevel,
        unitPrice,
      },
    });
    await logAudit(actorName, "Tạo vật tư mới", `${code} - ${name}`);
    revalidateAll();
    return { success: "Đã thêm vật tư mới!" };
  } catch {
    return { error: "Lỗi: Mã vật tư có thể đã tồn tại." };
  }
}

export async function updateMaterial(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["DIRECTOR", "ACCOUNTANT"].includes(role)) return { error: "Không có quyền thực hiện!" };

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const categoryId = (formData.get("categoryId") as string)?.trim();
  const minStockLevel = parseFloat(formData.get("minStockLevel") as string) || 0;
  const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0;

  if (!id || !name || !unit) return { error: "Dữ liệu không hợp lệ!" };

  try {
    const mat = await db.material.update({
      where: { id },
      data: {
        name,
        unit,
        description: description || null,
        categoryId: categoryId || null,
        minStockLevel,
        unitPrice,
      },
    });
    await logAudit(actorName, "Sửa vật tư", `${mat.code} - ${mat.name}`);
    revalidateAll();
    return { success: "Đã cập nhật vật tư!" };
  } catch {
    return { error: "Lỗi khi cập nhật vật tư." };
  }
}

export async function toggleMaterialActive(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (role !== "DIRECTOR") return { error: "Chỉ Giám Đốc mới có quyền thực hiện!" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Không tìm thấy vật tư!" };

  try {
    const mat = await db.material.findUnique({ where: { id } });
    if (!mat) return { error: "Vật tư không tồn tại!" };
    await db.material.update({ where: { id }, data: { isActive: !mat.isActive } });
    await logAudit(actorName, mat.isActive ? "Vô hiệu vật tư" : "Kích hoạt vật tư", `${mat.code} - ${mat.name}`);
    revalidateAll();
    return { success: `Đã ${mat.isActive ? "vô hiệu hóa" : "kích hoạt"} vật tư!` };
  } catch {
    return { error: "Lỗi khi cập nhật vật tư." };
  }
}

// ============================================================
// GIAO DỊCH VẬT TƯ
// ============================================================

export async function importMaterial(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["DIRECTOR", "ACCOUNTANT"].includes(role)) return { error: "Không có quyền thực hiện!" };

  const materialId = formData.get("materialId") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0;
  const supplierId = (formData.get("supplierId") as string)?.trim();
  const transactionDateStr = formData.get("transactionDate") as string;
  const reference = (formData.get("reference") as string)?.trim();
  const note = (formData.get("note") as string)?.trim();

  if (!materialId) return { error: "Vui lòng chọn vật tư!" };
  if (!quantity || quantity <= 0) return { error: "Số lượng nhập phải lớn hơn 0!" };

  const transactionDate = transactionDateStr ? new Date(transactionDateStr) : new Date();

  try {
    await db.$transaction(async (tx) => {
      const mat = await tx.material.findUnique({ where: { id: materialId } });
      if (!mat) throw new Error("Vật tư không tồn tại!");

      const stockBefore = mat.currentStock;
      const stockAfter = stockBefore + quantity;

      await tx.material.update({
        where: { id: materialId },
        data: { currentStock: stockAfter },
      });

      await tx.materialTransaction.create({
        data: {
          materialId,
          type: "IMPORT",
          status: "CONFIRMED",
          quantity,
          unitPrice,
          stockBefore,
          stockAfter,
          transactionDate,
          supplierId: supplierId || null,
          reference: reference || null,
          note: note || null,
          createdByName: actorName,
        },
      });

      await db.auditLog.create({
        data: {
          actorName,
          action: "Nhập kho vật tư",
          target: `${mat.code} - ${mat.name}`,
          detail: `SL: +${quantity} ${mat.unit} | Tồn sau: ${stockAfter} | ĐG: ${unitPrice.toLocaleString("vi-VN")}đ`,
        },
      });
    });

    revalidateAll();
    return { success: "Đã nhập kho vật tư thành công!" };
  } catch (e: any) {
    return { error: e.message || "Lỗi khi nhập kho." };
  }
}

export async function exportMaterial(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["DIRECTOR", "ACCOUNTANT"].includes(role)) return { error: "Không có quyền thực hiện!" };

  const materialId = formData.get("materialId") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const receivedById = (formData.get("receivedById") as string)?.trim();
  const reason = (formData.get("reason") as string)?.trim();
  const transactionDateStr = formData.get("transactionDate") as string;
  const reference = (formData.get("reference") as string)?.trim();
  const note = (formData.get("note") as string)?.trim();

  if (!materialId) return { error: "Vui lòng chọn vật tư!" };
  if (!quantity || quantity <= 0) return { error: "Số lượng xuất phải lớn hơn 0!" };
  if (!reason) return { error: "Lý do xuất kho không được để trống!" };

  const transactionDate = transactionDateStr ? new Date(transactionDateStr) : new Date();

  try {
    await db.$transaction(async (tx) => {
      const mat = await tx.material.findUnique({ where: { id: materialId } });
      if (!mat) throw new Error("Vật tư không tồn tại!");
      if (mat.currentStock < quantity)
        throw new Error(`Không đủ tồn kho! Tồn hiện tại: ${mat.currentStock} ${mat.unit}`);

      const stockBefore = mat.currentStock;
      const stockAfter = stockBefore - quantity;

      await tx.material.update({
        where: { id: materialId },
        data: { currentStock: stockAfter },
      });

      await tx.materialTransaction.create({
        data: {
          materialId,
          type: "EXPORT",
          status: "CONFIRMED",
          quantity,
          unitPrice: mat.unitPrice,
          stockBefore,
          stockAfter,
          transactionDate,
          receivedById: receivedById || null,
          reason: reason || null,
          reference: reference || null,
          note: note || null,
          createdByName: actorName,
        },
      });

      await db.auditLog.create({
        data: {
          actorName,
          action: "Xuất kho vật tư",
          target: `${mat.code} - ${mat.name}`,
          detail: `SL: -${quantity} ${mat.unit} | Tồn sau: ${stockAfter} | Lý do: ${reason}`,
        },
      });
    });

    revalidateAll();
    return { success: "Đã xuất kho vật tư thành công!" };
  } catch (e: any) {
    return { error: e.message || "Lỗi khi xuất kho." };
  }
}

export async function adjustStock(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (role !== "DIRECTOR") return { error: "Chỉ Giám Đốc mới có quyền điều chỉnh tồn kho!" };

  const materialId = formData.get("materialId") as string;
  const newQuantity = parseFloat(formData.get("newQuantity") as string);
  const reason = (formData.get("reason") as string)?.trim();

  if (!materialId) return { error: "Vui lòng chọn vật tư!" };
  if (newQuantity === undefined || newQuantity < 0) return { error: "Số lượng không hợp lệ!" };
  if (!reason) return { error: "Lý do điều chỉnh không được để trống!" };

  try {
    await db.$transaction(async (tx) => {
      const mat = await tx.material.findUnique({ where: { id: materialId } });
      if (!mat) throw new Error("Vật tư không tồn tại!");

      const stockBefore = mat.currentStock;
      const stockAfter = newQuantity;

      await tx.material.update({
        where: { id: materialId },
        data: { currentStock: stockAfter },
      });

      await tx.materialTransaction.create({
        data: {
          materialId,
          type: "ADJUST",
          status: "CONFIRMED",
          quantity: Math.abs(stockAfter - stockBefore),
          unitPrice: mat.unitPrice,
          stockBefore,
          stockAfter,
          reason,
          createdByName: actorName,
        },
      });

      await db.auditLog.create({
        data: {
          actorName,
          action: "Điều chỉnh tồn kho",
          target: `${mat.code} - ${mat.name}`,
          detail: `Từ ${stockBefore} → ${stockAfter} ${mat.unit} | Lý do: ${reason}`,
        },
      });
    });

    revalidateAll();
    return { success: "Đã điều chỉnh tồn kho!" };
  } catch (e: any) {
    return { error: e.message || "Lỗi khi điều chỉnh tồn kho." };
  }
}

export async function returnMaterial(prevState: any, formData: FormData) {
  const { name: actorName, role } = await getActor();
  if (!["DIRECTOR", "ACCOUNTANT"].includes(role)) return { error: "Không có quyền thực hiện!" };

  const materialId = formData.get("materialId") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const receivedById = (formData.get("receivedById") as string)?.trim();
  const reason = (formData.get("reason") as string)?.trim();
  const note = (formData.get("note") as string)?.trim();

  if (!materialId) return { error: "Vui lòng chọn vật tư!" };
  if (!quantity || quantity <= 0) return { error: "Số lượng trả phải lớn hơn 0!" };

  try {
    await db.$transaction(async (tx) => {
      const mat = await tx.material.findUnique({ where: { id: materialId } });
      if (!mat) throw new Error("Vật tư không tồn tại!");

      const stockBefore = mat.currentStock;
      const stockAfter = stockBefore + quantity;

      await tx.material.update({
        where: { id: materialId },
        data: { currentStock: stockAfter },
      });

      await tx.materialTransaction.create({
        data: {
          materialId,
          type: "RETURN",
          status: "CONFIRMED",
          quantity,
          unitPrice: mat.unitPrice,
          stockBefore,
          stockAfter,
          receivedById: receivedById || null,
          reason: reason || null,
          note: note || null,
          createdByName: actorName,
        },
      });

      await db.auditLog.create({
        data: {
          actorName,
          action: "Trả lại kho vật tư",
          target: `${mat.code} - ${mat.name}`,
          detail: `SL: +${quantity} ${mat.unit} | Tồn sau: ${stockAfter}`,
        },
      });
    });

    revalidateAll();
    return { success: "Đã ghi nhận trả lại kho thành công!" };
  } catch (e: any) {
    return { error: e.message || "Lỗi khi ghi nhận trả kho." };
  }
}
