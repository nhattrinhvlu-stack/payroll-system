"use client";

interface Props {
    payroll: any;
}

export default function PrintablePayslip({ payroll }: Props) {
    if (!payroll) return null;
    const emp = payroll.employee;

    return (
        <div className="hidden print:block print-area bg-white text-black p-8 max-w-4xl mx-auto font-sans text-sm">
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest">PHIẾU LƯƠNG NHÂN VIÊN</h1>
                    <p className="text-gray-600 mt-1">Tháng {payroll.month} Năm {payroll.year}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{emp.fullName}</p>
                    <p className="text-gray-600">Phòng ban: {emp.department?.name || "N/A"}</p>
                    <p className="text-gray-600">SĐT: {emp.phone || "N/A"}</p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-8">
                <div>
                    <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">1. THÔNG TIN CÔNG</h3>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Lương cơ bản:</span> <b>{new Intl.NumberFormat('vi-VN').format(payroll.baseSalary)} ₫</b></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Công chuẩn:</span> <b>{payroll.standardDays} ngày</b></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Thực tế (Công):</span> <b>{payroll.actualWorkDays} ngày</b></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Lương theo công:</span> <b>{new Intl.NumberFormat('vi-VN').format((payroll.baseSalary / payroll.standardDays) * payroll.actualWorkDays)} ₫</b></div>
                </div>
                <div>
                    <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">2. TĂNG CA & PHỤ CẤP</h3>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Lương Tăng ca ({payroll.overtimeHours}h):</span> <b>{new Intl.NumberFormat('vi-VN').format(payroll.overtimeSalary)} ₫</b></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Trách nhiệm:</span> <b>{new Intl.NumberFormat('vi-VN').format(payroll.responsibility)} ₫</b></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Điện thoại:</span> <b>{new Intl.NumberFormat('vi-VN').format(payroll.phoneAllowance)} ₫</b></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Xăng xe ({payroll.kmTraveled}km):</span> <b>{new Intl.NumberFormat('vi-VN').format(payroll.fuelAllowance)} ₫</b></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-600">Khác:</span> <b>{new Intl.NumberFormat('vi-VN').format(payroll.otherAllowance)} ₫</b></div>
                </div>
            </div>

            <div className="mb-6 border border-gray-300 p-4 rounded bg-gray-50">
                <h3 className="font-bold border-b border-gray-300 pb-1 mb-2 text-red-700">3. CÁC KHOẢN TRỪ</h3>
                <div className="flex justify-between mb-1"><span className="text-gray-600">Trừ BHXH:</span> <b className="text-red-600">-{new Intl.NumberFormat('vi-VN').format(payroll.insurance)} ₫</b></div>
                <div className="flex justify-between mb-1"><span className="text-gray-600">Đã tạm ứng:</span> <b className="text-red-600">-{new Intl.NumberFormat('vi-VN').format(payroll.advancePayment)} ₫</b></div>
            </div>

            <div className="border-t-2 border-black pt-4 flex justify-between items-end">
                <div>
                    <p className="italic text-gray-500">In lúc: {new Date().toLocaleString("vi-VN")}</p>
                </div>
                <div className="text-right">
                    <p className="uppercase font-bold text-gray-500 text-sm mb-1">Tổng Thực Lĩnh</p>
                    <p className="text-3xl font-black text-black">{new Intl.NumberFormat('vi-VN').format(payroll.totalSalary)} ₫</p>
                </div>
            </div>

            {/* Break page when printing multiple */}
            <div className="break-after-page"></div>
        </div>
    );
}
