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
