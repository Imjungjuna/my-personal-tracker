import { getCachedUser, getCachedMoodLogs7Days } from "@/lib/dal";
import {
  MoodChart,
  type MoodLogForChart,
} from "@/app/dashboard/(with-nav)/mood-checkin/MoodChart";
import { getLogTimeFromDaysAgo } from "@/utils/date";

export default async function MoodChartWrapper() {
  const user = await getCachedUser();

  const moodResult = await getCachedMoodLogs7Days(user.id);

  const moodLogs: MoodLogForChart[] = moodResult.map((row) => ({
    log_time: row.log_time,
    score: row.score,
  }));

  return <MoodChart logs={moodLogs} />;
}
