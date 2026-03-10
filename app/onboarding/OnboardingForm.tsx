"use client";

import { useActionState } from "react";
import { submitOnboarding, type OnboardingState } from "./actions";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    submitOnboarding,
    {} as OnboardingState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Please fill in the following information to track your sleep conditions.
      </p>

      <div>
        <label
          htmlFor="age"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Age <span className="text-red-500">*</span>
        </label>
        <input
          id="age"
          type="number"
          name="age"
          min={1}
          max={120}
          required
          placeholder="예: 30"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        />
        {state?.errors?.age && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.age}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="gender"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        >
          <option value="">선택 안 함</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="other">기타</option>
        </select>
        {state?.errors?.gender && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.gender}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="has_narcolepsy"
          type="checkbox"
          name="has_narcolepsy"
          value="on"
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700"
        />
        <label
          htmlFor="has_narcolepsy"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Has Narcolepsy (Sleep attacks, etc.)
        </label>
      </div>

      <div>
        <label
          htmlFor="usual_sleep_quality"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          평소 수면의 질 (1~5)
        </label>
        <select
          id="usual_sleep_quality"
          name="usual_sleep_quality"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        >
          <option value="">선택 안 함</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {state?.errors?.usual_sleep_quality && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.usual_sleep_quality}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="usual_bed_time"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Usual Bed Time
        </label>
        <input
          id="usual_bed_time"
          type="time"
          name="usual_bed_time"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        />
        {state?.errors?.usual_bed_time && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.usual_bed_time}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="usual_wake_time"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Usual Wake Time
        </label>
        <input
          id="usual_wake_time"
          type="time"
          name="usual_wake_time"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        />
        {state?.errors?.usual_wake_time && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.usual_wake_time}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="usual_nap_duration_minutes"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Usual Nap Duration (minutes)
        </label>
        <input
          id="usual_nap_duration_minutes"
          type="number"
          name="usual_nap_duration_minutes"
          min={0}
          max={480}
          placeholder="예: 30"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        />
        {state?.errors?.usual_nap_duration_minutes && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.usual_nap_duration_minutes}
          </p>
        )}
      </div>

      {state?.errors?._form && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.errors._form}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Saving..." : "Complete and go to dashboard"}
      </button>
    </form>
  );
}
