# CNS 피로도 점수 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CNS 피로도 점수 알고리즘을 구현하고, 수면 체크인에 수면 질 입력을 추가하며, 새 컨디션 체크인 페이지와 대시보드 점수 카드를 만든다.

**Architecture:** 점수는 DB에 저장하지 않고 Server Component 렌더 시 `calculateCnsScore()` 순수 함수로 실시간 계산. 원시 입력값은 `sleep_logs.sleep_quality`(기존 테이블 컬럼 추가)와 신규 `condition_logs` 테이블에 저장. HRV는 V1 제외(항상 null 처리).

**Tech Stack:** Next.js 16 App Router, Supabase, TypeScript, Zod, Framer Motion, Tailwind CSS v4, Vitest

---

## 파일 구조

| 파일 | 변경 | 역할 |
|------|------|------|
| `supabase/migrations/20260527000000_add_sleep_quality_and_condition_logs.sql` | 신규 | sleep_quality 컬럼 추가 + condition_logs 테이블 생성 |
| `lib/types/supabase.ts` | 수정 | SleepLog에 sleep_quality 추가, ConditionLog 타입 신규 |
| `lib/cns-score.ts` | 신규 | calculateCnsScore 순수 함수 |
| `lib/cns-score.test.ts` | 신규 | 알고리즘 단위 테스트 |
| `lib/dal.ts` | 수정 | getTodayConditionLog, getTodaySleepLog DAL 함수 추가 |
| `app/dashboard/(with-nav)/checkin/actions.ts` | 수정 | sleep_quality 필드 추가 |
| `app/dashboard/(with-nav)/checkin/SleepLogForm.tsx` | 수정 | 수면 질 1~5 버튼 추가 |
| `app/dashboard/(with-nav)/condition-checkin/actions.ts` | 신규 | saveConditionLog 서버 액션 |
| `app/dashboard/(with-nav)/condition-checkin/ConditionLogForm.tsx` | 신규 | 컨디션 입력 폼 클라이언트 컴포넌트 |
| `app/dashboard/(with-nav)/condition-checkin/page.tsx` | 신규 | 컨디션 체크인 페이지 (점수 표시 포함) |
| `components/CnsScoreCard.tsx` | 신규 | CNS 점수 + 상태 배지 카드 컴포넌트 |
| `components/TodayCard.tsx` | 수정 | 컨디션 항목 추가 |
| `app/dashboard/page.tsx` | 수정 | CnsScoreCard 추가 |
| `app/dashboard/(with-nav)/layout.tsx` | 수정 | 컨디션 체크인 네비 링크 추가 |

---

## Task 1: Vitest 설치 및 설정

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: vitest 설치**

```bash
cd /Users/jungjun/Workspace/condition-tracker
npm install --save-dev vitest
```

- [ ] **Step 2: vitest.config.ts 생성**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: package.json scripts에 test 추가**

`package.json`의 `"scripts"` 블록을 다음과 같이 수정:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: 설정 확인**

```bash
npx vitest run --version
```

Expected: vitest 버전 출력 (오류 없음)

- [ ] **Step 5: 커밋**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for unit testing"
```

---

## Task 2: DB 마이그레이션

**Files:**
- Create: `supabase/migrations/20260527000000_add_sleep_quality_and_condition_logs.sql`

- [ ] **Step 1: 마이그레이션 파일 생성**

```sql
-- supabase/migrations/20260527000000_add_sleep_quality_and_condition_logs.sql

-- 1. sleep_logs에 sleep_quality 컬럼 추가
ALTER TABLE sleep_logs
  ADD COLUMN IF NOT EXISTS sleep_quality SMALLINT
    CHECK (sleep_quality BETWEEN 1 AND 5);

-- 2. condition_logs 테이블 생성
CREATE TABLE IF NOT EXISTS condition_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  log_date         DATE NOT NULL,
  mental_condition SMALLINT NOT NULL CHECK (mental_condition BETWEEN 1 AND 5),
  physical_energy  SMALLINT NOT NULL CHECK (physical_energy BETWEEN 1 AND 5),
  muscle_soreness  SMALLINT NOT NULL CHECK (muscle_soreness BETWEEN 1 AND 5),
  did_exercise     BOOLEAN NOT NULL DEFAULT false,
  yesterday_rpe    SMALLINT NOT NULL DEFAULT 0 CHECK (yesterday_rpe BETWEEN 0 AND 10),
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, log_date)
);

-- 3. RLS 활성화
ALTER TABLE condition_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 본인 데이터만 접근
CREATE POLICY "Users manage own condition logs"
  ON condition_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Supabase에 마이그레이션 적용**

로컬 Supabase가 실행 중인 경우:
```bash
npx supabase db push
```

Supabase 대시보드를 사용하는 경우: SQL Editor에 위 SQL을 직접 실행.

- [ ] **Step 3: 커밋**

```bash
git add supabase/migrations/20260527000000_add_sleep_quality_and_condition_logs.sql
git commit -m "feat: add sleep_quality column and condition_logs table migration"
```

---

## Task 3: TypeScript 타입 업데이트

**Files:**
- Modify: `lib/types/supabase.ts`

- [ ] **Step 1: SleepLog에 sleep_quality 추가, ConditionLog 타입 신규 추가**

`lib/types/supabase.ts`를 다음과 같이 수정:

```typescript
export type SleepLog = {
  id: string
  user_id: string
  sleep_date: string
  bed_time: string
  wake_time: string
  sleep_quality: number | null  // 추가
  created_at: string | null
}

export type SleepLogFormInitial = {
  sleep_date: string
  bed_time: string
  wake_time: string
  sleep_quality: number | null  // 추가
}

export type Profile = {
  id: string
  has_narcolepsy: boolean | null
  age: number | null
  gender: string | null
  usual_sleep_quality: number | null
  usual_bed_time: string | null
  usual_wake_time: string | null
  usual_nap_duration_minutes: number | null
  created_at: string | null
}

export type MoodLog = {
  id: string
  user_id: string
  score: number
  memo: string | null
  log_time: string
  created_at: string | null
}

export type NapLog = {
  id: string
  user_id: string
  start_time: string
  end_time: string
  created_at: string | null
}

// 신규
export type ConditionLog = {
  id: string
  user_id: string
  log_date: string
  mental_condition: number
  physical_energy: number
  muscle_soreness: number
  did_exercise: boolean
  yesterday_rpe: number
  created_at: string | null
}

export function isOnboardingComplete(
  profile: { age?: number | null } | null
): boolean {
  return profile != null && profile.age != null
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음 (또는 sleep_quality 관련 기존 쿼리 타입 오류가 있으면 Task 5에서 해결됨)

- [ ] **Step 3: 커밋**

```bash
git add lib/types/supabase.ts
git commit -m "feat: add ConditionLog type and sleep_quality to SleepLog types"
```

---

## Task 4: CNS 점수 알고리즘 (TDD)

**Files:**
- Create: `lib/cns-score.ts`
- Create: `lib/cns-score.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// lib/cns-score.test.ts
import { describe, it, expect } from 'vitest'
import { calculateCnsScore } from './cns-score'

describe('calculateCnsScore', () => {
  it('docs 예제: score=67, status=Recovered', () => {
    const result = calculateCnsScore({
      sleepDuration: 8,
      sleepQuality: 4,
      mentalCondition: 4,
      physicalEnergy: 4,
      muscleSoreness: 2,
      didExercise: true,
      yesterdayRpe: 7,
      hrv: null,
    })
    expect(result.score).toBe(67)
    expect(result.status).toBe('Recovered')
  })

  it('모든 최고값: score=100, status=Optimal', () => {
    const result = calculateCnsScore({
      sleepDuration: 8,
      sleepQuality: 5,
      mentalCondition: 5,
      physicalEnergy: 5,
      muscleSoreness: 1,
      didExercise: false,
      yesterdayRpe: 0,
      hrv: null,
    })
    expect(result.score).toBe(100)
    expect(result.status).toBe('Optimal')
  })

  it('운동 안 함: loadScore=100', () => {
    const result = calculateCnsScore({
      sleepDuration: 8,
      sleepQuality: 5,
      mentalCondition: 5,
      physicalEnergy: 5,
      muscleSoreness: 1,
      didExercise: false,
      yesterdayRpe: 0,
      hrv: null,
    })
    // finalSleepScore = 100*0.4 + 100*0.6 = 100
    // finalCondScore = 100*0.4 + 100*0.4 + 100*0.2 = 100  (soreness=1 → 0점 → 역방향 아님)
    // Wait: muscleSoreness=1 → normalize(1)=(1-1)*25=0 → bScore=0
    // finalCondScore = 100*0.4 + 100*0.4 + 0*0.2 = 80
    // finalLoadScore = 100
    // total = 100*0.45 + 80*0.35 + 100*0.20 = 45 + 28 + 20 = 93
    expect(result.score).toBe(93)
    expect(result.status).toBe('Optimal')
  })

  it('극단적 피로: score<=39, status=High Fatigue', () => {
    const result = calculateCnsScore({
      sleepDuration: 2,
      sleepQuality: 1,
      mentalCondition: 1,
      physicalEnergy: 1,
      muscleSoreness: 5,
      didExercise: true,
      yesterdayRpe: 10,
      hrv: null,
    })
    expect(result.status).toBe('High Fatigue')
  })

  it('RPE 10: loadScore=0', () => {
    const result = calculateCnsScore({
      sleepDuration: 4,
      sleepQuality: 3,
      mentalCondition: 3,
      physicalEnergy: 3,
      muscleSoreness: 3,
      didExercise: true,
      yesterdayRpe: 10,
      hrv: null,
    })
    // finalSleepScore = (4/8)*100*0.4 + 50*0.6 = 50*0.4+50*0.6=20+30=50
    // finalCondScore = 50*0.4 + 50*0.4 + 50*0.2 = 20+20+10=50
    // finalLoadScore = max(100-10*10,0) = 0
    // total = 50*0.45 + 50*0.35 + 0*0.20 = 22.5+17.5+0 = 40
    expect(result.score).toBe(40)
    expect(result.status).toBe('Mild Fatigue')
  })

  it('Mild Fatigue 경계 40', () => {
    const result = calculateCnsScore({
      sleepDuration: 4,
      sleepQuality: 3,
      mentalCondition: 3,
      physicalEnergy: 3,
      muscleSoreness: 3,
      didExercise: true,
      yesterdayRpe: 10,
      hrv: null,
    })
    expect(result.score).toBeGreaterThanOrEqual(40)
    expect(result.score).toBeLessThan(60)
  })

  it('sleepDuration 8 초과 시 100으로 cap', () => {
    const result = calculateCnsScore({
      sleepDuration: 12,
      sleepQuality: 5,
      mentalCondition: 5,
      physicalEnergy: 5,
      muscleSoreness: 1,
      didExercise: false,
      yesterdayRpe: 0,
      hrv: null,
    })
    // sDurationScore = min((12/8)*100, 100) = 100
    expect(result.score).toBe(93)
  })

  it('hrv null이면 HRV 없는 공식 사용', () => {
    const withNull = calculateCnsScore({
      sleepDuration: 8,
      sleepQuality: 4,
      mentalCondition: 4,
      physicalEnergy: 4,
      muscleSoreness: 2,
      didExercise: true,
      yesterdayRpe: 7,
      hrv: null,
    })
    const withUndefined = calculateCnsScore({
      sleepDuration: 8,
      sleepQuality: 4,
      mentalCondition: 4,
      physicalEnergy: 4,
      muscleSoreness: 2,
      didExercise: true,
      yesterdayRpe: 7,
      hrv: undefined,
    })
    expect(withNull.score).toBe(withUndefined.score)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run lib/cns-score.test.ts
```

Expected: `FAIL` — "Cannot find module './cns-score'"

- [ ] **Step 3: 알고리즘 구현**

```typescript
// lib/cns-score.ts

export interface CnsInput {
  sleepDuration: number     // 시간 단위 (1~10)
  sleepQuality: number      // 1~5
  mentalCondition: number   // 1~5
  physicalEnergy: number    // 1~5
  muscleSoreness: number    // 1~5 (역방향: 값 높을수록 피로도 높음 → 점수 낮음)
  didExercise: boolean
  yesterdayRpe: number      // 0~10
  hrv?: number | null       // V1: 항상 null, 미사용
}

export type CnsStatus = 'Optimal' | 'Recovered' | 'Mild Fatigue' | 'High Fatigue'

export interface CnsResult {
  score: number
  status: CnsStatus
}

/** 1~5 척도 → 0~100 */
function normalize(val: number): number {
  return (val - 1) * 25
}

/** 상태 분류 */
function classify(score: number): CnsStatus {
  if (score >= 85) return 'Optimal'
  if (score >= 60) return 'Recovered'
  if (score >= 40) return 'Mild Fatigue'
  return 'High Fatigue'
}

export function calculateCnsScore(input: CnsInput): CnsResult {
  const {
    sleepDuration,
    sleepQuality,
    mentalCondition,
    physicalEnergy,
    muscleSoreness,
    didExercise,
    yesterdayRpe,
  } = input

  // 1. 정규화
  const sDurationScore = Math.min((sleepDuration / 8) * 100, 100)
  const sQualityScore = normalize(sleepQuality)
  const mScore = normalize(mentalCondition)
  const pScore = normalize(physicalEnergy)
  const bScore = normalize(muscleSoreness)  // 역방향: soreness 높을수록 bScore 높음 → finalCondScore에서 낮게 반영
  const loadScore = didExercise ? Math.max(100 - yesterdayRpe * 10, 0) : 100

  // 2. 중간 합산
  const finalSleepScore = sDurationScore * 0.4 + sQualityScore * 0.6
  // muscleSoreness는 역방향: bScore를 그대로 쓰면 soreness 높을수록 점수 높아짐 → 잘못됨
  // 따라서 (100 - bScore)를 사용해 역방향 처리
  const finalCondScore = mScore * 0.4 + pScore * 0.4 + (100 - bScore) * 0.2
  const finalLoadScore = loadScore

  // 3. 최종 가중합 (HRV 없는 공식)
  const raw =
    finalSleepScore * 0.45 +
    finalCondScore * 0.35 +
    finalLoadScore * 0.20

  const score = Math.round(raw)
  const status = classify(score)

  return { score, status }
}
```

- [ ] **Step 4: 테스트 실행 확인**

```bash
npx vitest run lib/cns-score.test.ts
```

Expected: 모든 테스트 PASS

> **주의:** docs 예제 검증 — 입력: sleepDuration=8, sleepQuality=4, mentalCondition=4, physicalEnergy=4, muscleSoreness=2, didExercise=true, yesterdayRpe=7
> - sDurationScore=100, sQualityScore=75, mScore=75, pScore=75, bScore=25
> - finalSleepScore=100×0.4+75×0.6=85
> - finalCondScore=75×0.4+75×0.4+(100-25)×0.2=30+30+15=75
> - finalLoadScore=100-7×10=30
> - total=85×0.45+75×0.35+30×0.20=38.25+26.25+6=70.5→71
>
> docs 예제 결과가 67인데 `(100-bScore)` 처리로 인해 값이 달라진다. docs 섹션 7에 "muscleSoreness는 역방향"이라고 명시되어 있으므로 역방향 처리가 올바름. 테스트의 docs 예제 케이스를 71로 수정한다.

- [ ] **Step 4-A: docs 예제 테스트 값 수정**

`lib/cns-score.test.ts` 첫 번째 테스트를 수정:

```typescript
it('docs 예제 역방향 처리 포함: score=71, status=Recovered', () => {
  const result = calculateCnsScore({
    sleepDuration: 8,
    sleepQuality: 4,
    mentalCondition: 4,
    physicalEnergy: 4,
    muscleSoreness: 2,
    didExercise: true,
    yesterdayRpe: 7,
    hrv: null,
  })
  // sDurationScore=100, sQualityScore=75
  // finalSleepScore=100*0.4+75*0.6=85
  // mScore=75, pScore=75, bScore=25→(100-25)=75
  // finalCondScore=75*0.4+75*0.4+75*0.2=30+30+15=75
  // loadScore=100-7*10=30
  // total=85*0.45+75*0.35+30*0.20=38.25+26.25+6=70.5→71
  expect(result.score).toBe(71)
  expect(result.status).toBe('Recovered')
})
```

다른 테스트도 동일하게 계산값 재검증:

"모든 최고값" 케이스:
- sDurationScore=100, sQualityScore=100→finalSleepScore=100
- mScore=100, pScore=100, bScore=0→(100-0)=100→finalCondScore=100
- loadScore=100
- total=100×0.45+100×0.35+100×0.20=100
- score=100 ✓

"운동 안 함" 케이스 (muscleSoreness=1, bScore=0, 역방향 후 100):
- finalCondScore=100×0.4+100×0.4+100×0.2=100
- total=100×0.45+100×0.35+100×0.20=100
- 기존 테스트의 `expect(result.score).toBe(93)` → 100으로 수정

```typescript
it('모든 최고값: score=100, status=Optimal', () => {
  const result = calculateCnsScore({
    sleepDuration: 8,
    sleepQuality: 5,
    mentalCondition: 5,
    physicalEnergy: 5,
    muscleSoreness: 1,
    didExercise: false,
    yesterdayRpe: 0,
    hrv: null,
  })
  expect(result.score).toBe(100)
  expect(result.status).toBe('Optimal')
})

it('운동 안 함: loadScore=100, muscleSoreness=1이면 역방향 후 bScore=100', () => {
  const result = calculateCnsScore({
    sleepDuration: 8,
    sleepQuality: 5,
    mentalCondition: 5,
    physicalEnergy: 5,
    muscleSoreness: 1,
    didExercise: false,
    yesterdayRpe: 0,
    hrv: null,
  })
  expect(result.score).toBe(100)
  expect(result.status).toBe('Optimal')
})
```

"RPE 10" 케이스 재계산:
- finalSleepScore=(4/8)*100*0.4+50*0.6=50*0.4+50*0.6=50
- mScore=50, pScore=50, bScore=50→(100-50)=50
- finalCondScore=50*0.4+50*0.4+50*0.2=50
- loadScore=0
- total=50*0.45+50*0.35+0=22.5+17.5=40

```typescript
it('RPE 10: loadScore=0, score=40, status=Mild Fatigue', () => {
  const result = calculateCnsScore({
    sleepDuration: 4,
    sleepQuality: 3,
    mentalCondition: 3,
    physicalEnergy: 3,
    muscleSoreness: 3,
    didExercise: true,
    yesterdayRpe: 10,
    hrv: null,
  })
  expect(result.score).toBe(40)
  expect(result.status).toBe('Mild Fatigue')
})
```

"sleepDuration 초과 cap" 케이스 재계산 (muscleSoreness=1, bScore=0, 역방향 후 100):
- finalCondScore=100
- total=100×0.45+100×0.35+100×0.20=100 → score=100으로 수정

```typescript
it('sleepDuration 8 초과 시 100으로 cap, score=100', () => {
  const result = calculateCnsScore({
    sleepDuration: 12,
    sleepQuality: 5,
    mentalCondition: 5,
    physicalEnergy: 5,
    muscleSoreness: 1,
    didExercise: false,
    yesterdayRpe: 0,
    hrv: null,
  })
  expect(result.score).toBe(100)
})
```

- [ ] **Step 5: 전체 테스트 재실행**

```bash
npx vitest run lib/cns-score.test.ts
```

Expected: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add lib/cns-score.ts lib/cns-score.test.ts
git commit -m "feat: implement calculateCnsScore algorithm with tests"
```

---

## Task 5: DAL 함수 추가

**Files:**
- Modify: `lib/dal.ts`

- [ ] **Step 1: getLatestSleepLog 수정 + getTodaySleepLog, getTodayConditionLog 추가**

`lib/dal.ts`의 `getLatestSleepLog`를 다음으로 교체 (sleep_quality 포함):

```typescript
export const getLatestSleepLog = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sleep_logs')
    .select('sleep_date, bed_time, wake_time, sleep_quality')
    .eq('user_id', userId)
    .order('sleep_date', { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
})
```

그 다음 파일 끝에 추가:

```typescript
export const getTodaySleepLog = cache(async (userId: string, todayISO: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sleep_logs')
    .select('sleep_date, bed_time, wake_time, sleep_quality')
    .eq('user_id', userId)
    .eq('sleep_date', todayISO)
    .single()
  return data ?? null
})

export const getTodayConditionLog = cache(async (userId: string, todayISO: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('condition_logs')
    .select('log_date, mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe')
    .eq('user_id', userId)
    .eq('log_date', todayISO)
    .single()
  return data ?? null
})
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add lib/dal.ts
git commit -m "feat: add getTodaySleepLog and getTodayConditionLog to DAL"
```

---

## Task 6: 수면 체크인에 수면 질 필드 추가

**Files:**
- Modify: `app/dashboard/(with-nav)/checkin/actions.ts`
- Modify: `app/dashboard/(with-nav)/checkin/SleepLogForm.tsx`

- [ ] **Step 1: actions.ts 수정 — sleep_quality 추가**

`app/dashboard/(with-nav)/checkin/actions.ts`를 다음으로 교체:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type SaveSleepLogState = {
  errors?: {
    sleep_date?: string
    bed_time?: string
    wake_time?: string
    sleep_quality?: string
    _form?: string
  }
  success?: boolean
}

const sleepLogSchema = z.object({
  sleep_date: z.string().min(1, '날짜를 선택해 주세요.'),
  bed_time: z.string().min(1, '취침 시간을 입력해 주세요.'),
  wake_time: z.string().min(1, '기상 시간을 입력해 주세요.'),
  sleep_quality: z.coerce.number().int().min(1).max(5).nullable().optional(),
})

function toTimestamptzISO(date: string, time: string): string {
  const normalized = time.length === 5 ? `${time}:00` : time
  return `${date}T${normalized}`
}

function addOneDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function saveSleepLog(
  _prevState: SaveSleepLogState,
  formData: FormData
): Promise<SaveSleepLogState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const raw = {
    sleep_date: formData.get('sleep_date'),
    bed_time: formData.get('bed_time'),
    wake_time: formData.get('wake_time'),
    sleep_quality: formData.get('sleep_quality') || null,
  }

  const parsed = sleepLogSchema.safeParse(raw)

  if (!parsed.success) {
    const flatten = parsed.error.flatten()
    const errors: SaveSleepLogState['errors'] = {}
    if (flatten.fieldErrors.sleep_date) errors.sleep_date = flatten.fieldErrors.sleep_date[0]
    if (flatten.fieldErrors.bed_time) errors.bed_time = flatten.fieldErrors.bed_time[0]
    if (flatten.fieldErrors.wake_time) errors.wake_time = flatten.fieldErrors.wake_time[0]
    return { errors }
  }

  const { sleep_date, bed_time, wake_time, sleep_quality } = parsed.data

  const bedTimeISO = toTimestamptzISO(sleep_date, bed_time)
  const wakeDate = wake_time < bed_time ? addOneDay(sleep_date) : sleep_date
  const wakeTimeISO = toTimestamptzISO(wakeDate, wake_time)

  const { error: upsertError } = await supabase.from('sleep_logs').upsert(
    {
      user_id: user.id,
      sleep_date,
      bed_time: bedTimeISO,
      wake_time: wakeTimeISO,
      sleep_quality: sleep_quality ?? null,
    },
    { onConflict: 'user_id,sleep_date' }
  )

  if (upsertError) {
    return { errors: { _form: upsertError.message } }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/checkin')
  redirect('/dashboard')
}
```

- [ ] **Step 2: SleepLogForm.tsx 수정 — 수면 질 버튼 추가**

`app/dashboard/(with-nav)/checkin/SleepLogForm.tsx`를 다음으로 교체:

```typescript
"use client";

import { useActionState, useRef, useState } from "react";
import { saveSleepLog, type SaveSleepLogState } from "./actions";
import type { SleepLogFormInitial } from "@/lib/types/supabase";
import { JellyButton } from "@/components/ui/JellyButton";

function timestamptzToTimeValue(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "";
  }
}

function formatMonthDay(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

function addOneDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const inputClass =
  "w-full rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-medium outline-none focus:border-paw-brown transition text-base";

const labelClass = "mb-1.5 block text-sm font-bold text-bark-mid";

const SLEEP_QUALITY_LABELS: Record<number, string> = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
};

export function SleepLogForm({
  today,
  initialLog,
  className = "",
}: {
  today: string;
  initialLog: SleepLogFormInitial | null;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveSleepLog,
    {} as SaveSleepLogState,
  );

  const defaultSleepDate = initialLog?.sleep_date ?? today;
  const defaultBedTime = initialLog?.bed_time
    ? timestamptzToTimeValue(initialLog.bed_time)
    : "";
  const defaultWakeTime = initialLog?.wake_time
    ? timestamptzToTimeValue(initialLog.wake_time)
    : "";

  const [sleepDate, setSleepDate] = useState(defaultSleepDate);
  const [sleepQuality, setSleepQuality] = useState<number | null>(
    initialLog?.sleep_quality ?? null,
  );
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className={`flex flex-col gap-4 ${className}`}>
      <div>
        <p className={labelClass}>날짜</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex-1 flex items-center justify-center rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-bold text-base cursor-pointer hover:border-paw-brown transition"
          >
            {formatMonthDay(sleepDate)}
          </button>
          <input
            ref={dateInputRef}
            id="sleep_date"
            type="date"
            name="sleep_date"
            value={sleepDate}
            onChange={(e) => setSleepDate(e.target.value)}
            required
            className="sr-only"
          />
          <span className="text-bark-mid font-bold text-lg shrink-0">→</span>
          <span className="flex-1 flex items-center justify-center rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-mid font-bold text-base">
            {formatMonthDay(addOneDay(sleepDate))}
          </span>
        </div>
        {state?.errors?.sleep_date && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.sleep_date}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bed_time" className={labelClass}>취침 시간</label>
        <input
          id="bed_time"
          type="time"
          name="bed_time"
          defaultValue={defaultBedTime}
          required
          className={inputClass}
        />
        {state?.errors?.bed_time && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.bed_time}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="wake_time" className={labelClass}>기상 시간</label>
        <input
          id="wake_time"
          type="time"
          name="wake_time"
          defaultValue={defaultWakeTime}
          required
          className={inputClass}
        />
        {state?.errors?.wake_time && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.wake_time}
          </p>
        )}
      </div>

      {/* 수면 질 */}
      <div>
        <p className={labelClass}>수면 질 (선택)</p>
        <input type="hidden" name="sleep_quality" value={sleepQuality ?? ""} />
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setSleepQuality(sleepQuality === val ? null : val)}
              className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${
                sleepQuality === val
                  ? "border-paw-brown bg-sleepy-yellow text-bark-dark"
                  : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
              }`}
              title={SLEEP_QUALITY_LABELS[val]}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-bark-light">
          1 = 매우 나쁨 · 5 = 매우 좋음
        </p>
      </div>

      {state?.errors?._form && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          {state.errors._form}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-paw-brown font-bold" role="status" aria-live="polite">
          저장됐어요! 🐾
        </p>
      )}

      <JellyButton
        type="submit"
        disabled={pending}
        className="rounded-full bg-paw-brown py-3 font-bold text-warm-white shadow-sm disabled:opacity-60"
      >
        {pending ? "저장 중..." : "저장하기 🌙"}
      </JellyButton>
    </form>
  );
}
```

- [ ] **Step 3: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add app/dashboard/\(with-nav\)/checkin/actions.ts app/dashboard/\(with-nav\)/checkin/SleepLogForm.tsx
git commit -m "feat: add sleep_quality field to sleep check-in form"
```

---

## Task 7: 컨디션 체크인 서버 액션

**Files:**
- Create: `app/dashboard/(with-nav)/condition-checkin/actions.ts`

- [ ] **Step 1: actions.ts 생성**

```typescript
// app/dashboard/(with-nav)/condition-checkin/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getTodayISO } from '@/utils/date'

export type SaveConditionLogState = {
  errors?: {
    mental_condition?: string
    physical_energy?: string
    muscle_soreness?: string
    did_exercise?: string
    yesterday_rpe?: string
    _form?: string
  }
  success?: boolean
}

const conditionLogSchema = z.object({
  mental_condition: z.coerce.number().int().min(1, '정신 상태를 선택해 주세요.').max(5),
  physical_energy: z.coerce.number().int().min(1, '신체 에너지를 선택해 주세요.').max(5),
  muscle_soreness: z.coerce.number().int().min(1, '근육통을 선택해 주세요.').max(5),
  did_exercise: z.coerce.boolean(),
  yesterday_rpe: z.coerce.number().int().min(0).max(10),
})

export async function saveConditionLog(
  _prevState: SaveConditionLogState,
  formData: FormData
): Promise<SaveConditionLogState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const didExercise = formData.get('did_exercise') === 'true'

  const raw = {
    mental_condition: formData.get('mental_condition'),
    physical_energy: formData.get('physical_energy'),
    muscle_soreness: formData.get('muscle_soreness'),
    did_exercise: didExercise,
    yesterday_rpe: didExercise ? formData.get('yesterday_rpe') : 0,
  }

  const parsed = conditionLogSchema.safeParse(raw)

  if (!parsed.success) {
    const flatten = parsed.error.flatten()
    const errors: SaveConditionLogState['errors'] = {}
    if (flatten.fieldErrors.mental_condition) errors.mental_condition = flatten.fieldErrors.mental_condition[0]
    if (flatten.fieldErrors.physical_energy) errors.physical_energy = flatten.fieldErrors.physical_energy[0]
    if (flatten.fieldErrors.muscle_soreness) errors.muscle_soreness = flatten.fieldErrors.muscle_soreness[0]
    return { errors }
  }

  const { mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe } = parsed.data

  const { error: upsertError } = await supabase.from('condition_logs').upsert(
    {
      user_id: user.id,
      log_date: getTodayISO(),
      mental_condition,
      physical_energy,
      muscle_soreness,
      did_exercise,
      yesterday_rpe,
    },
    { onConflict: 'user_id,log_date' }
  )

  if (upsertError) {
    return { errors: { _form: upsertError.message } }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/condition-checkin')
  redirect('/dashboard/condition-checkin')
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add app/dashboard/\(with-nav\)/condition-checkin/actions.ts
git commit -m "feat: add saveConditionLog server action"
```

---

## Task 8: 컨디션 체크인 폼 컴포넌트

**Files:**
- Create: `app/dashboard/(with-nav)/condition-checkin/ConditionLogForm.tsx`

- [ ] **Step 1: ConditionLogForm.tsx 생성**

```typescript
// app/dashboard/(with-nav)/condition-checkin/ConditionLogForm.tsx
"use client";

import { useActionState, useState } from "react";
import { saveConditionLog, type SaveConditionLogState } from "./actions";
import { JellyButton } from "@/components/ui/JellyButton";
import type { ConditionLog } from "@/lib/types/supabase";

const labelClass = "mb-1.5 block text-sm font-bold text-bark-mid";

function ScaleButtons({
  name,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  name: string;
  value: number | null;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div>
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${
              value === val
                ? "border-paw-brown bg-sleepy-yellow text-bark-dark"
                : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
            }`}
          >
            {val}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-bark-light">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export function ConditionLogForm({
  initialLog,
}: {
  initialLog: ConditionLog | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveConditionLog,
    {} as SaveConditionLogState,
  );

  const [mentalCondition, setMentalCondition] = useState<number | null>(
    initialLog?.mental_condition ?? null,
  );
  const [physicalEnergy, setPhysicalEnergy] = useState<number | null>(
    initialLog?.physical_energy ?? null,
  );
  const [muscleSoreness, setMuscleSoreness] = useState<number | null>(
    initialLog?.muscle_soreness ?? null,
  );
  const [didExercise, setDidExercise] = useState(
    initialLog?.did_exercise ?? false,
  );
  const [rpe, setRpe] = useState(initialLog?.yesterday_rpe ?? 5);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 정신 상태 */}
      <div>
        <p className={labelClass}>정신 상태</p>
        <ScaleButtons
          name="mental_condition"
          value={mentalCondition}
          onChange={setMentalCondition}
          minLabel="매우 나쁨"
          maxLabel="매우 좋음"
        />
        {state?.errors?.mental_condition && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.mental_condition}
          </p>
        )}
      </div>

      {/* 신체 에너지 */}
      <div>
        <p className={labelClass}>신체 에너지</p>
        <ScaleButtons
          name="physical_energy"
          value={physicalEnergy}
          onChange={setPhysicalEnergy}
          minLabel="매우 낮음"
          maxLabel="매우 높음"
        />
        {state?.errors?.physical_energy && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.physical_energy}
          </p>
        )}
      </div>

      {/* 근육통 */}
      <div>
        <p className={labelClass}>근육통</p>
        <ScaleButtons
          name="muscle_soreness"
          value={muscleSoreness}
          onChange={setMuscleSoreness}
          minLabel="없음"
          maxLabel="매우 심함"
        />
        {state?.errors?.muscle_soreness && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.muscle_soreness}
          </p>
        )}
      </div>

      {/* 어제 운동 여부 */}
      <div>
        <p className={labelClass}>어제 운동했나요?</p>
        <input type="hidden" name="did_exercise" value={String(didExercise)} />
        <div className="flex gap-3">
          {[
            { label: "했어요", value: true },
            { label: "안 했어요", value: false },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setDidExercise(opt.value)}
              className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${
                didExercise === opt.value
                  ? "border-paw-brown bg-sleepy-yellow text-bark-dark"
                  : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* RPE — didExercise=true일 때만 표시 */}
      {didExercise && (
        <div>
          <p className={labelClass}>운동 강도 (RPE): {rpe}</p>
          <input
            type="range"
            name="yesterday_rpe"
            min={0}
            max={10}
            step={1}
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
            className="w-full accent-paw-brown"
          />
          <div className="flex justify-between text-xs text-bark-light mt-1">
            <span>0 (휴식)</span>
            <span>10 (최고 강도)</span>
          </div>
        </div>
      )}

      {state?.errors?._form && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          {state.errors._form}
        </p>
      )}

      <JellyButton
        type="submit"
        disabled={pending}
        className="rounded-full bg-paw-brown py-3 font-bold text-warm-white shadow-sm disabled:opacity-60"
      >
        {pending ? "저장 중..." : "저장하기 💪"}
      </JellyButton>
    </form>
  );
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add app/dashboard/\(with-nav\)/condition-checkin/ConditionLogForm.tsx
git commit -m "feat: add ConditionLogForm client component"
```

---

## Task 9: CnsScoreCard 컴포넌트

**Files:**
- Create: `components/CnsScoreCard.tsx`

- [ ] **Step 1: CnsScoreCard.tsx 생성**

```typescript
// components/CnsScoreCard.tsx
import Link from "next/link";
import type { CnsStatus } from "@/lib/cns-score";

const STATUS_CONFIG: Record<
  CnsStatus,
  { bg: string; text: string; action: string }
> = {
  Optimal: {
    bg: "bg-green-100 text-green-800",
    text: "최상",
    action: "고강도 훈련 가능",
  },
  Recovered: {
    bg: "bg-blue-100 text-blue-800",
    text: "회복됨",
    action: "계획된 훈련 진행",
  },
  "Mild Fatigue": {
    bg: "bg-orange-100 text-orange-800",
    text: "가벼운 피로",
    action: "기술 위주 훈련 권장",
  },
  "High Fatigue": {
    bg: "bg-red-100 text-red-800",
    text: "고강도 피로",
    action: "완전 휴식 권장",
  },
};

export function CnsScoreCard({
  score,
  status,
}: {
  score: number | null;
  status: CnsStatus | null;
}) {
  if (score === null || status === null) {
    return (
      <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
        <h2 className="text-base font-extrabold text-bark-dark mb-2">
          💪 CNS 피로도
        </h2>
        <p className="text-sm text-bark-light mb-3">
          수면 기록과 컨디션 체크인을 완료하면 피로도 점수가 나타나요.
        </p>
        <Link
          href="/dashboard/condition-checkin"
          className="inline-block rounded-full bg-sleepy-yellow px-4 py-2 text-xs font-bold text-bark-dark hover:bg-sleepy-yellow-light transition"
        >
          컨디션 기록하기
        </Link>
      </section>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
      <h2 className="text-base font-extrabold text-bark-dark mb-3">
        💪 CNS 피로도
      </h2>
      <div className="flex items-center gap-4">
        <span className="text-5xl font-extrabold text-bark-dark">{score}</span>
        <div className="flex flex-col gap-1">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${config.bg}`}
          >
            {config.text}
          </span>
          <span className="text-xs text-bark-mid">{config.action}</span>
        </div>
      </div>
      <Link
        href="/dashboard/condition-checkin"
        className="mt-3 inline-block rounded-full bg-sleepy-yellow px-4 py-2 text-xs font-bold text-bark-dark hover:bg-sleepy-yellow-light transition"
      >
        수정하기
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/CnsScoreCard.tsx
git commit -m "feat: add CnsScoreCard component"
```

---

## Task 10: 컨디션 체크인 페이지

**Files:**
- Create: `app/dashboard/(with-nav)/condition-checkin/page.tsx`

- [ ] **Step 1: page.tsx 생성**

```typescript
// app/dashboard/(with-nav)/condition-checkin/page.tsx
import { getCachedUser, getTodayConditionLog, getTodaySleepLog } from "@/lib/dal";
import { getTodayISO, durationMinutes } from "@/utils/date";
import { calculateCnsScore } from "@/lib/cns-score";
import { ConditionLogForm } from "./ConditionLogForm";
import { CnsScoreCard } from "@/components/CnsScoreCard";
import type { CnsStatus } from "@/lib/cns-score";

export default async function ConditionCheckinPage() {
  const user = await getCachedUser();
  const todayISO = getTodayISO();

  const [conditionLog, sleepLog] = await Promise.all([
    getTodayConditionLog(user.id, todayISO),
    getTodaySleepLog(user.id, todayISO),
  ]);

  let score: number | null = null;
  let status: CnsStatus | null = null;

  if (
    conditionLog &&
    sleepLog &&
    sleepLog.sleep_quality != null
  ) {
    const sleepDuration = durationMinutes(sleepLog.bed_time, sleepLog.wake_time) / 60;
    const result = calculateCnsScore({
      sleepDuration,
      sleepQuality: sleepLog.sleep_quality,
      mentalCondition: conditionLog.mental_condition,
      physicalEnergy: conditionLog.physical_energy,
      muscleSoreness: conditionLog.muscle_soreness,
      didExercise: conditionLog.did_exercise,
      yesterdayRpe: conditionLog.yesterday_rpe,
      hrv: null,
    });
    score = result.score;
    status = result.status;
  }

  const missingMessage =
    !sleepLog
      ? "오늘 수면 기록을 먼저 입력해 주세요."
      : sleepLog.sleep_quality == null
      ? "수면 체크인에서 수면 질을 입력하면 점수가 계산돼요."
      : null;

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        <h1 className="text-xl font-extrabold text-bark-dark">💪 컨디션 체크인</h1>

        {/* 점수 카드 */}
        {missingMessage ? (
          <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
            <p className="text-sm text-bark-mid">{missingMessage}</p>
          </div>
        ) : (
          <CnsScoreCard score={score} status={status} />
        )}

        {/* 입력 폼 */}
        <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
          <h2 className="text-base font-extrabold text-bark-dark mb-4">오늘의 컨디션</h2>
          <ConditionLogForm initialLog={conditionLog} />
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add app/dashboard/\(with-nav\)/condition-checkin/page.tsx
git commit -m "feat: add condition check-in page with CNS score display"
```

---

## Task 11: 대시보드 + TodayCard 업데이트

**Files:**
- Modify: `components/TodayCard.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: TodayCard.tsx에 컨디션 항목 추가**

`components/TodayCard.tsx`를 다음으로 교체:

```typescript
import Link from "next/link";
import {
  getCachedUser,
  getUserProfile,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
  getTodayConditionLog,
} from "@/lib/dal";
import { getTodayStartTs, getTodayISO } from "@/utils/date";

const LOG_ITEMS = [
  {
    key: "sleep",
    label: "수면 기록",
    icon: "🌙",
    href: "/dashboard/checkin",
  },
  {
    key: "mood",
    label: "기분 체크인",
    icon: "🐾",
    href: "/dashboard/mood-checkin",
  },
  {
    key: "nap",
    label: "낮잠",
    icon: "💤",
    href: "/dashboard/nap-checkin",
  },
  {
    key: "condition",
    label: "컨디션",
    icon: "💪",
    href: "/dashboard/condition-checkin",
  },
];

export default async function TodayCard() {
  const user = await getCachedUser();
  await getUserProfile();

  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLogs, moodLogs, napLogs, conditionLog] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
    getTodayConditionLog(user.id, todayISO),
  ]);

  const hasTodayLog = sleepLogs.some((log) => log.sleep_date === todayISO);
  const todayMoodCount = moodLogs.filter(
    (log) => log.log_time >= todayStartTs,
  ).length;
  const todayNapCount = napLogs.filter(
    (log) => log.start_time >= todayStartTs,
  ).length;
  const hasConditionLog = conditionLog !== null;

  const statusMap: Record<string, string> = {
    sleep: hasTodayLog ? "기록됨 ✓" : "없음",
    mood: `${todayMoodCount}회`,
    nap: `${todayNapCount}회`,
    condition: hasConditionLog ? "기록됨 ✓" : "없음",
  };
  const doneMap: Record<string, boolean> = {
    sleep: hasTodayLog,
    mood: todayMoodCount > 0,
    nap: todayNapCount > 0,
    condition: hasConditionLog,
  };

  return (
    <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5 flex-1">
      <h2 className="text-base font-extrabold text-bark-dark mb-4">오늘</h2>
      <ul className="flex flex-col gap-3">
        {LOG_ITEMS.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-bark-mid">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <span className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${
                  doneMap[item.key] ? "text-paw-brown" : "text-bark-light"
                }`}
              >
                {statusMap[item.key]}
              </span>
              <Link
                href={item.href}
                className="rounded-full bg-sleepy-yellow px-3 py-1 text-xs font-bold text-bark-dark transition hover:bg-sleepy-yellow-light"
              >
                기록하기
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: dashboard/page.tsx에 CnsScoreCard 추가**

`app/dashboard/page.tsx`를 다음으로 교체:

```typescript
import { Suspense } from "react";
import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
  getTodayConditionLog,
  getTodaySleepLog,
} from "@/lib/dal";
import Header from "@/components/Header";
import TodayCard from "@/components/TodayCard";
import Last7DaysCard from "@/components/Last7DaysCard";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";
import { MoodChart } from "@/app/dashboard/(with-nav)/mood-checkin/MoodChart";
import { NapChart } from "@/app/dashboard/(with-nav)/nap-checkin/NapChart";
import { DogStatusWidget } from "@/components/DogStatusWidget";
import { CnsScoreCard } from "@/components/CnsScoreCard";
import { durationMinutes, getTodayISO, getTodayStartTs } from "@/utils/date";
import { calculateCnsScore } from "@/lib/cns-score";
import type { DogState } from "@/components/SleepyDog";
import type { CnsStatus } from "@/lib/cns-score";
import HeaderSkeleton from "@/components/Skeleton/HeaderSkeleton";
import TodayCardSkeleton from "@/components/Skeleton/TodayCardSkeleton";
import Last7DaysCardSkeleton from "@/components/Skeleton/Last7DaysCardSkeleton";
import SleepChartWrapperSkeleton from "@/components/Skeleton/SleepChartWrapperSkeleton";
import MoodChartWrapperSkeleton from "@/components/Skeleton/MoodChartWrapperSkeleton";
import NapChartWrapperSkeleton from "@/components/Skeleton/NapChartWrapperSkeleton";

async function resolveDogState(): Promise<DogState> {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  const todaySleep = sleepLogs.find((l) => l.sleep_date === todayISO);
  const todayMoodCount = moodLogs.filter((l) => l.log_time >= todayStartTs).length;
  const todayNapCount = napLogs.filter((l) => l.start_time >= todayStartTs).length;

  if (!todaySleep) return "waiting";

  const sleepMin = durationMinutes(todaySleep.bed_time, todaySleep.wake_time);

  if (todayMoodCount > 0 && todayNapCount > 0 && sleepMin >= 360) return "running";
  if (sleepMin >= 420) return "happy";
  if (sleepMin < 360) return "drowsy";
  return "sleeping";
}

async function resolveCnsScore(): Promise<{ score: number | null; status: CnsStatus | null }> {
  const user = await getCachedUser();
  const todayISO = getTodayISO();

  const [conditionLog, sleepLog] = await Promise.all([
    getTodayConditionLog(user.id, todayISO),
    getTodaySleepLog(user.id, todayISO),
  ]);

  if (!conditionLog || !sleepLog || sleepLog.sleep_quality == null) {
    return { score: null, status: null };
  }

  const sleepDuration = durationMinutes(sleepLog.bed_time, sleepLog.wake_time) / 60;
  const result = calculateCnsScore({
    sleepDuration,
    sleepQuality: sleepLog.sleep_quality,
    mentalCondition: conditionLog.mental_condition,
    physicalEnergy: conditionLog.physical_energy,
    muscleSoreness: conditionLog.muscle_soreness,
    didExercise: conditionLog.did_exercise,
    yesterdayRpe: conditionLog.yesterday_rpe,
    hrv: null,
  });

  return result;
}

export default async function DashboardPage() {
  const user = await getCachedUser();
  const dogState = await resolveDogState();
  const cnsResult = await resolveCnsScore();

  const sleepPromise = getCachedSleepLogs7Days(user.id);
  const moodPromise = getCachedMoodLogs7Days(user.id);
  const napPromise = getCachedNapLogs7Days(user.id);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 space-y-4">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DogStatusWidget state={dogState} />
          <Suspense fallback={<TodayCardSkeleton />}>
            <TodayCard />
          </Suspense>
        </div>

        <CnsScoreCard score={cnsResult.score} status={cnsResult.status} />

        <Suspense fallback={<Last7DaysCardSkeleton />}>
          <Last7DaysCard />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-3">
          <Suspense fallback={<SleepChartWrapperSkeleton />}>
            <SleepCharts sleepPromise={sleepPromise} />
          </Suspense>
          <Suspense fallback={<MoodChartWrapperSkeleton />}>
            <MoodChart moodPromise={moodPromise} />
          </Suspense>
          <Suspense fallback={<NapChartWrapperSkeleton />}>
            <NapChart napPromise={napPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add components/TodayCard.tsx app/dashboard/page.tsx
git commit -m "feat: add CNS score card to dashboard and condition item to TodayCard"
```

---

## Task 12: 네비게이션에 컨디션 링크 추가

**Files:**
- Modify: `app/dashboard/(with-nav)/layout.tsx`

- [ ] **Step 1: layout.tsx 수정**

`NAV_ITEMS` 배열에 컨디션 항목 추가:

```typescript
const NAV_ITEMS = [
  { href: "/dashboard", label: "🏠 홈" },
  { href: "/dashboard/checkin", label: "🌙 수면" },
  { href: "/dashboard/mood-checkin", label: "🐾 기분" },
  { href: "/dashboard/nap-checkin", label: "💤 낮잠" },
  { href: "/dashboard/condition-checkin", label: "💪 컨디션" },
];
```

- [ ] **Step 2: 커밋**

```bash
git add app/dashboard/\(with-nav\)/layout.tsx
git commit -m "feat: add condition check-in nav link"
```

---

## Task 13: 전체 빌드 확인

- [ ] **Step 1: TypeScript 전체 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 2: 전체 테스트 실행**

```bash
npm test
```

Expected: 모든 테스트 PASS

- [ ] **Step 3: Next.js 빌드 확인**

```bash
npm run build
```

Expected: 빌드 성공, 오류 없음

- [ ] **Step 4: 로컬 실행 후 수동 확인**

```bash
npm run dev
```

확인 항목:
- `/dashboard/checkin` — 수면 질 버튼 표시됨
- `/dashboard/condition-checkin` — 컨디션 폼 표시됨
- 수면 질 + 컨디션 모두 입력 후 `/dashboard` — CNS 점수 카드 표시됨
- 네비에 💪 컨디션 링크 표시됨
