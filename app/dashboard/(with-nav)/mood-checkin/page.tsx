import { verifySessionUsingGetClaims } from "@/lib/dal";
import { MoodLogForm } from "@/app/dashboard/(with-nav)/mood-checkin/MoodLogForm";

export default async function MoodCheckinPage() {
  await verifySessionUsingGetClaims();

  return (
    <div className="min-h-screen bg-zinc-100 px-6 pb-8 pt-14 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 [text-wrap:balance] dark:text-zinc-50">
            기분 기록
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          지금 기분을 1~5로 선택하고, 필요하면 메모를 남겨보세요.
        </p>

        <div className="mt-8">
          <MoodLogForm />
        </div>
      </div>
    </div>
  );
}
