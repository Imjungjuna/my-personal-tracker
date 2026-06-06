import { describe, it, expect } from 'vitest'
import { computeCellState, isApplicable } from './cell-state'
import type { GoalActivationPeriod } from './types'

const TODAY = '2026-06-06'

function p(startedOn: string, endedOn: string | null): GoalActivationPeriod {
  return { id: '1', goal_id: 'g1', user_id: 'u1', started_on: startedOn, ended_on: endedOn, created_at: '' }
}

describe('isApplicable', () => {
  it('true: date in open period', () => {
    expect(isApplicable([p('2026-06-01', null)], '2026-06-05', TODAY)).toBe(true)
  })
  it('true: today in open period', () => {
    expect(isApplicable([p('2026-06-01', null)], TODAY, TODAY)).toBe(true)
  })
  it('false: before period start', () => {
    expect(isApplicable([p('2026-06-03', null)], '2026-06-02', TODAY)).toBe(false)
  })
  it('false: after period end', () => {
    expect(isApplicable([p('2026-06-01', '2026-06-04')], '2026-06-05', TODAY)).toBe(false)
  })
  it('true: on period start date (inclusive)', () => {
    expect(isApplicable([p('2026-06-05', null)], '2026-06-05', TODAY)).toBe(true)
  })
  it('true: on period end date (inclusive)', () => {
    expect(isApplicable([p('2026-06-01', '2026-06-05')], '2026-06-05', TODAY)).toBe(true)
  })
  it('true: multiple periods, one matches', () => {
    expect(isApplicable([p('2026-05-01', '2026-05-15'), p('2026-06-01', null)], '2026-06-05', TODAY)).toBe(true)
  })
  it('false: empty periods', () => {
    expect(isApplicable([], '2026-06-05', TODAY)).toBe(false)
  })
})

describe('computeCellState', () => {
  const periods = [p('2026-06-01', null)]

  it('DONE: applicable + done=true (past)', () => {
    expect(computeCellState(periods, true, '2026-06-05', TODAY)).toBe('DONE')
  })
  it('MISSED: applicable + done=false + past date', () => {
    expect(computeCellState(periods, false, '2026-06-05', TODAY)).toBe('MISSED')
  })
  it('MISSED: applicable + done=undefined + past date', () => {
    expect(computeCellState(periods, undefined, '2026-06-05', TODAY)).toBe('MISSED')
  })
  it('PENDING: applicable + not done + today', () => {
    expect(computeCellState(periods, false, TODAY, TODAY)).toBe('PENDING')
  })
  it('DONE: applicable + done=true + today', () => {
    expect(computeCellState(periods, true, TODAY, TODAY)).toBe('DONE')
  })
  it('NA: not applicable (gap between periods)', () => {
    const gap = [p('2026-06-01', '2026-06-03')]
    expect(computeCellState(gap, false, '2026-06-05', TODAY)).toBe('NA')
  })
  it('NA: empty periods, any done state', () => {
    expect(computeCellState([], true, '2026-06-05', TODAY)).toBe('NA')
  })
})
