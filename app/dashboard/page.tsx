import { Suspense } from "react";
import HeaderSkeleton from "@/components/Skeleton/HeaderSkeleton";
import Header from "@/components/Header";
import TodayCard from "@/components/TodayCard";
import Last7DaysCard from "@/components/Last7DaysCard";
import RecentSleepLog from "@/components/RecentSleepLog";
import SleepChartWrapper from "@/components/SleepChartWrapper";
import NapChartWrapper from "@/components/NapChartWrapper";
import MoodChartWrapper from "@/components/MoodChartWrapper";
import TodayCardSkeleton from "@/components/Skeleton/TodayCardSkeleton";
import RecentSleepLogSkeleton from "@/components/Skeleton/RecentSleepLogSkeleton";
import Last7DaysCardSkeleton from "@/components/Skeleton/Last7DaysCardSkeleton";
import SleepChartWrapperSkeleton from "@/components/Skeleton/SleepChartWrapperSkeleton";
import MoodChartWrapperSkeleton from "@/components/Skeleton/MoodChartWrapperSkeleton";
import NapChartWrapperSkeleton from "@/components/NapChartWrapper";

export default async function DashboardPage() {
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
            <SleepChartWrapper />
          </Suspense>
          <Suspense fallback={<MoodChartWrapperSkeleton />}>
            <MoodChartWrapper />
          </Suspense>
          <Suspense fallback={<NapChartWrapperSkeleton />}>
            <NapChartWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
