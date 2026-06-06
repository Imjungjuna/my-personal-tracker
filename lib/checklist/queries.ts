import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { GoalWithPeriods, DailyLog } from './types'

export const getGoalsWithPeriods = cache(async (userId: string): Promise<GoalWithPeriods[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_activation_periods(*)')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as GoalWithPeriods[]
})

export const getTodayLogs = cache(async (userId: string, todayISO: string): Promise<DailyLog[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', todayISO)

  if (error) throw new Error(error.message)
  return (data ?? []) as DailyLog[]
})

export const getLogsForRange = cache(async (
  userId: string,
  fromDate: string,
  toDate: string
): Promise<DailyLog[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', fromDate)
    .lte('log_date', toDate)

  if (error) throw new Error(error.message)
  return (data ?? []) as DailyLog[]
})
