// import { createClient } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
import Link from "next/link";
import { SleepLogForm } from "@/app/dashboard/(with-nav)/checkin/SleepLogForm";
import type { SleepLogFormInitial } from "@/lib/types/supabase";
import { verifySessionUsingGetClaims } from "@/lib/dal";

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default async function CheckinPage() {
  await verifySessionUsingGetClaims();

  const today = getTodayISO();

  const initialLog: SleepLogFormInitial | null = {
    sleep_date: today,
    bed_time: "",
    wake_time: "", //현재 시간 반환하면 좋을 듯
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
