// app/(app)/dashboard/calendar/page.tsx
import { getCachedUser, getMonthLogs } from "@/lib/dal";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const year  = parseInt(params.year  ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth() + 1), 10);

  const user = await getCachedUser();
  const { sleepLogs, conditionLogs, moodLogs, napLogs } = await getMonthLogs(user.id, year, month);

  const prevYear  = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear  = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-warm-white border-b border-[#E8D5C0] px-7 h-[58px] flex items-center">
        <h1 className="text-[17px] font-bold text-bark-dark">캘린더</h1>
      </header>

      <main className="flex-1 px-7 py-5 max-w-2xl">
        <div className="bg-warm-white rounded-[14px] p-5 border border-[#E8D5C0]">
          {/* Month navigator */}
          <div className="flex items-center justify-between mb-5">
            <a
              href={`/dashboard/calendar?year=${prevYear}&month=${prevMonth}`}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream text-bark-mid"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </a>
            <h2 className="text-sm font-bold text-bark-dark">
              {year}년 {month}월
            </h2>
            <a
              href={`/dashboard/calendar?year=${nextYear}&month=${nextMonth}`}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream text-bark-mid"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>

          <MonthCalendar
            year={year}
            month={month}
            sleepLogs={sleepLogs}
            conditionLogs={conditionLogs}
            moodLogs={moodLogs}
            napLogs={napLogs}
          />
        </div>
      </main>
    </div>
  );
}
