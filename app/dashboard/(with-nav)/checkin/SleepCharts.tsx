"use client";

import { use, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getTodayISO, durationMinutes, formatDuration } from "@/utils/date";

export type SleepLogRaw = {
  sleep_date: string;
  bed_time: string;
  wake_time: string;
};

function formatTime(iso: string): string {
  const d = new Date(new Date(iso).getTime());
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
    const byDate: Record<
      string,
      { minutes: number; bedTime: string; wakeTime: string }
    > = {};
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
    <div className="pt-5 pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        최근 수면 시간
      </h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 14 }}
              stroke="#71717a"
              tickLine={false}
            />
            <YAxis
              width={35}
              tick={{ fontSize: 14 }}
              stroke="#71717a"
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
              domain={[0, (max: number) => Math.max(10, Math.ceil(max) + 1)]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {p.date}
                    </p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {p.durationLabel}
                    </p>
                    {p.bedTime && p.wakeTime && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {p.bedTime} → {p.wakeTime}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="duration"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              fill="#71717a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
