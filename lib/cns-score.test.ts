import { describe, it, expect } from 'vitest'
import { calculateCnsScore } from './cns-score'

describe('calculateCnsScore', () => {
  it('기준 케이스 (muscleSoreness=2, RPE=7): score=71, status=Recovered', () => {
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
    // muscleSoreness=2 → normalize=25 → inverted: 100-25=75
    // finalSleepScore=100*0.4+75*0.6=85
    // finalCondScore=75*0.4+75*0.4+75*0.2=75
    // loadScore=100-7*10=30
    // total=85*0.45+75*0.35+30*0.20=38.25+26.25+6=70.5→71
    expect(result.score).toBe(71)
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
    // sDurationScore=100, sQualityScore=100→finalSleepScore=100
    // mScore=100, pScore=100, bScore=0→(100-0)=100→finalCondScore=100
    // loadScore=100
    // total=100*0.45+100*0.35+100*0.20=100
    expect(result.score).toBe(100)
    expect(result.status).toBe('Optimal')
  })

  it('극단적 피로: status=High Fatigue', () => {
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
    // finalSleepScore=50*0.4+50*0.6=50
    // mScore=50, pScore=50, bScore=50→(100-50)=50
    // finalCondScore=50*0.4+50*0.4+50*0.2=50
    // loadScore=0
    // total=50*0.45+50*0.35+0=22.5+17.5=40
    expect(result.score).toBe(40)
    expect(result.status).toBe('Mild Fatigue')
  })

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

  it('hrv null과 undefined 동일 처리', () => {
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

  it('운동 안 하면 loadScore=100', () => {
    const withExercise = calculateCnsScore({
      sleepDuration: 6,
      sleepQuality: 3,
      mentalCondition: 3,
      physicalEnergy: 3,
      muscleSoreness: 3,
      didExercise: true,
      yesterdayRpe: 5,
      hrv: null,
    })
    const withoutExercise = calculateCnsScore({
      sleepDuration: 6,
      sleepQuality: 3,
      mentalCondition: 3,
      physicalEnergy: 3,
      muscleSoreness: 3,
      didExercise: false,
      yesterdayRpe: 0,
      hrv: null,
    })
    // withoutExercise should score higher (loadScore=100 vs 50)
    expect(withoutExercise.score).toBeGreaterThan(withExercise.score)
  })
})
