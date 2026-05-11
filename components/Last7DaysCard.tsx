import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";
import { durationMinutes, formatDuration } from "@/utils/date";

export default async function Last7DaysCard() {
  const user = await getCachedUser();

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  const avgMinutesLast7 =
    sleepLogs.length > 0
      ? Math.round(
          sleepLogs.reduce(
            (s, l) => s + durationMinutes(l.bed_time, l.wake_time),
            0,
          ) / sleepLogs.length,
        )
      : null;

  const avgMoodLast7 =
    moodLogs.length > 0
      ? Math.round(
          (moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length) * 10,
        ) / 10
      : null;

  const totalNapMinLast7 = napLogs.reduce(
    (s, n) => s + durationMinutes(n.start_time, n.end_time),
    0,
  );

  const stats = [
    {
      icon: "🌙",
      label: "평균 수면",
      value: avgMinutesLast7 != null ? formatDuration(avgMinutesLast7) : "—",
    },
    {
      icon: "🐾",
      label: "평균 기분",
      value: avgMoodLast7 != null ? `${avgMoodLast7} / 5` : "—",
    },
    {
      icon: "💤",
      label: "낮잠",
      value:
        napLogs.length > 0
          ? `${napLogs.length}회 · ${formatDuration(totalNapMinLast7)}`
          : "—",
    },
  ];

  return (
    <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5 flex-1">
      <h2 className="text-base font-extrabold text-bark-dark mb-4">최근 7일</h2>
      <ul className="flex flex-col gap-3">
        {stats.map((stat) => (
          <li key={stat.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-bark-mid">
              <span>{stat.icon}</span>
              {stat.label}
            </span>
            <span className="text-sm font-bold text-bark-dark">
              {stat.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
