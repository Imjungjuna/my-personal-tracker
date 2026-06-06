'use server'

import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/dal'

export async function upsertLog(goalId: string, date: string, done: boolean): Promise<void> {
  const supabase = await createClient()
  const user = await getCachedUser()

  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { user_id: user.id, goal_id: goalId, log_date: date, done },
      { onConflict: 'goal_id,log_date' }
    )

  if (error) throw new Error(error.message)
}

export async function addGoal(name: string): Promise<void> {
  const supabase = await createClient()
  const user = await getCachedUser()

  const { error } = await supabase
    .from('goals')
    .insert({ user_id: user.id, name: name.trim(), is_active: true })

  if (error) throw new Error(error.message)
}

export async function toggleGoalActive(goalId: string, currentlyActive: boolean): Promise<void> {
  const supabase = await createClient()
  const rpc = currentlyActive ? 'deactivate_goal' : 'activate_goal'

  const { error } = await supabase.rpc(rpc, { p_goal_id: goalId })
  if (error) throw new Error(error.message)
}

export async function reorderGoals(updates: { id: string; sort_order: number }[]): Promise<void> {
  const supabase = await createClient()

  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('goals').update({ sort_order }).eq('id', id)
    )
  )

  for (const result of results) {
    if (result.error) throw new Error(result.error.message)
  }
}
