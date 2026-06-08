'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type OnboardingState = {
  errors?: {
    age?: string
    gender?: string
    usual_sleep_quality?: string
    usual_bed_time?: string
    usual_wake_time?: string
    usual_nap_duration_minutes?: string
    has_narcolepsy?: string
    _form?: string
  }
}

const onboardingSchema = z.object({
  age: z.coerce.number().int().min(1, '나이를 입력해 주세요.').max(120),
  gender: z.string().min(1, '성별을 선택해 주세요.'),
  has_narcolepsy: z
    .string()
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
  usual_sleep_quality: z.coerce.number().int().min(1, '수면 질을 선택해 주세요.').max(5),
  usual_bed_time: z.string().min(1, '취침 시간을 입력해 주세요.'),
  usual_wake_time: z.string().min(1, '기상 시간을 입력해 주세요.'),
  usual_nap_duration_minutes: z.coerce.number().int().min(0, '낮잠 시간을 선택해 주세요.').max(480),
})

function timeToPgTime(v: string | undefined): string | null {
  if (!v || !v.trim()) return null
  const s = v.trim()
  return s.length === 5 ? `${s}:00` : s
}

export async function submitOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const raw = {
    age: formData.get('age'),
    gender: formData.get('gender'),
    has_narcolepsy: formData.get('has_narcolepsy'),
    usual_sleep_quality: formData.get('usual_sleep_quality') || undefined,
    usual_bed_time: formData.get('usual_bed_time'),
    usual_wake_time: formData.get('usual_wake_time'),
    usual_nap_duration_minutes: formData.get('usual_nap_duration_minutes') || undefined,
  }

  const parsed = onboardingSchema.safeParse(raw)

  if (!parsed.success) {
    const flatten = parsed.error.flatten()
    const errors: OnboardingState['errors'] = {}
    if (flatten.fieldErrors.age) errors.age = flatten.fieldErrors.age[0]
    if (flatten.fieldErrors.gender) errors.gender = flatten.fieldErrors.gender?.[0]
    if (flatten.fieldErrors.usual_sleep_quality)
      errors.usual_sleep_quality = flatten.fieldErrors.usual_sleep_quality[0]
    if (flatten.fieldErrors.usual_bed_time)
      errors.usual_bed_time = flatten.fieldErrors.usual_bed_time[0]
    if (flatten.fieldErrors.usual_wake_time)
      errors.usual_wake_time = flatten.fieldErrors.usual_wake_time[0]
    if (flatten.fieldErrors.usual_nap_duration_minutes)
      errors.usual_nap_duration_minutes = flatten.fieldErrors.usual_nap_duration_minutes[0]
    return { errors }
  }

  const {
    age,
    gender,
    has_narcolepsy,
    usual_sleep_quality,
    usual_bed_time,
    usual_wake_time,
    usual_nap_duration_minutes,
  } = parsed.data

  const { error: upsertError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      age,
      gender: gender || null,
      has_narcolepsy: has_narcolepsy ?? false,
      usual_sleep_quality: usual_sleep_quality ?? null,
      usual_bed_time: timeToPgTime(usual_bed_time),
      usual_wake_time: timeToPgTime(usual_wake_time),
      usual_nap_duration_minutes: usual_nap_duration_minutes ?? null,
      onboarding_completed: true,
    },
    { onConflict: 'id' }
  )

  if (upsertError) {
    return { errors: { _form: upsertError.message } }
  }

  // Refresh session so the JWT picks up onboarding_completed: true from the hook.
  // Without this, middleware reads stale claims and loops back to /onboarding.
  await supabase.auth.refreshSession()

  redirect('/dashboard')
}
