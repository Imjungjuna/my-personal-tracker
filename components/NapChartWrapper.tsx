import { getCachedUser, getCachedNapLogs7Days } from "@/lib/dal";
import {
  NapChart,
  type NapLogForChart,
} from "@/app/dashboard/(with-nav)/nap-checkin/NapChart";

export default async function NapChartWrapper() {
  const user = await getCachedUser();

  const napResultPromise = getCachedNapLogs7Days(user.id);

  return <NapChart napPromise={napResultPromise} />;
}
