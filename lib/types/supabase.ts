/** sleep_condition_tracker 프로젝트의 public.sleep_logs 테이블 구조 기준 */
export type SleepLog = {
  id: string
  user_id: string
  sleep_date: string
  bed_time: string
  wake_time: string
  created_at: string | null
}

export type SleepLogRow = {
  id: string;
  user_id: string
  sleep_date: string
  bed_time: string
  wake_time: string
  created_at: string | null
}

/** 폼 기본값/조회용 (타임존 없는 time 부분만 표시용) */
export type SleepLogFormInitial = {
  sleep_date: string
  bed_time: string
  wake_time: string
}

/** public.profiles 테이블 (온보딩 설문) */
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

/** public.mood_logs 테이블 (상시 기분 체크인) */
export type MoodLog = {
  id: string
  user_id: string
  score: number
  memo: string | null
  log_time: string
  created_at: string | null
}

export type MoodLogRow = {
  id: string
  user_id: string
  score: number
  memo: string | null
  log_time: string
  created_at: string | null
}

/** public.nap_logs 테이블 (낮잠 기록) */
export type NapLog = {
  id: string
  user_id: string
  start_time: string
  end_time: string
  created_at: string | null
}

export type NapLogRow = {
  id: string
  user_id: string
  start_time: string
  end_time: string
  created_at: string | null
}

/** 온보딩 완료 여부: age가 있으면 완료로 간주 (profile은 id, age만 있어도 됨) */
export function isOnboardingComplete(
  profile: { age?: number | null } | null
): boolean {
  return profile != null && profile.age != null
}
