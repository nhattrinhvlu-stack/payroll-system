"use client";

import { createEmployee } from "@/actions/employee";
import { useRef } from "react";

export default function AddEmployeeForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800">✨ Thêm nhân viên mới</h3>
      
      {/* action={createEmployee} là phép màu kết nối thẳng về Server */}
      <form 
        action={async (formData) => {
          await createEmployee(formData);
          formRef.current?.reset(); // Xóa trắng form sau khi nhập xong
        }} 
        ref={formRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input name="fullName" placeholder="Họ và tên" required className="border p-2 rounded" />
        <input name="position" placeholder="Chức vụ (VD: Kỹ sư)" required className="border p-2 rounded" />
        <input name="department" placeholder="Phòng ban" required className="border p-2 rounded" />
        <input name="baseSalary" type="number" placeholder="Lương cơ bản (VNĐ)" required className="border p-2 rounded" />
        
        <button 
          type="submit" 
          className="col-span-1 md:col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold transition"
        >
          + Lưu nhân viên
        </button>
      </form>
    </div>
  );
}