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
import { getTodayISO } from "@/utils/date";

type MoodLogRaw = { score: number; log_time: string };

export function MoodChart({
  moodPromise,
}: {
  moodPromise: Promise<MoodLogRaw[]>;
}) {
  const logs = use(moodPromise);

  const chartData = useMemo(() => {
    const today = getTodayISO();
    const byDate: Record<string, number[]> = {};
    for (const row of logs) {
      const date = row.log_time.slice(0, 10);
      if (date <= today) {
        byDate[date] = [...(byDate[date] ?? []), row.score];
      }
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const scores = byDate[dateStr];
      const avg = scores
        ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
        : null;
      return {
        date: dateStr.slice(5).replace("-", "/"),
        avg,
        label: avg ? `${avg} / 5` : "기록 없음",
      };
    });
  }, [logs]);

  return (
    <div>
      <h3 className="text-base font-extrabold text-bark-dark mb-4">
        🐾 기분 변화
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
              width={28}
              domain={[0, 5]}
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip
              cursor={{ fill: "#FFF3C4", radius: 8 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="rounded-2xl border border-paw-brown-light bg-warm-white px-3 py-2 shadow-md">
                    <p className="text-xs text-bark-mid font-medium">{p.date}</p>
                    <p className="font-bold text-bark-dark">{p.label}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="avg"
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
                  fill={entry.avg ? "#F4A7B9" : "#E8C4A0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
