"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { updateLeaveStatus } from "@/actions/leave";

interface Props {
    leaveRequests: any[];
}

export default function LeaveRequestCard({ leaveRequests }: Props) {
    const [isPending, startTransition] = useTransition();

    const pendingLeaves = leaveRequests.filter(l => l.status === "PENDING");
    const historyLeaves = leaveRequests.filter(l => l.status !== "PENDING").slice(0, 10);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                📅 Duyệt Đơn Nghỉ Phép
                {pendingLeaves.length > 0 && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">{pendingLeaves.length} chờ duyệt</span>}
            </h3>

            {/* Danh sách chờ duyệt */}
            <div className="space-y-4 mb-8">
                {pendingLeaves.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">Không có đơn nghỉ phép nào đang chờ.</p>
                ) : (
                    pendingLeaves.map((leave: any) => (
                        <div key={leave.id} className="border border-orange-200 bg-orange-50 p-4 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div>
                                <p className="font-bold text-gray-800">{leave.employee?.fullName}</p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-blue-700">
                                        {leave.type === "ANNUAL" && "Phép năm"}
                                        {leave.type === "SICK" && "Nghỉ ốm"}
                                        {leave.type === "UNPAID" && "Không lương"}
                                        {leave.type === "OTHER" && "Khác"}
                                    </span>
                                    {' '}• {leave.totalDays} ngày ({new Date(leave.startDate).toLocaleDateString("vi-VN")} - {new Date(leave.endDate).toLocaleDateString("vi-VN")})
                                </p>
                                <p className="text-xs text-gray-500 mt-1 italic">"{leave.reason}"</p>
                            </div>

                            <form className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                <input type="hidden" name="id" value={leave.id} />
                                <input type="text" name="approverNote" placeholder="Ghi chú (tùy chọn)..." className="border p-2 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
                                <button
                                    formAction={(formData) => {
                                        formData.append("status", "APPROVED");
                                        startTransition(async () => {
                                            const res = await updateLeaveStatus(null, formData);
                                            if (res?.success) toast.success(res.success);
                                            if (res?.error) toast.error(res.error);
                                        });
                                    }}
                                    disabled={isPending}
                                    className="bg-green-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                                >
                                    ✅ Duyệt
                                </button>
                                <button
                                    formAction={(formData) => {
                                        formData.append("status", "REJECTED");
                                        startTransition(async () => {
                                            const res = await updateLeaveStatus(null, formData);
                                            if (res?.success) toast.success(res.success);
                                            if (res?.error) toast.error(res.error);
                                        });
                                    }}
                                    disabled={isPending}
                                    className="bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-bold hover:bg-red-200 border border-red-200 disabled:opacity-50"
                                >
                                    ❌ Từ chối
                                </button>
                            </form>
                        </div>
                    ))
                )}
            </div>

            {/* Lịch sử duyệt (10 cái gần nhất) */}
            {historyLeaves.length > 0 && (
                <>
                    <h4 className="font-bold text-sm text-gray-500 mb-3 border-t pt-4">Lịch sử Duyệt (gần đây)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs">
                                <tr>
                                    <th className="p-2">Nhân viên</th>
                                    <th className="p-2">Loại & Thời gian</th>
                                    <th className="p-2">Trạng thái</th>
                                    <th className="p-2">Ghi chú duyệt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-xs text-gray-600">
                                {historyLeaves.map((l: any) => (
                                    <tr key={l.id} className="hover:bg-gray-50">
                                        <td className="p-2 font-medium">{l.employee?.fullName}</td>
                                        <td className="p-2">
                                            {l.type === "ANNUAL" && "Phép năm"}
                                            {l.type === "SICK" && "Nghỉ ốm"}
                                            {l.type === "UNPAID" && "Không lương"}
                                            {l.type === "OTHER" && "Khác"}
                                            <br />({l.totalDays} ngày)
                                        </td>
                                        <td className="p-2">
                                            {l.status === "APPROVED" ? (
                                                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Đã duyệt</span>
                                            ) : (
                                                <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Từ chối</span>
                                            )}
                                        </td>
                                        <td className="p-2 italic">{l.approverNote || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
