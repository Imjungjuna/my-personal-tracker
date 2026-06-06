# Daily Checklist Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/check-in/daily-goals` (daily check-in) and `/goals` (30-day table dashboard) backed by Supabase goals/periods/logs tables, plus restructure existing check-in routes under `app/(app)/`.

**Architecture:** Route group `app/(app)/` provides shared layout (Sidebar + BottomTabBar) for all authenticated pages. Pure `computeCellState` function drives cell rendering from periods + logs. Both new pages use `useOptimistic` for instant UI feedback on toggle actions, with `router.refresh()` to sync server state.

**Tech Stack:** Next.js 16 App Router, React 19 `useOptimistic`, Supabase `@supabase/ssr`, dnd-kit, framer-motion, Tailwind v4, vitest

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `app/(app)/layout.tsx` | Shared authenticated layout (replaces two dashboard layouts) |
| `app/(app)/dashboard/page.tsx` | Moved from `app/dashboard/(with-nav)/page.tsx` |
| `app/(app)/dashboard/calendar/page.tsx` | Moved |
| `app/(app)/check-in/sleep/` | All files moved from `app/dashboard/(with-nav)/checkin/` |
| `app/(app)/check-in/mood/` | All files moved from `app/dashboard/(with-nav)/mood-checkin/` |
| `app/(app)/check-in/nap/` | All files moved from `app/dashboard/(with-nav)/nap-checkin/` |
| `app/(app)/check-in/condition/` | All files moved from `app/dashboard/(with-nav)/condition-checkin/` |
| `app/(app)/check-in/daily-goals/page.tsx` | Page 1 server component |
| `app/(app)/check-in/daily-goals/TodayChecklist.tsx` | Page 1 main client component |
| `app/(app)/check-in/daily-goals/GoalCheckRow.tsx` | Single goal row |
| `app/(app)/check-in/daily-goals/AddGoalForm.tsx` | Inline add form |
| `app/(app)/goals/page.tsx` | Page 2 server component |
| `app/(app)/goals/GoalDashboard.tsx` | Page 2 main client component |
| `app/(app)/goals/SortableGoalRow.tsx` | dnd-kit sortable table row |
| `app/(app)/goals/DashboardCell.tsx` | Single cell (pure) |
| `app/(app)/goals/Legend.tsx` | 4-state legend |
| `lib/checklist/types.ts` | Shared TS types |
| `lib/checklist/cell-state.ts` | Pure cell state logic |
| `lib/checklist/cell-state.test.ts` | Vitest tests |
| `lib/checklist/queries.ts` | Server-only data fetching |
| `lib/checklist/actions.ts` | Server actions |

### Modified files
| File | Change |
|------|--------|
| `next.config.ts` | Add 4 permanent redirects |
| `components/dashboard/Sidebar.tsx` | Update links + add 2 new nav items |
| `components/dashboard/BottomTabBar.tsx` | Update 4 check-in links |
| `app/(app)/check-in/sleep/actions.ts` | Update revalidatePath |
| `app/(app)/check-in/mood/actions.ts` | Update revalidatePath |
| `app/(app)/check-in/nap/actions.ts` | Update revalidatePath |
| `app/(app)/check-in/condition/actions.ts` | Update revalidatePath |

### Deleted files
- `app/dashboard/layout.tsx`
- `app/dashboard/(with-nav)/layout.tsx`

---

## Task 1: Types + cell-state (TDD)

**Files:**
- Create: `lib/checklist/types.ts`
- Create: `lib/checklist/cell-state.ts`
- Create: `lib/checklist/cell-state.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/checklist/cell-state.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests — expect compile error (modules not found)**

```bash
npm run test -- lib/checklist/cell-state.test.ts
```
Expected: error — `Cannot find module './cell-state'`

- [ ] **Step 3: Create types**

Create `lib/checklist/types.ts`:

```ts
export type Goal = {
  id: string
  user_id: string
  name: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type GoalActivationPeriod = {
  id: string
  goal_id: string
  user_id: string
  started_on: string   // 'YYYY-MM-DD'
  ended_on: string | null  // 'YYYY-MM-DD' or null (still active)
  created_at: string
}

export type DailyLog = {
  id: string
  goal_id: string
  user_id: string
  log_date: string  // 'YYYY-MM-DD'
  done: boolean
  created_at: string
  updated_at: string
}

export type CellState = 'DONE' | 'MISSED' | 'PENDING' | 'NA'

// Goal with its activation periods nested (from Supabase select with join)
export type GoalWithPeriods = Goal & {
  goal_activation_periods: GoalActivationPeriod[]
}
```

- [ ] **Step 4: Create cell-state**

Create `lib/checklist/cell-state.ts`:

```ts
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
```

- [ ] **Step 5: Run tests — expect all pass**

```bash
npm run test -- lib/checklist/cell-state.test.ts
```
Expected: `15 tests passed`

- [ ] **Step 6: Commit**

```bash
git add lib/checklist/types.ts lib/checklist/cell-state.ts lib/checklist/cell-state.test.ts
git commit -m "feat: add checklist types and cell-state pure logic with tests"
```

---

## Task 2: Checklist data layer (queries + actions)

**Files:**
- Create: `lib/checklist/queries.ts`
- Create: `lib/checklist/actions.ts`

- [ ] **Step 1: Create queries**

Create `lib/checklist/queries.ts`:

```ts
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { GoalWithPeriods, DailyLog } from './types'

export const getGoalsWithPeriods = cache(async (userId: string): Promise<GoalWithPeriods[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_activation_periods(*)')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as GoalWithPeriods[]
})

export const getTodayLogs = cache(async (userId: string, todayISO: string): Promise<DailyLog[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', todayISO)

  if (error) throw new Error(error.message)
  return (data ?? []) as DailyLog[]
})

export const getLogsForRange = cache(async (
  userId: string,
  fromDate: string,
  toDate: string
): Promise<DailyLog[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', fromDate)
    .lte('log_date', toDate)

  if (error) throw new Error(error.message)
  return (data ?? []) as DailyLog[]
})
```

- [ ] **Step 2: Create actions**

Create `lib/checklist/actions.ts`:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/dal'

export async function upsertLog(goalId: string, date: string, done: boolean): Promise<void> {
  const supabase = await createClient()
  const user = await getCachedUser()

  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { user_id: user.id, goal_id: goalId, log_date: date, done },
      { onConflict: 'goal_id,log_date' }
    )

  if (error) throw new Error(error.message)
}

export async function addGoal(name: string): Promise<void> {
  const supabase = await createClient()
  const user = await getCachedUser()

  const { error } = await supabase
    .from('goals')
    .insert({ user_id: user.id, name: name.trim(), is_active: true })

  if (error) throw new Error(error.message)
}

export async function toggleGoalActive(goalId: string, currentlyActive: boolean): Promise<void> {
  const supabase = await createClient()
  const rpc = currentlyActive ? 'deactivate_goal' : 'activate_goal'

  const { error } = await supabase.rpc(rpc, { p_goal_id: goalId })
  if (error) throw new Error(error.message)
}

export async function reorderGoals(updates: { id: string; sort_order: number }[]): Promise<void> {
  const supabase = await createClient()

  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('goals').update({ sort_order }).eq('id', id)
    )
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/checklist/queries.ts lib/checklist/actions.ts
git commit -m "feat: add checklist server queries and actions"
```

---

## Task 3: Route restructure

Move all existing dashboard pages into `app/(app)/` route group. Create unified layout. Add redirects.

**Files:**
- Create: `app/(app)/layout.tsx`
- Move: all pages listed below
- Modify: 4 actions files (revalidatePath)
- Modify: `next.config.ts`
- Delete: `app/dashboard/layout.tsx`, `app/dashboard/(with-nav)/layout.tsx`

- [ ] **Step 1: Create the unified layout**

Create `app/(app)/layout.tsx`:

```tsx
import { Sidebar } from '@/components/dashboard/Sidebar'
import { BottomTabBar } from '@/components/dashboard/BottomTabBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {children}
      </div>
      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 2: Move dashboard pages**

```bash
mkdir -p app/\(app\)/dashboard/calendar
git mv "app/dashboard/(with-nav)/page.tsx" "app/(app)/dashboard/page.tsx"
git mv "app/dashboard/(with-nav)/calendar/page.tsx" "app/(app)/dashboard/calendar/page.tsx"
```

- [ ] **Step 3: Move sleep check-in**

```bash
mkdir -p app/\(app\)/check-in/sleep
git mv "app/dashboard/(with-nav)/checkin/page.tsx" "app/(app)/check-in/sleep/page.tsx"
git mv "app/dashboard/(with-nav)/checkin/SleepLogForm.tsx" "app/(app)/check-in/sleep/SleepLogForm.tsx"
git mv "app/dashboard/(with-nav)/checkin/SleepCharts.tsx" "app/(app)/check-in/sleep/SleepCharts.tsx"
git mv "app/dashboard/(with-nav)/checkin/actions.ts" "app/(app)/check-in/sleep/actions.ts"
git mv "app/dashboard/(with-nav)/checkin/loading.tsx" "app/(app)/check-in/sleep/loading.tsx"
```

- [ ] **Step 4: Move mood check-in**

```bash
mkdir -p app/\(app\)/check-in/mood
git mv "app/dashboard/(with-nav)/mood-checkin/page.tsx" "app/(app)/check-in/mood/page.tsx"
git mv "app/dashboard/(with-nav)/mood-checkin/MoodLogForm.tsx" "app/(app)/check-in/mood/MoodLogForm.tsx"
git mv "app/dashboard/(with-nav)/mood-checkin/MoodChart.tsx" "app/(app)/check-in/mood/MoodChart.tsx"
git mv "app/dashboard/(with-nav)/mood-checkin/actions.ts" "app/(app)/check-in/mood/actions.ts"
git mv "app/dashboard/(with-nav)/mood-checkin/loading.tsx" "app/(app)/check-in/mood/loading.tsx"
```

- [ ] **Step 5: Move nap check-in**

```bash
mkdir -p app/\(app\)/check-in/nap
git mv "app/dashboard/(with-nav)/nap-checkin/page.tsx" "app/(app)/check-in/nap/page.tsx"
git mv "app/dashboard/(with-nav)/nap-checkin/NapLogForm.tsx" "app/(app)/check-in/nap/NapLogForm.tsx"
git mv "app/dashboard/(with-nav)/nap-checkin/NapChart.tsx" "app/(app)/check-in/nap/NapChart.tsx"
git mv "app/dashboard/(with-nav)/nap-checkin/actions.ts" "app/(app)/check-in/nap/actions.ts"
```

- [ ] **Step 6: Move condition check-in**

```bash
mkdir -p app/\(app\)/check-in/condition
git mv "app/dashboard/(with-nav)/condition-checkin/page.tsx" "app/(app)/check-in/condition/page.tsx"
git mv "app/dashboard/(with-nav)/condition-checkin/ConditionLogForm.tsx" "app/(app)/check-in/condition/ConditionLogForm.tsx"
git mv "app/dashboard/(with-nav)/condition-checkin/actions.ts" "app/(app)/check-in/condition/actions.ts"
```

- [ ] **Step 7: Fix revalidatePath in sleep actions**

Edit `app/(app)/check-in/sleep/actions.ts` — change line 94:
```ts
// Before:
revalidatePath("/dashboard/checkin");
// After:
revalidatePath("/check-in/sleep");
```

- [ ] **Step 8: Fix revalidatePath in mood actions**

Edit `app/(app)/check-in/mood/actions.ts` — change line 59:
```ts
// Before:
revalidatePath('/dashboard/mood-checkin')
// After:
revalidatePath('/check-in/mood')
```

- [ ] **Step 9: Fix revalidatePath in nap actions**

Edit `app/(app)/check-in/nap/actions.ts` — change line 72:
```ts
// Before:
revalidatePath('/dashboard/nap-checkin')
// After:
revalidatePath('/check-in/nap')
```

- [ ] **Step 10: Fix revalidatePath in condition actions**

Edit `app/(app)/check-in/condition/actions.ts` — change line 81:
```ts
// Before:
revalidatePath('/dashboard/condition-checkin')
// After:
revalidatePath('/check-in/condition')
```

- [ ] **Step 11: Delete old layout files**

```bash
git rm "app/dashboard/layout.tsx"
git rm "app/dashboard/(with-nav)/layout.tsx"
```

- [ ] **Step 12: Add redirects to next.config.ts**

Edit `next.config.ts` — replace entire file:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/dashboard/checkin', destination: '/check-in/sleep', permanent: true },
      { source: '/dashboard/mood-checkin', destination: '/check-in/mood', permanent: true },
      { source: '/dashboard/nap-checkin', destination: '/check-in/nap', permanent: true },
      { source: '/dashboard/condition-checkin', destination: '/check-in/condition', permanent: true },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 13: Verify dev server starts**

```bash
npm run dev
```
Expected: no build errors; visit `http://localhost:3000/dashboard` — Sidebar + page renders correctly.
Visit `http://localhost:3000/check-in/sleep` — sleep check-in page renders.
Visit `http://localhost:3000/dashboard/checkin` — redirects to `/check-in/sleep`.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "refactor: restructure routes into (app) route group, move check-in pages to /check-in/"
```

---

## Task 4: Navigation update

**Files:**
- Modify: `components/dashboard/Sidebar.tsx`
- Modify: `components/dashboard/BottomTabBar.tsx`

- [ ] **Step 1: Update Sidebar**

Replace the entire `NAV_ITEMS` array in `components/dashboard/Sidebar.tsx`:

```tsx
const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: '대시보드',
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/calendar',
    label: '캘린더',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/check-in/daily-goals',
    label: '체크리스트',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: '/goals',
    label: '목표 현황',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    href: '/check-in/sleep',
    label: '수면',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    href: '/check-in/mood',
    label: '기분',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
      </svg>
    ),
  },
  {
    href: '/check-in/nap',
    label: '낮잠',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    href: '/check-in/condition',
    label: '컨디션',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M18 8c0 4-6 9-6 9S6 12 6 8a6 6 0 0112 0z" /><circle cx="12" cy="8" r="2" />
      </svg>
    ),
  },
]
```

- [ ] **Step 2: Update BottomTabBar**

Replace the `TAB_ITEMS` array in `components/dashboard/BottomTabBar.tsx` (update only the 4 href values that changed — icon/label stay the same):

```tsx
const TAB_ITEMS = [
  { href: '/dashboard', label: '대시보드', exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: '/dashboard/calendar', label: '캘린더',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { href: '/check-in/sleep', label: '수면',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
  { href: '/check-in/mood', label: '기분',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth={2.5}/><line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth={2.5}/></svg> },
  { href: '/check-in/nap', label: '낮잠',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
  { href: '/check-in/condition', label: '컨디션',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 8c0 4-6 9-6 9S6 12 6 8a6 6 0 0112 0z"/><circle cx="12" cy="8" r="2"/></svg> },
]
```

- [ ] **Step 3: Verify navigation works**

```bash
npm run dev
```
Expected: Sidebar shows 8 items including "체크리스트" and "목표 현황". All existing links navigate correctly. BottomTabBar check-in links go to new routes.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/Sidebar.tsx components/dashboard/BottomTabBar.tsx
git commit -m "feat: update navigation — add checklist/goals links, update check-in routes"
```

---

## Task 5: Page 1 — server component + GoalCheckRow

**Files:**
- Create: `app/(app)/check-in/daily-goals/page.tsx`
- Create: `app/(app)/check-in/daily-goals/GoalCheckRow.tsx`

- [ ] **Step 1: Create page server component**

Create `app/(app)/check-in/daily-goals/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Create GoalCheckRow**

Create `app/(app)/check-in/daily-goals/GoalCheckRow.tsx`:

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { GoalWithPeriods } from '@/lib/checklist/types'

interface Props {
  goal: GoalWithPeriods
  done: boolean
  inactive?: boolean
  onToggleDone: () => void
  onToggleActive: () => void
}

export function GoalCheckRow({ goal, done, inactive = false, onToggleDone, onToggleActive }: Props) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors ${
        done ? 'bg-emerald-50' : inactive ? '' : 'hover:bg-muted/30'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleDone}
        disabled={inactive}
        aria-label={done ? '완료 취소' : '완료로 표시'}
        className={`
          w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-paw-brown-light bg-transparent hover:border-paw-brown'
          }
          ${inactive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <AnimatePresence>
          {done && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="w-4 h-4"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      {/* Goal name */}
      <span
        className={`flex-1 text-base font-medium transition-colors ${
          done
            ? 'text-muted-foreground line-through'
            : inactive
            ? 'text-muted-foreground'
            : 'text-bark-dark'
        }`}
      >
        {goal.name}
      </span>

      {/* Active toggle */}
      <button
        onClick={onToggleActive}
        className="text-xs text-muted-foreground hover:text-bark-dark px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
        aria-label={inactive ? `${goal.name} 다시 활성화` : `${goal.name} 잠시 중단`}
      >
        {inactive ? '다시 시작' : '중단'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/check-in/daily-goals/page.tsx" "app/(app)/check-in/daily-goals/GoalCheckRow.tsx"
git commit -m "feat: add daily-goals page server component and GoalCheckRow"
```

---

## Task 6: Page 1 — AddGoalForm

**Files:**
- Create: `app/(app)/check-in/daily-goals/AddGoalForm.tsx`

- [ ] **Step 1: Create AddGoalForm**

Create `app/(app)/check-in/daily-goals/AddGoalForm.tsx`:

```tsx
'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addGoal } from '@/lib/checklist/actions'

export function AddGoalForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const openForm = () => {
    setOpen(true)
    // focus after state update renders the input
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const closeForm = () => {
    setOpen(false)
    setName('')
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await addGoal(name.trim())
        closeForm()
        router.refresh()
      } catch {
        setError('목표 추가에 실패했어요. 다시 시도해주세요.')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={openForm}
        className="w-full flex items-center gap-2 px-5 py-4 rounded-3xl bg-warm-white/80 border-2 border-dashed border-paw-brown-light text-muted-foreground hover:text-bark-dark hover:border-paw-brown transition-colors text-sm font-medium"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        목표 추가
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-4"
    >
      <input
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="새 목표 이름 (예: 물 2L 마시기)"
        maxLength={200}
        className="w-full bg-transparent text-bark-dark placeholder:text-muted-foreground text-base font-medium outline-none border-b border-border pb-2 mb-3"
      />
      {error && <p className="text-xs text-rose-500 mb-2">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={closeForm}
          className="px-4 py-1.5 text-sm text-muted-foreground hover:text-bark-dark transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isPending}
          className="px-4 py-1.5 text-sm font-semibold bg-sleepy-yellow text-bark-dark rounded-lg disabled:opacity-40 transition-opacity"
        >
          {isPending ? '추가 중...' : '추가'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/check-in/daily-goals/AddGoalForm.tsx"
git commit -m "feat: add AddGoalForm component for daily-goals page"
```

---

## Task 7: Page 1 — TodayChecklist (main client component)

**Files:**
- Create: `app/(app)/check-in/daily-goals/TodayChecklist.tsx`

- [ ] **Step 1: Create TodayChecklist**

Create `app/(app)/check-in/daily-goals/TodayChecklist.tsx`:

```tsx
'use client'

import { useOptimistic, useTransition, useState } from 'react'
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
  const [, startTransition] = useTransition()

  const initialLogDone: Record<string, boolean> = {}
  for (const log of initialLogs) {
    initialLogDone[log.goal_id] = log.done
  }

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

  const activeGoals = optimistic.goals.filter(g => g.is_active)
  const inactiveGoals = optimistic.goals.filter(g => !g.is_active)

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
              onToggleDone={() => handleToggleDone(goal.id)}
              onToggleActive={() => handleToggleActive(goal.id, true)}
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
                  onToggleActive={() => handleToggleActive(goal.id, false)}
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
```

- [ ] **Step 2: Verify Page 1 in browser**

```bash
npm run dev
```
Expected:
- `/check-in/daily-goals` loads without errors
- Sidebar shows "체크리스트" active
- Checking a goal updates instantly (optimistic), persists on refresh
- "중단" moves goal to inactive section instantly
- "잠시 쉬는 목표" collapses/expands
- "다시 시작" moves goal back to active section
- "+ 목표 추가" opens form; submitting adds goal and refreshes list

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/check-in/daily-goals/TodayChecklist.tsx"
git commit -m "feat: add TodayChecklist client component with optimistic updates"
```

---

## Task 8: Page 2 — DashboardCell + Legend

**Files:**
- Create: `app/(app)/goals/DashboardCell.tsx`
- Create: `app/(app)/goals/Legend.tsx`

- [ ] **Step 1: Create DashboardCell**

Create `app/(app)/goals/DashboardCell.tsx`:

```tsx
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
```

- [ ] **Step 2: Create Legend**

Create `app/(app)/goals/Legend.tsx`:

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/goals/DashboardCell.tsx" "app/(app)/goals/Legend.tsx"
git commit -m "feat: add DashboardCell and Legend components for goals page"
```

---

## Task 9: Page 2 — SortableGoalRow

**Files:**
- Create: `app/(app)/goals/SortableGoalRow.tsx`

- [ ] **Step 1: Create SortableGoalRow**

Create `app/(app)/goals/SortableGoalRow.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/goals/SortableGoalRow.tsx"
git commit -m "feat: add SortableGoalRow with dnd-kit for goals table"
```

---

## Task 10: Page 2 — GoalDashboard + page server component

**Files:**
- Create: `app/(app)/goals/GoalDashboard.tsx`
- Create: `app/(app)/goals/page.tsx`

- [ ] **Step 1: Create GoalDashboard**

Create `app/(app)/goals/GoalDashboard.tsx`:

```tsx
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
```

- [ ] **Step 2: Create page server component**

Create `app/(app)/goals/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Verify Page 2 in browser**

```bash
npm run dev
```
Expected:
- `/goals` loads, shows table with 30 date columns
- Goal name column is sticky on horizontal scroll
- Date header is sticky on vertical scroll
- Cell colors: green ✓ for done, muted red · for missed, outline ○ for today pending, empty — for N/A
- Drag handle on each row; dragging reorders within section; order persists on refresh
- "잠시 쉬는 목표" section collapses/expands
- Active toggle ("중단"/"다시 시작") moves goal between sections optimistically
- Legend shows all 4 states at bottom
- Empty state shows link to checklist page

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/goals/GoalDashboard.tsx" "app/(app)/goals/page.tsx"
git commit -m "feat: add GoalDashboard table with dnd-kit reorder and 30-day cell grid"
```

---

## Self-review

**Spec coverage check:**
- ✅ Route restructure `app/(app)/` — Task 3
- ✅ Redirects for old routes — Task 3, Step 12
- ✅ Navigation updated — Task 4
- ✅ Types + cell-state with tests — Task 1
- ✅ Queries + actions (upsertLog, addGoal, toggleGoalActive, reorderGoals) — Task 2
- ✅ Page 1: active/inactive sections, checkbox optimistic, toggle optimistic — Task 5–7
- ✅ Collapsed inactive by default — Task 7 (`useState(false)`)
- ✅ Add goal form — Task 6
- ✅ Page 2: 30-day table, sticky columns, two sections — Task 10
- ✅ dnd-kit per-section SortableContext (no cross-section drag) — Task 10
- ✅ Cell colors + glyphs (a11y) — Task 8
- ✅ Legend — Task 8
- ✅ Active toggle in both pages — Tasks 7 + 10
- ✅ Muted reds (rose-100/60, not alarm red) — Task 8
- ✅ KST today via `getTodayISO()` — Tasks 5, 10

**Assumptions made:**
1. `dnd-kit` already installed (user confirmed)
2. No dark mode — `.dark` CSS variables not defined in globals.css
3. `goal_activation_periods` is queryable as nested select via Supabase foreign key relationship
4. BottomTabBar mobile users reach new pages from `/dashboard` home (option C — no new tabs added)
5. `reorderGoals` uses parallel individual UPDATEs (acceptable for typical goal counts < 20)
6. Dates computed in KST via existing `getISODaysAgo()` — no additional timezone handling needed
