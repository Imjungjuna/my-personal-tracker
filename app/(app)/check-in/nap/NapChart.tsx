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

type NapLogRaw = { start_time: string; end_time: string };

export function NapChart({ napPromise }: { napPromise: Promise<NapLogRaw[]> }) {
  const logs = use(napPromise);

  const chartData = useMemo(() => {
    const today = getTodayISO();
    const byDate: Record<string, number> = {};
    for (const row of logs) {
      const date = row.start_time.slice(0, 10);
      if (date <= today) {
        byDate[date] = (byDate[date] ?? 0) + durationMinutes(row.start_time, row.end_time);
      }
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const minutes = byDate[dateStr] ?? null;
      return {
        date: dateStr.slice(5).replace("-", "/"),
        minutes,
        label: minutes != null ? formatDuration(minutes) : "기록 없음",
      };
    });
  }, [logs]);

  return (
    <div>
      <h3 className="text-base font-extrabold text-bark-dark mb-4">
        💤 낮잠 시간
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
              width={36}
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}m`}
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
              dataKey="minutes"
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
                  fill={entry.minutes ? "#FFD97D" : "#E8C4A0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
