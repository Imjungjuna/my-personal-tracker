import { SleepLogForm } from "@/app/dashboard/(with-nav)/checkin/SleepLogForm";
import type { SleepLogFormInitial } from "@/lib/types/supabase";
import { verifySessionUsingGetClaims } from "@/lib/dal";
import { getTodayISO } from "@/utils/date";

export default async function CheckinPage() {
  await verifySessionUsingGetClaims();

  const today = getTodayISO();

  const initialLog: SleepLogFormInitial | null = {
    sleep_date: today,
    bed_time: "",
    wake_time: "",
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-6 pb-8 pt-14 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 [text-wrap:balance] dark:text-zinc-50">
            수면 기록
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          취침·기상 시간을 입력해 주세요.
        </p>

        <div className="mt-8">
          <SleepLogForm
            today={today}
            initialLog={initialLog}
          />
        </div>
      </div>
    </div>
  );
}
