import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SleepLogForm } from "@/app/dashboard/(with-nav)/checkin/SleepLogForm";
import type { SleepLogFormInitial } from "@/lib/types/supabase";
import { isOnboardingComplete } from "@/lib/types/supabase";

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default async function CheckinPage() {
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
    redirect("/onboarding?next=/dashboard/checkin");
  }

  const today = getTodayISO();
  const { data: todayLog } = await supabase
    .from("sleep_logs")
    .select("sleep_date, bed_time, wake_time")
    .eq("user_id", user.id)
    .eq("sleep_date", today)
    .maybeSingle();

  const initialLog: SleepLogFormInitial | null =
    todayLog == null
      ? null
      : {
          sleep_date: todayLog.sleep_date,
          bed_time: todayLog.bed_time,
          wake_time: todayLog.wake_time,
        };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-8 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            수면 기록
          </h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            대시보드로
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          취침·기상 시간을 입력해 주세요.
        </p>

        <section className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-600">
          <SleepLogForm
            today={today}
            initialLog={initialLog}
            className="mt-4"
          />
        </section>
      </div>
    </div>
  );
}
