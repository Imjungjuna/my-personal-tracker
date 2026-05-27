export interface CnsInput {
  sleepDuration: number     // 시간 단위 (1~10)
  sleepQuality: number      // 1~5
  mentalCondition: number   // 1~5
  physicalEnergy: number    // 1~5
  muscleSoreness: number    // 1~5 (역방향: 높을수록 피로, 점수 낮아짐)
  didExercise: boolean
  yesterdayRpe: number      // 0~10
  hrv?: number | null       // V1: 항상 null
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

/** 점수 → 상태 분류 */
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
  // muscleSoreness 역방향: bScore 높을수록 피로 → (100 - bScore)로 반전
  const bScore = 100 - normalize(muscleSoreness)
  const loadScore = didExercise ? Math.max(100 - yesterdayRpe * 10, 0) : 100

  // 2. 중간 합산
  const finalSleepScore = sDurationScore * 0.4 + sQualityScore * 0.6
  const finalCondScore = mScore * 0.4 + pScore * 0.4 + bScore * 0.2
  const finalLoadScore = loadScore

  // 3. 최종 가중합 (HRV 없는 공식)
  const raw =
    finalSleepScore * 0.45 +
    finalCondScore * 0.35 +
    finalLoadScore * 0.20

  const score = Math.round(raw)

  return { score, status: classify(score) }
}
