'use client'

import { useActionState } from 'react'
import { saveMoodLog, type SaveMoodLogState } from './actions'
import { MOOD_LABELS } from '@/utils/date'

export function MoodLogForm() {
  const [state, formAction, pending] = useActionState(saveMoodLog, {} as SaveMoodLogState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          기분
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm transition hover:bg-zinc-50 has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:has-[:checked]:border-zinc-200 dark:has-[:checked]:bg-zinc-600"
            >
              <input
                type="radio"
                name="score"
                value={n}
                required
                className="sr-only"
              />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {n}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {MOOD_LABELS[n]}
              </span>
            </label>
          ))}
        </div>
        {state?.errors?.score && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {state.errors.score}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="memo"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          메모 (선택)
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={3}
          maxLength={500}
          placeholder="간단히 적어보세요"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        />
      </div>

      {state?.errors?._form && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.errors._form}
        </p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400" role="status">
          저장되었습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
