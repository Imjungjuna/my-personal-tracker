// components/dashboard/StatCards.tsx
import { getCachedUser, getCachedMoodLogs7Days, getCachedNapLogs7Days, getTodaySleepLog, getTodayConditionLog } from "@/lib/dal";
import { calculateCnsScore } from "@/lib/cns-score";
import { durationMinutes, formatDuration, getTodayISO, getTodayStartTs } from "@/utils/date";

function StatCard({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <div className={`rounded-[14px] p-4 ${primary ? "bg-bark-dark" : "bg-warm-white border border-[#E8D5C0]"}`}>
      {children}
    </div>
  );
}

export async function StatCards() {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLog, conditionLog, moodLogs, napLogs] = await Promise.all([
    getTodaySleepLog(user.id, todayISO),
    getTodayConditionLog(user.id, todayISO),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  // CNS score
  let cnsScore: number | null = null;
  let cnsStatus: string | null = null;
  if (sleepLog && conditionLog && sleepLog.sleep_quality != null) {
    const result = calculateCnsScore({
      sleepDuration: durationMinutes(sleepLog.bed_time, sleepLog.wake_time) / 60,
      sleepQuality: sleepLog.sleep_quality,
      mentalCondition: conditionLog.mental_condition,
      physicalEnergy: conditionLog.physical_energy,
      muscleSoreness: conditionLog.muscle_soreness,
      didExercise: conditionLog.did_exercise,
      yesterdayRpe: conditionLog.yesterday_rpe,
      hrv: null,
    });
    cnsScore = result.score;
    cnsStatus = result.status;
  }

  // Sleep duration
  const sleepMin = sleepLog ? durationMinutes(sleepLog.bed_time, sleepLog.wake_time) : null;

  // Mood average today
  const todayMoods = moodLogs.filter((l) => l.log_time >= todayStartTs);
  const moodAvg = todayMoods.length > 0
    ? (todayMoods.reduce((s, l) => s + l.score, 0) / todayMoods.length).toFixed(1)
    : null;

  // Nap today
  const todayNaps = napLogs.filter((l) => l.start_time >= todayStartTs);
  const napTotalMin = todayNaps.reduce(
    (s, l) => s + durationMinutes(l.start_time, l.end_time), 0
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* CNS */}
      <StatCard primary>
        <p className="text-[11px] font-medium text-warm-white/60 mb-1">오늘 CNS 점수</p>
        <p className="text-3xl font-extrabold text-sleepy-yellow leading-none">
          {cnsScore ?? "—"}
        </p>
        {cnsStatus && (
          <span className="inline-block mt-1.5 text-[10px] font-semibold bg-sleepy-yellow/15 text-sleepy-yellow px-2 py-0.5 rounded-full">
            {cnsStatus}
          </span>
        )}
      </StatCard>

      {/* Sleep */}
      <StatCard>
        <p className="text-[11px] font-medium text-bark-mid mb-1">수면 시간</p>
        <p className="text-3xl font-extrabold text-bark-dark leading-none">
          {sleepMin != null ? formatDuration(sleepMin) : "—"}
        </p>
      </StatCard>

      {/* Mood */}
      <StatCard>
        <p className="text-[11px] font-medium text-bark-mid mb-1">기분 평균</p>
        <p className="text-3xl font-extrabold text-bark-dark leading-none">
          {moodAvg ?? "—"}
          {moodAvg && <span className="text-sm font-medium text-bark-mid ml-1">/5</span>}
        </p>
      </StatCard>

      {/* Nap */}
      <StatCard>
        <p className="text-[11px] font-medium text-bark-mid mb-1">낮잠</p>
        <p className="text-3xl font-extrabold text-bark-dark leading-none">
          {napTotalMin > 0 ? formatDuration(napTotalMin) : "—"}
        </p>
        {todayNaps.length > 0 && (
          <span className="inline-block mt-1.5 text-[10px] font-medium bg-[#F5EDE0] text-bark-mid px-2 py-0.5 rounded-full">
            {todayNaps.length}회
          </span>
        )}
      </StatCard>
    </div>
  );
}
