import Link from "next/link";
// import { verifySessionUsingGetUser } from "@/lib/dal";
import { verifySessionUsingGetClaims } from "@/lib/dal";
import { MoodLogForm } from "@/app/dashboard/(with-nav)/mood-checkin/MoodLogForm";

export default async function MoodCheckinPage() {
  // console.time("UsingGetUser");
  await verifySessionUsingGetClaims();
  // console.timeEnd("UsingGetUser");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-8 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            기분 기록
          </h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            대시보드로
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          지금 기분을 1~5로 선택하고, 필요하면 메모를 남겨보세요.
        </p>

        <section className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-600">
          <MoodLogForm />
        </section>
      </div>
    </div>
  );
}
