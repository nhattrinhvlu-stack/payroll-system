// Các hàm tính lương dùng chung cho lương tháng và lương ngày.

export interface FuelSettings {
  fuelPrice1to15: number;
  fuelPrice20to30: number;
  fuelPriceAbove30: number;
}

// Trả về mức hỗ trợ xăng cố định (VNĐ/ngày) theo bán kính. km=0 không tính.
export function getDailyFuelAllowance(km: number, settings: FuelSettings): number {
  if (km <= 0) return 0;
  if (km <= 15) return settings.fuelPrice1to15;
  if (km <= 30) return settings.fuelPrice20to30;
  return settings.fuelPriceAbove30;
}

export interface DailyPayInputs {
  dailyWage: number;
  workingDays: number;
  overtime: number;
  kmTraveled: number;
  dailyAllowance: number;
  dailyAdvance: number;
}

export interface DailyPayBreakdown {
  wage: number;          // dailyWage * workingDays
  overtimePay: number;   // tiền tăng ca
  fuel: number;          // hỗ trợ xăng
  allowance: number;     // hỗ trợ thêm trong ngày
  advance: number;       // tạm ứng (trừ)
  total: number;         // thành tiền ngày
}

// Tính tiền 1 ngày cho nhân viên lương ngày.
// Tăng ca = overtime giờ * (dailyWage/8) * overtimeRatio. Không trừ BHXH cho lương ngày.
export function computeDailyPay(
  inp: DailyPayInputs,
  settings: FuelSettings & { overtimeRatio: number }
): DailyPayBreakdown {
  const wage = inp.dailyWage * inp.workingDays;
  const overtimePay = inp.overtime * (inp.dailyWage / 8) * settings.overtimeRatio;
  const fuel = getDailyFuelAllowance(inp.kmTraveled, settings);
  const allowance = inp.dailyAllowance;
  const advance = inp.dailyAdvance;
  const total = wage + overtimePay + fuel + allowance - advance;
  return { wage, overtimePay, fuel, allowance, advance, total };
}
