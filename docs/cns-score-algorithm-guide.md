# CNS Fatigue Score — 구현 가이드 (V1.1)

---

## 1. 입력 스키마

```typescript
interface CnsDemoInput {
  sleepDuration: number; // 수면 시간 (단위: 시간, 범위: 1~10)
  sleepQuality: number; // 수면 질 (1~5)
  mentalCondition: number; // 정신 상태 (1~5)
  physicalEnergy: number; // 신체 에너지 (1~5)
  muscleSoreness: number; // 근육통 (1~5, 1=없음, 5=매우 심함)
  didExercise: boolean; // 전날 운동 여부
  yesterdayRpe: number; // 전날 운동 강도 (0~10, 운동 안 했으면 0)
  hrv?: number | null; // 심박변이도 (선택, 단위: ms)
}
```

---

## 2. 정규화 규칙

### 수면 시간 → 0~100

```
sDurationScore = min((sleepDuration / 8) * 100, 100)
```

> 8시간 = 만점 100. 초과해도 100 이상 안 됨.

### 1~5 척도 → 0~100

```
normalize(val) = (val - 1) * 25
```

| 입력 | 점수 |
| ---- | ---- |
| 1    | 0    |
| 2    | 25   |
| 3    | 50   |
| 4    | 75   |
| 5    | 100  |

### RPE → 로드 점수

```
loadScore = didExercise ? max(100 - yesterdayRpe * 10, 0) : 100
```

> RPE 10 = 0점 (완전 고갈), 운동 안 함 = 100점 (부하 없음)

### HRV → 0~100 (선택)

```
hrvScore = min((hrv / 60) * 100, 100)
```

> 60ms = 만점 기준. 초과 시 100으로 cap.

---

## 3. 중간 점수 합산

```
finalSleepScore = sDurationScore * 0.4 + sQualityScore * 0.6
finalCondScore  = mScore * 0.4 + pScore * 0.4 + bScore * 0.2
finalLoadScore  = loadScore  (위에서 계산)
```

---

## 4. 최종 점수 (가중 합산)

### HRV **없을 때**

```
totalScore = finalSleepScore * 0.45
           + finalCondScore  * 0.35
           + finalLoadScore  * 0.20
```

### HRV **있을 때**

```
totalScore = finalSleepScore * 0.35
           + finalCondScore  * 0.30
           + finalLoadScore  * 0.20
           + hrvScore        * 0.15
```

> 최종값 `Math.round()` 처리.

---

## 5. 상태 분류

| 점수 범위 | 상태             | 권장 행동           |
| --------- | ---------------- | ------------------- |
| 85 이상   | **Optimal**      | 고강도 훈련 가능    |
| 60~84     | **Recovered**    | 계획된 훈련 진행    |
| 40~59     | **Mild Fatigue** | 기술 위주 훈련 권장 |
| 39 이하   | **High Fatigue** | 완전 휴식           |

---

## 6. 검증용 예제

```typescript
// 입력
{
  sleepDuration: 8,
  sleepQuality: 4,
  mentalCondition: 4,
  physicalEnergy: 4,
  muscleSoreness: 2,
  didExercise: true,
  yesterdayRpe: 7,
  hrv: null
}

// 계산
sDurationScore = 100
sQualityScore  = 75   // (4-1)*25
mScore         = 75
pScore         = 75
bScore         = 25   // (2-1)*25
loadScore      = 30   // 100 - 7*10

finalSleepScore = 100*0.4 + 75*0.6 = 85
finalCondScore  = 75*0.4 + 75*0.4 + 25*0.2 = 65
finalLoadScore  = 30

totalScore = 85*0.45 + 65*0.35 + 30*0.20
           = 38.25 + 22.75 + 6
           = 67  → "Recovered"
```

---

## 7. 구현 시 주의사항

- `muscleSoreness`는 **역방향** — 값 높을수록 피로도 높음 (점수 낮아짐). 입력 UI에서 레이블 명확히 할 것.
- `hrv`는 `null | undefined | 0` 모두 "HRV 없음"으로 처리.
- `yesterdayRpe`는 `didExercise: false`면 반드시 `0` 세팅.
- 점수 범위는 이론상 0~100이지만, 극단값(모두 1점 입력 등)에서 0점도 가능.
