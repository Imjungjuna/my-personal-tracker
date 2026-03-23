import { getCachedUser, getCachedSleepLogs7Days } from "@/lib/dal";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";

const RECENT_DAYS = 6; //test caching

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function durationMinutes(bedTime: string, wakeTime: string): number {
  const bed = new Date(bedTime).getTime();
  const wake = new Date(wakeTime).getTime();
  let diff = (wake - bed) / 60_000;
  if (diff < 0) diff += 24 * 60;
  return Math.round(diff);
}

export default async function SleepChartWrapper() {
  const user = await getCachedUser();

  const today = getTodayISO();
  const fromDate = getDateDaysAgo(RECENT_DAYS); //test caching

  const recentLogs = await getCachedSleepLogs7Days(user.id, fromDate);

  const logsWithDuration = recentLogs
    .filter((row) => row.sleep_date <= today)
    .map((row) => ({
      sleep_date: row.sleep_date,
      bed_time: row.bed_time,
      wake_time: row.wake_time,
      durationMinutes: durationMinutes(row.bed_time, row.wake_time),
    }));

  return <SleepCharts logs={logsWithDuration} />;
}

//수면 기록은 원래 쿼리에 lte로 오늘 날짜까지 제한하는 조건이 있었어. DAL 함수는 gte 조건만 가지고 있으니, 자바스크립트의 filter 메서드를 사용해서 오늘 날짜 이후의 미래 데이터가 있다면 걸러내도록 처리했어.
