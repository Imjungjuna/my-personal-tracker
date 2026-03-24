export function getDateDaysAgo(days: number): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstDate = new Date(utc + 9 * 3600000);

  kstDate.setDate(kstDate.getDate() - days);

  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayISO() {
  return getDateDaysAgo(0);
}

export function durationMinutes(bedTime: string, wakeTime: string): number {
  const bed = new Date(bedTime).getTime();
  const wake = new Date(wakeTime).getTime();
  return Math.round((wake - bed) / 60_000);
}

export function getTodayStartTs() {
  const todayDate = getDateDaysAgo(0);
  return new Date(`${todayDate}T00:00:00+09:00`).toISOString();
}

export function getLogTimeFromDaysAgo(days: number): string {
  const targetDate = getDateDaysAgo(days);
  return new Date(`${targetDate}T00:00:00+09:00`).toISOString();
}

export const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
};
