"use client";

import { useActionState, useState } from "react";
import { saveConditionLog, type SaveConditionLogState } from "./actions";
import { JellyButton } from "@/components/ui/JellyButton";
import type { ConditionLog } from "@/lib/types/supabase";

const labelClass = "mb-1.5 block text-sm font-bold text-bark-mid";

function ScaleButtons({
  name,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  name: string;
  value: number | null;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div>
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${
              value === val
                ? "border-paw-brown bg-sleepy-yellow text-bark-dark"
                : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
            }`}
          >
            {val}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-bark-light">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export function ConditionLogForm({
  initialLog,
}: {
  initialLog: ConditionLog | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveConditionLog,
    {} as SaveConditionLogState,
  );

  const [mentalCondition, setMentalCondition] = useState<number | null>(
    initialLog?.mental_condition ?? null,
  );
  const [physicalEnergy, setPhysicalEnergy] = useState<number | null>(
    initialLog?.physical_energy ?? null,
  );
  const [muscleSoreness, setMuscleSoreness] = useState<number | null>(
    initialLog?.muscle_soreness ?? null,
  );
  const [didExercise, setDidExercise] = useState(
    initialLog?.did_exercise ?? false,
  );
  const [rpe, setRpe] = useState(initialLog?.yesterday_rpe ?? 5);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 정신 상태 */}
      <div>
        <p className={labelClass}>정신 상태</p>
        <ScaleButtons
          name="mental_condition"
          value={mentalCondition}
          onChange={setMentalCondition}
          minLabel="매우 나쁨"
          maxLabel="매우 좋음"
        />
        {state?.errors?.mental_condition && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.mental_condition}
          </p>
        )}
      </div>

      {/* 신체 에너지 */}
      <div>
        <p className={labelClass}>신체 에너지</p>
        <ScaleButtons
          name="physical_energy"
          value={physicalEnergy}
          onChange={setPhysicalEnergy}
          minLabel="매우 낮음"
          maxLabel="매우 높음"
        />
        {state?.errors?.physical_energy && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.physical_energy}
          </p>
        )}
      </div>

      {/* 근육통 */}
      <div>
        <p className={labelClass}>근육통</p>
        <ScaleButtons
          name="muscle_soreness"
          value={muscleSoreness}
          onChange={setMuscleSoreness}
          minLabel="없음"
          maxLabel="매우 심함"
        />
        {state?.errors?.muscle_soreness && (
          <p className="mt-1 text-sm text-red-500 font-medium" role="alert">
            {state.errors.muscle_soreness}
          </p>
        )}
      </div>

      {/* 어제 운동 여부 */}
      <div>
        <p className={labelClass}>어제 운동했나요?</p>
        <input type="hidden" name="did_exercise" value={String(didExercise)} />
        <div className="flex gap-3">
          {[
            { label: "했어요", value: true },
            { label: "안 했어요", value: false },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setDidExercise(opt.value)}
              className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${
                didExercise === opt.value
                  ? "border-paw-brown bg-sleepy-yellow text-bark-dark"
                  : "border-paw-brown-light bg-cream text-bark-mid hover:border-paw-brown"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* RPE — didExercise=true일 때만 표시 */}
      {didExercise && (
        <div>
          <p className={labelClass}>운동 강도 (RPE): {rpe}</p>
          <input
            type="range"
            name="yesterday_rpe"
            min={0}
            max={10}
            step={1}
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
            className="w-full accent-paw-brown"
          />
          <div className="flex justify-between text-xs text-bark-light mt-1">
            <span>0 (휴식)</span>
            <span>10 (최고 강도)</span>
          </div>
        </div>
      )}

      {state?.errors?._form && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          {state.errors._form}
        </p>
      )}

      <JellyButton
        type="submit"
        disabled={pending}
        className="rounded-full bg-paw-brown py-3 font-bold text-warm-white shadow-sm disabled:opacity-60"
      >
        {pending ? "저장 중..." : "저장하기 💪"}
      </JellyButton>
    </form>
  );
}
