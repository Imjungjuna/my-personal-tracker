# Dashboard & Calendar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile bottom-tab layout with a desktop sidebar + responsive bottom-tab layout, redesign the dashboard with stat cards + 7-day multi-metric bar chart, and add a monthly calendar page.

**Architecture:** The `(with-nav)` route group layout is replaced with a sidebar (desktop) + bottom tab bar (mobile) shell. The dashboard home page moves inside `(with-nav)` so all dashboard routes share the same sidebar. New components are colocated in `components/dashboard/` and `components/calendar/`.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components, Supabase (PostgreSQL), Recharts, Tailwind CSS v4, Vitest

---

## File Map

### Modified
- `app/dashboard/layout.tsx` — change outer wrapper from `bg-zinc-100` to `flex` for sidebar layout
- `app/dashboard/(with-nav)/layout.tsx` — replace top nav with `<Sidebar>` + `<BottomTabBar>`
- `lib/dal.ts` — add `getCachedConditionLogs7Days`, `getTodayCheckinStatus`, `getMonthLogs`

### Created
- `app/dashboard/(with-nav)/page.tsx` — new dashboard page (replaces `app/dashboard/page.tsx`)
- `app/dashboard/(with-nav)/calendar/page.tsx` — new calendar page
- `components/dashboard/Sidebar.tsx` — left sidebar (desktop only)
- `components/dashboard/BottomTabBar.tsx` — bottom tab bar (mobile only)
- `components/dashboard/CheckinButtons.tsx` — today's 4 check-in status buttons
- `components/dashboard/StatCards.tsx` — 4-column stat card row
- `components/dashboard/WeekConditionChart.tsx` — 7-day grouped bar chart (client)
- `components/dashboard/TodayMetricsCard.tsx` — today's condition with pip indicators
- `components/dashboard/MoodLogList.tsx` — today's mood entries list
- `components/calendar/MonthCalendar.tsx` — monthly calendar grid (client)
- `lib/dashboard-utils.ts` — pure helpers: week chart data transform, CNS status color
- `lib/dashboard-utils.test.ts` — vitest unit tests for helpers
- `scripts/seed-sample-data.sql` — 30-day sample data for local dev

### Deleted
- `app/dashboard/page.tsx` — content moved to `(with-nav)/page.tsx`

---

## Task 1: Pure helper functions + tests

**Files:**
- Create: `lib/dashboard-utils.ts`
- Create: `lib/dashboard-utils.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// lib/dashboard-utils.test.ts
import { describe, it, expect } from "vitest";
import { cnsStatusColor, buildWeekChartData } from "./dashboard-utils";

describe("cnsStatusColor", () => {
  it("returns optimal color for score >= 85", () => {
    expect(cnsStatusColor("Optimal")).toBe("#D4F0D4");
  });
  it("returns recovered color for Recovered", () => {
    expect(cnsStatusColor("Recovered")).toBe("#FFF3C4");
  });
  it("returns mild color for Mild Fatigue", () => {
    expect(cnsStatusColor("Mild Fatigue")).toBe("#FFE0B2");
  });
  it("returns high color for High Fatigue", () => {
    expect(cnsStatusColor("High Fatigue")).toBe("#FFCDD2");
  });
  it("returns empty color for null", () => {
    expect(cnsStatusColor(null)).toBe("#F5EDE0");
  });
});

describe("buildWeekChartData", () => {
  it("returns 7 entries spanning last 7 days", () => {
    const result = buildWeekChartData([], []);
    expect(result).toHaveLength(7);
  });

  it("fills in condition values for matching date", () => {
    const conditionLogs = [
      { log_date: "2026-06-04", mental_condition: 4, physical_energy: 3, muscle_soreness: 2 },
    ];
    const sleepLogs = [
      { wake_date: "2026-06-04", sleep_quality: 5 },
    ];
    // find today's entry
    const result = buildWeekChartData(conditionLogs, sleepLogs);
    const today = result.find((d) => d.isToday);
    expect(today?.mentalCondition).toBe(4);
    expect(today?.physicalEnergy).toBe(3);
    expect(today?.muscleSoreness).toBe(2);
    expect(today?.sleepQuality).toBe(5);
  });

  it("sets null for days with no log", () => {
    const result = buildWeekChartData([], []);
    expect(result[0].mentalCondition).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/jungjun/Workspace/condition-tracker
npx vitest run lib/dashboard-utils.test.ts
```

Expected: FAIL — `dashboard-utils` module not found

- [ ] **Step 3: Implement helpers**

```typescript
// lib/dashboard-utils.ts
import type { CnsStatus } from "@/lib/cns-score";
import { getISODaysAgo, getTodayISO } from "@/utils/date";

export function cnsStatusColor(status: CnsStatus | null): string {
  switch (status) {
    case "Optimal":      return "#D4F0D4";
    case "Recovered":    return "#FFF3C4";
    case "Mild Fatigue": return "#FFE0B2";
    case "High Fatigue": return "#FFCDD2";
    default:             return "#F5EDE0";
  }
}

export type WeekDayData = {
  date: string;       // ISO "YYYY-MM-DD"
  label: string;      // "4" (day number)
  mentalCondition: number | null;
  physicalEnergy: number | null;
  muscleSoreness: number | null;
  sleepQuality: number | null;
  isToday: boolean;
};

export function buildWeekChartData(
  conditionLogs: Array<{ log_date: string; mental_condition: number; physical_energy: number; muscle_soreness: number }>,
  sleepLogs: Array<{ wake_date: string; sleep_quality: number | null }>,
): WeekDayData[] {
  const today = getTodayISO();
  return Array.from({ length: 7 }, (_, i) => {
    const date = getISODaysAgo(6 - i);
    const cond = conditionLogs.find((l) => l.log_date === date);
    const sleep = sleepLogs.find((l) => l.wake_date === date);
    return {
      date,
      label: date.slice(8), // day number
      mentalCondition:  cond?.mental_condition  ?? null,
      physicalEnergy:   cond?.physical_energy   ?? null,
      muscleSoreness:   cond?.muscle_soreness   ?? null,
      sleepQuality:     sleep?.sleep_quality    ?? null,
      isToday: date === today,
    };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/dashboard-utils.test.ts
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/dashboard-utils.ts lib/dashboard-utils.test.ts
git commit -m "feat: add dashboard pure helpers + tests (cnsStatusColor, buildWeekChartData)"
```

---

## Task 2: DAL additions

**Files:**
- Modify: `lib/dal.ts`

- [ ] **Step 1: Add three new queries at the end of `lib/dal.ts`**

```typescript
// Append to lib/dal.ts

export const getCachedConditionLogs7Days = cache(
  async (userId: string, fromDate: string = getISODaysAgo(6)) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("condition_logs")
      .select("log_date, mental_condition, physical_energy, muscle_soreness")
      .eq("user_id", userId)
      .gte("log_date", fromDate)
      .order("log_date", { ascending: true });
    return data ?? [];
  },
);

export const getTodayCheckinStatus = cache(async (userId: string) => {
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();
  const supabase = await createClient();

  const [sleep, condition, mood, nap] = await Promise.all([
    supabase.from("sleep_logs").select("id").eq("user_id", userId).eq("wake_date", todayISO).maybeSingle(),
    supabase.from("condition_logs").select("id").eq("user_id", userId).eq("log_date", todayISO).maybeSingle(),
    supabase.from("mood_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("log_time", todayStartTs),
    supabase.from("nap_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("start_time", todayStartTs),
  ]);

  return {
    sleep:     !!sleep.data,
    condition: !!condition.data,
    mood:      (mood.count ?? 0) > 0,
    nap:       (nap.count ?? 0) > 0,
  };
});

export const getMonthLogs = cache(
  async (userId: string, year: number, month: number) => {
    const supabase = await createClient();
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const startTs = new Date(`${startDate}T00:00:00+09:00`).toISOString();
    const endTs   = new Date(`${endDate}T23:59:59+09:00`).toISOString();

    const [sleepLogs, conditionLogs, moodLogs, napLogs] = await Promise.all([
      supabase.from("sleep_logs").select("wake_date, bed_time, wake_time, sleep_quality").eq("user_id", userId).gte("wake_date", startDate).lte("wake_date", endDate),
      supabase.from("condition_logs").select("log_date, mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe").eq("user_id", userId).gte("log_date", startDate).lte("log_date", endDate),
      supabase.from("mood_logs").select("log_time, score").eq("user_id", userId).gte("log_time", startTs).lte("log_time", endTs),
      supabase.from("nap_logs").select("start_time, end_time").eq("user_id", userId).gte("start_time", startTs).lte("start_time", endTs),
    ]);

    return {
      sleepLogs:     sleepLogs.data     ?? [],
      conditionLogs: conditionLogs.data ?? [],
      moodLogs:      moodLogs.data      ?? [],
      napLogs:       napLogs.data       ?? [],
    };
  },
);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/dal.ts
git commit -m "feat(dal): add getCachedConditionLogs7Days, getTodayCheckinStatus, getMonthLogs"
```

---

## Task 3: Sidebar component

**Files:**
- Create: `components/dashboard/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar**

```tsx
// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/dashboard/calendar",
    label: "캘린더",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/checkin",
    label: "수면",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/mood-checkin",
    label: "기분",
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
    href: "/dashboard/nap-checkin",
    label: "낮잠",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/condition-checkin",
    label: "컨디션",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M18 8c0 4-6 9-6 9S6 12 6 8a6 6 0 0112 0z" /><circle cx="12" cy="8" r="2" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[210px] shrink-0 bg-bark-dark min-h-screen px-3.5 py-6 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2.5 pb-5 mb-2 border-b border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFD97D" strokeWidth={1.8} className="w-5 h-5 shrink-0">
          <circle cx="12" cy="13" r="6" />
          <circle cx="6.5" cy="6.5" r="2" /><circle cx="17.5" cy="6.5" r="2" />
          <circle cx="3.5" cy="11" r="2" /><circle cx="20.5" cy="11" r="2" />
        </svg>
        <span className="text-warm-white font-bold text-sm">컨디션 트래커</span>
      </div>

      <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest px-2.5 py-2 mt-1">메뉴</p>

      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
              isActive
                ? "bg-sleepy-yellow text-bark-dark font-bold"
                : "text-white/60 hover:bg-white/[0.08] hover:text-warm-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}

      {/* General section */}
      <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest px-2.5 py-2 mt-4">일반</p>
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] text-sm font-medium text-white/35"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93A10 10 0 1112 2" />
        </svg>
        설정
      </Link>
    </aside>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/Sidebar.tsx
git commit -m "feat: add Sidebar component with outline icons"
```

---

## Task 4: BottomTabBar component (mobile)

**Files:**
- Create: `components/dashboard/BottomTabBar.tsx`

- [ ] **Step 1: Create BottomTabBar**

```tsx
// components/dashboard/BottomTabBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB_ITEMS = [
  { href: "/dashboard", label: "홈", exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/calendar", label: "캘린더",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { href: "/dashboard/checkin", label: "수면",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
  { href: "/dashboard/mood-checkin", label: "기분",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth={2.5}/><line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth={2.5}/></svg> },
  { href: "/dashboard/nap-checkin", label: "낮잠",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
  { href: "/dashboard/condition-checkin", label: "컨디션",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 8c0 4-6 9-6 9S6 12 6 8a6 6 0 0112 0z"/><circle cx="12" cy="8" r="2"/></svg> },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-warm-white/90 backdrop-blur-sm border-t border-paw-brown-light">
      <div className="flex">
        {TAB_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? "text-bark-dark" : "text-bark-light"
              }`}
            >
              <span className={`p-1 rounded-lg ${isActive ? "bg-sleepy-yellow" : ""}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/BottomTabBar.tsx
git commit -m "feat: add BottomTabBar component for mobile"
```

---

## Task 5: Replace (with-nav) layout + update outer layout

**Files:**
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/dashboard/(with-nav)/layout.tsx`

- [ ] **Step 1: Update outer dashboard layout**

Replace entire `app/dashboard/layout.tsx`:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Replace (with-nav) layout**

Replace entire `app/dashboard/(with-nav)/layout.tsx`:

```tsx
// app/dashboard/(with-nav)/layout.tsx
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomTabBar } from "@/components/dashboard/BottomTabBar";

export default function WithNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {children}
      </div>
      <BottomTabBar />
    </>
  );
}
```

- [ ] **Step 3: Start dev server and verify existing check-in pages still render**

```bash
npm run dev
```

Open `http://localhost:3000/dashboard/checkin` — sidebar visible on desktop, bottom tabs on mobile. Check-in forms still functional.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/layout.tsx app/dashboard/(with-nav)/layout.tsx
git commit -m "feat: replace top nav with sidebar + bottom tab bar layout"
```

---

## Task 6: WeekConditionChart component

**Files:**
- Create: `components/dashboard/WeekConditionChart.tsx`

This is a client component. It receives the 7-day data as a prop (already built by `buildWeekChartData`).

- [ ] **Step 1: Create WeekConditionChart**

```tsx
// components/dashboard/WeekConditionChart.tsx
"use client";

import { use } from "react";
import { buildWeekChartData } from "@/lib/dashboard-utils";

type SleepLog = { wake_date: string; sleep_quality: number | null };
type ConditionLog = { log_date: string; mental_condition: number; physical_energy: number; muscle_soreness: number };

interface Props {
  sleepPromise: Promise<SleepLog[]>;
  conditionPromise: Promise<ConditionLog[]>;
}

const METRICS = [
  { key: "mentalCondition",  color: "#C8956C", label: "정신 상태" },
  { key: "physicalEnergy",   color: "#FFD97D", label: "신체 에너지" },
  { key: "muscleSoreness",   color: "#F4A7B9", label: "근육 통증" },
  { key: "sleepQuality",     color: "#A8D5A2", label: "수면 질" },
] as const;

const CHART_HEIGHT = 110;
const BAR_WIDTH = 8;

export function WeekConditionChart({ sleepPromise, conditionPromise }: Props) {
  const sleepLogs = use(sleepPromise);
  const conditionLogs = use(conditionPromise);
  const days = buildWeekChartData(conditionLogs, sleepLogs);

  return (
    <div>
      {/* Bars */}
      <div className="flex items-end gap-2" style={{ height: CHART_HEIGHT }}>
        {days.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="flex items-end gap-0.5 w-full justify-center">
              {METRICS.map(({ key, color }) => {
                const value = day[key];
                const height = value != null ? Math.round((value / 5) * CHART_HEIGHT) : 0;
                return (
                  <div
                    key={key}
                    title={value != null ? `${value}` : "기록 없음"}
                    className="rounded-t-[3px] transition-all"
                    style={{
                      width: BAR_WIDTH,
                      height,
                      background: value != null ? color : "#F5EDE0",
                      outline: day.isToday ? `1.5px solid #5C3D2E` : undefined,
                      outlineOffset: day.isToday ? 1 : undefined,
                    }}
                  />
                );
              })}
            </div>
            <span className={`text-[9px] mt-1 ${day.isToday ? "text-paw-brown font-bold" : "text-bark-light"}`}>
              {day.isToday ? "오늘" : day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-cream">
        {METRICS.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-[2px]" style={{ background: color }} />
            <span className="text-[10px] text-bark-mid">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/WeekConditionChart.tsx
git commit -m "feat: add WeekConditionChart 7-day grouped bar chart"
```

---

## Task 7: CheckinButtons component

**Files:**
- Create: `components/dashboard/CheckinButtons.tsx`

- [ ] **Step 1: Create CheckinButtons**

```tsx
// components/dashboard/CheckinButtons.tsx
import Link from "next/link";
import { getTodayCheckinStatus } from "@/lib/dal";
import { getCachedUser } from "@/lib/dal";

const ITEMS = [
  { key: "sleep",     label: "수면",    href: "/dashboard/checkin" },
  { key: "mood",      label: "기분",    href: "/dashboard/mood-checkin" },
  { key: "nap",       label: "낮잠",    href: "/dashboard/nap-checkin" },
  { key: "condition", label: "컨디션 기록하기", href: "/dashboard/condition-checkin" },
] as const;

export async function CheckinButtons() {
  const user = await getCachedUser();
  const status = await getTodayCheckinStatus(user.id);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-[11px] font-semibold text-bark-mid uppercase tracking-wider mr-1">
        오늘 체크인
      </span>
      {ITEMS.map((item) => {
        const done = status[item.key];
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-medium transition-colors ${
              done
                ? "bg-[#F5EDE0] border border-[#E8D5C0] text-bark-mid"
                : "bg-bark-dark text-sleepy-yellow font-bold"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/CheckinButtons.tsx
git commit -m "feat: add CheckinButtons with today's check-in status"
```

---

## Task 8: StatCards component

**Files:**
- Create: `components/dashboard/StatCards.tsx`

- [ ] **Step 1: Create StatCards**

```tsx
// components/dashboard/StatCards.tsx
import { getCachedUser, getCachedSleepLogs7Days, getCachedMoodLogs7Days, getCachedNapLogs7Days, getTodaySleepLog, getTodayConditionLog } from "@/lib/dal";
import { calculateCnsScore } from "@/lib/cns-score";
import { durationMinutes, formatDuration, getTodayISO, getTodayStartTs } from "@/utils/date";

function StatCard({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <div className={`rounded-[14px] p-4 ${primary ? "bg-bark-dark" : "bg-warm-white border border-[#E8D5C0]"}`}>
      {children}
    </div>
  );
}

export async function StatCards() {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLog, conditionLog, moodLogs, napLogs] = await Promise.all([
    getTodaySleepLog(user.id, todayISO),
    getTodayConditionLog(user.id, todayISO),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  // CNS score
  let cnsScore: number | null = null;
  let cnsStatus: string | null = null;
  if (sleepLog && conditionLog && sleepLog.sleep_quality != null) {
    const result = calculateCnsScore({
      sleepDuration: durationMinutes(sleepLog.bed_time, sleepLog.wake_time) / 60,
      sleepQuality: sleepLog.sleep_quality,
      mentalCondition: conditionLog.mental_condition,
      physicalEnergy: conditionLog.physical_energy,
      muscleSoreness: conditionLog.muscle_soreness,
      didExercise: conditionLog.did_exercise,
      yesterdayRpe: conditionLog.yesterday_rpe,
      hrv: null,
    });
    cnsScore = result.score;
    cnsStatus = result.status;
  }

  // Sleep duration
  const sleepMin = sleepLog ? durationMinutes(sleepLog.bed_time, sleepLog.wake_time) : null;

  // Mood average today
  const todayMoods = moodLogs.filter((l) => l.log_time >= todayStartTs);
  const moodAvg = todayMoods.length > 0
    ? (todayMoods.reduce((s, l) => s + l.score, 0) / todayMoods.length).toFixed(1)
    : null;

  // Nap today
  const todayNaps = napLogs.filter((l) => l.start_time >= todayStartTs);
  const napTotalMin = todayNaps.reduce(
    (s, l) => s + durationMinutes(l.start_time, l.end_time), 0
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* CNS */}
      <StatCard primary>
        <p className="text-[11px] font-medium text-warm-white/60 mb-1">오늘 CNS 점수</p>
        <p className="text-3xl font-extrabold text-sleepy-yellow leading-none">
          {cnsScore ?? "—"}
        </p>
        {cnsStatus && (
          <span className="inline-block mt-1.5 text-[10px] font-semibold bg-sleepy-yellow/15 text-sleepy-yellow px-2 py-0.5 rounded-full">
            {cnsStatus}
          </span>
        )}
      </StatCard>

      {/* Sleep */}
      <StatCard>
        <p className="text-[11px] font-medium text-bark-mid mb-1">수면 시간</p>
        <p className="text-3xl font-extrabold text-bark-dark leading-none">
          {sleepMin != null ? formatDuration(sleepMin) : "—"}
        </p>
      </StatCard>

      {/* Mood */}
      <StatCard>
        <p className="text-[11px] font-medium text-bark-mid mb-1">기분 평균</p>
        <p className="text-3xl font-extrabold text-bark-dark leading-none">
          {moodAvg ?? "—"}
          {moodAvg && <span className="text-sm font-medium text-bark-mid ml-1">/5</span>}
        </p>
      </StatCard>

      {/* Nap */}
      <StatCard>
        <p className="text-[11px] font-medium text-bark-mid mb-1">낮잠</p>
        <p className="text-3xl font-extrabold text-bark-dark leading-none">
          {napTotalMin > 0 ? formatDuration(napTotalMin) : "—"}
        </p>
        {todayNaps.length > 0 && (
          <span className="inline-block mt-1.5 text-[10px] font-medium bg-[#F5EDE0] text-bark-mid px-2 py-0.5 rounded-full">
            {todayNaps.length}회
          </span>
        )}
      </StatCard>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/StatCards.tsx
git commit -m "feat: add StatCards component (CNS, sleep, mood, nap)"
```

---

## Task 9: TodayMetricsCard + MoodLogList

**Files:**
- Create: `components/dashboard/TodayMetricsCard.tsx`
- Create: `components/dashboard/MoodLogList.tsx`

- [ ] **Step 1: Create TodayMetricsCard**

```tsx
// components/dashboard/TodayMetricsCard.tsx
import { getCachedUser, getTodayConditionLog } from "@/lib/dal";
import { getTodayISO } from "@/utils/date";

function Pips({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < value ? "bg-paw-brown" : "bg-[#E8D5C0]"}`}
        />
      ))}
    </div>
  );
}

const METRICS = [
  {
    key: "mental_condition" as const,
    label: "정신 상태",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
  },
  {
    key: "physical_energy" as const,
    label: "신체 에너지",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    key: "muscle_soreness" as const,
    label: "근육 통증",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

export async function TodayMetricsCard() {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const log = await getTodayConditionLog(user.id, todayISO);

  if (!log) {
    return (
      <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
        <p className="text-xs font-bold text-bark-dark mb-3">오늘 컨디션</p>
        <p className="text-xs text-bark-light">아직 컨디션 기록이 없어요</p>
      </div>
    );
  }

  return (
    <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
      <p className="text-xs font-bold text-bark-dark mb-3">오늘 컨디션</p>
      <div className="flex flex-col gap-0">
        {METRICS.map((m) => (
          <div key={m.key} className="flex items-center gap-2.5 py-2.5 border-b border-cream last:border-0">
            {m.icon}
            <span className="text-xs font-medium text-bark-dark flex-1">{m.label}</span>
            <Pips value={log[m.key]} />
            <span className="text-xs font-bold text-bark-dark w-4 text-right">{log[m.key]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-xs font-medium text-bark-dark flex-1">어제 RPE</span>
          <Pips value={Math.round((log.yesterday_rpe / 10) * 5)} />
          <span className="text-xs font-bold text-bark-dark w-4 text-right">
            {log.yesterday_rpe}<span className="text-[9px] text-bark-mid">/10</span>
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MoodLogList**

```tsx
// components/dashboard/MoodLogList.tsx
import { getCachedUser, getCachedMoodLogs7Days } from "@/lib/dal";
import { getTodayStartTs } from "@/utils/date";

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
    hour12: false,
  });
}

export async function MoodLogList() {
  const user = await getCachedUser();
  const todayStartTs = getTodayStartTs();
  const allLogs = await getCachedMoodLogs7Days(user.id);
  const todayLogs = allLogs
    .filter((l) => l.log_time >= todayStartTs)
    .sort((a, b) => a.log_time.localeCompare(b.log_time));

  return (
    <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
      <p className="text-xs font-bold text-bark-dark mb-3">오늘 기분 기록</p>
      {todayLogs.length === 0 ? (
        <p className="text-xs text-bark-light">아직 기분 기록이 없어요</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {todayLogs.map((log) => (
            <div key={log.log_time} className="flex items-center gap-2 px-2 py-1.5 bg-cream rounded-lg">
              <span className="text-[10px] text-bark-mid min-w-[36px]">{formatTime(log.log_time)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-paw-brown shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
              </svg>
              <span className="text-xs font-bold text-bark-dark">{log.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/TodayMetricsCard.tsx components/dashboard/MoodLogList.tsx
git commit -m "feat: add TodayMetricsCard and MoodLogList components"
```

---

## Task 10: New dashboard page

**Files:**
- Create: `app/dashboard/(with-nav)/page.tsx`
- Delete: `app/dashboard/page.tsx`

- [ ] **Step 1: Create new dashboard page**

```tsx
// app/dashboard/(with-nav)/page.tsx
import { Suspense } from "react";
import { getCachedUser, getCachedSleepLogs7Days, getCachedMoodLogs7Days, getCachedConditionLogs7Days } from "@/lib/dal";
import { CheckinButtons } from "@/components/dashboard/CheckinButtons";
import { StatCards } from "@/components/dashboard/StatCards";
import { WeekConditionChart } from "@/components/dashboard/WeekConditionChart";
import { TodayMetricsCard } from "@/components/dashboard/TodayMetricsCard";
import { MoodLogList } from "@/components/dashboard/MoodLogList";
import { DogStatusWidget } from "@/components/DogStatusWidget";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";
import { getTodayISO, durationMinutes, getTodayStartTs } from "@/utils/date";
import type { DogState } from "@/components/SleepyDog";
import { getCachedNapLogs7Days, getTodaySleepLog } from "@/lib/dal";

async function resolveDogState(): Promise<DogState> {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();
  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);
  const todaySleep = sleepLogs.find((l) => l.wake_date === todayISO);
  const todayMoodCount = moodLogs.filter((l) => l.log_time >= todayStartTs).length;
  const todayNapCount = napLogs.filter((l) => l.start_time >= todayStartTs).length;
  if (!todaySleep) return "waiting";
  const sleepMin = durationMinutes(todaySleep.bed_time, todaySleep.wake_time);
  if (todayMoodCount > 0 && todayNapCount > 0 && sleepMin >= 360) return "running";
  if (sleepMin >= 420) return "happy";
  if (sleepMin < 360) return "drowsy";
  return "sleeping";
}

export default async function DashboardPage() {
  const user = await getCachedUser();
  const dogState = await resolveDogState();

  const sleepPromise = getCachedSleepLogs7Days(user.id);
  const conditionPromise = getCachedConditionLogs7Days(user.id);

  // date display
  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
    timeZone: "Asia/Seoul",
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-warm-white border-b border-[#E8D5C0] px-7 h-[58px] flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-bark-dark">대시보드</h1>
          <p className="text-[11px] text-bark-mid">오늘의 컨디션과 지난 일주일 기록을 확인하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-bark-mid bg-cream border border-[#E8C4A0] px-3 py-1 rounded-full">
            {todayLabel}
          </span>
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 bg-cream border border-[#E8C4A0] rounded-xl">
            <div className="w-7 h-7 rounded-full bg-paw-brown flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FDF6EC" strokeWidth={2} className="w-4 h-4">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-[12px] font-bold text-bark-dark leading-tight">{user.email?.split("@")[0]}</span>
              <span className="text-[10px] text-bark-mid leading-tight">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-7 py-5 flex flex-col gap-4">
        {/* Check-in buttons */}
        <Suspense fallback={<div className="h-9 bg-[#F5EDE0] rounded-xl animate-pulse" />}>
          <CheckinButtons />
        </Suspense>

        {/* Stat cards */}
        <Suspense fallback={<div className="h-24 bg-[#F5EDE0] rounded-xl animate-pulse" />}>
          <StatCards />
        </Suspense>

        {/* Middle grid: 7-day chart + right panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
          <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-bark-dark flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                지난 7일 컨디션
              </h2>
              <a href="/dashboard/calendar" className="text-[11px] text-bark-mid bg-cream border border-[#E8C4A0] px-2.5 py-1 rounded-full">
                캘린더 전체보기 →
              </a>
            </div>
            <Suspense fallback={<div className="h-28 bg-cream rounded animate-pulse" />}>
              <WeekConditionChart sleepPromise={sleepPromise} conditionPromise={conditionPromise} />
            </Suspense>
          </div>

          <div className="flex flex-col gap-4">
            <Suspense fallback={<div className="h-36 bg-[#F5EDE0] rounded-xl animate-pulse" />}>
              <TodayMetricsCard />
            </Suspense>
            <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0] text-center">
              <DogStatusWidget state={dogState} />
            </div>
          </div>
        </div>

        {/* Bottom grid: sleep chart + mood list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-warm-white rounded-[14px] p-4 border border-[#E8D5C0]">
            <h2 className="text-[13px] font-bold text-bark-dark mb-3 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-bark-mid">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              7일 수면 시간
            </h2>
            <Suspense fallback={<div className="h-24 bg-cream rounded animate-pulse" />}>
              <SleepCharts sleepPromise={sleepPromise} />
            </Suspense>
          </div>
          <Suspense fallback={<div className="h-36 bg-[#F5EDE0] rounded-xl animate-pulse" />}>
            <MoodLogList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Delete old dashboard page**

```bash
rm /Users/jungjun/Workspace/condition-tracker/app/dashboard/page.tsx
```

- [ ] **Step 3: Verify in browser — `http://localhost:3000/dashboard`**

Expect: sidebar + new layout with all sections visible.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/(with-nav)/page.tsx
git rm app/dashboard/page.tsx
git commit -m "feat: redesign dashboard page with sidebar layout and new components"
```

---

## Task 11: Calendar page + MonthCalendar component

**Files:**
- Create: `components/calendar/MonthCalendar.tsx`
- Create: `app/dashboard/(with-nav)/calendar/page.tsx`

- [ ] **Step 1: Create MonthCalendar client component**

```tsx
// components/calendar/MonthCalendar.tsx
"use client";

import { useState, useMemo } from "react";
import { calculateCnsScore } from "@/lib/cns-score";
import { cnsStatusColor } from "@/lib/dashboard-utils";
import { durationMinutes } from "@/utils/date";
import type { CnsStatus } from "@/lib/cns-score";

type SleepLog      = { wake_date: string; bed_time: string; wake_time: string; sleep_quality: number | null };
type ConditionLog  = { log_date: string; mental_condition: number; physical_energy: number; muscle_soreness: number; did_exercise: boolean; yesterday_rpe: number };
type MoodLog       = { log_time: string; score: number };
type NapLog        = { start_time: string; end_time: string };

interface Props {
  year: number;
  month: number; // 1-12
  sleepLogs: SleepLog[];
  conditionLogs: ConditionLog[];
  moodLogs: MoodLog[];
  napLogs: NapLog[];
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function getDayStartTs(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00+09:00`).toISOString();
}
function getDayEndTs(dateISO: string): string {
  return new Date(`${dateISO}T23:59:59+09:00`).toISOString();
}

export function MonthCalendar({ year, month, sleepLogs, conditionLogs, moodLogs, napLogs }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const dayDataMap = useMemo(() => {
    const map = new Map<string, { cnsStatus: CnsStatus | null; hasSleep: boolean; hasMood: boolean; hasNap: boolean; hasCondition: boolean }>();

    // build per-day
    const firstDay = new Date(year, month - 1, 1);
    const lastDay  = new Date(year, month, 0);
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateISO = d.toISOString().slice(0, 10);
      const startTs = getDayStartTs(dateISO);
      const endTs   = getDayEndTs(dateISO);

      const sleep     = sleepLogs.find((l) => l.wake_date === dateISO);
      const condition = conditionLogs.find((l) => l.log_date === dateISO);
      const hasMood   = moodLogs.some((l) => l.log_time >= startTs && l.log_time <= endTs);
      const hasNap    = napLogs.some((l) => l.start_time >= startTs && l.start_time <= endTs);

      let cnsStatus: CnsStatus | null = null;
      if (sleep && condition && sleep.sleep_quality != null) {
        const result = calculateCnsScore({
          sleepDuration: durationMinutes(sleep.bed_time, sleep.wake_time) / 60,
          sleepQuality:  sleep.sleep_quality,
          mentalCondition:  condition.mental_condition,
          physicalEnergy:   condition.physical_energy,
          muscleSoreness:   condition.muscle_soreness,
          didExercise:      condition.did_exercise,
          yesterdayRpe:     condition.yesterday_rpe,
          hrv: null,
        });
        cnsStatus = result.status;
      }

      map.set(dateISO, { cnsStatus, hasSleep: !!sleep, hasMood, hasNap, hasCondition: !!condition });
    }
    return map;
  }, [year, month, sleepLogs, conditionLogs, moodLogs, napLogs]);

  // Calendar grid — start from Monday
  const firstOfMonth = new Date(year, month - 1, 1);
  const startDow = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  const selectedData = selected ? dayDataMap.get(selected) : null;

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-bark-mid py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateISO = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const data = dayDataMap.get(dateISO);
          const bg = cnsStatusColor(data?.cnsStatus ?? null);
          const isToday = dateISO === todayISO;
          const isSelected = dateISO === selected;

          return (
            <button
              key={dateISO}
              onClick={() => setSelected(isSelected ? null : dateISO)}
              className={`aspect-square rounded-[10px] flex flex-col items-center justify-center p-1 gap-0.5 border-2 transition-colors ${
                isSelected ? "border-bark-dark" : isToday ? "border-paw-brown" : "border-transparent"
              }`}
              style={{ background: bg }}
            >
              <span className={`text-[10px] font-bold ${isToday ? "text-paw-brown" : "text-bark-dark"}`}>{day}</span>
              {data && (
                <div className="flex gap-[2px]">
                  {data.hasSleep     && <div className="w-[5px] h-[5px] rounded-full bg-[#A8D5A2]" />}
                  {data.hasMood      && <div className="w-[5px] h-[5px] rounded-full bg-[#F4A7B9]" />}
                  {data.hasNap       && <div className="w-[5px] h-[5px] rounded-full bg-[#FFD97D]" />}
                  {data.hasCondition && <div className="w-[5px] h-[5px] rounded-full bg-[#C8956C]" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pb-4 border-b border-cream">
        {[
          { color: "#D4F0D4", label: "최적" },
          { color: "#FFF3C4", label: "회복중" },
          { color: "#FFE0B2", label: "경미 피로" },
          { color: "#FFCDD2", label: "고피로" },
          { color: "#F5EDE0", label: "기록 없음" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: color }} />
            <span className="text-[10px] text-bark-mid">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-2">
          {[{ color: "#A8D5A2", label: "수면" }, { color: "#F4A7B9", label: "기분" }, { color: "#FFD97D", label: "낮잠" }, { color: "#C8956C", label: "컨디션" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-bark-mid">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && selectedData && (
        <div className="mt-4 p-4 bg-cream rounded-[12px]">
          <p className="text-xs font-bold text-bark-dark mb-2">{selected}</p>
          <div className="flex flex-wrap gap-2 text-[11px] text-bark-mid">
            <span>수면: {selectedData.hasSleep ? "✓" : "—"}</span>
            <span>기분: {selectedData.hasMood ? "✓" : "—"}</span>
            <span>낮잠: {selectedData.hasNap ? "✓" : "—"}</span>
            <span>컨디션: {selectedData.hasCondition ? "✓" : "—"}</span>
            {selectedData.cnsStatus && <span className="font-semibold text-bark-dark">CNS: {selectedData.cnsStatus}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create calendar page**

```tsx
// app/dashboard/(with-nav)/calendar/page.tsx
import { getCachedUser, getMonthLogs } from "@/lib/dal";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const year  = parseInt(params.year  ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth() + 1), 10);

  const user = await getCachedUser();
  const { sleepLogs, conditionLogs, moodLogs, napLogs } = await getMonthLogs(user.id, year, month);

  const prevYear  = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear  = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-warm-white border-b border-[#E8D5C0] px-7 h-[58px] flex items-center">
        <h1 className="text-[17px] font-bold text-bark-dark">캘린더</h1>
      </header>

      <main className="flex-1 px-7 py-5 max-w-2xl">
        <div className="bg-warm-white rounded-[14px] p-5 border border-[#E8D5C0]">
          {/* Month navigator */}
          <div className="flex items-center justify-between mb-5">
            <a
              href={`/dashboard/calendar?year=${prevYear}&month=${prevMonth}`}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream text-bark-mid"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </a>
            <h2 className="text-sm font-bold text-bark-dark">
              {year}년 {month}월
            </h2>
            <a
              href={`/dashboard/calendar?year=${nextYear}&month=${nextMonth}`}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream text-bark-mid"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>

          <MonthCalendar
            year={year}
            month={month}
            sleepLogs={sleepLogs}
            conditionLogs={conditionLogs}
            moodLogs={moodLogs}
            napLogs={napLogs}
          />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser — `http://localhost:3000/dashboard/calendar`**

Expect: month grid with colored cells, month navigation working.

- [ ] **Step 4: Commit**

```bash
git add components/calendar/MonthCalendar.tsx app/dashboard/(with-nav)/calendar/page.tsx
git commit -m "feat: add calendar page with monthly CNS status grid"
```

---

## Task 12: Sample data + .gitignore

**Files:**
- Create: `scripts/seed-sample-data.sql`
- Modify: `.gitignore`

- [ ] **Step 1: Add .superpowers to .gitignore**

```bash
echo ".superpowers/" >> /Users/jungjun/Workspace/condition-tracker/.gitignore
```

- [ ] **Step 2: Create seed SQL**

```sql
-- scripts/seed-sample-data.sql
-- Run in Supabase SQL editor after replacing <USER_ID> with your auth.users UUID

DO $$
DECLARE
  uid UUID := '<USER_ID>'; -- replace with your user ID
  base_date DATE := CURRENT_DATE - INTERVAL '29 days';
  i INT;
  d DATE;
  bed_ts TIMESTAMPTZ;
  wake_ts TIMESTAMPTZ;
  sleep_h NUMERIC;
  nap_start TIMESTAMPTZ;
BEGIN
  -- Ensure profile exists
  INSERT INTO profiles (id, has_narcolepsy, age, gender, usual_sleep_quality, usual_bed_time, usual_wake_time, usual_nap_duration_minutes)
  VALUES (uid, false, 28, 'male', 3, '23:00:00', '07:00:00', 20)
  ON CONFLICT (id) DO NOTHING;

  FOR i IN 0..29 LOOP
    d := base_date + i;

    -- Sleep log (vary 5.5h–8.5h)
    sleep_h := 5.5 + (random() * 3);
    bed_ts  := (d - INTERVAL '1 day') + TIME '23:00:00' + (random() * INTERVAL '2 hours') - INTERVAL '1 hour';
    wake_ts := bed_ts + (sleep_h * INTERVAL '1 hour');
    INSERT INTO sleep_logs (user_id, wake_date, bed_time, wake_time, sleep_quality)
    VALUES (uid, d, bed_ts AT TIME ZONE 'Asia/Seoul', wake_ts AT TIME ZONE 'Asia/Seoul',
            1 + floor(random() * 5)::INT)
    ON CONFLICT DO NOTHING;

    -- Condition log
    INSERT INTO condition_logs (user_id, log_date, mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe)
    VALUES (uid, d,
            1 + floor(random() * 5)::INT,
            1 + floor(random() * 5)::INT,
            1 + floor(random() * 5)::INT,
            random() > 0.4,
            floor(random() * 11)::INT)
    ON CONFLICT DO NOTHING;

    -- Mood logs (1–3 per day)
    INSERT INTO mood_logs (user_id, score, log_time)
    VALUES
      (uid, 1 + floor(random() * 5)::INT, (d + TIME '08:00:00') AT TIME ZONE 'Asia/Seoul'),
      (uid, 1 + floor(random() * 5)::INT, (d + TIME '14:00:00') AT TIME ZONE 'Asia/Seoul');

    -- Nap log (60% of days)
    IF random() > 0.4 THEN
      nap_start := (d + TIME '13:00:00') AT TIME ZONE 'Asia/Seoul';
      INSERT INTO nap_logs (user_id, start_time, end_time)
      VALUES (uid, nap_start, nap_start + INTERVAL '20 minutes');
    END IF;
  END LOOP;
END $$;
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-sample-data.sql .gitignore
git commit -m "chore: add sample data seed SQL and .superpowers to .gitignore"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Sidebar navigation (Task 3)
- ✅ BottomTabBar mobile (Task 4)
- ✅ Layout architecture change (Task 5)
- ✅ Header with user profile + email (Task 10)
- ✅ Quick check-in buttons with status (Task 7)
- ✅ 4 stat cards (Task 8)
- ✅ 7-day multi-metric bar chart (Task 6)
- ✅ Today metrics with pip indicators (Task 9)
- ✅ Dog status card (Task 10 — reuses existing `DogStatusWidget`)
- ✅ 7-day sleep chart (Task 10 — reuses existing `SleepCharts`)
- ✅ Today mood log list (Task 9)
- ✅ Calendar page with monthly view (Task 11)
- ✅ CNS color mapping tested (Task 1)
- ✅ Sample data (Task 12)
- ✅ .gitignore for .superpowers (Task 12)

**Type consistency check:**
- `WeekDayData.mentalCondition` defined in Task 1, consumed in Task 6 ✅
- `getTodayCheckinStatus` returns `{ sleep, condition, mood, nap }`, consumed in Task 7 ✅
- `getMonthLogs` returns `{ sleepLogs, conditionLogs, moodLogs, napLogs }`, consumed in Task 11 ✅
- `cnsStatusColor` takes `CnsStatus | null`, used in Task 11 ✅

**No placeholders:** All steps contain actual code.
