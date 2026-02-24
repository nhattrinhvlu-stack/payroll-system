"use client";

import { useState, useEffect, useTransition } from "react";
import { getEmployeeDetailByMonth } from "@/actions/director";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
    employeeId: string;
}

export default function EmployeeDetailClient({ employeeId }: Props) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData(month, year);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = (m: number, y: number) => {
        setLoading(true);
        startTransition(async () => {
            const res = await getEmployeeDetailByMonth(employeeId, m, y);
            if (res.error) {
                toast.error(res.error);
            } else {
                setData(res);
            }
            setLoading(false);
        });
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(month, year);
    };

    if (!data && loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data && !loading) {
        return <div className="p-6 text-red-500 font-bold">Không tải được dữ liệu nhân viên!</div>;
    }

    const { employee, attendances, leaves, payroll } = data;

    // Tính toán tổng quan
    let totalWorkingDays = 0;
    let totalOvertimeHours = 0;
    attendances.forEach((att: any) => {
        totalWorkingDays += att.workingDays;
        totalOvertimeHours += att.overtime;
    });

    // Tìm các ngày nghỉ cụ thể trong tháng
    const firstDayOfMonth = new Date(year, month - 1, 1).getTime();
    const nextMonthFirstDay = new Date(year, month, 1).getTime();

    let totalLeaveDaysInMonth = 0;
    const leaveDaysDetails: { date: string; type: string; reason: string; status: string }[] = [];

    leaves.forEach((l: any) => {
        let current = new Date(l.startDate).getTime();
        const end = new Date(l.endDate).getTime();
        let currentDaysInMonth = 0;

        // Duyệt qua từng ngày của đơn nghỉ phép
        while (current <= end) {
            if (current >= firstDayOfMonth && current < nextMonthFirstDay) {
                // Ngày này nằm trong tháng đang xem
                currentDaysInMonth += 1;
                leaveDaysDetails.push({
                    date: new Date(current).toLocaleDateString("vi-VN"),
                    type: l.type,
                    reason: l.reason,
                    status: l.status,
                });
            }
            current += 24 * 60 * 60 * 1000; // +1 ngày
        }

        // Tổng số ngày nghỉ của đơn này trong tháng đang xem
        // (Lưu ý: Nếu l.totalDays là số thập phân, phần này có thể phức tạp hơn. Giả định đơn giản tính theo ngày chẵn)
        if (l.totalDays % 1 !== 0) {
            // Ví dụ nghỉ nửa ngày. Ta chia đều theo tỷ lệ hoặc lấy logic tổng quát.
            // Để đơn giản, ta lấy l.totalDays nếu toàn bộ đơn nằm trong tháng.
            const isCompletelyInMonth = new Date(l.startDate).getTime() >= firstDayOfMonth && new Date(l.endDate).getTime() < nextMonthFirstDay;
            if (isCompletelyInMonth) {
                currentDaysInMonth = l.totalDays; // Ghi đè lại bằng số ngày chính xác (vd: 0.5)
            }
        }

        if (l.status === "APPROVED") {
            totalLeaveDaysInMonth += currentDaysInMonth;
        }
    });

    return (
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/director" className="text-gray-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Quay lại danh sách
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 border-l-2 border-gray-300 pl-4">Chi tiết nhân sự: <span className="text-blue-600">{employee.fullName}</span></h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Card thông tin cơ bản */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Thông tin cơ bản</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Mã NV / Username:</span>
                            <span className="font-medium text-gray-800">@{employee.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Phòng ban:</span>
                            <span className="font-medium text-gray-800">{employee.department?.name || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Lương cơ bản:</span>
                            <span className="font-bold text-green-600">{employee.baseSalary.toLocaleString("vi-VN")} vnđ</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Trạng thái:</span>
                            <span>
                                {employee.isActive
                                    ? <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Đang làm việc</span>
                                    : <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Đã nghỉ việc / Khóa</span>
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Filter Tháng/Năm */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Chọn khoảng thời gian</h2>
                    <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tháng</label>
                            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg p-2 min-w-[120px] bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Năm</label>
                            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-gray-300 rounded-lg p-2 w-24 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min={2020} max={2099} />
                        </div>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                            {loading ? "Đang tải..." : "Xem dữ liệu"}
                        </button>
                    </form>

                    {/* Tổng quan tháng */}
                    {!loading && (
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="text-xs font-bold text-blue-600 uppercase mb-1">CÔNG ĐI LÀM</div>
                                <div className="text-2xl font-black text-gray-800">{totalWorkingDays} <span className="text-sm font-normal text-gray-500">ngày</span></div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                <div className="text-xs font-bold text-orange-600 uppercase mb-1">TĂNG CA</div>
                                <div className="text-2xl font-black text-gray-800">{totalOvertimeHours} <span className="text-sm font-normal text-gray-500">giờ</span></div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="text-xs font-bold text-red-600 uppercase mb-1">ĐÃ NGHỈ (DUYỆT)</div>
                                <div className="text-2xl font-black text-gray-800">{totalLeaveDaysInMonth} <span className="text-sm font-normal text-gray-500">ngày</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!loading && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Lịch sử điểm danh (Chấm công) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Chi tiết đi làm & tăng ca
                            </h2>
                        </div>
                        <div className="p-0 overflow-auto max-h-[500px]">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white sticky top-0 z-10 shadow-sm text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="p-3 font-bold">Ngày</th>
                                        <th className="p-3 font-bold text-center">Công</th>
                                        <th className="p-3 font-bold text-center">Tăng ca</th>
                                        <th className="p-3 font-bold">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {attendances.length === 0 ? (
                                        <tr><td colSpan={4} className="p-6 text-center text-gray-400 italic">Chưa có dữ liệu chấm công tháng này</td></tr>
                                    ) : (
                                        attendances.map((att: any) => (
                                            <tr key={att.id} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium text-gray-800">{new Date(att.date).toLocaleDateString("vi-VN")}</td>
                                                <td className="p-3 text-center font-bold text-blue-600">{att.workingDays}</td>
                                                <td className="p-3 text-center">
                                                    {att.overtime > 0 ? <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">+{att.overtime}h</span> : "-"}
                                                </td>
                                                <td className="p-3 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs" title={att.note}>{att.note || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chi tiết đơn từ (Nghỉ phép) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Chi tiết ngày xin nghỉ
                            </h2>
                        </div>
                        <div className="p-0 overflow-auto max-h-[500px]">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white sticky top-0 z-10 shadow-sm text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="p-3 font-bold">Ngày nghỉ</th>
                                        <th className="p-3 font-bold">Loại đơn</th>
                                        <th className="p-3 font-bold">Lý do</th>
                                        <th className="p-3 font-bold">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaveDaysDetails.length === 0 ? (
                                        <tr><td colSpan={4} className="p-6 text-center text-gray-400 italic">Không có đăng ký ngày nghỉ nào trong tháng</td></tr>
                                    ) : (
                                        leaveDaysDetails.map((ld, i) => (
                                            <tr key={i} className="hover:bg-red-50/30">
                                                <td className="p-3 font-bold text-gray-800">{ld.date}</td>
                                                <td className="p-3">
                                                    {ld.type === 'ANNUAL' && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Nghỉ phép năm</span>}
                                                    {ld.type === 'SICK' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">Nghỉ ốm</span>}
                                                    {ld.type === 'UNPAID' && <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">Không lương</span>}
                                                    {ld.type === 'OTHER' && <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">Khác</span>}
                                                </td>
                                                <td className="p-3 text-gray-600 truncate max-w-xs">{ld.reason}</td>
                                                <td className="p-3">
                                                    {ld.status === "APPROVED" && <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Đã duyệt</span>}
                                                    {ld.status === "PENDING" && <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded">Chờ duyệt</span>}
                                                    {ld.status === "REJECTED" && <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">Từ chối</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Danh sách đơn gốc (tham khảo) */}
                            {leaves.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 p-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Đơn xin nghỉ trong kỳ ({leaves.length})</h3>
                                    <div className="space-y-2">
                                        {leaves.map((l: any, i: number) => (
                                            <div key={l.id} className="bg-gray-50 p-2 rounded text-xs text-gray-600 border border-gray-100">
                                                <span className="font-bold text-gray-800">Đơn {i + 1}:</span> Từ {new Date(l.startDate).toLocaleDateString("vi-VN")} đến {new Date(l.endDate).toLocaleDateString("vi-VN")}
                                                <span className="mx-2 text-gray-300">|</span> Tổng: <span className="font-bold text-red-500">{l.totalDays}</span> ngày
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
