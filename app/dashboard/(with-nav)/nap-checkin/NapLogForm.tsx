"use client";

import { useActionState, useState } from "react";
import { z } from "zod";
import { saveNapLog, type SaveNapLogState } from "./actions";
import { JellyButton } from "@/components/ui/JellyButton";
import { getTodayISO } from "@/utils/date";

const napSchema = z
  .object({
    nap_date: z.string().min(1, "날짜를 입력해주세요"),
    start_time: z.string().min(1, "시작 시간을 입력해주세요"),
    end_time: z.string().min(1, "종료 시간을 입력해주세요"),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "종료 시간은 시작 시간보다 늦어야 해요",
    path: ["end_time"],
  });

type ClientErrors = Partial<Record<"nap_date" | "start_time" | "end_time", string>>;

const inputClass =
  "w-full rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-medium outline-none focus:border-paw-brown transition text-base";
const labelClass = "mb-1.5 block text-sm font-bold text-bark-mid";

export function NapLogForm() {
  const [state, formAction, pending] = useActionState(
    saveNapLog,
    {} as SaveNapLogState,
  );
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = napSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      e.preventDefault();
      const flat = result.error.flatten().fieldErrors;
      setClientErrors({
        nap_date: flat.nap_date?.[0],
        start_time: flat.start_time?.[0],
        end_time: flat.end_time?.[0],
      });
    } else {
      setClientErrors({});
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        {(clientErrors.start_time ?? state?.errors?.start_time) && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {clientErrors.start_time ?? state?.errors?.start_time}
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
        {(clientErrors.end_time ?? state?.errors?.end_time) && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {clientErrors.end_time ?? state?.errors?.end_time}
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
