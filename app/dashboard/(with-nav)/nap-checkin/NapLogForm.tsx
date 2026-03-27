"use client";

import { useActionState } from "react";
import { saveNapLog, type SaveNapLogState } from "./actions";
import { getTodayISO } from "@/utils/date";

export function NapLogForm() {
  const [state, formAction, pending] = useActionState(
    saveNapLog,
    {} as SaveNapLogState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="nap_date"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          날짜
        </label>
        <input
          id="nap_date"
          type="date"
          name="nap_date"
          defaultValue={getTodayISO()}
          required
          className="w-full rounded-lg bg-zinc-200/70 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-500"
        />
        {state?.errors?.nap_date && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.nap_date}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="start_time"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          시작 시각
        </label>
        <input
          id="start_time"
          type="time"
          name="start_time"
          required
          className="w-full rounded-lg bg-zinc-200/70 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-500"
        />
        {state?.errors?.start_time && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.start_time}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="end_time"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          종료 시각
        </label>
        <input
          id="end_time"
          type="time"
          name="end_time"
          required
          className="w-full rounded-lg bg-zinc-200/70 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-500"
        />
        {state?.errors?.end_time && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.end_time}
          </p>
        )}
      </div>

      {state?.errors?._form && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.errors._form}
        </p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400" role="status" aria-live="polite">
          저장되었습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
