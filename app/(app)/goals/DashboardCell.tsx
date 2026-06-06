import type { CellState } from '@/lib/checklist/types'

interface Props {
  state: CellState
}

const CONFIG: Record<CellState, { bg: string; text: string; glyph: string; label: string }> = {
  DONE: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    glyph: '✓',
    label: '완료',
  },
  MISSED: {
    bg: 'bg-rose-100/60',
    text: 'text-rose-400',
    glyph: '·',
    label: '미완료',
  },
  PENDING: {
    bg: 'border border-border bg-transparent',
    text: 'text-muted-foreground',
    glyph: '○',
    label: '진행중 (오늘)',
  },
  NA: {
    bg: 'bg-transparent',
    text: 'text-muted-foreground/30',
    glyph: '—',
    label: '해당없음',
  },
}

export function DashboardCell({ state }: Props) {
  const { bg, text, glyph, label } = CONFIG[state]
  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold select-none ${bg} ${text}`}
    >
      <span aria-hidden="true">{glyph}</span>
    </div>
  )
}
