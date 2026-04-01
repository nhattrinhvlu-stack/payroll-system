import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InventoryDashboard from "./InventoryDashboard";

export const dynamic = "force-dynamic";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) return JSON.parse(session.value);
  } catch {}
  return null;
}

export default async function DirectorInventoryPage() {
  const session = await getSession();
  if (!session || !["DIRECTOR", "ACCOUNTANT"].includes(session.role)) {
    redirect("/login");
  }

  const isDirector = session.role === "DIRECTOR";

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [categories, suppliers, materials, employees, transactions] = await Promise.all([
    db.materialCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { materials: true } } },
    }),
    db.supplier.findMany({ orderBy: { name: "asc" } }),
    db.material.findMany({
      orderBy: { code: "asc" },
      include: { category: true },
    }),
    db.employee.findMany({
      where: { isActive: true, role: "EMPLOYEE" },
      select: { id: true, fullName: true, department: { select: { name: true } } },
      orderBy: { fullName: "asc" },
    }),
    db.materialTransaction.findMany({
      orderBy: { transactionDate: "desc" },
      take: 200,
      include: {
        material: { select: { code: true, name: true, unit: true } },
        supplier: { select: { name: true } },
        receivedBy: { select: { fullName: true } },
      },
    }),
  ]);

  // Tính thống kê
  const activeMaterials = materials.filter((m) => m.isActive);
  const lowStockCount = activeMaterials.filter(
    (m) => m.minStockLevel > 0 && m.currentStock <= m.minStockLevel
  ).length;

  const importThisMonth = transactions.filter(
    (t) => t.type === "IMPORT" && new Date(t.transactionDate) >= firstDayOfMonth
  ).length;

  const exportThisMonth = transactions.filter(
    (t) => t.type === "EXPORT" && new Date(t.transactionDate) >= firstDayOfMonth
  ).length;

  const totalStockValue = activeMaterials.reduce(
    (sum, m) => sum + m.currentStock * m.unitPrice,
    0
  );

  const stats = {
    totalMaterials: activeMaterials.length,
    lowStockCount,
    importThisMonth,
    exportThisMonth,
    totalStockValue,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <a
          href={isDirector ? "/director" : "/accountant"}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
        >
          ← Quay lại trang chủ
        </a>

        <InventoryDashboard
          categories={categories}
          suppliers={suppliers}
          materials={materials}
          employees={employees}
          transactions={transactions}
          stats={stats}
          isDirector={isDirector}
        />
      </div>
    </div>
  );
}
