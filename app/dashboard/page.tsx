import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isOnboardingComplete } from "@/lib/types/supabase";
import {
  SleepCharts,
  type SleepLogForChart,
} from "./(with-nav)/checkin/SleepCharts";
import {
  MoodChart,
  type MoodLogForChart,
} from "./(with-nav)/mood-checkin/MoodChart";
import {
  NapChart,
  type NapLogForChart,
} from "./(with-nav)/nap-checkin/NapChart";
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

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 sm:py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl space-y-0">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>

        <div className="flex flex-col md:flex-row gap-6">
          <Suspense fallback={<TodayCardSkeleton />}>
            <TodayCard />
          </Suspense>
          <Suspense fallback={<TodayCardSkeleton />}>
            <Last7DaysCard />
          </Suspense>
        </div>
        <Suspense fallback={<RecentSleepLogSkeleton />}>
          <RecentSleepLog />
        </Suspense>

        <div className="grid gap-0 lg:grid-cols-3 py-6">
          <Suspense
            fallback={
              <div className="h-64 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-2" />
            }
          >
            <SleepChartWrapper />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-64 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-2" />
            }
          >
            <MoodChartWrapper />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-64 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-2" />
            }
          >
            <NapChartWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
