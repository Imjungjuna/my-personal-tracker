import type { GoalActivationPeriod, CellState } from './types'

export function isApplicable(
  periods: GoalActivationPeriod[],
  date: string,
  today: string
): boolean {
  return periods.some(p => {
    const end = p.ended_on ?? today
    return p.started_on <= date && date <= end
  })
}

export function computeCellState(
  periods: GoalActivationPeriod[],
  done: boolean | undefined,
  date: string,
  today: string
): CellState {
  if (!isApplicable(periods, date, today)) return 'NA'
  if (done === true) return 'DONE'
  if (date < today) return 'MISSED'
  if (date === today) return 'PENDING'
  return 'NA'
}
