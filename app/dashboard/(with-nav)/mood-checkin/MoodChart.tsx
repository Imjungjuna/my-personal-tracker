'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export type MoodLogForChart = {
  log_time: string
  score: number
}

const MOOD_LABELS: Record<number, string> = {
  1: '매우 나쁨',
  2: '나쁨',
  3: '보통',
  4: '좋음',
  5: '매우 좋음',
}

export function MoodChart({ logs }: { logs: MoodLogForChart[] }) {
  const byDate = logs.reduce<Record<string, { sum: number; count: number }>>(
    (acc, log) => {
      const date = log.log_time.slice(0, 10)
      if (!acc[date]) acc[date] = { sum: 0, count: 0 }
      acc[date].sum += log.score
      acc[date].count += 1
      return acc
    },
    {}
  )

  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sum, count }]) => ({
      date: date.slice(5).replace('-', '/'),
      avg: Math.round((sum / count) * 10) / 10,
      label: `${(sum / count).toFixed(1)}`,
    }))

  if (chartData.length === 0) {
    return (
      <div className="py-5 pb-6 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
        <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          최근 기분
        </h3>
        <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
          기록된 기분 데이터가 없습니다. 기분 기록에서 입력해 보세요.
        </p>
      </div>
    )
  }

  return (
    <div className="py-5 pb-6 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
        최근 기분 (날짜별 평균)
      </h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 14 }}
              stroke="#71717a"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 14 }}
              stroke="#71717a"
              tickLine={false}
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0].payload
                const score = Math.round(p.avg)
                return (
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {p.date}
                    </p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {p.label} · {MOOD_LABELS[score] ?? score}
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={48} fill="#71717a">
              {chartData.map((_, i) => (
                <Cell key={i} fill="#71717a" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
