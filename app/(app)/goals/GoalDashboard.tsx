'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { GoalWithPeriods, DailyLog } from '@/lib/checklist/types'
import { toggleGoalActive, reorderGoals } from '@/lib/checklist/actions'
import { SortableGoalRow } from './SortableGoalRow'
import { Legend } from './Legend'

interface Props {
  initialGoals: GoalWithPeriods[]
  logs: DailyLog[]
  dates: string[]
  today: string
}

type OptimisticAction =
  | { type: 'toggle_active'; goalId: string; active: boolean }
  | { type: 'reorder'; section: 'active' | 'inactive'; orderedIds: string[] }

export function GoalDashboard({ initialGoals, logs, dates, today }: Props) {
  const router = useRouter()
  const [inactiveOpen, setInactiveOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Build lookup: `${goalId}:${date}` → done
  const logMap = new Map<string, boolean>()
  for (const log of logs) {
    logMap.set(`${log.goal_id}:${log.log_date}`, log.done)
  }

  const [optimisticGoals, addOptimistic] = useOptimistic(
    initialGoals,
    (state: GoalWithPeriods[], action: OptimisticAction): GoalWithPeriods[] => {
      if (action.type === 'toggle_active') {
        return state.map(g => g.id === action.goalId ? { ...g, is_active: action.active } : g)
      }
      if (action.type === 'reorder') {
        const sectionGoals = state.filter(g =>
          action.section === 'active' ? g.is_active : !g.is_active
        )
        const other = state.filter(g =>
          action.section === 'active' ? !g.is_active : g.is_active
        )
        const reordered = action.orderedIds
          .map(id => sectionGoals.find(g => g.id === id))
          .filter((g): g is GoalWithPeriods => g !== undefined)
        return action.section === 'active'
          ? [...reordered, ...other]
          : [...other, ...reordered]
      }
      return state
    }
  )

  const activeGoals = optimisticGoals.filter(g => g.is_active)
  const inactiveGoals = optimisticGoals.filter(g => !g.is_active)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent, section: 'active' | 'inactive') => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const sectionGoals = section === 'active' ? activeGoals : inactiveGoals
    const oldIndex = sectionGoals.findIndex(g => g.id === active.id)
    const newIndex = sectionGoals.findIndex(g => g.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(sectionGoals, oldIndex, newIndex)
    const orderedIds = reordered.map(g => g.id)
    const updates = reordered.map((g, i) => ({ id: g.id, sort_order: i }))

    setError(null)
    startTransition(async () => {
      addOptimistic({ type: 'reorder', section, orderedIds })
      try {
        await reorderGoals(updates)
        router.refresh()
      } catch {
        setError('순서 저장에 실패했어요.')
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

  const colCount = dates.length + 2  // name col + date cols + toggle col

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-rose-500 bg-rose-50 rounded-xl px-4 py-2" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse w-max min-w-full">
            <thead>
              <tr className="bg-warm-white border-b border-border">
                {/* Sticky goal name header */}
                <th
                  scope="col"
                  className="sticky left-0 z-20 bg-warm-white text-left text-xs font-semibold text-muted-foreground px-3 py-3 min-w-[160px] border-r border-border/40"
                >
                  목표
                </th>
                {/* Date headers */}
                {dates.map(date => (
                  <th
                    key={date}
                    scope="col"
                    className="text-center px-1 py-3 w-9 min-w-[36px]"
                  >
                    <div className="text-[10px] font-medium text-muted-foreground leading-tight">
                      {date.slice(5).replace('-', '/')}
                    </div>
                    {date === today && (
                      <div className="text-[8px] font-bold text-primary">오늘</div>
                    )}
                  </th>
                ))}
                <th scope="col" className="w-16 min-w-[64px] px-2 py-3 text-[10px] font-semibold text-muted-foreground text-center">
                  상태
                </th>
              </tr>
            </thead>

            <tbody>
              {/* ── Active section ── */}
              {activeGoals.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan={colCount}
                      className="sticky left-0 bg-muted/20 px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                    >
                      활성 목표
                    </td>
                  </tr>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={e => handleDragEnd(e, 'active')}
                  >
                    <SortableContext
                      items={activeGoals.map(g => g.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {activeGoals.map(goal => (
                        <SortableGoalRow
                          key={goal.id}
                          goal={goal}
                          dates={dates}
                          today={today}
                          logMap={logMap}
                          onToggleActive={() => handleToggleActive(goal.id, true)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </>
              )}

              {/* ── Inactive section ── */}
              {inactiveGoals.length > 0 && (
                <>
                  <tr>
                    <td colSpan={colCount} className="border-t-2 border-border p-0">
                      <button
                        onClick={() => setInactiveOpen(v => !v)}
                        aria-expanded={inactiveOpen}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted/40 transition-colors"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className={`w-3 h-3 transition-transform duration-200 ${inactiveOpen ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        잠시 쉬는 목표 ({inactiveGoals.length})
                      </button>
                    </td>
                  </tr>
                  {inactiveOpen && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={e => handleDragEnd(e, 'inactive')}
                    >
                      <SortableContext
                        items={inactiveGoals.map(g => g.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {inactiveGoals.map(goal => (
                          <SortableGoalRow
                            key={goal.id}
                            goal={goal}
                            dates={dates}
                            today={today}
                            logMap={logMap}
                            onToggleActive={() => handleToggleActive(goal.id, false)}
                            inactive
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </>
              )}

              {/* Empty state */}
              {activeGoals.length === 0 && inactiveGoals.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    목표가 없어요.{' '}
                    <a href="/check-in/daily-goals" className="text-primary underline">
                      체크리스트 페이지
                    </a>
                    에서 첫 목표를 추가해보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Legend />
    </div>
  )
}
