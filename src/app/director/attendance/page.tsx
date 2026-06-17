export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DateSelector from "@/app/accountant/DateSelector";
import AttendanceTable from "@/app/accountant/AttendanceTable";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) return JSON.parse(session.value);
  } catch { }
  return null;
}

export default async function DirectorAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "DIRECTOR") {
    redirect("/login");
  }

  const params = await searchParams;
  const dateStr = (params.date as string) || new Date().toISOString().split("T")[0];
  const selectedDate = new Date(dateStr);

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const employees = await db.employee.findMany({
    include: {
      department: true,
      attendances: {
        where: { date: { gte: startOfDay, lt: endOfDay } },
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { lte: endOfDay },
          endDate: { gte: startOfDay },
        },
      },
    },
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <a
        href="/director"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
      >
        ← Quay lại trang chủ
      </a>

      <h1 className="text-3xl font-black text-indigo-900 tracking-tight mb-6">
        🕒 SỬA CHẤM CÔNG (GIÁM ĐỐC)
      </h1>

      <div className="space-y-4">
        <DateSelector date={dateStr} />
        <AttendanceTable employees={employees as any} dateStr={dateStr} />
      </div>
    </div>
  );
}
