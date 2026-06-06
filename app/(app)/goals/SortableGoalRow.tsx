'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { GoalWithPeriods } from '@/lib/checklist/types'
import { computeCellState } from '@/lib/checklist/cell-state'
import { DashboardCell } from './DashboardCell'

interface Props {
  goal: GoalWithPeriods
  dates: string[]
  today: string
  logMap: Map<string, boolean>   // key: `${goalId}:${date}`
  onToggleActive: () => void
  inactive?: boolean
}

export function SortableGoalRow({ goal, dates, today, logMap, onToggleActive, inactive = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-border/40 transition-colors ${
        isDragging ? 'opacity-50 bg-muted/40' : 'hover:bg-muted/10'
      }`}
    >
      {/* Sticky goal name cell */}
      <td className="sticky left-0 z-10 bg-warm-white px-3 py-2.5 border-r border-border/40 min-w-[160px] max-w-[160px]">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
            aria-label="드래그해서 순서 변경"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <circle cx="9" cy="5" r="1.2" /><circle cx="15" cy="5" r="1.2" />
              <circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" />
              <circle cx="9" cy="19" r="1.2" /><circle cx="15" cy="19" r="1.2" />
            </svg>
          </button>
          <span
            className={`text-sm font-medium truncate ${
              inactive ? 'text-muted-foreground' : 'text-bark-dark'
            }`}
            title={goal.name}
          >
            {goal.name}
          </span>
        </div>
      </td>

      {/* Date cells */}
      {dates.map(date => {
        const done = logMap.get(`${goal.id}:${date}`)
        const cellState = computeCellState(goal.goal_activation_periods, done, date, today)
        return (
          <td key={date} className="px-1 py-2 text-center">
            <div className="flex justify-center">
              <DashboardCell state={cellState} />
            </div>
          </td>
        )
      })}

      {/* Toggle active */}
      <td className="px-2 py-2 text-center">
        <button
          onClick={onToggleActive}
          className="text-[10px] text-muted-foreground hover:text-bark-dark px-1.5 py-1 rounded hover:bg-muted/50 transition-colors whitespace-nowrap"
          aria-label={inactive ? `${goal.name} 다시 활성화` : `${goal.name} 잠시 중단`}
        >
          {inactive ? '다시 시작' : '중단'}
        </button>
      </td>
    </tr>
  )
}
