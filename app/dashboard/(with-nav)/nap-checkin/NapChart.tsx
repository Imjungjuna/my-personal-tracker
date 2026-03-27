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
import { durationMinutes, formatDuration } from "@/utils/date";

export type NapLogBeforeProcess = {
  start_time: string;
  end_time: string;
};

export function NapChart({
  napPromise,
}: {
  napPromise: Promise<NapLogBeforeProcess[]>;
}) {
  const napLogsBeforeProcess: NapLogBeforeProcess[] = use(napPromise);

  const chartData = useMemo(() => {
    const byDate: Record<string, number> = {};
    for (const row of napLogsBeforeProcess) {
      const date = row.start_time.slice(0, 10);
      byDate[date] = (byDate[date] ?? 0) + durationMinutes(row.start_time, row.end_time);
    }

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const totalMin = byDate[dateStr];

      return {
        date: dateStr.slice(5).replace("-", "/"),
        minutes: totalMin ?? null,
        label: totalMin ? formatDuration(totalMin) : "기록 없음",
      };
    });
  }, [napLogsBeforeProcess]);

  return (
    <div className="pt-5 pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        최근 낮잠
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
              width={45}
              tick={{ fontSize: 14 }}
              stroke="#71717a"
              tickLine={false}
              tickFormatter={(v) => `${v}분`}
              domain={[
                0,
                (max: number) => Math.max(60, Math.ceil(max / 30) * 30),
              ]}
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
                      {p.label}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="minutes"
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
