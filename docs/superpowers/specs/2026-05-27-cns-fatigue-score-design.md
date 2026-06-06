# CNS 피로도 점수 기능 — 설계 스펙

**날짜**: 2026-05-27
**범위**: 알고리즘 구현, DB 스키마 확장, 컨디션 체크인 신규 페이지, 대시보드 점수 카드
**참조 문서**: `docs/cns-score-algorithm-guide.md`

---

## 1. 아키텍처 요약

점수는 DB에 저장하지 않고 **렌더 시 Server Component에서 실시간 계산**한다.
- 알고리즘 수정 시 기존 데이터 재계산 자동 반영
- 기존 패턴(차트도 원시 로그에서 렌더 시 계산)과 일치
- `lib/cns-score.ts` 순수 함수 — 입력 → 점수/상태

---

## 2. DB 스키마 변경

### 2-1. `sleep_logs` 컬럼 추가

```sql
ALTER TABLE sleep_logs
  ADD COLUMN sleep_quality SMALLINT;  -- 1~5, nullable (기존 로그 호환)
```

### 2-2. 신규 `condition_logs` 테이블

```sql
CREATE TABLE condition_logs (
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

ALTER TABLE condition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own condition logs"
  ON condition_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 3. 알고리즘 함수 (`lib/cns-score.ts`)

`docs/cns-score-algorithm-guide.md` 스펙을 그대로 구현한다.

```typescript
export interface CnsInput {
  sleepDuration: number      // 시간 단위
  sleepQuality: number       // 1~5
  mentalCondition: number    // 1~5
  physicalEnergy: number     // 1~5
  muscleSoreness: number     // 1~5 (역방향)
  didExercise: boolean
  yesterdayRpe: number       // 0~10
  hrv?: number | null        // V1: 미사용, null 처리
}

export type CnsStatus = "Optimal" | "Recovered" | "Mild Fatigue" | "High Fatigue"

export interface CnsResult {
  score: number
  status: CnsStatus
}

export function calculateCnsScore(input: CnsInput): CnsResult
```

검증: `docs/cns-score-algorithm-guide.md` 섹션 6 예제 → `score === 67`, `status === "Recovered"`

---

## 4. 수면 체크인 변경 (`/dashboard/checkin`)

### 변경 파일
- `app/dashboard/(with-nav)/checkin/SleepLogForm.tsx` — `sleepQuality` 1~5 라디오 추가
- `app/dashboard/(with-nav)/checkin/actions.ts` — zod 스키마 + upsert에 `sleep_quality` 포함

### UI
- 기존 취침/기상 시간 필드 아래에 "수면 질" 1~5 버튼 행 추가
- MoodFace 컴포넌트 스타일 재사용 (없으면 단순 버튼)

---

## 5. 신규 컨디션 체크인 (`/dashboard/condition-checkin`)

### 파일 구조
```
app/dashboard/(with-nav)/condition-checkin/
├── page.tsx               # Server Component: 오늘 로그 조회 + CNS 점수 계산 + 표시
├── ConditionLogForm.tsx   # Client Component: 입력 폼
└── actions.ts             # saveConditionLog 서버 액션
```

### 폼 필드

| 필드 | 레이블 | UI | 비고 |
|------|--------|-----|------|
| `mental_condition` | 정신 상태 | 1~5 버튼 | 1=매우 나쁨, 5=매우 좋음 |
| `physical_energy` | 신체 에너지 | 1~5 버튼 | 1=매우 낮음, 5=매우 높음 |
| `muscle_soreness` | 근육통 | 1~5 버튼 | 1=없음, 5=매우 심함 |
| `did_exercise` | 어제 운동 여부 | 토글 | false면 RPE 행 숨김 |
| `yesterday_rpe` | 운동 강도 (RPE) | 0~10 슬라이더 | did_exercise=true일 때만 표시 |

### 서버 액션
```typescript
// actions.ts
export async function saveConditionLog(prevState, formData): Promise<ActionResult>
// zod 검증 → upsert condition_logs (user_id, log_date 기준)
// revalidatePath('/dashboard'), revalidatePath('/dashboard/condition-checkin')
```

### 점수 표시 (page.tsx)
- 오늘 `condition_logs` + 오늘 `sleep_logs` 조회
- 두 데이터 모두 있으면 `calculateCnsScore()` 호출
- 점수 카드: 숫자 + 상태 배지 (색상: Optimal=초록, Recovered=파랑, Mild Fatigue=주황, High Fatigue=빨강)
- 데이터 부족 시: "오늘 수면 기록을 먼저 입력해주세요" 안내

---

## 6. 대시보드 변경 (`/dashboard`)

### `TodayCard` 수정
- 기존 수면/기분/낮잠 항목에 "컨디션" 항목 추가
- 기록 있으면 CNS 점수 표시, 없으면 "없음"

### 신규 `CnsScoreCard` 컴포넌트
```
components/CnsScoreCard.tsx
```
- Props: `score: number | null, status: CnsStatus | null`
- score null이면 빈 상태 (체크인 유도 버튼)
- score 있으면: 큰 숫자 + 상태 배지 + 권장 행동 텍스트

### 대시보드 데이터 흐름
```
dashboard/page.tsx (Server Component)
  ├── getCachedSleepLogs7Days()  (기존)
  ├── getTodayConditionLog()     (신규 DAL)
  └── calculateCnsScore()       (오늘 수면 + 컨디션 데이터 있을 때)
```

---

## 7. DAL 추가 (`lib/dal.ts`)

```typescript
export const getTodayConditionLog = cache(async (userId: string) => {
  // condition_logs WHERE user_id = userId AND log_date = today
})
```

---

## 8. 네비게이션

기존 바텀 네비(`app/dashboard/(with-nav)/layout.tsx`)에 컨디션 체크인 링크 추가.

---

## 9. 파일 변경 요약

### 신규
- `lib/cns-score.ts`
- `app/dashboard/(with-nav)/condition-checkin/page.tsx`
- `app/dashboard/(with-nav)/condition-checkin/ConditionLogForm.tsx`
- `app/dashboard/(with-nav)/condition-checkin/actions.ts`
- `components/CnsScoreCard.tsx`
- `supabase/migrations/YYYYMMDD_add_sleep_quality_and_condition_logs.sql`

### 수정
- `lib/dal.ts` — `getTodayConditionLog` 추가
- `lib/types/supabase.ts` — `ConditionLog` 타입 추가, `SleepLog`에 `sleep_quality` 추가
- `app/dashboard/(with-nav)/checkin/SleepLogForm.tsx` — `sleepQuality` 필드 추가
- `app/dashboard/(with-nav)/checkin/actions.ts` — `sleep_quality` 포함
- `app/dashboard/page.tsx` — CNS 점수 카드 추가
- `components/TodayCard.tsx` — 컨디션 항목 추가
- `app/dashboard/(with-nav)/layout.tsx` — 네비 링크 추가

---

## 10. 제약 사항

- HRV 입력 V1 제외 (항상 null 처리, HRV 없는 공식 사용)
- 컨디션 로그 하루 1회 (upsert)
- 수면 로그 없으면 CNS 점수 계산 불가 (sleepDuration, sleepQuality 필요)
- 기존 서버 액션 패턴 유지 (zod + useActionState)
- 기존 디자인 시스템 토큰 사용 (paw-brown, cream 등)
