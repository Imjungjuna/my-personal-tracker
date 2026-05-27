"use client";

import { useActionState, useRef, useState } from "react";
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

function formatMonthDay(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

function addOneDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const inputClass =
  "w-full rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-medium outline-none focus:border-paw-brown transition text-base";

const labelClass = "mb-1.5 block text-sm font-bold text-bark-mid";

const SLEEP_QUALITY_LABELS: Record<number, string> = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
};

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

  const [sleepDate, setSleepDate] = useState(defaultSleepDate);
  const [sleepQuality, setSleepQuality] = useState<number | null>(
    initialLog?.sleep_quality ?? null,
  );
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className={`flex flex-col gap-4 ${className}`}>
      <div>
        <p className={labelClass}>날짜</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex-1 flex items-center justify-center rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-bold text-base cursor-pointer hover:border-paw-brown transition"
          >
            {formatMonthDay(sleepDate)}
          </button>
          <input
            ref={dateInputRef}
            id="sleep_date"
            type="date"
            name="sleep_date"
            value={sleepDate}
            onChange={(e) => setSleepDate(e.target.value)}
            required
            className="sr-only"
          />
          <span className="text-bark-mid font-bold text-lg shrink-0">→</span>
          <span className="flex-1 flex items-center justify-center rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-mid font-bold text-base">
            {formatMonthDay(addOneDay(sleepDate))}
          </span>
        </div>
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

      {/* 수면 질 */}
      <div>
        <p className={labelClass}>수면 질 (선택)</p>
        <input type="hidden" name="sleep_quality" value={sleepQuality ?? ""} />
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setSleepQuality(sleepQuality === val ? null : val)}
              className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${
                sleepQuality === val
                  ? "border-paw-brown bg-sleepy-yellow text-bark-dark"
                  : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
              }`}
              title={SLEEP_QUALITY_LABELS[val]}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-bark-light">
          1 = 매우 나쁨 · 5 = 매우 좋음
        </p>
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
