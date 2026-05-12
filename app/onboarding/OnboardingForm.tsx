"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActionState } from "react";
import { submitOnboarding, type OnboardingState } from "./actions";
import { JellyButton } from "@/components/ui/JellyButton";

const STEPS = [
  { id: 0, question: "몇 살이에요?" },
  { id: 1, question: "성별은 어떻게 되세요?" },
  { id: 2, question: "평소 몇 시에 자고 일어나요?" },
  { id: 3, question: "평소 수면의 질은 어때요?" },
  { id: 4, question: "낮잠은 얼마나 자요?" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const GENDER_OPTIONS = [
  { value: "male", label: "남성 🙋‍♂️" },
  { value: "female", label: "여성 🙋‍♀️" },
  { value: "other", label: "기타 🙋" },
];

const NAP_OPTIONS = [
  { value: "0", label: "안 자요" },
  { value: "20", label: "20분" },
  { value: "30", label: "30분" },
  { value: "60", label: "1시간" },
  { value: "90", label: "1시간 30분" },
];

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    submitOnboarding,
    {} as OnboardingState,
  );

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [hasNarcolepsy, setHasNarcolepsy] = useState(false);
  const [napDuration, setNapDuration] = useState("0");

  const isLastStep = step === STEPS.length - 1;

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goPrev() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  const inputClass =
    "w-full rounded-2xl border-2 border-paw-brown-light bg-cream px-4 py-3 text-bark-dark font-medium outline-none focus:border-paw-brown transition text-base";

  return (
    <div className="p-6">
      {/* 진행 점 인디케이터 */}
      <div className="flex justify-center gap-2 mb-6">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-2 rounded-full transition-all duration-300 ${
              s.id === step
                ? "w-6 bg-paw-brown"
                : s.id < step
                ? "w-2 bg-paw-brown-light"
                : "w-2 bg-bark-light"
            }`}
          />
        ))}
      </div>

      {/* 단계 질문 + 입력 */}
      <div className="overflow-hidden min-h-[160px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <p className="text-lg font-bold text-bark-dark mb-4">
              {STEPS[step].question}
            </p>

            {step === 0 && (
              <input
                type="number"
                min={1}
                max={120}
                placeholder="예: 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
              />
            )}

            {step === 1 && (
              <div className="grid grid-cols-3 gap-3">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    className={`rounded-2xl border-2 py-3 px-2 text-sm font-bold transition ${
                      gender === opt.value
                        ? "border-paw-brown bg-sleepy-yellow-light text-bark-dark"
                        : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-semibold text-bark-mid mb-1 block">
                    취침 시간
                  </label>
                  <input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-bark-mid mb-1 block">
                    기상 시간
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSleepQuality(n)}
                      className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${
                        sleepQuality === n
                          ? "border-paw-brown bg-sleepy-yellow-light text-bark-dark"
                          : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between px-1 text-xs text-bark-light font-medium">
                  <span>매우 나쁨</span>
                  <span>매우 좋음</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {NAP_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNapDuration(opt.value)}
                      className={`rounded-2xl border-2 py-2.5 px-2 text-sm font-bold transition ${
                        napDuration === opt.value
                          ? "border-paw-brown bg-sleepy-yellow-light text-bark-dark"
                          : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNarcolepsy}
                    onChange={(e) => setHasNarcolepsy(e.target.checked)}
                    className="h-5 w-5 rounded-md border-paw-brown-light accent-paw-brown"
                  />
                  <span className="text-sm font-medium text-bark-mid">
                    기면증이 있어요 (수면발작 등)
                  </span>
                </label>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {state?.errors?._form && (
        <p className="mt-3 text-sm text-red-500 font-medium" role="alert">
          {state.errors._form}
        </p>
      )}

      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <JellyButton
            type="button"
            onClick={goPrev}
            className="flex-1 rounded-full border-2 border-paw-brown-light bg-cream py-3 font-bold text-bark-mid"
          >
            ← 이전
          </JellyButton>
        )}

        {!isLastStep ? (
          <JellyButton
            type="button"
            onClick={goNext}
            className="flex-1 rounded-full bg-paw-brown py-3 font-bold text-warm-white shadow-sm"
          >
            다음 →
          </JellyButton>
        ) : (
          <form action={formAction} className="flex-1" ref={formRef}>
            <input type="hidden" name="age" value={age} />
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="usual_bed_time" value={bedTime} />
            <input type="hidden" name="usual_wake_time" value={wakeTime} />
            <input
              type="hidden"
              name="usual_sleep_quality"
              value={sleepQuality ?? ""}
            />
            <input
              type="hidden"
              name="has_narcolepsy"
              value={hasNarcolepsy ? "on" : ""}
            />
            <input
              type="hidden"
              name="usual_nap_duration_minutes"
              value={napDuration}
            />
            <JellyButton
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-paw-brown py-3 font-bold text-warm-white shadow-sm disabled:opacity-60"
            >
              {pending ? "저장 중..." : "완료! 대시보드로 →"}
            </JellyButton>
          </form>
        )}
      </div>
    </div>
  );
}
