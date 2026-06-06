export type Goal = {
  id: string
  user_id: string
  name: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type GoalActivationPeriod = {
  id: string
  goal_id: string
  user_id: string
  started_on: string   // 'YYYY-MM-DD'
  ended_on: string | null  // 'YYYY-MM-DD' or null (still active)
  created_at: string
}

export type DailyLog = {
  id: string
  goal_id: string
  user_id: string
  log_date: string  // 'YYYY-MM-DD'
  done: boolean
  created_at: string
  updated_at: string
}

export type CellState = 'DONE' | 'MISSED' | 'PENDING' | 'NA'

// Goal with its activation periods nested (from Supabase select with join)
export type GoalWithPeriods = Goal & {
  goal_activation_periods: GoalActivationPeriod[]
}
