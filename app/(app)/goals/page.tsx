import { getCachedUser } from '@/lib/dal'
import { getGoalsWithPeriods, getLogsForRange } from '@/lib/checklist/queries'
import { getTodayISO, getISODaysAgo } from '@/utils/date'
import { GoalDashboard } from './GoalDashboard'

export default async function GoalsPage() {
  const user = await getCachedUser()
  const todayISO = getTodayISO()
  const fromDate = getISODaysAgo(29)  // 30 days inclusive of today

  const [goals, logs] = await Promise.all([
    getGoalsWithPeriods(user.id),
    getLogsForRange(user.id, fromDate, todayISO),
  ])

  // Date columns: oldest (29 days ago) → newest (today)
  const dates: string[] = []
  for (let i = 29; i >= 0; i--) {
    dates.push(getISODaysAgo(i))
  }

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="px-4 py-6">
        <h1 className="text-xl font-extrabold text-bark-dark mb-6">목표 현황</h1>
        <GoalDashboard
          initialGoals={goals}
          logs={logs}
          dates={dates}
          today={todayISO}
        />
      </div>
    </div>
  )
}
