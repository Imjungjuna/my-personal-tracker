// components/dashboard/TodayMetricsCard.tsx
import { getCachedUser, getTodayConditionLog } from "@/lib/dal";
import { getTodayISO } from "@/utils/date";

function Pips({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < value ? "bg-paw-brown" : "bg-[#E8D5C0]"}`}
        />
      ))}
    </div>
  );
}

const METRICS = [
  {
    key: "mental_condition" as const,
    label: "정신 상태",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
  },
  {
    key: "physical_energy" as const,
    label: "신체 에너지",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    key: "muscle_soreness" as const,
    label: "근육 통증",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

export async function TodayMetricsCard() {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const log = await getTodayConditionLog(user.id, todayISO);

  if (!log) {
    return (
      <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
        <p className="text-xs font-bold text-bark-dark mb-3">오늘 컨디션</p>
        <p className="text-xs text-bark-light">아직 컨디션 기록이 없어요</p>
      </div>
    );
  }

  return (
    <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
      <p className="text-xs font-bold text-bark-dark mb-3">오늘 컨디션</p>
      <div className="flex flex-col gap-0">
        {METRICS.map((m) => (
          <div key={m.key} className="flex items-center gap-2.5 py-2.5 border-b border-cream last:border-0">
            {m.icon}
            <span className="text-xs font-medium text-bark-dark flex-1">{m.label}</span>
            <Pips value={log[m.key]} />
            <span className="text-xs font-bold text-bark-dark w-4 text-right">{log[m.key]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-xs font-medium text-bark-dark flex-1">어제 RPE</span>
          <Pips value={Math.round((log.yesterday_rpe / 10) * 5)} />
          <span className="text-xs font-bold text-bark-dark w-4 text-right">
            {log.yesterday_rpe}<span className="text-[9px] text-bark-mid">/10</span>
          </span>
        </div>
      </div>
    </div>
  );
}
