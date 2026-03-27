export type SleepLog = {
  id: string
  user_id: string
  sleep_date: string
  bed_time: string
  wake_time: string
  created_at: string | null
}

export type SleepLogFormInitial = {
  sleep_date: string
  bed_time: string
  wake_time: string
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

export function isOnboardingComplete(
  profile: { age?: number | null } | null
): boolean {
  return profile != null && profile.age != null
}
