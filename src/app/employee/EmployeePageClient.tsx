"use client";

export default function EmployeePageClient() {
    return (
        <button onClick={() => window.print()} className="bg-gray-800 hover:bg-black text-white px-2 py-1 rounded shadow text-[10px] font-bold no-print flex items-center gap-1 transition">
            🖨️ In PDF
        </button>
    );
}
