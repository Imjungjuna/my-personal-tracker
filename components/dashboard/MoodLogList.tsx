// components/dashboard/MoodLogList.tsx
import { getCachedUser, getCachedMoodLogs7Days } from "@/lib/dal";
import { getTodayStartTs } from "@/utils/date";

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
    hour12: false,
  });
}

export async function MoodLogList() {
  const user = await getCachedUser();
  const todayStartTs = getTodayStartTs();
  const allLogs = await getCachedMoodLogs7Days(user.id);
  const todayLogs = allLogs
    .filter((l) => l.log_time >= todayStartTs)
    .sort((a, b) => a.log_time.localeCompare(b.log_time));

  return (
    <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
      <p className="text-xs font-bold text-bark-dark mb-3">오늘 기분 기록</p>
      {todayLogs.length === 0 ? (
        <p className="text-xs text-bark-light">아직 기분 기록이 없어요</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {todayLogs.map((log) => (
            <div key={log.log_time} className="flex items-center gap-2 px-2 py-1.5 bg-cream rounded-lg">
              <span className="text-[10px] text-bark-mid min-w-[36px]">{formatTime(log.log_time)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-paw-brown shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
              </svg>
              <span className="text-xs font-bold text-bark-dark">{log.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
