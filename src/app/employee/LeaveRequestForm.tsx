"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createLeaveRequest } from "@/actions/leave";

export default function LeaveRequestForm() {
    const [state, action, isPending] = useActionState(createLeaveRequest, null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success);
            (document.getElementById("leaveForm") as HTMLFormElement)?.reset();
        }
        if (state?.error) toast.error(state.error);
    }, [state]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="font-bold text-gray-700 mb-4 text-center">📅 Xin Nghỉ Phép</h3>
            <form id="leaveForm" action={action} className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">Loại Nghỉ</label>
                    <select name="type" required className="w-full border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white">
                        <option value="ANNUAL">Nghỉ phép năm (Có lương)</option>
                        <option value="SICK">Nghỉ ốm (Có BHXH hỗ trợ)</option>
                        <option value="UNPAID">Nghỉ không lương</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold text-gray-600 block mb-1">Từ ngày</label>
                        <input type="date" name="startDate" required className="w-full border p-2 rounded text-sm outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block mb-1">Đến ngày</label>
                        <input type="date" name="endDate" required className="w-full border p-2 rounded text-sm outline-none" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">Lý do nghỉ</label>
                    <textarea name="reason" rows={3} required placeholder="Ghi rõ lý do..." className="w-full border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-green-500"></textarea>
                </div>
                <button disabled={isPending} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 shadow disabled:opacity-50">
                    {isPending ? "Đang gửi đơn..." : "Gửi Đơn Xin Nghỉ"}
                </button>
            </form>
        </div>
    );
}
