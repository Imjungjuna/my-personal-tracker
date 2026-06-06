# Daily Checklist Tracker — Design Spec

**Date:** 2026-06-06
**Scope:** Two new pages (daily check-in + 30-day dashboard) + route restructure

---

## 1. Route Structure

### New top-level route group `app/(app)/`
Route group (URL-transparent). Replaces `app/dashboard/layout.tsx` + `app/dashboard/(with-nav)/layout.tsx` with a single shared layout.

```
app/
  (app)/
    layout.tsx                     ← flex bg-cream + Sidebar + BottomTabBar (one place)
    dashboard/
      page.tsx                     → /dashboard          (moved, URL unchanged)
      calendar/page.tsx            → /dashboard/calendar (moved, URL unchanged)
    check-in/
      daily-goals/page.tsx         → /check-in/daily-goals  (NEW)
      sleep/page.tsx               → /check-in/sleep         (moved from /dashboard/checkin)
      mood/page.tsx                → /check-in/mood          (moved from /dashboard/mood-checkin)
      nap/page.tsx                 → /check-in/nap           (moved from /dashboard/nap-checkin)
      condition/page.tsx           → /check-in/condition     (moved from /dashboard/condition-checkin)
    goals/
      page.tsx                     → /goals               (NEW)
  login/, auth/, onboarding/       (unchanged)
```

Old routes get permanent redirects in `next.config.ts`:
- `/dashboard/checkin` → `/check-in/sleep`
- `/dashboard/mood-checkin` → `/check-in/mood`
- `/dashboard/nap-checkin` → `/check-in/nap`
- `/dashboard/condition-checkin` → `/check-in/condition`

Delete: `app/dashboard/layout.tsx`, `app/dashboard/(with-nav)/layout.tsx`

### Navigation updates
- **Sidebar**: update 4 existing check-in links + add "체크리스트" (`/check-in/daily-goals`) and "목표 현황" (`/goals`)
- **BottomTabBar**: update 4 check-in links only; new pages accessible via `/dashboard` home on mobile (option C)
- Existing action files: update any `revalidatePath` calls to new routes

---

## 2. Data Layer

```
lib/checklist/
  types.ts        ← Goal, GoalActivationPeriod, DailyLog, CellState, GoalWithPeriods
  cell-state.ts   ← isApplicable(), computeCellState() — pure functions, no imports from server
  queries.ts      ← server-only, React cache-wrapped queries
  actions.ts      ← 'use server' actions
```

### Types
```ts
type CellState = 'DONE' | 'MISSED' | 'PENDING' | 'NA'
type GoalWithPeriods = Goal & { goal_activation_periods: GoalActivationPeriod[] }
```

### Cell-state rule (canonical)
1. `applicable(G, D)` = any period where `started_on <= D <= (ended_on ?? today)`
2. Not applicable → **NA**
3. Applicable:
   - `done === true` → **DONE**
   - `D < today` → **MISSED**
   - `D === today` → **PENDING**
   - `D > today` → don't render

### Queries (server-only, `cache()` wrapped)
- `getGoalsWithPeriods(userId)` — goals + nested periods, sorted `(is_active desc, sort_order asc, created_at desc)`
- `getTodayLogs(userId, todayISO)` — today's daily_logs
- `getLogsForRange(userId, fromDate, toDate)` — 30-day logs for dashboard

### Actions (`'use server'`)
- `upsertLog(goalId, date, done)` — upsert daily_logs on conflict `(goal_id, log_date)`
- `addGoal(name)` — insert into goals (trigger auto-opens period)
- `toggleGoalActive(goalId, currentlyActive)` — calls `activate_goal` / `deactivate_goal` RPC
- `reorderGoals(updates: {id, sort_order}[])` — bulk sort_order update

---

## 3. Page 1 — `/check-in/daily-goals`

**Purpose:** Low-friction daily check-in. Mobile-first, large tap targets.

**File structure:**
```
app/(app)/check-in/daily-goals/
  page.tsx           ← Server Component: fetch goals + today's logs → TodayChecklist
  TodayChecklist.tsx ← 'use client': main state + optimistic logic
  GoalCheckRow.tsx   ← 'use client': single goal row
  AddGoalForm.tsx    ← 'use client': inline add form
```

**Optimistic UI:**
- Checkbox toggle: `useOptimistic` on log done state → `upsertLog` → `router.refresh()`
- Active toggle: `useOptimistic` on goal list → `toggleGoalActive` → `router.refresh()`
- Add goal: no optimistic (needs server-generated ID) → `addGoal` → `router.refresh()`
- Error: inline message, state reverts automatically on transition end

**Layout:**
- Active goals: card with large rows (48px+ tap target), checkbox + name + "중단" button
- Inactive ("잠시 쉬는 목표"): collapsed by default, expand to reactivate
- "+ 목표 추가": dashed button → inline form

**Tone:** neutral language ("잠시 쉬는 목표" not "중단된 목표"), gentle empty state copy

---

## 4. Page 2 — `/goals`

**Purpose:** 30-day goal history table. Honest, calm visualization.

**File structure:**
```
app/(app)/goals/
  page.tsx              ← Server Component: fetch goals + 30-day logs → GoalDashboard
  GoalDashboard.tsx     ← 'use client': table + dnd + optimistic active toggle
  SortableGoalRow.tsx   ← 'use client': dnd-kit sortable table row
  DashboardCell.tsx     ← pure component: renders one cell by CellState
  Legend.tsx            ← static: 4-state legend
```

**Table layout:**
- Sticky left column (goal name), sticky top row (dates)
- Horizontal scroll; 30 date columns oldest→newest, today rightmost
- Two sections with divider: "활성 목표" on top, "잠시 쉬는 목표" below (collapsed)

**Cell colors (color + glyph for a11y):**
| State   | Background          | Text            | Glyph |
|---------|---------------------|-----------------|-------|
| DONE    | `bg-emerald-100`    | `text-emerald-600` | ✓  |
| MISSED  | `bg-rose-100/60`    | `text-rose-400` | ·     |
| PENDING | `border border-border` | `text-muted-foreground` | ○ |
| NA      | transparent         | `text-muted-foreground/30` | — |

**Drag-to-reorder (dnd-kit):**
- Two separate `DndContext` + `SortableContext` — one per section (no cross-section drag)
- On drop: `reorderGoals(updates)` → `router.refresh()`; optimistic reorder via `useOptimistic`

**Active toggle in table:** same pattern as Page 1 (optimistic + error display)

---

## 5. Tech Decisions

- **dnd-kit** (already installed by user) for drag-to-reorder
- **framer-motion** (already installed) for checkbox check animation
- **KST timezone** (`getTodayISO()` from `utils/date.ts`) for all date comparisons
- No dark mode implementation (`.dark` theme variables not defined in globals.css)
- No new test infra — vitest already configured; tests cover `cell-state.ts` pure functions only
