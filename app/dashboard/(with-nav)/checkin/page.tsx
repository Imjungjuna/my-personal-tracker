import { getTodayISO } from "@/utils/date";
import { getCachedUser, getLatestSleepLog, getCachedSleepLogs7Days } from "@/lib/dal";
import { SleepLogForm } from "./SleepLogForm";
import { SleepCharts } from "./SleepCharts";
import { Suspense } from "react";
import SleepChartWrapperSkeleton from "@/components/Skeleton/SleepChartWrapperSkeleton";
import { SleepyDog } from "@/components/SleepyDog";

export default async function CheckinPage() {
  const today = getTodayISO();
  const user = await getCachedUser();
  const [initialLog, sleepLogs] = await Promise.all([
    getLatestSleepLog(user.id),
    getCachedSleepLogs7Days(user.id),
  ]);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <SleepyDog state="sleeping" size="sm" />
          <h1 className="text-xl font-extrabold text-bark-dark">수면 기록</h1>
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <SleepLogForm today={today} initialLog={initialLog} />
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <Suspense fallback={<SleepChartWrapperSkeleton />}>
            <SleepCharts sleepPromise={Promise.resolve(sleepLogs)} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
