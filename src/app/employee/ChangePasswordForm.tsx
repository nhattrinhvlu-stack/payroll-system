"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/actions/auth";
import toast from "react-hot-toast";

export default function ChangePasswordForm() {
  const [state, action, isPending] = useActionState(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success(state.success);
      formRef.current?.reset(); // Reset form sau khi thành công
    }
  }, [state]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        🔒 Đổi Mật Khẩu
      </h3>
      
      <form ref={formRef} action={action} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Mật khẩu cũ</label>
          <input 
            name="oldPassword" 
            type="password" 
            placeholder="••••••"
            required
            className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Mật khẩu mới</label>
            <input 
              name="newPassword" 
              type="password" 
              placeholder="Mới..."
              required
              minLength={6}
              className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Nhập lại mới</label>
            <input 
              name="confirmPassword" 
              type="password" 
              placeholder="Xác nhận..."
              required
              minLength={6}
              className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
        </div>

        <button 
          disabled={isPending}
          className="w-full bg-gray-800 text-white py-2 rounded font-bold text-sm hover:bg-black transition disabled:opacity-50 mt-2"
        >
          {isPending ? "Đang xử lý..." : "Lưu Mật Khẩu Mới"}
        </button>
      </form>
    </div>
  );
}