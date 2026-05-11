"use client";

import { useActionState } from "react";
import { saveNapLog, type SaveNapLogState } from "./actions";
import { JellyButton } from "@/components/ui/JellyButton";
import { getTodayISO } from "@/utils/date";

const inputClass =
  "w-full rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-medium outline-none focus:border-paw-brown transition text-base";
const labelClass = "mb-1.5 block text-sm font-bold text-bark-mid";

export function NapLogForm() {
  const [state, formAction, pending] = useActionState(
    saveNapLog,
    {} as SaveNapLogState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="nap_date" className={labelClass}>날짜</label>
        <input
          id="nap_date"
          type="date"
          name="nap_date"
          defaultValue={getTodayISO()}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="start_time" className={labelClass}>낮잠 시작</label>
        <input
          id="start_time"
          type="time"
          name="start_time"
          required
          className={inputClass}
        />
        {state?.errors?.start_time && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.start_time}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="end_time" className={labelClass}>낮잠 종료</label>
        <input
          id="end_time"
          type="time"
          name="end_time"
          required
          className={inputClass}
        />
        {state?.errors?.end_time && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.end_time}
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
          저장됐어요! 💤
        </p>
      )}

      <JellyButton
        type="submit"
        disabled={pending}
        className="rounded-full bg-paw-brown py-3 font-bold text-warm-white shadow-sm disabled:opacity-60"
      >
        {pending ? "저장 중..." : "낮잠 저장하기 💤"}
      </JellyButton>
    </form>
  );
}
