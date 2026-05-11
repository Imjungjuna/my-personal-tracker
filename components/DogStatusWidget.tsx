"use client";

import { motion } from "framer-motion";
import { SleepyDog, type DogState } from "@/components/SleepyDog";

const STATE_MESSAGES: Record<DogState, string> = {
  waiting: "오늘 기록이 없어요. 뼈다귀 주세요! 🦴",
  drowsy: "수면이 부족해요. 더 자야 해요... 😪",
  happy: "수면 목표 달성! 최고예요 🎉",
  running: "오늘 모든 기록 완료! 달려라! 🏃",
  sleeping: "오늘도 잘 쉬고 계시네요 🌙",
  tilting: "안녕하세요! 🐾",
};

export function DogStatusWidget({ state }: { state: DogState }) {
  return (
    <motion.div
      className="rounded-3xl bg-sleepy-yellow-light p-5 flex flex-col items-center gap-3 shadow-[0_4px_24px_rgba(200,149,108,0.12)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <SleepyDog state={state} size="md" />
      <p className="text-sm font-bold text-bark-dark text-center">
        {STATE_MESSAGES[state]}
      </p>
    </motion.div>
  );
}
