export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import ChangePasswordForm from "@/app/employee/ChangePasswordForm";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (session) return JSON.parse(session.value);
  } catch {}
  return null;
}

export default async function WarehousePage() {
  const session = await getSession();
  if (!session || !["WAREHOUSE", "DIRECTOR"].includes(session.role)) {
    redirect("/login");
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-indigo-900 tracking-tight">📦 QUẢN LÝ VẬT TƯ (THỦ KHO)</h1>
        <form action={logout}>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md">
            Đăng xuất
          </button>
        </form>
      </div>

      {/* --- QUẢN LÝ VẬT TƯ --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">📦 Quản lý Vật Tư</h2>
        <a
          href="/warehouse/inventory"
          className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-md hover:border-blue-300 transition group"
        >
          <div className="bg-blue-100 text-blue-700 text-2xl w-12 h-12 rounded-xl flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition">
            📦
          </div>
          <div>
            <div className="font-bold text-gray-800">Mở trang Quản lý Vật Tư</div>
            <div className="text-sm text-gray-500">Nhập kho, xuất kho, xem tồn kho và lịch sử giao dịch</div>
          </div>
          <span className="ml-auto text-gray-400 group-hover:text-blue-600 text-lg">→</span>
        </a>
      </div>

      {/* --- TÀI KHOẢN --- */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">👤 Tài Khoản Của Tôi</h2>
        <div className="max-w-md">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
