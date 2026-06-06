// app/dashboard/(with-nav)/page.tsx
import { Suspense } from "react";
import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
  getCachedConditionLogs7Days,
} from "@/lib/dal";
import { CheckinButtons } from "@/components/dashboard/CheckinButtons";
import { StatCards } from "@/components/dashboard/StatCards";
import { WeekConditionChart } from "@/components/dashboard/WeekConditionChart";
import { TodayMetricsCard } from "@/components/dashboard/TodayMetricsCard";
import { MoodLogList } from "@/components/dashboard/MoodLogList";
import { DogStatusWidget } from "@/components/DogStatusWidget";
import { SleepCharts } from "@/app/(app)/check-in/sleep/SleepCharts";
import { durationMinutes, getTodayISO, getTodayStartTs } from "@/utils/date";
import type { DogState } from "@/components/SleepyDog";

async function resolveDogState(): Promise<DogState> {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();
  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);
  const todaySleep = sleepLogs.find((l) => l.wake_date === todayISO);
  const todayMoodCount = moodLogs.filter(
    (l) => l.log_time >= todayStartTs,
  ).length;
  const todayNapCount = napLogs.filter(
    (l) => l.start_time >= todayStartTs,
  ).length;
  if (!todaySleep) return "waiting";
  const sleepMin = durationMinutes(todaySleep.bed_time, todaySleep.wake_time);
  if (todayMoodCount > 0 && todayNapCount > 0 && sleepMin >= 360)
    return "running";
  if (sleepMin >= 420) return "happy";
  if (sleepMin < 360) return "drowsy";
  return "sleeping";
}

export default async function DashboardPage() {
  const user = await getCachedUser();
  const dogState = await resolveDogState();

  const sleepPromise = getCachedSleepLogs7Days(user.id);
  const conditionPromise = getCachedConditionLogs7Days(user.id);

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Seoul",
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-warm-white border-b border-[#E8D5C0] px-7 h-[58px] flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-bark-dark">대시보드</h1>
          <p className="text-[11px] text-bark-mid">
            오늘의 컨디션과 지난 일주일 기록을 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[11px] text-bark-mid bg-cream border border-[#E8C4A0] px-3 py-1 rounded-full">
            {todayLabel}
          </span>
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 bg-cream border border-[#E8C4A0] rounded-xl">
            <div className="w-7 h-7 rounded-full bg-paw-brown flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FDF6EC"
                strokeWidth={2}
                className="w-4 h-4"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[12px] font-bold text-bark-dark leading-tight">
                {user.email?.split("@")[0]}
              </span>
              <span className="text-[10px] text-bark-mid leading-tight">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-7 py-5 flex flex-col gap-4">
        {/* Check-in buttons */}
        <Suspense
          fallback={
            <div className="h-9 bg-[#F5EDE0] rounded-xl animate-pulse" />
          }
        >
          <CheckinButtons />
        </Suspense>

        {/* Stat cards */}
        <Suspense
          fallback={
            <div className="h-24 bg-[#F5EDE0] rounded-xl animate-pulse" />
          }
        >
          <StatCards />
        </Suspense>

        {/* Middle grid: 7-day chart + right panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
          <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-bark-dark flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-3.5 h-3.5 text-bark-mid"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                지난 7일 컨디션
              </h2>
              <a
                href="/dashboard/calendar"
                className="text-[11px] text-bark-mid bg-cream border border-[#E8C4A0] px-2.5 py-1 rounded-full"
              >
                캘린더 전체보기 →
              </a>
            </div>
            <Suspense
              fallback={<div className="h-28 bg-cream rounded animate-pulse" />}
            >
              <WeekConditionChart
                sleepPromise={sleepPromise}
                conditionPromise={conditionPromise}
              />
            </Suspense>
          </div>

          <div className="flex flex-col gap-4">
            <Suspense
              fallback={
                <div className="h-36 bg-[#F5EDE0] rounded-xl animate-pulse" />
              }
            >
              <TodayMetricsCard />
            </Suspense>
            <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0] text-center">
              <DogStatusWidget state={dogState} />
            </div>
          </div>
        </div>

        {/* Bottom grid: sleep chart + mood list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
            <h2 className="text-[13px] font-bold text-bark-dark mb-3 flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-3.5 h-3.5 text-bark-mid"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              7일 수면 시간
            </h2>
            <Suspense
              fallback={<div className="h-24 bg-cream rounded animate-pulse" />}
            >
              <SleepCharts sleepPromise={sleepPromise} />
            </Suspense>
          </div>
          <Suspense
            fallback={
              <div className="h-36 bg-[#F5EDE0] rounded-xl animate-pulse" />
            }
          >
            <MoodLogList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
