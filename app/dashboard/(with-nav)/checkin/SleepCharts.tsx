"use client";

import { use, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getTodayISO, durationMinutes, formatDuration } from "@/utils/date";

export type SleepLogRaw = {
  sleep_date: string;
  bed_time: string;
  wake_time: string;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function SleepCharts({
  sleepPromise,
}: {
  sleepPromise: Promise<SleepLogRaw[]>;
}) {
  const logs = use(sleepPromise);

  const chartData = useMemo(() => {
    const today = getTodayISO();
    const byDate: Record<string, { minutes: number; bedTime: string; wakeTime: string }> = {};
    for (const row of logs) {
      if (row.sleep_date <= today) {
        byDate[row.sleep_date] = {
          minutes: durationMinutes(row.bed_time, row.wake_time),
          bedTime: formatTime(row.bed_time),
          wakeTime: formatTime(row.wake_time),
        };
      }
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const entry = byDate[dateStr];
      return {
        date: dateStr.slice(5).replace("-", "/"),
        duration: entry ? entry.minutes / 60 : null,
        durationLabel: entry ? formatDuration(entry.minutes) : "기록 없음",
        bedTime: entry?.bedTime ?? null,
        wakeTime: entry?.wakeTime ?? null,
      };
    });
  }, [logs]);

  return (
    <div>
      <h3 className="text-base font-extrabold text-bark-dark mb-4">
        🌙 최근 수면 시간
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={32}
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}h`}
              domain={[0, (max: number) => Math.max(10, Math.ceil(max) + 1)]}
            />
            <Tooltip
              cursor={{ fill: "#FFF3C4", radius: 8 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="rounded-2xl border border-paw-brown-light bg-warm-white px-3 py-2 shadow-md">
                    <p className="text-xs text-bark-mid font-medium">{p.date}</p>
                    <p className="font-bold text-bark-dark">{p.durationLabel}</p>
                    {p.bedTime && p.wakeTime && (
                      <p className="text-xs text-bark-mid">
                        {p.bedTime} → {p.wakeTime}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="duration"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
              isAnimationActive
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.duration ? "#C8956C" : "#E8C4A0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
