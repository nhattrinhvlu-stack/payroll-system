import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Action cập nhật cài đặt ngay trong file này cho tiện
async function updateSettings(formData: FormData) {
  "use server";
  
  const standardWorkDays = parseInt(formData.get("standardWorkDays") as string);
  const overtimeMultiplier = parseFloat(formData.get("overtimeMultiplier") as string);
  const gasPricePerKm = parseFloat(formData.get("gasPricePerKm") as string);
  const lunchAllowance = parseFloat(formData.get("lunchAllowance") as string);

  // Lưu vào ID mặc định là "default"
  await db.globalSettings.upsert({
    where: { id: "default" },
    update: { standardWorkDays, overtimeMultiplier, gasPricePerKm, lunchAllowance },
    create: { id: "default", standardWorkDays, overtimeMultiplier, gasPricePerKm, lunchAllowance },
  });

  revalidatePath("/settings");
}

export default async function SettingsPage() {
  // Lấy cài đặt hiện tại
  const settings = await db.globalSettings.findUnique({ where: { id: "default" } });

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">⚙️ Cài đặt hệ thống</h1>
      <p className="text-gray-500 mb-8">Thiết lập các thông số tính lương dành cho Giám đốc.</p>

      <form action={updateSettings} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="space-y-6">
          
          {/* 1. Công chuẩn */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Số ngày công chuẩn / tháng</label>
            <div className="flex items-center">
              <input 
                name="standardWorkDays" 
                type="number" 
                defaultValue={settings?.standardWorkDays ?? 26} 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <span className="ml-3 text-gray-500 font-medium">ngày</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Dùng để tính lương 1 ngày công (Lương CB / ngày công chuẩn)</p>
          </div>

          <hr />

          {/* 2. Hệ số tăng ca */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Hệ số tính Tăng ca (Overtime)</label>
            <div className="flex items-center">
              <input 
                name="overtimeMultiplier" 
                type="number" 
                step="0.1" 
                defaultValue={settings?.overtimeMultiplier ?? 1.5} 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <span className="ml-3 text-gray-500 font-medium">lần</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">VD: 1.5 nghĩa là làm 1 tiếng tăng ca = 1.5 tiếng bình thường.</p>
          </div>

          <hr />

          {/* 3. Tiền xăng */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Định mức hỗ trợ Xăng xe</label>
            <div className="flex items-center">
              <input 
                name="gasPricePerKm" 
                type="number" 
                defaultValue={settings?.gasPricePerKm ?? 5000} 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <span className="ml-3 text-gray-500 font-medium">VNĐ / km</span>
            </div>
          </div>

           {/* 4. Tiền ăn */}
           <div>
            <label className="block font-bold text-gray-700 mb-1">Phụ cấp ăn trưa</label>
            <div className="flex items-center">
              <input 
                name="lunchAllowance" 
                type="number" 
                defaultValue={settings?.lunchAllowance ?? 25000} 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <span className="ml-3 text-gray-500 font-medium">VNĐ / ngày</span>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-800 text-white p-4 rounded-lg font-bold hover:bg-blue-900 shadow-md transition-all">
            💾 Lưu Cấu Hình
          </button>
        </div>
      </form>
    </div>
  );
}