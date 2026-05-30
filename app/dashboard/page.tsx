import { Suspense } from "react";
import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
  getTodayConditionLog,
  getTodaySleepLog,
} from "@/lib/dal";
import Header from "@/components/Header";
import TodayCard from "@/components/TodayCard";
import Last7DaysCard from "@/components/Last7DaysCard";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";
import { MoodChart } from "@/app/dashboard/(with-nav)/mood-checkin/MoodChart";
import { NapChart } from "@/app/dashboard/(with-nav)/nap-checkin/NapChart";
import { DogStatusWidget } from "@/components/DogStatusWidget";
import { CnsScoreCard } from "@/components/CnsScoreCard";
import { durationMinutes, getTodayISO, getTodayStartTs } from "@/utils/date";
import { calculateCnsScore } from "@/lib/cns-score";
import type { DogState } from "@/components/SleepyDog";
import type { CnsStatus } from "@/lib/cns-score";
import HeaderSkeleton from "@/components/Skeleton/HeaderSkeleton";
import TodayCardSkeleton from "@/components/Skeleton/TodayCardSkeleton";
import Last7DaysCardSkeleton from "@/components/Skeleton/Last7DaysCardSkeleton";
import SleepChartWrapperSkeleton from "@/components/Skeleton/SleepChartWrapperSkeleton";
import MoodChartWrapperSkeleton from "@/components/Skeleton/MoodChartWrapperSkeleton";
import NapChartWrapperSkeleton from "@/components/Skeleton/NapChartWrapperSkeleton";

async function resolveDogState(): Promise<DogState> {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  const todaySleep = sleepLogs.find((l) => l.sleep_date === todayISO);
  const todayMoodCount = moodLogs.filter((l) => l.log_time >= todayStartTs).length;
  const todayNapCount = napLogs.filter((l) => l.start_time >= todayStartTs).length;

  if (!todaySleep) return "waiting";

  const sleepMin = durationMinutes(todaySleep.bed_time, todaySleep.wake_time);

  if (todayMoodCount > 0 && todayNapCount > 0 && sleepMin >= 360) return "running";
  if (sleepMin >= 420) return "happy";
  if (sleepMin < 360) return "drowsy";
  return "sleeping";
}

async function resolveCnsScore(): Promise<{ score: number | null; status: CnsStatus | null }> {
  const user = await getCachedUser();
  const todayISO = getTodayISO();

  const [conditionLog, sleepLog] = await Promise.all([
    getTodayConditionLog(user.id, todayISO),
    getTodaySleepLog(user.id, todayISO),
  ]);

  if (!conditionLog || !sleepLog || sleepLog.sleep_quality == null) {
    return { score: null, status: null };
  }

  const sleepDuration = durationMinutes(sleepLog.bed_time, sleepLog.wake_time) / 60;
  const result = calculateCnsScore({
    sleepDuration,
    sleepQuality: sleepLog.sleep_quality,
    mentalCondition: conditionLog.mental_condition,
    physicalEnergy: conditionLog.physical_energy,
    muscleSoreness: conditionLog.muscle_soreness,
    didExercise: conditionLog.did_exercise,
    yesterdayRpe: conditionLog.yesterday_rpe,
    hrv: null,
  });

  return result;
}

export default async function DashboardPage() {
  const user = await getCachedUser();
  const dogState = await resolveDogState();
  const cnsResult = await resolveCnsScore();

  const sleepPromise = getCachedSleepLogs7Days(user.id);
  const moodPromise = getCachedMoodLogs7Days(user.id);
  const napPromise = getCachedNapLogs7Days(user.id);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 space-y-4">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DogStatusWidget state={dogState} />
          <Suspense fallback={<TodayCardSkeleton />}>
            <TodayCard />
          </Suspense>
        </div>

        <CnsScoreCard score={cnsResult.score} status={cnsResult.status} />

        <Suspense fallback={<Last7DaysCardSkeleton />}>
          <Last7DaysCard />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-3">
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
