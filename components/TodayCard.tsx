import Link from "next/link";
import {
  getCachedUser,
  getUserProfile,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
  getTodayConditionLog,
} from "@/lib/dal";
import { getTodayStartTs, getTodayISO } from "@/utils/date";

const LOG_ITEMS = [
  {
    key: "sleep",
    label: "수면 기록",
    icon: "🌙",
    href: "/dashboard/checkin",
  },
  {
    key: "mood",
    label: "기분 체크인",
    icon: "🐾",
    href: "/dashboard/mood-checkin",
  },
  {
    key: "nap",
    label: "낮잠",
    icon: "💤",
    href: "/dashboard/nap-checkin",
  },
  {
    key: "condition",
    label: "컨디션",
    icon: "💪",
    href: "/dashboard/condition-checkin",
  },
];

export default async function TodayCard() {
  const user = await getCachedUser();
  await getUserProfile();

  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLogs, moodLogs, napLogs, conditionLog] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
    getTodayConditionLog(user.id, todayISO),
  ]);

  const hasTodayLog = sleepLogs.some((log) => log.sleep_date === todayISO);
  const todayMoodCount = moodLogs.filter(
    (log) => log.log_time >= todayStartTs,
  ).length;
  const todayNapCount = napLogs.filter(
    (log) => log.start_time >= todayStartTs,
  ).length;
  const hasConditionLog = conditionLog !== null;

  const statusMap: Record<string, string> = {
    sleep: hasTodayLog ? "기록됨 ✓" : "없음",
    mood: `${todayMoodCount}회`,
    nap: `${todayNapCount}회`,
    condition: hasConditionLog ? "기록됨 ✓" : "없음",
  };
  const doneMap: Record<string, boolean> = {
    sleep: hasTodayLog,
    mood: todayMoodCount > 0,
    nap: todayNapCount > 0,
    condition: hasConditionLog,
  };

  return (
    <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5 flex-1">
      <h2 className="text-base font-extrabold text-bark-dark mb-4">오늘</h2>
      <ul className="flex flex-col gap-3">
        {LOG_ITEMS.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-bark-mid">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <span className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${
                  doneMap[item.key] ? "text-paw-brown" : "text-bark-light"
                }`}
              >
                {statusMap[item.key]}
              </span>
              <Link
                href={item.href}
                className="rounded-full bg-sleepy-yellow px-3 py-1 text-xs font-bold text-bark-dark transition hover:bg-sleepy-yellow-light"
              >
                기록하기
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
