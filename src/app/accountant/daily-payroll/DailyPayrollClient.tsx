"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setAttendancePaid } from "@/actions/dailyPayroll";

interface DayRow {
  id: string;
  date: string | Date;
  workingDays: number;
  overtime: number;
  kmTraveled: number;
  fuel: number;
  dailyAllowance: number;
  dailyAdvance: number;
  total: number;
  isPaid: boolean;
}

interface EmpRow {
  id: string;
  fullName: string;
  department: string;
  dailyWage: number;
  days: DayRow[];
  totalAll: number;
  totalPaid: number;
  totalUnpaid: number;
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n));

export default function DailyPayrollClient({
  data,
  month,
  year,
}: {
  data: EmpRow[];
  month: number;
  year: number;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const monthValue = `${year}-${String(month).padStart(2, "0")}`;

  async function togglePaid(attendanceId: string, current: boolean) {
    setLoadingId(attendanceId);
    const fd = new FormData();
    fd.set("attendanceId", attendanceId);
    fd.set("isPaid", (!current).toString());
    const res = await setAttendancePaid(fd);
    if (res?.success) {
      toast.success(res.success);
      router.refresh();
    } else if (res?.error) {
      toast.error(res.error);
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Chọn tháng */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-gray-700">📅 Chọn tháng:</span>
        <input
          type="month"
          defaultValue={monthValue}
          onChange={(e) => {
            const [y, m] = e.target.value.split("-");
            router.push(`?month=${parseInt(m)}&year=${y}`);
          }}
          className="border-2 border-indigo-100 rounded-lg px-3 py-2 font-bold text-indigo-700 outline-none focus:border-indigo-500 cursor-pointer"
        />
      </div>

      {data.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Chưa có nhân viên nào trả lương theo ngày, hoặc chưa có dữ liệu chấm công trong tháng này.
        </div>
      )}

      {data.map((emp) => (
        <div key={emp.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b bg-gray-50">
            <div>
              <div className="font-bold text-gray-800 text-lg">{emp.fullName}</div>
              <div className="text-xs text-gray-500">
                {emp.department} · Lương/ngày: <b className="text-green-700">{fmt(emp.dailyWage)} ₫</b>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-right">
                <div className="text-gray-500">Tổng</div>
                <div className="font-black text-indigo-700">{fmt(emp.totalAll)} ₫</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Đã trả</div>
                <div className="font-black text-green-600">{fmt(emp.totalPaid)} ₫</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Chưa trả</div>
                <div className="font-black text-red-600">{fmt(emp.totalUnpaid)} ₫</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 uppercase text-xs">
                <tr>
                  <th className="p-2">Ngày</th>
                  <th className="p-2 text-center">Công</th>
                  <th className="p-2 text-center">TC(h)</th>
                  <th className="p-2 text-center">Km</th>
                  <th className="p-2 text-right">Xăng</th>
                  <th className="p-2 text-right">Hỗ trợ</th>
                  <th className="p-2 text-right">Ứng</th>
                  <th className="p-2 text-right">Thành tiền</th>
                  <th className="p-2 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {emp.days.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-gray-400 text-xs">
                      Chưa có chấm công trong tháng.
                    </td>
                  </tr>
                )}
                {emp.days.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="p-2 font-medium">{new Date(d.date).toLocaleDateString("vi-VN")}</td>
                    <td className="p-2 text-center">{d.workingDays}</td>
                    <td className="p-2 text-center">{d.overtime > 0 ? d.overtime : "-"}</td>
                    <td className="p-2 text-center">{d.kmTraveled > 0 ? d.kmTraveled : "-"}</td>
                    <td className="p-2 text-right">{d.fuel > 0 ? fmt(d.fuel) : "-"}</td>
                    <td className="p-2 text-right text-green-700">{d.dailyAllowance > 0 ? fmt(d.dailyAllowance) : "-"}</td>
                    <td className="p-2 text-right text-red-600">{d.dailyAdvance > 0 ? fmt(d.dailyAdvance) : "-"}</td>
                    <td className="p-2 text-right font-bold">{fmt(d.total)}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => togglePaid(d.id, d.isPaid)}
                        disabled={loadingId === d.id}
                        className={`text-xs font-bold px-3 py-1 rounded border transition disabled:opacity-50 ${d.isPaid
                          ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                          : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          }`}
                      >
                        {loadingId === d.id ? "..." : d.isPaid ? "✓ Đã trả" : "Chưa trả"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
