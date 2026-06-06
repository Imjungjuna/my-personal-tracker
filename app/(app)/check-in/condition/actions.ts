'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getTodayISO } from '@/utils/date'

export type SaveConditionLogState = {
  errors?: {
    mental_condition?: string
    physical_energy?: string
    muscle_soreness?: string
    did_exercise?: string
    yesterday_rpe?: string
    _form?: string
  }
  success?: boolean
}

const conditionLogSchema = z.object({
  mental_condition: z.coerce.number().int().min(1, '정신 상태를 선택해 주세요.').max(5),
  physical_energy: z.coerce.number().int().min(1, '신체 에너지를 선택해 주세요.').max(5),
  muscle_soreness: z.coerce.number().int().min(1, '근육통을 선택해 주세요.').max(5),
  did_exercise: z.coerce.boolean(),
  yesterday_rpe: z.coerce.number().int().min(0).max(10),
})

export async function saveConditionLog(
  _prevState: SaveConditionLogState,
  formData: FormData
): Promise<SaveConditionLogState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const didExercise = formData.get('did_exercise') === 'true'

  const raw = {
    mental_condition: formData.get('mental_condition'),
    physical_energy: formData.get('physical_energy'),
    muscle_soreness: formData.get('muscle_soreness'),
    did_exercise: didExercise,
    yesterday_rpe: didExercise ? formData.get('yesterday_rpe') : 0,
  }

  const parsed = conditionLogSchema.safeParse(raw)

  if (!parsed.success) {
    const flatten = parsed.error.flatten()
    const errors: SaveConditionLogState['errors'] = {}
    if (flatten.fieldErrors.mental_condition) errors.mental_condition = flatten.fieldErrors.mental_condition[0]
    if (flatten.fieldErrors.physical_energy) errors.physical_energy = flatten.fieldErrors.physical_energy[0]
    if (flatten.fieldErrors.muscle_soreness) errors.muscle_soreness = flatten.fieldErrors.muscle_soreness[0]
    return { errors }
  }

  const { mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe } = parsed.data

  const { error: upsertError } = await supabase.from('condition_logs').upsert(
    {
      user_id: user.id,
      log_date: getTodayISO(),
      mental_condition,
      physical_energy,
      muscle_soreness,
      did_exercise,
      yesterday_rpe,
    },
    { onConflict: 'user_id,log_date' }
  )

  if (upsertError) {
    return { errors: { _form: upsertError.message } }
  }

  revalidatePath('/dashboard')
  revalidatePath('/check-in/condition')
  redirect('/dashboard')
}
