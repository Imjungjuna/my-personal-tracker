import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isOnboardingComplete } from '@/lib/types/supabase'
import { NapLogForm } from './NapLogForm'

export default async function NapCheckinPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, age')
    .eq('id', user.id)
    .single()

  if (!isOnboardingComplete(profile ?? null)) {
    redirect('/onboarding?next=/dashboard/nap-checkin')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-8 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            낮잠 기록
          </h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            대시보드로
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          낮잠 시작·종료 시각을 입력해 주세요.
        </p>

        <section className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-600">
          <NapLogForm />
        </section>
      </div>
    </div>
  )
}
