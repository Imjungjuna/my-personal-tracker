"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { use, useMemo } from "react";
import { MOOD_LABELS } from "@/utils/date";

export type MoodLogForChart = {
  log_time: string;
  score: number;
};

export function MoodChart({
  moodPromise,
}: {
  moodPromise: Promise<MoodLogForChart[]>;
}) {
  const moodLogs: MoodLogForChart[] = use(moodPromise);

  const chartData = useMemo(() => {
    const byDate = moodLogs.reduce<
      Record<string, { sum: number; count: number }>
    >((acc, log) => {
      const date = log.log_time.slice(0, 10);
      if (!acc[date]) acc[date] = { sum: 0, count: 0 };
      acc[date].sum += log.score;
      acc[date].count += 1;
      return acc;
    }, {});

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const dayData = byDate[dateStr];

      return {
        date: dateStr.slice(5).replace("-", "/"),
        avg: dayData ? Math.round((dayData.sum / dayData.count) * 10) / 10 : null,
        label: dayData
          ? `${(dayData.sum / dayData.count).toFixed(1)}`
          : "기록 없음",
      };
    });
  }, [moodLogs]);

  return (
    <div className="py-5 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        최근 기분(날짜별 평균)
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
              width={24}
              tick={{ fontSize: 14 }}
              stroke="#71717a"
              tickLine={false}
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;

                if (p.avg === null) {
                  return (
                    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {p.date}
                      </p>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {p.label}
                      </p>
                    </div>
                  );
                }

                const score = Math.round(p.avg);
                return (
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {p.date}
                    </p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {p.label} · {MOOD_LABELS[score] ?? score}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="avg"
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
