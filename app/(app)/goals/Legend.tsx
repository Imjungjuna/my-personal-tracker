import { DashboardCell } from './DashboardCell'
import type { CellState } from '@/lib/checklist/types'

const ITEMS: { state: CellState; label: string }[] = [
  { state: 'DONE', label: '완료' },
  { state: 'MISSED', label: '미완료' },
  { state: 'PENDING', label: '오늘 (진행중)' },
  { state: 'NA', label: '해당없음' },
]

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 items-center" aria-label="범례">
      {ITEMS.map(({ state, label }) => (
        <div key={state} className="flex items-center gap-1.5">
          <DashboardCell state={state} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
