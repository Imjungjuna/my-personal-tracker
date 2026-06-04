// components/calendar/MonthCalendar.tsx
"use client";

import { useState, useMemo } from "react";
import { calculateCnsScore } from "@/lib/cns-score";
import { cnsStatusColor } from "@/lib/dashboard-utils";
import { durationMinutes } from "@/utils/date";
import type { CnsStatus } from "@/lib/cns-score";

type SleepLog      = { wake_date: string; bed_time: string; wake_time: string; sleep_quality: number | null };
type ConditionLog  = { log_date: string; mental_condition: number; physical_energy: number; muscle_soreness: number; did_exercise: boolean; yesterday_rpe: number };
type MoodLog       = { log_time: string; score: number };
type NapLog        = { start_time: string; end_time: string };

interface Props {
  year: number;
  month: number; // 1-12
  sleepLogs: SleepLog[];
  conditionLogs: ConditionLog[];
  moodLogs: MoodLog[];
  napLogs: NapLog[];
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function getDayStartTs(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00+09:00`).toISOString();
}
function getDayEndTs(dateISO: string): string {
  return new Date(`${dateISO}T23:59:59+09:00`).toISOString();
}

export function MonthCalendar({ year, month, sleepLogs, conditionLogs, moodLogs, napLogs }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const dayDataMap = useMemo(() => {
    const map = new Map<string, { cnsStatus: CnsStatus | null; hasSleep: boolean; hasMood: boolean; hasNap: boolean; hasCondition: boolean }>();

    const firstDay = new Date(year, month - 1, 1);
    const lastDay  = new Date(year, month, 0);
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateISO = d.toISOString().slice(0, 10);
      const startTs = getDayStartTs(dateISO);
      const endTs   = getDayEndTs(dateISO);

      const sleep     = sleepLogs.find((l) => l.wake_date === dateISO);
      const condition = conditionLogs.find((l) => l.log_date === dateISO);
      const hasMood   = moodLogs.some((l) => l.log_time >= startTs && l.log_time <= endTs);
      const hasNap    = napLogs.some((l) => l.start_time >= startTs && l.start_time <= endTs);

      let cnsStatus: CnsStatus | null = null;
      if (sleep && condition && sleep.sleep_quality != null) {
        const result = calculateCnsScore({
          sleepDuration: durationMinutes(sleep.bed_time, sleep.wake_time) / 60,
          sleepQuality:  sleep.sleep_quality,
          mentalCondition:  condition.mental_condition,
          physicalEnergy:   condition.physical_energy,
          muscleSoreness:   condition.muscle_soreness,
          didExercise:      condition.did_exercise,
          yesterdayRpe:     condition.yesterday_rpe,
          hrv: null,
        });
        cnsStatus = result.status;
      }

      map.set(dateISO, { cnsStatus, hasSleep: !!sleep, hasMood, hasNap, hasCondition: !!condition });
    }
    return map;
  }, [year, month, sleepLogs, conditionLogs, moodLogs, napLogs]);

  // Calendar grid — start from Monday
  const firstOfMonth = new Date(year, month - 1, 1);
  const startDow = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  const selectedData = selected ? dayDataMap.get(selected) : null;

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-bark-mid py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateISO = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const data = dayDataMap.get(dateISO);
          const bg = cnsStatusColor(data?.cnsStatus ?? null);
          const isToday = dateISO === todayISO;
          const isSelected = dateISO === selected;

          return (
            <button
              key={dateISO}
              onClick={() => setSelected(isSelected ? null : dateISO)}
              className={`aspect-square rounded-[10px] flex flex-col items-center justify-center p-1 gap-0.5 border-2 transition-colors ${
                isSelected ? "border-bark-dark" : isToday ? "border-paw-brown" : "border-transparent"
              }`}
              style={{ background: bg }}
            >
              <span className={`text-[10px] font-bold ${isToday ? "text-paw-brown" : "text-bark-dark"}`}>{day}</span>
              {data && (
                <div className="flex gap-[2px]">
                  {data.hasSleep     && <div className="w-[5px] h-[5px] rounded-full bg-[#A8D5A2]" />}
                  {data.hasMood      && <div className="w-[5px] h-[5px] rounded-full bg-[#F4A7B9]" />}
                  {data.hasNap       && <div className="w-[5px] h-[5px] rounded-full bg-[#FFD97D]" />}
                  {data.hasCondition && <div className="w-[5px] h-[5px] rounded-full bg-[#C8956C]" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pb-4 border-b border-cream">
        {[
          { color: "#D4F0D4", label: "최적" },
          { color: "#FFF3C4", label: "회복중" },
          { color: "#FFE0B2", label: "경미 피로" },
          { color: "#FFCDD2", label: "고피로" },
          { color: "#F5EDE0", label: "기록 없음" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: color }} />
            <span className="text-[10px] text-bark-mid">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-2">
          {[{ color: "#A8D5A2", label: "수면" }, { color: "#F4A7B9", label: "기분" }, { color: "#FFD97D", label: "낮잠" }, { color: "#C8956C", label: "컨디션" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-bark-mid">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && selectedData && (
        <div className="mt-4 p-4 bg-cream rounded-[12px]">
          <p className="text-xs font-bold text-bark-dark mb-2">{selected}</p>
          <div className="flex flex-wrap gap-2 text-[11px] text-bark-mid">
            <span>수면: {selectedData.hasSleep ? "✓" : "—"}</span>
            <span>기분: {selectedData.hasMood ? "✓" : "—"}</span>
            <span>낮잠: {selectedData.hasNap ? "✓" : "—"}</span>
            <span>컨디션: {selectedData.hasCondition ? "✓" : "—"}</span>
            {selectedData.cnsStatus && <span className="font-semibold text-bark-dark">CNS: {selectedData.cnsStatus}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
