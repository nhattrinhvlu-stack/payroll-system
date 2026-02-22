"use client";

import { useActionState } from "react";
import toast from "react-hot-toast";
import { createContract } from "@/actions/director";

interface Props {
    contracts: any[];
    employees: any[];
}

export default function ContractListCard({ contracts, employees }: Props) {
    const [state, action, isPending] = useActionState(createContract, null);

    if (state?.success) {
        toast.success(state.success);
    }
    if (state?.error) {
        toast.error(state.error);
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4">Quản lý Hợp Đồng ({contracts.length})</h3>

            {/* Form Tạo Hợp Đồng */}
            <form action={action} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nhân viên (*)</label>
                    <select name="employeeId" required className="w-full border p-2 rounded text-sm outline-none bg-white">
                        <option value="">-- Chọn NV --</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                    </select>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Loại Hợp Đồng (*)</label>
                    <select name="type" required className="w-full border p-2 rounded text-sm outline-none bg-white">
                        <option value="FULL_TIME">Toàn thời gian</option>
                        <option value="PART_TIME">Bán thời gian</option>
                        <option value="CONTRACT">Thời vụ</option>
                        <option value="PROBATION">Thử việc</option>
                    </select>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Ngày bắt đầu (*)</label>
                    <input type="date" name="startDate" required className="w-full border p-2 rounded text-sm outline-none bg-white" />
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Ngày kết thúc</label>
                    <input type="date" name="endDate" className="w-full border p-2 rounded text-sm outline-none bg-white" />
                </div>
                <div className="lg:col-span-1 flex items-end">
                    <button disabled={isPending} className="w-full bg-blue-600 text-white p-2 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
                        {isPending ? "Đang lưu..." : "+ Thêm HĐ"}
                    </button>
                </div>
            </form>

            {/* Danh sách */}
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 uppercase text-xs sticky top-0 z-10">
                        <tr>
                            <th className="p-2">Nhân viên</th>
                            <th className="p-2">Loại HĐ</th>
                            <th className="p-2">Ngày bắt đầu</th>
                            <th className="p-2">Ngày kết thúc</th>
                            <th className="p-2">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {contracts.map((c: any) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="p-2 font-medium">{c.employee?.fullName || 'N/A'}</td>
                                <td className="p-2 font-bold text-blue-700 text-xs">
                                    {c.type === 'FULL_TIME' && "Toàn TG"}
                                    {c.type === 'PART_TIME' && "Bán TG"}
                                    {c.type === 'CONTRACT' && "Thời vụ"}
                                    {c.type === 'PROBATION' && "Thử việc"}
                                </td>
                                <td className="p-2">{new Date(c.startDate).toLocaleDateString("vi-VN")}</td>
                                <td className="p-2">{c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "Vô thời hạn"}</td>
                                <td className="p-2">
                                    {c.isActive ? <span className="text-green-600 font-bold">Hiệu lực</span> : <span className="text-gray-400">Hết hiệu lực</span>}
                                </td>
                            </tr>
                        ))}
                        {contracts.length === 0 && (
                            <tr><td colSpan={5} className="text-center p-4 text-gray-500 text-xs">Chưa có hợp đồng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
