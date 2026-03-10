"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type SleepLogForChart = {
  sleep_date: string;
  bed_time: string;
  wake_time: string;
  durationMinutes: number;
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function SleepCharts({ logs }: { logs: SleepLogForChart[] }) {
  const chartData = [...logs]
    .sort(
      (a, b) =>
        new Date(a.sleep_date).getTime() - new Date(b.sleep_date).getTime(),
    )
    .map((log) => ({
      date: log.sleep_date.slice(5).replace("-", "/"),
      duration: log.durationMinutes / 60,
      durationLabel: formatDuration(log.durationMinutes),
    }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          최근 수면 시간
        </h3>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          기록된 수면 데이터가 없습니다. 수면 기록에서 입력해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
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
              tick={{ fontSize: 12 }}
              stroke="#71717a"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
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
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
