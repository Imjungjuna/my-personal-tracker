import type { CnsStatus } from "@/lib/cns-score";
import { getISODaysAgo, getTodayISO } from "@/utils/date";

export function cnsStatusColor(status: CnsStatus | null): string {
  switch (status) {
    case "Optimal":      return "#D4F0D4";
    case "Recovered":    return "#FFF3C4";
    case "Mild Fatigue": return "#FFE0B2";
    case "High Fatigue": return "#FFCDD2";
    default:             return "#F5EDE0";
  }
}

export type WeekDayData = {
  date: string;       // ISO "YYYY-MM-DD"
  label: string;      // "4" (day number)
  mentalCondition: number | null;
  physicalEnergy: number | null;
  muscleSoreness: number | null;
  sleepQuality: number | null;
  isToday: boolean;
};

export function buildWeekChartData(
  conditionLogs: Array<{ log_date: string; mental_condition: number; physical_energy: number; muscle_soreness: number }>,
  sleepLogs: Array<{ wake_date: string; sleep_quality: number | null }>,
): WeekDayData[] {
  const today = getTodayISO();
  return Array.from({ length: 7 }, (_, i) => {
    const date = getISODaysAgo(6 - i);
    const cond = conditionLogs.find((l) => l.log_date === date);
    const sleep = sleepLogs.find((l) => l.wake_date === date);
    return {
      date,
      label: date.slice(8), // day number
      mentalCondition:  cond?.mental_condition  ?? null,
      physicalEnergy:   cond?.physical_energy   ?? null,
      muscleSoreness:   cond?.muscle_soreness   ?? null,
      sleepQuality:     sleep?.sleep_quality    ?? null,
      isToday: date === today,
    };
  });
}
