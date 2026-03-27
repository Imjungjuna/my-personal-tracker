import { NapLogForm } from "@/app/dashboard/(with-nav)/nap-checkin/NapLogForm";
import { verifySessionUsingGetClaims } from "@/lib/dal";

export default async function NapCheckinPage() {
  await verifySessionUsingGetClaims();

  return (
    <div className="min-h-screen bg-zinc-100 px-6 pb-8 pt-14 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 [text-wrap:balance] dark:text-zinc-50">
            낮잠 기록
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          낮잠 시작·종료 시각을 입력해 주세요.
        </p>

        <div className="mt-8">
          <NapLogForm />
        </div>
      </div>
    </div>
  );
}
