// components/dashboard/WeekConditionChart.tsx
"use client";

import { use } from "react";
import { buildWeekChartData } from "@/lib/dashboard-utils";

type SleepLog = { wake_date: string; sleep_quality: number | null };
type ConditionLog = { log_date: string; mental_condition: number; physical_energy: number; muscle_soreness: number };

interface Props {
  sleepPromise: Promise<SleepLog[]>;
  conditionPromise: Promise<ConditionLog[]>;
}

const METRICS = [
  { key: "mentalCondition",  color: "#C8956C", label: "정신 상태" },
  { key: "physicalEnergy",   color: "#FFD97D", label: "신체 에너지" },
  { key: "muscleSoreness",   color: "#F4A7B9", label: "근육 통증" },
  { key: "sleepQuality",     color: "#A8D5A2", label: "수면 질" },
] as const;

const CHART_HEIGHT = 110;

export function WeekConditionChart({ sleepPromise, conditionPromise }: Props) {
  const sleepLogs = use(sleepPromise);
  const conditionLogs = use(conditionPromise);
  const days = buildWeekChartData(conditionLogs, sleepLogs);

  return (
    <div className="w-full overflow-hidden">
      {/* Bars */}
      <div className="flex items-end gap-1" style={{ height: CHART_HEIGHT }}>
        {days.map((day) => (
          <div key={day.date} className="flex-1 min-w-0 flex flex-col items-center gap-0.5">
            <div className="grid gap-[2px] w-full" style={{ gridTemplateColumns: `repeat(${METRICS.length}, 1fr)` }}>
              {METRICS.map(({ key, color }) => {
                const value = day[key];
                const height = value != null ? Math.round((value / 5) * CHART_HEIGHT) : 2;
                return (
                  <div
                    key={key}
                    title={value != null ? `${value}` : "기록 없음"}
                    className="rounded-t-[2px] transition-all self-end"
                    style={{
                      height,
                      background: value != null ? color : "#EDE0D0",
                      opacity: value != null ? 1 : 0.3,
                      outline: day.isToday ? `1.5px solid #5C3D2E` : undefined,
                      outlineOffset: day.isToday ? 1 : undefined,
                    }}
                  />
                );
              })}
            </div>
            <span className={`text-[9px] mt-1 ${day.isToday ? "text-paw-brown font-bold" : "text-bark-light"}`}>
              {day.isToday ? "오늘" : day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-cream">
        {METRICS.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-[2px]" style={{ background: color }} />
            <span className="text-[10px] text-bark-mid">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
