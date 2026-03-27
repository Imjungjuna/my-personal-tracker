"use client";

import { use } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getTodayISO, durationMinutes } from "@/utils/date";

export type SleepLogRaw = {
  sleep_date: string;
  bed_time: string;
  wake_time: string;
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function SleepCharts({
  sleepPromise,
}: {
  sleepPromise: Promise<SleepLogRaw[]>;
}) {
  const logs = use(sleepPromise);

  const today = getTodayISO();
  const byDate: Record<string, number> = {};
  for (const row of logs) {
    if (row.sleep_date <= today) {
      byDate[row.sleep_date] = durationMinutes(row.bed_time, row.wake_time);
    }
  }

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const totalMin = byDate[dateStr];

    return {
      date: dateStr.slice(5).replace("-", "/"),
      duration: totalMin ? totalMin / 60 : null,
      durationLabel: totalMin ? formatDuration(totalMin) : "기록 없음",
    };
  });

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
                  </div>
                );
              }}
            />
            <Bar
              dataKey="duration"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              fill="#71717a"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill="#71717a" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
