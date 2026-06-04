# Design Spec: Dashboard & Calendar Redesign

**Date:** 2026-06-04
**Status:** Approved (mockup validated)

---

## 1. Overview

Redesign the condition tracker app from a mobile-first bottom-tab layout to a desktop-first sidebar layout, and add a 7-day condition visualization (multi-metric bar chart) to the dashboard and a dedicated Calendar page.

---

## 2. Layout Architecture

### Desktop (≥ 768px)
- **Left sidebar** (210px fixed) + **main content area** (flex: 1)
- Sidebar always visible; no overlay
- Top header bar inside main area (not spanning sidebar)

### Mobile (< 768px)
- Sidebar hidden; bottom tab bar replaces it (same 6 items)
- Header shrinks; user profile collapses to avatar only
- Single-column stacked layout for all cards

### Route Group Change
Current: `app/dashboard/(with-nav)/layout.tsx` uses bottom `<nav>`
New: same route group, layout replaced with sidebar + responsive bottom tab

---

## 3. Navigation Structure

### Sidebar / Bottom Tab Items (in order)
| # | Label | Icon (outline SVG) | Route |
|---|-------|--------------------|-------|
| 1 | 대시보드 | grid 2×2 | `/dashboard` |
| 2 | 캘린더 | calendar | `/dashboard/calendar` ← **new** |
| 3 | 수면 | moon | `/dashboard/checkin` |
| 4 | 기분 | smile | `/dashboard/mood-checkin` |
| 5 | 낮잠 | coffee cup | `/dashboard/nap-checkin` |
| 6 | 컨디션 | location pin | `/dashboard/condition-checkin` |

**General section** (sidebar only):
- 설정 (gear icon) — `/dashboard/settings` (existing or placeholder)
- 유저 프로필 (bottom of sidebar) — nickname + no route

### Active State
- Sidebar: `background: #FFD97D; color: #5C3D2E; font-weight: 700`
- Bottom tab: same yellow highlight

---

## 4. Dashboard Page (`/dashboard`)

### 4-1. Header
- Left: page title "대시보드" + subtitle
- Right: date chip (`YYYY년 M월 D일 (요일)`) + user profile block
  - User profile block: avatar circle (brown bg, white user icon) + nickname + email
  - Pulls from `profiles` table (nickname) and `auth.users` (email)

### 4-2. Quick Check-in Buttons
Horizontal row below header, above stat cards.

- Label: "오늘 체크인" (small uppercase)
- 4 buttons: 수면 / 기분 / 낮잠 / 컨디션 기록하기
- **Completed today** → muted style: `background: #F5EDE0; border: 1.5px solid #E8D5C0; color: #A07850; font-weight: 500`
- **Not yet completed** → primary style: `background: #5C3D2E; color: #FFD97D; font-weight: 700; no border`
- Completion check: same logic as existing `getTodaySleepLog`, `getTodayConditionLog`, etc.
- Clicking navigates to respective check-in page

### 4-3. Stat Cards (4-column grid)
| Card | Value | Badge |
|------|-------|-------|
| CNS 점수 (primary/dark) | score / 100 | status label (Optimal / Recovered / …) |
| 수면 시간 | Xh Ym | ↑/↓ vs yesterday |
| 기분 평균 | X.X / 5 | 좋음 / 보통 / 나쁨 |
| 낮잠 | X분 | N회 |

CNS card uses dark bg (`#5C3D2E`) with yellow value text. Others use `#FFFBF5`.

### 4-4. Middle Grid (2 columns: `1fr 260px`)

#### Left: 7-Day Multi-Metric Bar Chart
- X-axis: last 7 days (날짜 숫자)
- Today column highlighted with outline border
- Per day: 4 grouped bars (width 8px each, gap 2px)
  - 정신 상태 → `#C8956C`
  - 신체 에너지 → `#FFD97D`
  - 근육 통증 → `#F4A7B9`
  - 수면 질 → `#A8D5A2`
- Bar height proportional to score (1–5 scale → 20%–100% of 110px container)
- Missing day → bars absent (0 height)
- Legend below chart
- "캘린더 전체보기 →" link → `/dashboard/calendar`

#### Right Panel (2 stacked cards)

**오늘 컨디션 card:**
- 4 metric rows: 정신 상태 / 신체 에너지 / 근육 통증 / 어제 RPE
- Each row: icon (outline SVG) + label + 5-pip indicator + numeric value
- RPE shows `/10` denominator
- Data from `getTodayConditionLog`

**강아지 상태 card:**
- Centered: paw outline SVG icon (36px) + status text + sub text
- 4 progress dots (수면·기분·낮잠·컨디션): green = done, light = pending
- Keeps existing dog state logic (waiting / drowsy / happy / running / sleeping)

### 4-5. Bottom Grid (2 columns: `1fr 1fr`)

**7일 수면 시간 chart:**
- Single bar per day, color `#C8956C` (logged) / `#E8C4A0` (short sleep) / `#F5EDE0` (no log)
- Today bar: `#FFD97D` with border
- Height proportional to sleep duration (0–10h)
- Reuses existing `SleepCharts` logic, restyled

**오늘 기분 기록 list:**
- Shows all mood log entries for today
- Each row: time (HH:MM) + outline smile icon + score + memo text (truncated)
- No "+ 기록" button in this card (navigate via sidebar tab)
- Empty state: "아직 기분 기록이 없어요"

---

## 5. Calendar Page (`/dashboard/calendar`) — New

Scope for this phase: **monthly calendar view** showing per-day CNS status color.

### Layout
- Page header: month navigator (← YYYY년 MM월 →)
- 7-column calendar grid
- Day cell:
  - Date number
  - CNS status background color (Optimal/Recovered/Mild/High/none)
  - Small dots for logged categories (수면·기분·낮잠·컨디션)
- Click on day → show detail panel (slide-in or inline expand) with that day's full stats

### CNS Color Scale
| Status | Background |
|--------|------------|
| Optimal (90–100) | `#D4F0D4` |
| Recovered (70–89) | `#FFF3C4` |
| Mild Fatigue (50–69) | `#FFE0B2` |
| High Fatigue (< 50) | `#FFCDD2` |
| No data | `#F5EDE0` |

### Data
- Fetch all logs for displayed month in one query
- Calculate CNS score per day using existing `calculateCNSScore` from `lib/cns-score.ts`

---

## 6. Icon System

All icons: **outline SVG, single color (stroke only, no fill), stroke-width 2**.
No emoji anywhere in the UI.
Source: inline SVG (Lucide-compatible paths) — no external icon library added.

---

## 7. Data Requirements

All data already exists. New queries needed:

| Query | Purpose |
|-------|---------|
| `getMonthLogs(userId, year, month)` | Calendar page: all logs for a month |
| Today check-in status for each of 4 categories | Already partially exists; unify into one helper |

No schema changes required.

---

## 8. Sample Data

Add a seed script or Supabase SQL to insert 30 days of realistic sample data for local development. Covers all 5 tables (sleep_logs, mood_logs, nap_logs, condition_logs, profiles).

---

## 9. Out of Scope (this phase)

- Settings page implementation
- Push notifications
- Data export
- Dark mode
- Multi-user / social features
