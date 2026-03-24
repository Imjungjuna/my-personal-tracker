import { getCachedUser, getCachedNapLogs7Days } from "@/lib/dal";
import {
  NapChart,
  type NapLogForChart,
} from "@/app/dashboard/(with-nav)/nap-checkin/NapChart";
import { durationMinutes, getLogTimeFromDaysAgo } from "@/utils/date";

export default async function NapChartWrapper() {
  const user = await getCachedUser();

  const napResult = await getCachedNapLogs7Days(user.id);

  const napLogsWithDuration: NapLogForChart[] = napResult.map((row) => ({
    start_time: row.start_time,
    end_time: row.end_time,
    durationMinutes: durationMinutes(row.start_time, row.end_time),
  }));

  return <NapChart logs={napLogsWithDuration} />;
}
