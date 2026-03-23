import { getCachedUser, getCachedMoodLogs7Days } from "@/lib/dal";
import {
  MoodChart,
  type MoodLogForChart,
} from "@/app/dashboard/(with-nav)/mood-checkin/MoodChart";

const RECENT_DAYS = 6;

function getLogTimeFromDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function MoodChartWrapper() {
  const user = await getCachedUser();
  const fromTs = getLogTimeFromDaysAgo(RECENT_DAYS);

  const moodResult = await getCachedMoodLogs7Days(user.id, fromTs);

  const moodLogs: MoodLogForChart[] = moodResult.map((row) => ({
    log_time: row.log_time,
    score: row.score,
  }));

  return <MoodChart logs={moodLogs} />;
}
