import { Suspense } from "react";
import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";
import HeaderSkeleton from "@/components/Skeleton/HeaderSkeleton";
import Header from "@/components/Header";
import TodayCard from "@/components/TodayCard";
import Last7DaysCard from "@/components/Last7DaysCard";
import RecentSleepLog from "@/components/RecentSleepLog";
import TodayCardSkeleton from "@/components/Skeleton/TodayCardSkeleton";
import RecentSleepLogSkeleton from "@/components/Skeleton/RecentSleepLogSkeleton";
import Last7DaysCardSkeleton from "@/components/Skeleton/Last7DaysCardSkeleton";
import SleepChartWrapperSkeleton from "@/components/Skeleton/SleepChartWrapperSkeleton";
import MoodChartWrapperSkeleton from "@/components/Skeleton/MoodChartWrapperSkeleton";
import NapChartWrapperSkeleton from "@/components/Skeleton/NapChartWrapperSkeleton";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";
import { MoodChart } from "@/app/dashboard/(with-nav)/mood-checkin/MoodChart";
import { NapChart } from "@/app/dashboard/(with-nav)/nap-checkin/NapChart";

export default async function DashboardPage() {
  const user = await getCachedUser();

  const sleepPromise = getCachedSleepLogs7Days(user.id);
  const moodPromise = getCachedMoodLogs7Days(user.id);
  const napPromise = getCachedNapLogs7Days(user.id);

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 sm:py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl space-y-0">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>

        <div className="flex flex-col md:flex-row lg:gap-12 gap-6">
          <Suspense fallback={<TodayCardSkeleton />}>
            <TodayCard />
          </Suspense>
          <Suspense fallback={<Last7DaysCardSkeleton />}>
            <Last7DaysCard />
          </Suspense>
        </div>
        <Suspense fallback={<RecentSleepLogSkeleton />}>
          <RecentSleepLog />
        </Suspense>

        <div className="grid gap-0 lg:grid-cols-3 lg:gap-6 py-6">
          <Suspense fallback={<SleepChartWrapperSkeleton />}>
            <SleepCharts sleepPromise={sleepPromise} />
          </Suspense>
          <Suspense fallback={<MoodChartWrapperSkeleton />}>
            <MoodChart moodPromise={moodPromise} />
          </Suspense>
          <Suspense fallback={<NapChartWrapperSkeleton />}>
            <NapChart napPromise={napPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
