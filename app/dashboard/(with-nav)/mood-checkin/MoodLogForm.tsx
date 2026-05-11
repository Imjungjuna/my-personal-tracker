"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { saveMoodLog, type SaveMoodLogState } from "./actions";
import { MoodFace } from "@/components/SleepyDog";
import { JellyButton } from "@/components/ui/JellyButton";

const MOOD_LABELS: Record<number, string> = {
  1: "너무 별로",
  2: "별로",
  3: "보통",
  4: "좋아요",
  5: "최고!",
};

export function MoodLogForm() {
  const [state, formAction, pending] = useActionState(
    saveMoodLog,
    {} as SaveMoodLogState,
  );
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <p className="text-base font-bold text-bark-dark">오늘 기분은?</p>

      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="score"
              value={n}
              required
              className="sr-only"
              onChange={() => setSelected(n)}
            />
            <motion.div
              animate={
                selected === n
                  ? { scale: [1, 1.3, 1], y: [0, -6, 0] }
                  : { scale: 1, y: 0 }
              }
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`rounded-2xl p-2 border-2 transition ${
                selected === n
                  ? "border-paw-brown bg-sleepy-yellow-light"
                  : "border-transparent bg-cream hover:border-paw-brown-light"
              }`}
            >
              <MoodFace score={n} />
            </motion.div>
            <span className="text-xs font-bold text-bark-mid">
              {MOOD_LABELS[n]}
            </span>
          </label>
        ))}
      </div>

      {state?.errors?.score && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          {state.errors.score}
        </p>
      )}

      <div>
        <label
          htmlFor="memo"
          className="mb-1.5 block text-sm font-bold text-bark-mid"
        >
          메모 (선택)
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={3}
          maxLength={500}
          placeholder="오늘 기분을 간단히 적어보세요..."
          className="w-full rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-medium outline-none focus:border-paw-brown transition text-base resize-none"
        />
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
        {pending ? "저장 중..." : "기분 저장하기 🐾"}
      </JellyButton>
    </form>
  );
}
