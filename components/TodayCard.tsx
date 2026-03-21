import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isOnboardingComplete } from "@/lib/types/supabase";

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getTodayStartTs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function TodayCard() {
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
  const todayStartTs = getTodayStartTs();

  const [{ count: sleepCount }, { count: moodCount }, { count: napCount }] =
    await Promise.all([
      supabase
        .from("sleep_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("sleep_date", today),
      supabase
        .from("mood_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("log_time", todayStartTs),
      supabase
        .from("nap_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("start_time", todayStartTs),
    ]);

  const hasTodayLog = (sleepCount ?? 0) > 0;
  const todayMoodCount = moodCount ?? 0;
  const todayNapCount = napCount ?? 0;

  return (
    <section className="flex flex-1 flex-col pt-5 md:px-2">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        오늘
      </h2>
      <ul className="mt-4 flex flex-1 flex-col space-y-0">
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
        <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700">
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
  );
}
