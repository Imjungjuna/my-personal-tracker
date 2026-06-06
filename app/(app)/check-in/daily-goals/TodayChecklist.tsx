'use client'

import { useOptimistic, useTransition, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { GoalWithPeriods, DailyLog } from '@/lib/checklist/types'
import { upsertLog, toggleGoalActive } from '@/lib/checklist/actions'
import { GoalCheckRow } from './GoalCheckRow'
import { AddGoalForm } from './AddGoalForm'

interface Props {
  initialGoals: GoalWithPeriods[]
  initialLogs: DailyLog[]
  today: string
}

type OptimisticAction =
  | { type: 'toggle_done'; goalId: string; done: boolean }
  | { type: 'toggle_active'; goalId: string; active: boolean }

type ChecklistState = {
  goals: GoalWithPeriods[]
  logDone: Record<string, boolean>  // goalId → done
}

export function TodayChecklist({ initialGoals, initialLogs, today }: Props) {
  const router = useRouter()
  const [inactiveOpen, setInactiveOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const initialLogDone = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const log of initialLogs) {
      map[log.goal_id] = log.done
    }
    return map
  }, [initialLogs])

  const [optimistic, addOptimistic] = useOptimistic(
    { goals: initialGoals, logDone: initialLogDone } satisfies ChecklistState,
    (state: ChecklistState, action: OptimisticAction): ChecklistState => {
      if (action.type === 'toggle_done') {
        return { ...state, logDone: { ...state.logDone, [action.goalId]: action.done } }
      }
      if (action.type === 'toggle_active') {
        return {
          ...state,
          goals: state.goals.map(g =>
            g.id === action.goalId ? { ...g, is_active: action.active } : g
          ),
        }
      }
      return state
    }
  )

  const activeGoals = useMemo(() => optimistic.goals.filter(g => g.is_active), [optimistic.goals])
  const inactiveGoals = useMemo(() => optimistic.goals.filter(g => !g.is_active), [optimistic.goals])

  const handleToggleDone = (goalId: string) => {
    const currentDone = optimistic.logDone[goalId] ?? false
    setError(null)
    startTransition(async () => {
      addOptimistic({ type: 'toggle_done', goalId, done: !currentDone })
      try {
        await upsertLog(goalId, today, !currentDone)
        router.refresh()
      } catch {
        setError('체크 저장에 실패했어요. 다시 시도해주세요.')
      }
    })
  }

  const handleToggleActive = (goalId: string, currentlyActive: boolean) => {
    setError(null)
    startTransition(async () => {
      addOptimistic({ type: 'toggle_active', goalId, active: !currentlyActive })
      try {
        await toggleGoalActive(goalId, currentlyActive)
        router.refresh()
      } catch {
        setError('목표 상태 변경에 실패했어요.')
      }
    })
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-rose-500 bg-rose-50 rounded-xl px-4 py-2" role="alert">
          {error}
        </p>
      )}

      {/* Active goals */}
      <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-4 space-y-1">
        {activeGoals.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            활성 목표가 없어요.
            <br />
            아래에서 목표를 추가하거나, 쉬는 목표를 다시 시작해보세요.
          </p>
        ) : (
          activeGoals.map(goal => (
            <GoalCheckRow
              key={goal.id}
              goal={goal}
              done={optimistic.logDone[goal.id] ?? false}
              onToggleDone={isPending ? () => {} : () => handleToggleDone(goal.id)}
              onToggleActive={isPending ? () => {} : () => handleToggleActive(goal.id, true)}
            />
          ))
        )}
      </div>

      {/* Inactive goals (collapsible) */}
      {inactiveGoals.length > 0 && (
        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.08)] overflow-hidden">
          <button
            onClick={() => setInactiveOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
            aria-expanded={inactiveOpen}
          >
            <span>잠시 쉬는 목표 ({inactiveGoals.length})</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`w-4 h-4 transition-transform duration-200 ${inactiveOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {inactiveOpen && (
            <div className="px-4 pb-4 space-y-1 border-t border-border/40">
              {inactiveGoals.map(goal => (
                <GoalCheckRow
                  key={goal.id}
                  goal={goal}
                  done={false}
                  inactive
                  onToggleDone={() => {}}
                  onToggleActive={isPending ? () => {} : () => handleToggleActive(goal.id, false)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AddGoalForm />
    </div>
  )
}
