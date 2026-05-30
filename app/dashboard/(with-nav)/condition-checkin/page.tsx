import { getCachedUser, getTodayConditionLog, getTodaySleepLog } from "@/lib/dal";
import { getTodayISO, durationMinutes } from "@/utils/date";
import { calculateCnsScore } from "@/lib/cns-score";
import { ConditionLogForm } from "./ConditionLogForm";
import { CnsScoreCard } from "@/components/CnsScoreCard";
import type { CnsStatus } from "@/lib/cns-score";

export default async function ConditionCheckinPage() {
  const user = await getCachedUser();
  const todayISO = getTodayISO();

  const [conditionLog, sleepLog] = await Promise.all([
    getTodayConditionLog(user.id, todayISO),
    getTodaySleepLog(user.id, todayISO),
  ]);

  let score: number | null = null;
  let status: CnsStatus | null = null;

  if (
    conditionLog &&
    sleepLog &&
    sleepLog.sleep_quality != null
  ) {
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
    score = result.score;
    status = result.status;
  }

  const missingMessage =
    !sleepLog
      ? "오늘 수면 기록을 먼저 입력해 주세요."
      : sleepLog.sleep_quality == null
      ? "수면 체크인에서 수면 질을 입력하면 점수가 계산돼요."
      : null;

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        <h1 className="text-xl font-extrabold text-bark-dark">💪 컨디션 체크인</h1>

        {/* 점수 카드 */}
        {missingMessage ? (
          <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
            <p className="text-sm text-bark-mid">{missingMessage}</p>
          </div>
        ) : (
          <CnsScoreCard score={score} status={status} />
        )}

        {/* 입력 폼 */}
        <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
          <h2 className="text-base font-extrabold text-bark-dark mb-4">오늘의 컨디션</h2>
          <ConditionLogForm initialLog={conditionLog} />
        </section>
      </div>
    </div>
  );
}
