"use client";

import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PrintablePayslip from "@/components/PrintablePayslip";
import { calculateMonthlyPayroll, approvePayroll } from "@/actions/payroll";

export default function AccountantPageClient({ currentMonth, payrolls }: { currentMonth: number, payrolls: any[] }) {
    const [printFilterMonth, setPrintFilterMonth] = useState(currentMonth.toString());

    // Lọc payrolls để in
    const payrollsToPrint = payrolls.filter(p => printFilterMonth === "" || p.month.toString() === printFilterMonth);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                        <h2 className="text-sm font-black text-indigo-400 uppercase mb-4 tracking-widest">Tính lương tháng</h2>
                        <form action={async (formData) => {
                            const res = await calculateMonthlyPayroll(formData);
                            if (res.error) toast.error(res.error);
                            else toast.success(res.success || "Thành công");
                        }} className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Tháng</label>
                                <input name="month" type="number" defaultValue={currentMonth} min="1" max="12" className="w-full border-2 border-gray-100 p-2 rounded-xl focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl font-bold transition">
                                Tính
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                        <h2 className="text-sm font-black text-indigo-400 uppercase mb-4 tracking-widest">In Phiếu Lương Hàng Loạt</h2>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Lọc theo Tháng</label>
                                <input type="number" value={printFilterMonth} onChange={(e) => setPrintFilterMonth(e.target.value)} min="1" max="12" className="w-full border-2 border-gray-100 p-2 rounded-xl focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <button onClick={() => window.print()} className="bg-gray-800 hover:bg-black text-white p-2.5 rounded-xl font-bold transition flex items-center gap-2">
                                🖨️ In PDF ({payrollsToPrint.length})
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 italic">Lưu ý: Chỉ in những phiếu lương đang hiển thị bên phải theo bộ lọc tháng.</p>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-indigo-500/10 overflow-hidden text-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-indigo-50 text-indigo-900">
                                    <th className="p-4 font-black uppercase">Nhân viên</th>
                                    <th className="p-4 text-center font-black uppercase">Tháng</th>
                                    <th className="p-4 text-right font-black uppercase">Thực lĩnh</th>
                                    <th className="p-4 text-center font-black uppercase">Trạng thái</th>
                                    <th className="p-4 text-right font-black uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payrollsToPrint.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Không có dữ liệu phiếu lương cho tháng này.</td></tr>
                                )}
                                {payrollsToPrint.map((p) => (
                                    <tr key={p.id} className="hover:bg-indigo-50/30">
                                        <td className="p-4 font-bold text-gray-800">{p.employee.fullName}</td>
                                        <td className="p-4 text-center text-gray-500">{p.month}/{p.year}</td>
                                        <td className="p-4 text-right font-black text-indigo-600">
                                            {new Intl.NumberFormat('vi-VN').format(p.totalSalary)}đ
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-gray-100">
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {p.status === "DRAFT" && (
                                                <form action={async (formData) => {
                                                    const res = await approvePayroll(formData);
                                                    if (res.error) toast.error(res.error);
                                                    else toast.success(res.success || "Thành công");
                                                }}>
                                                    <input type="hidden" name="id" value={p.id} />
                                                    <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition">
                                                        Gửi duyệt
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- VÙNG IN TRÊN BẢN PDF --- */}
            <div className="hidden print:block print-area">
                {payrollsToPrint.map(p => (
                    <PrintablePayslip key={p.id} payroll={p} />
                ))}
            </div>
        </>
    );
}
