"use client";

import { useActionState } from "react";
import { saveSleepLog, type SaveSleepLogState } from "./actions";
import type { SleepLogFormInitial } from "@/lib/types/supabase";

function timestamptzToTimeValue(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "";
  }
}

export function SleepLogForm({
  today,
  initialLog,
  className = "",
}: {
  today: string;
  initialLog: SleepLogFormInitial | null;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveSleepLog,
    {} as SaveSleepLogState,
  );

  const defaultSleepDate = initialLog?.sleep_date ?? today;
  const defaultBedTime = initialLog?.bed_time
    ? timestamptzToTimeValue(initialLog.bed_time)
    : "";
  const defaultWakeTime = initialLog?.wake_time
    ? timestamptzToTimeValue(initialLog.wake_time)
    : "";

  return (
    <form action={formAction} className={`flex flex-col gap-4 ${className}`}>
      <div>
        <label
          htmlFor="sleep_date"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          날짜
        </label>
        <input
          id="sleep_date"
          type="date"
          name="sleep_date"
          defaultValue={defaultSleepDate}
          required
          className="w-full rounded-lg bg-zinc-200/70 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-500"
        />
        {state?.errors?.sleep_date && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.sleep_date}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="bed_time"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          취침 시간
        </label>
        <input
          id="bed_time"
          type="time"
          name="bed_time"
          defaultValue={defaultBedTime}
          required
          className="w-full rounded-lg bg-zinc-200/70 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-500"
        />
        {state?.errors?.bed_time && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.bed_time}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="wake_time"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          기상 시간
        </label>
        <input
          id="wake_time"
          type="time"
          name="wake_time"
          defaultValue={defaultWakeTime}
          required
          className="w-full rounded-lg bg-zinc-200/70 px-3 py-2.5 text-zinc-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-500"
        />
        {state?.errors?.wake_time && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.errors.wake_time}
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
