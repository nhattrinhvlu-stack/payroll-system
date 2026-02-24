"use client";

import { upsertAttendance } from "@/actions/attendance";
import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function AttendanceTable({ employees, dateStr }: { employees: any[], dateStr: string }) {
  const [editingEmp, setEditingEmp] = useState<any>(null);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-600">
            <tr>
              <th className="p-4 w-1/3">Nhân viên</th>
              <th className="p-4 text-center">Phòng ban</th>
              <th className="p-4 text-center">Tóm tắt Chấm công</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Không có nhân viên nào.</td></tr>
            ) : null}
            {employees.map((emp) => {
              const att = emp.attendances[0] || {};
              const hasData = Object.keys(att).length > 0;

              return (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-indigo-900">{emp.fullName}</td>
                  <td className="p-4 text-center text-gray-500">{emp.department?.name || "N/A"}</td>
                  <td className="p-4 text-center">
                    {hasData ? (
                      <div className="flex flex-wrap justify-center gap-2">
                        {att.workingDays > 0 && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Công: {att.workingDays}</span>}
                        {att.overtime > 0 && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">TC: {att.overtime}h</span>}
                        {att.dailyAllowance > 0 && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Hỗ trợ: {new Intl.NumberFormat('vi-VN').format(att.dailyAllowance)}đ</span>}
                        {att.dailyAdvance > 0 && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Ứng: {new Intl.NumberFormat('vi-VN').format(att.dailyAdvance)}đ</span>}
                        {!att.workingDays && !att.overtime && !att.dailyAllowance && !att.dailyAdvance && <span className="text-gray-400 italic text-xs">Chưa có</span>}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Chưa chấm công</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setEditingEmp(emp)}
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                    >
                      {hasData ? "✏️ Sửa" : "📝 Chấm công"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingEmp && (
        <AttendanceModal
          emp={editingEmp}
          dateStr={dateStr}
          onClose={() => setEditingEmp(null)}
        />
      )}
    </div>
  );
}

function AttendanceModal({ emp, dateStr, onClose }: { emp: any, dateStr: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const att = emp.attendances[0] || {};

  // Form states
  const [dailyAllowance, setDailyAllowance] = useState<number>(att.dailyAllowance ?? 0);
  const [dailyAdvance, setDailyAdvance] = useState<number>(att.dailyAdvance ?? 0);
  const [note, setNote] = useState<string>(att.note ?? "");

  // Helper states
  const [showHelper, setShowHelper] = useState(false);
  const [helperType, setHelperType] = useState<"ALLOWANCE" | "ADVANCE">("ALLOWANCE");
  const [helperAmount, setHelperAmount] = useState<number | "">("");
  const [helperReason, setHelperReason] = useState("");

  // Tìm đơn xin nghỉ được duyệt trong ngày này
  const leaveToday = emp.leaveRequests?.find((l: any) => l.status === "APPROVED");
  let maxWorkingDays = 1;
  let leaveNotice = "";

  if (leaveToday) {
    if (leaveToday.session === "ALL_DAY") {
      maxWorkingDays = 0;
      leaveNotice = "Nghỉ Cả ngày (Đã duyệt)";
    } else if (leaveToday.session === "MORNING" || leaveToday.session === "AFTERNOON") {
      maxWorkingDays = 0.5;
      leaveNotice = leaveToday.session === "MORNING" ? "Nghỉ Buổi Sáng (Đã duyệt)" : "Nghỉ Buổi Chiều (Đã duyệt)";
    }
  }

  // Effect để tự động điều chỉnh số ngày công về giới hạn tối đa khi mở modal
  useState(() => {
    if (att.workingDays === undefined || att.workingDays > maxWorkingDays) {
      // Only strictly override if the existing data is violating the max.
      // In normal setup we might not want to overwrite instantly, but for security we should
    }
  });

  async function handleSave(formData: FormData) {
    setLoading(true);
    // Overwrite formData with our controlled states for these 3 fields
    formData.set("dailyAllowance", dailyAllowance.toString());
    formData.set("dailyAdvance", dailyAdvance.toString());
    formData.set("note", note);

    const res = await upsertAttendance(formData);
    setLoading(false);

    if (res.success) {
      toast.success(`Đã lưu chấm công cho ${emp.fullName}`);
      onClose(); // Đóng modal sau khi lưu xong
    } else {
      toast.error("Đã xảy ra lỗi khi lưu!");
    }
  }

  const addDetail = () => {
    if (!helperAmount || Number(helperAmount) <= 0 || !helperReason.trim()) {
      toast.error("Vui lòng nhập đủ số tiền và lý do!");
      return;
    }

    const amt = Number(helperAmount);
    const formattedAmt = new Intl.NumberFormat('vi-VN').format(amt);

    if (helperType === "ALLOWANCE") {
      setDailyAllowance((prev) => prev + amt);
      setNote((prev) => {
        const prefix = prev ? prev + "\n" : "";
        return prefix + `+ Hỗ trợ ${formattedAmt}đ: ${helperReason.trim()}`;
      });
    } else {
      setDailyAdvance((prev) => prev + amt);
      setNote((prev) => {
        const prefix = prev ? prev + "\n" : "";
        return prefix + `- Ứng ${formattedAmt}đ: ${helperReason.trim()}`;
      });
    }

    setHelperAmount("");
    setHelperReason("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Header Modal */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="font-black text-lg">Chấm công: {emp.fullName}</h3>
            <p className="text-indigo-200 text-xs font-medium">Ngày: {new Date(dateStr).toLocaleDateString('vi-VN')} • {emp.department?.name}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-indigo-500 p-1 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {leaveNotice && (
          <div className="bg-orange-50 border-b border-orange-200 p-3 text-center">
            <p className="text-orange-700 font-bold text-sm">⚠️ Khóa nhập liệu: {leaveNotice}</p>
          </div>
        )}

        {/* Body Form */}
        <div className="overflow-y-auto p-6">
          <form id="attendance-form" action={handleSave} className="space-y-4">
            <input type="hidden" name="employeeId" value={emp.id} />
            <input type="hidden" name="date" value={dateStr} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Công (Ngày)</label>
                <input name="workingDays" type="number" step="0.5" max={maxWorkingDays} min="0" defaultValue={Math.min(att.workingDays ?? 1, maxWorkingDays)} disabled={maxWorkingDays === 0}
                  className="w-full border-2 border-gray-100 rounded-xl p-2.5 font-bold text-blue-700 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tăng ca (Giờ)</label>
                <input name="overtime" type="number" step="0.5" min="0" defaultValue={maxWorkingDays === 0 ? 0 : (att.overtime ?? 0)} disabled={maxWorkingDays === 0}
                  className="w-full border-2 border-gray-100 rounded-xl p-2.5 font-bold text-orange-600 focus:border-orange-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Di chuyển (Km)</label>
              <input name="kmTraveled" type="number" step="1" min="0" defaultValue={att.kmTraveled ?? 0}
                className="w-full border-2 border-gray-100 rounded-xl p-2.5 font-bold focus:border-gray-400 outline-none transition" />
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-black text-gray-700 uppercase">Tài chính</label>
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${showHelper ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {showHelper ? "Đóng công cụ chi tiết" : "⚡ Nhập chi tiết Hỗ trợ/Ứng"}
              </button>
            </div>

            {/* Smart Helper Tool */}
            {showHelper && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 animate-in slide-in-from-top-2">
                <p className="text-xs font-medium text-indigo-800 mb-3">
                  Công cụ này giúp bạn tự động cộng dồn tiền và nối chi tiết vào ô Ghi chú.
                </p>
                <div className="flex gap-2 mb-2">
                  <select
                    value={helperType} onChange={(e) => setHelperType(e.target.value as any)}
                    className="border-2 border-indigo-100 rounded-lg p-2 text-sm font-bold bg-white outline-none flex-shrink-0"
                  >
                    <option value="ALLOWANCE">Hỗ trợ (+)</option>
                    <option value="ADVANCE">Ứng tiền (-)</option>
                  </select>
                  <input
                    type="number" placeholder="Số tiền..." step="1000" min="0"
                    value={helperAmount} onChange={(e) => setHelperAmount(e.target.value ? Number(e.target.value) : "")}
                    className="border-2 border-indigo-100 rounded-lg p-2 text-sm font-bold w-1/3 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Lý do chi tiết (VD: Đi Cần Thơ)..."
                    value={helperReason} onChange={(e) => setHelperReason(e.target.value)}
                    className="border-2 border-indigo-100 rounded-lg p-2 text-sm flex-1 outline-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDetail(); } }}
                  />
                  <button
                    type="button" onClick={addDetail}
                    className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-green-600 uppercase mb-1">Tiền Hỗ trợ (+)</label>
                <input type="number" step="1000" min="0" value={dailyAllowance} onChange={(e) => setDailyAllowance(Number(e.target.value))}
                  className="w-full border-2 border-green-100 bg-green-50 rounded-xl p-2.5 font-bold text-green-700 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-red-600 uppercase mb-1">Tiền Ứng trước (-)</label>
                <input type="number" step="1000" min="0" value={dailyAdvance} onChange={(e) => setDailyAdvance(Number(e.target.value))}
                  className="w-full border-2 border-red-100 bg-red-50 rounded-xl p-2.5 font-bold text-red-700 focus:border-red-500 outline-none transition" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú tổng hợp</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ghi chú sẽ tự động được tạo nếu dùng công cụ chi tiết..."
                className="w-full border-2 border-gray-100 rounded-xl p-2.5 text-sm text-gray-700 focus:border-indigo-400 outline-none transition resize-none" />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 shrink-0 flex gap-3 border-t">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition">
            Hủy bỏ
          </button>
          <button type="submit" form="attendance-form" disabled={loading} className="flex-1 px-4 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Đang lưu..." : "💾 Lưu chấm công"}
          </button>
        </div>
      </div>
    </div>
  );
}