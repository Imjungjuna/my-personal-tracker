"use client";

import { useActionState } from "react";
import { saveSleepLog, type SaveSleepLogState } from "./actions";
import type { SleepLogFormInitial } from "@/lib/types/supabase";
import { JellyButton } from "@/components/ui/JellyButton";

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

const inputClass =
  "w-full rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-medium outline-none focus:border-paw-brown transition text-base";

const labelClass = "mb-1.5 block text-sm font-bold text-bark-mid";

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
        <label htmlFor="sleep_date" className={labelClass}>날짜</label>
        <input
          id="sleep_date"
          type="date"
          name="sleep_date"
          defaultValue={defaultSleepDate}
          required
          className={inputClass}
        />
        {state?.errors?.sleep_date && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.sleep_date}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bed_time" className={labelClass}>취침 시간</label>
        <input
          id="bed_time"
          type="time"
          name="bed_time"
          defaultValue={defaultBedTime}
          required
          className={inputClass}
        />
        {state?.errors?.bed_time && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.bed_time}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="wake_time" className={labelClass}>기상 시간</label>
        <input
          id="wake_time"
          type="time"
          name="wake_time"
          defaultValue={defaultWakeTime}
          required
          className={inputClass}
        />
        {state?.errors?.wake_time && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.wake_time}
          </p>
        )}
      </div>

      {state?.errors?._form && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          {state.errors._form}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-paw-brown font-bold" role="status" aria-live="polite">
          저장됐어요! 🐾
        </p>
      )}

      <JellyButton
        type="submit"
        disabled={pending}
        className="rounded-full bg-paw-brown py-3 font-bold text-warm-white shadow-sm disabled:opacity-60"
      >
        {pending ? "저장 중..." : "저장하기 🌙"}
      </JellyButton>
    </form>
  );
}
