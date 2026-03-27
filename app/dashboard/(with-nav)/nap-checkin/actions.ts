'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type SaveNapLogState = {
  success?: boolean
  errors?: {
    nap_date?: string
    start_time?: string
    end_time?: string
    _form?: string
  }
}

const napLogSchema = z.object({
  nap_date: z.string().min(1, '날짜를 선택해 주세요.'),
  start_time: z.string().min(1, '시작 시각을 입력해 주세요.'),
  end_time: z.string().min(1, '종료 시각을 입력해 주세요.'),
})

function toTimestamptzISO(date: string, time: string): string {
  const normalized = time.length === 5 ? `${time}:00` : time
  return `${date}T${normalized}`
}

export async function saveNapLog(
  _prevState: SaveNapLogState,
  formData: FormData
): Promise<SaveNapLogState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const raw = {
    nap_date: formData.get('nap_date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
  }

  const parsed = napLogSchema.safeParse(raw)

  if (!parsed.success) {
    const flatten = parsed.error.flatten()
    const errors: SaveNapLogState['errors'] = {}
    if (flatten.fieldErrors.nap_date) errors.nap_date = flatten.fieldErrors.nap_date[0]
    if (flatten.fieldErrors.start_time) errors.start_time = flatten.fieldErrors.start_time[0]
    if (flatten.fieldErrors.end_time) errors.end_time = flatten.fieldErrors.end_time[0]
    return { errors }
  }

  const { nap_date, start_time, end_time } = parsed.data
  const startTimeISO = toTimestamptzISO(nap_date, start_time)
  const endTimeISO = toTimestamptzISO(nap_date, end_time)

  const { error: insertError } = await supabase.from('nap_logs').insert({
    user_id: user.id,
    start_time: startTimeISO,
    end_time: endTimeISO,
  })

  if (insertError) {
    return { errors: { _form: insertError.message } }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/nap-checkin')
  redirect('/dashboard')
}
