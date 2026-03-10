'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type SaveMoodLogState = {
  errors?: {
    score?: string
    _form?: string
  }
  success?: boolean
}

const moodLogSchema = z.object({
  score: z.coerce.number().int().min(1, '기분을 선택해 주세요.').max(5),
  memo: z.string().max(500).optional().nullable(),
})

export async function saveMoodLog(
  _prevState: SaveMoodLogState,
  formData: FormData
): Promise<SaveMoodLogState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const raw = {
    score: formData.get('score'),
    memo: formData.get('memo') || null,
  }

  const parsed = moodLogSchema.safeParse(raw)

  if (!parsed.success) {
    const flatten = parsed.error.flatten()
    const errors: SaveMoodLogState['errors'] = {}
    if (flatten.fieldErrors.score) errors.score = flatten.fieldErrors.score[0]
    return { errors }
  }

  const { score, memo } = parsed.data

  const { error: insertError } = await supabase.from('mood_logs').insert({
    user_id: user.id,
    score,
    memo: memo ?? null,
  })

  if (insertError) {
    return { errors: { _form: insertError.message } }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/mood-checkin')
  redirect('/dashboard')
}
