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

const RECENT_DAYS = 14;

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function getLogTimeFromDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** bed_time, wake_time (ISO) → 수면 시간(분). 자정 넘기면 24시간 가산 */
function durationMinutes(bedTime: string, wakeTime: string): number {
  const bed = new Date(bedTime).getTime();
  const wake = new Date(wakeTime).getTime();
  let diff = (wake - bed) / 60_000;
  if (diff < 0) diff += 24 * 60;
  return Math.round(diff);
}

function napDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / 60_000);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, age")
    .eq("id", user.id)
    .single();

  if (!isOnboardingComplete(profile ?? null)) {
    redirect("/onboarding?next=/dashboard");
  }

  const today = getTodayISO();
  const fromDate = getDateDaysAgo(RECENT_DAYS);
  const sevenDaysAgo = getDateDaysAgo(7);
  const fromTs = getLogTimeFromDaysAgo(RECENT_DAYS);

  const [sleepResult, moodResult, napResult] = await Promise.all([
    supabase
      .from("sleep_logs")
      .select("sleep_date, bed_time, wake_time")
      .eq("user_id", user.id)
      .gte("sleep_date", fromDate)
      .lte("sleep_date", today)
      .order("sleep_date", { ascending: false }),
    supabase
      .from("mood_logs")
      .select("log_time, score")
      .eq("user_id", user.id)
      .gte("log_time", fromTs)
      .order("log_time", { ascending: false }),
    supabase
      .from("nap_logs")
      .select("start_time, end_time")
      .eq("user_id", user.id)
      .gte("start_time", fromTs)
      .order("start_time", { ascending: false }),
  ]);

  const recentLogs = sleepResult.data;
  const moodLogs: MoodLogForChart[] = (moodResult.data ?? []).map((row) => ({
    log_time: row.log_time,
    score: row.score,
  }));

  const napLogsWithDuration: NapLogForChart[] = (napResult.data ?? []).map(
    (row) => ({
      start_time: row.start_time,
      end_time: row.end_time,
      durationMinutes: napDurationMinutes(row.start_time, row.end_time),
    }),
  );

  const todayNapCount = napLogsWithDuration.filter(
    (n) => n.start_time.slice(0, 10) === today,
  ).length;
  const last7Nap = napLogsWithDuration.filter(
    (n) => n.start_time.slice(0, 10) >= sevenDaysAgo,
  );
  const totalNapMinLast7 = last7Nap.reduce((s, n) => s + n.durationMinutes, 0);

  const logsWithDuration: SleepLogForChart[] = (recentLogs ?? []).map(
    (row) => ({
      sleep_date: row.sleep_date,
      bed_time: row.bed_time,
      wake_time: row.wake_time,
      durationMinutes: durationMinutes(row.bed_time, row.wake_time),
    }),
  );

  const last7 = logsWithDuration.filter((_, i) => i < 7);
  const avgMinutesLast7 =
    last7.length > 0
      ? Math.round(
          last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length,
        )
      : null;
  const hasTodayLog = logsWithDuration.some((l) => l.sleep_date === today);
  const lastLog = logsWithDuration[0] ?? null;

  const todayMoodCount = moodLogs.filter(
    (m) => m.log_time.slice(0, 10) === today,
  ).length;
  const last7Mood = moodLogs.filter(
    (m) => m.log_time.slice(0, 10) >= sevenDaysAgo,
  );
  const avgMoodLast7 =
    last7Mood.length > 0
      ? Math.round(
          (last7Mood.reduce((s, m) => s + m.score, 0) / last7Mood.length) * 10,
        ) / 10
      : null;

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "사용자";

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 sm:py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl space-y-0">
        <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-700">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              대시보드
            </h1>
            <p className="mt-1.5 text-base text-zinc-600 dark:text-zinc-400">
              안녕하세요,{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {displayName}
              </strong>
              님.
            </p>
          </div>
          <div className="items-center gap-3 hidden">
            <Link
              href="/dashboard/checkin"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              수면 기록하기
            </Link>
            <Link
              href="/dashboard/mood-checkin"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              기분 기록하기
            </Link>
            <Link
              href="/dashboard/nap-checkin"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              낮잠 기록하기
            </Link>
            <form
              action={async () => {
                "use server";
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect("/login");
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                로그아웃
              </button>
            </form>
          </div>
        </header>
        <div className="flex flex-col md:flex-row gap-6">
          <section className="flex flex-1 flex-col pt-5 md:px-2 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              오늘
            </h2>
            <ul className="mt-4 flex flex-1 flex-col min-h-0 space-y-0">
              <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700 first:pt-0">
                <span className="text-base text-zinc-600 dark:text-zinc-400">
                  수면 기록
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                    {hasTodayLog ? "기록됨" : "없음"}
                  </span>
                  <Link
                    href="/dashboard/checkin"
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    기록하기 →
                  </Link>
                </span>
              </li>
              <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-base text-zinc-600 dark:text-zinc-400">
                  기분 체크인
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                    {todayMoodCount}회
                  </span>
                  <Link
                    href="/dashboard/mood-checkin"
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    기록하기 →
                  </Link>
                </span>
              </li>
              <li className="flex flex-1 items-center justify-between py-4">
                <span className="text-base text-zinc-600 dark:text-zinc-400">
                  낮잠
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                    {todayNapCount}회
                  </span>
                  <Link
                    href="/dashboard/nap-checkin"
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    기록하기 →
                  </Link>
                </span>
              </li>
            </ul>
          </section>

          <section className="flex flex-1 flex-col pt-5 mb-5 md:mb-0 md:px-2 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              최근 7일
            </h2>
            <ul className="mt-4 flex flex-1 flex-col min-h-0 space-y-0">
              <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700 first:pt-0">
                <span className="text-base text-zinc-600 dark:text-zinc-400">
                  평균 수면
                </span>
                <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {avgMinutesLast7 != null
                    ? formatDuration(avgMinutesLast7)
                    : "—"}
                </span>
              </li>
              <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-base text-zinc-600 dark:text-zinc-400">
                  평균 기분
                </span>
                <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {avgMoodLast7 != null ? `${avgMoodLast7}` : "—"}
                </span>
              </li>
              <li className="flex flex-1 items-center justify-between py-4">
                <span className="text-base text-zinc-600 dark:text-zinc-400">
                  낮잠
                </span>
                <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {last7Nap.length > 0
                    ? `${last7Nap.length}회 · ${formatDuration(totalNapMinLast7)}`
                    : "—"}
                </span>
              </li>
            </ul>
          </section>
        </div>

        {lastLog && (
          <div className="pb-4 pt-6 border-b border-zinc-200 dark:border-zinc-700">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-400">
              최근 기록
            </p>
            <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-50">
              {lastLog.sleep_date} · {formatDuration(lastLog.durationMinutes)}
            </p>
          </div>
        )}

        <div className="grid gap-0 lg:grid-cols-3 py-6">
          <SleepCharts logs={logsWithDuration} />
          <MoodChart logs={moodLogs} />
          <NapChart logs={napLogsWithDuration} />
        </div>
      </div>
    </div>
  );
}
