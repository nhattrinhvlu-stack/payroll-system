"use client"; // <-- Quan trọng: Đánh dấu file này chạy ở Client

import { useRouter } from "next/navigation";

export default function DateSelector({ date }: { date: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <span className="font-bold text-gray-700">📅 Chọn ngày làm việc:</span>
      <input 
        type="date" 
        defaultValue={date}
        // Khi chọn ngày -> Đổi URL -> Trang sẽ tự load lại dữ liệu mới
        onChange={(e) => {
           router.push(`?date=${e.target.value}`);
        }}
        className="border-2 border-indigo-100 rounded-lg px-3 py-2 font-bold text-indigo-700 outline-none focus:border-indigo-500 cursor-pointer"
      />
    </div>
  );
}