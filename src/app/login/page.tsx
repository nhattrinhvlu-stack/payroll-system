"use client";

import { login } from "@/actions/auth";
import { useActionState } from "react";

// State ban đầu của form
const initialState = {
  error: "",
};

export default function LoginPage() {
  // useActionState giúp hứng lỗi trả về từ Server Action
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await login(formData);
    if (result?.error) {
      return { error: result.error };
    }
    return { error: "" };
  }, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Payroll System</h1>
          <p className="text-gray-500 mt-2">Đăng nhập hệ thống</p>
        </div>

        <form action={formAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
            <input 
              name="username" 
              type="text" 
              required 
              placeholder="admin"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {state.error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
              ⚠️ {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-70"
          >
            {isPending ? "Đang xử lý..." : "ĐĂNG NHẬP"}
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-400 mt-6">
          Hệ thống quản lý nội bộ - Vui lòng không chia sẻ tài khoản.
        </p>
      </div>
    </div>
  );
}