export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function updateSettings(formData: FormData) {
  "use server";

  const standardWorkDays = parseInt(formData.get("standardWorkDays") as string);
  const overtimeRatio = parseFloat(formData.get("overtimeRatio") as string);
  const fuelPrice1to15 = parseFloat(formData.get("fuelPrice1to15") as string);
  const fuelPrice20to30 = parseFloat(formData.get("fuelPrice20to30") as string);
  const fuelPriceAbove30 = parseFloat(formData.get("fuelPriceAbove30") as string);

  await db.globalSettings.upsert({
    where: { id: "default" },
    update: { standardWorkDays, overtimeRatio, fuelPrice1to15, fuelPrice20to30, fuelPriceAbove30 },
    create: { id: "default", standardWorkDays, overtimeRatio, fuelPrice1to15, fuelPrice20to30, fuelPriceAbove30 },
  });

  revalidatePath("/setting");
}

export default async function SettingsPage() {
  const settings = await db.globalSettings.findUnique({ where: { id: "default" } });

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">⚙️ Cài đặt hệ thống</h1>
      <p className="text-gray-500 mb-8">Thiết lập các thông số tính lương dành cho Giám đốc.</p>

      <form action={updateSettings} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="space-y-6">

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
          </div>

          <hr />

          <div>
            <label className="block font-bold text-gray-700 mb-1">Hệ số tính Tăng ca (Overtime)</label>
            <div className="flex items-center">
              <input
                name="overtimeRatio"
                type="number"
                step="0.1"
                defaultValue={settings?.overtimeRatio ?? 1.5}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="ml-3 text-gray-500 font-medium">lần</span>
            </div>
          </div>

          <hr />

          <div>
            <label className="block font-bold text-gray-700 mb-2">Định mức hỗ trợ Xăng xe (theo bán kính)</label>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bán kính 1 – 15 km</p>
                <div className="flex items-center">
                  <input
                    name="fuelPrice1to15"
                    type="number"
                    defaultValue={settings?.fuelPrice1to15 ?? 3000}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="ml-3 text-gray-500 font-medium whitespace-nowrap">VNĐ / km</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Bán kính 20 – 30 km</p>
                <div className="flex items-center">
                  <input
                    name="fuelPrice20to30"
                    type="number"
                    defaultValue={settings?.fuelPrice20to30 ?? 4000}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="ml-3 text-gray-500 font-medium whitespace-nowrap">VNĐ / km</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Bán kính trên 30 km</p>
                <div className="flex items-center">
                  <input
                    name="fuelPriceAbove30"
                    type="number"
                    defaultValue={settings?.fuelPriceAbove30 ?? 5000}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="ml-3 text-gray-500 font-medium whitespace-nowrap">VNĐ / km</span>
                </div>
              </div>
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
