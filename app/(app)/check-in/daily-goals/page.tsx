import { getCachedUser } from '@/lib/dal'
import { getGoalsWithPeriods, getTodayLogs } from '@/lib/checklist/queries'
import { getTodayISO } from '@/utils/date'
import { TodayChecklist } from './TodayChecklist'

export default async function DailyGoalsPage() {
  const user = await getCachedUser()
  const todayISO = getTodayISO()

  const [goals, logs] = await Promise.all([
    getGoalsWithPeriods(user.id),
    getTodayLogs(user.id, todayISO),
  ])

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-lg px-4 py-6 space-y-2">
        <h1 className="text-xl font-extrabold text-bark-dark mb-6">오늘의 체크리스트</h1>
        <TodayChecklist initialGoals={goals} initialLogs={logs} today={todayISO} />
      </div>
    </div>
  )
}
