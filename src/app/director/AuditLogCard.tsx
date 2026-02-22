"use client";

interface Props {
    auditLogs: any[];
}

export default function AuditLogCard({ auditLogs }: Props) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4">Lịch sử Hệ thống (Audit Log)</h3>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 uppercase text-xs sticky top-0 z-10">
                        <tr>
                            <th className="p-2">Thời gian</th>
                            <th className="p-2">Người dùng</th>
                            <th className="p-2">Hành động</th>
                            <th className="p-2">Đối tượng</th>
                            <th className="p-2">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y relative">
                        {auditLogs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50 text-xs text-gray-600">
                                <td className="p-2 whitespace-nowrap text-gray-400">
                                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                                </td>
                                <td className="p-2 font-bold text-gray-700">{log.actorName}</td>
                                <td className="p-2">
                                    <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-2 font-medium">{log.target}</td>
                                <td className="p-2 italic text-gray-500">{log.detail || "-"}</td>
                            </tr>
                        ))}
                        {auditLogs.length === 0 && (
                            <tr><td colSpan={5} className="text-center p-4 text-gray-500">Chưa có dữ liệu hệ thống.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
