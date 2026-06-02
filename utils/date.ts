export function getISODaysAgo(days: number): string {
  const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
  kstDate.setUTCDate(kstDate.getUTCDate() - days);
  return kstDate.toISOString().slice(0, 10);
} // output example: "2026-06-03"

export function getTodayISO() {
  return getISODaysAgo(0);
}

export function durationMinutes(bedTime: string, wakeTime: string): number {
  const bed = new Date(bedTime).getTime();
  const wake = new Date(wakeTime).getTime();
  const diff = Math.round((wake - bed) / 60_000);
  // 자정을 넘기는 경우(취침 > 기상) 하루치 분을 더함
  return diff < 0 ? diff + 24 * 60 : diff;
}

export function getTodayStartTs() {
  const todayDate = getISODaysAgo(0);
  return new Date(`${todayDate}T00:00:00+09:00`).toISOString();
}

export function getLogTimeFromDaysAgo(days: number): string {
  const targetDate = getISODaysAgo(days);
  return new Date(`${targetDate}T00:00:00+09:00`).toISOString();
}

export const MOOD_LABELS: Record<number, string> = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
};

export const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
};
