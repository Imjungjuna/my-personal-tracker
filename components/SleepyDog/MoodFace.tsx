// components/SleepyDog/MoodFace.tsx
"use client";

import { motion } from "framer-motion";

const MOOD_EYE_PATHS: Record<number, { left: string; right: string }> = {
  1: {
    left: "M96,67 Q100,62 104,67",   // 슬픈 눈 (역호)
    right: "M112,67 Q116,62 120,67",
  },
  2: {
    left: "M96,69 Q100,73 104,69",   // 반쯤 감긴
    right: "M112,69 Q116,73 120,69",
  },
  3: {
    left: "M97,71 Q101,71 105,71",   // 평범 (직선)
    right: "M113,71 Q117,71 121,71",
  },
  4: {
    left: "M97,72 Q101,76 105,72",   // 반달 (웃음)
    right: "M113,72 Q117,76 121,72",
  },
  5: {
    left: "M96,73 Q101,78 106,73",   // 더 큰 반달
    right: "M112,73 Q117,78 122,73",
  },
};

const MOOD_EAR_OFFSET: Record<number, number> = {
  1: 6,   // 귀 처짐
  2: 3,
  3: 0,
  4: -2,
  5: -5,  // 귀 올라감
};

const DOG_COLORS = {
  body: "#E8C4A0",
  ear: "#C8956C",
  eyeStroke: "#5C3D2E",
  nose: "#5C3D2E",
};

export function MoodFace({ score }: { score: number }) {
  const eyes = MOOD_EYE_PATHS[score] ?? MOOD_EYE_PATHS[3];
  const earOffset = MOOD_EAR_OFFSET[score] ?? 0;

  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* 왼쪽 귀 */}
      <ellipse
        cx="44"
        cy={40 + earOffset}
        rx="16"
        ry="22"
        fill={DOG_COLORS.ear}
        transform={`rotate(-18, 44, ${40 + earOffset})`}
      />
      {/* 오른쪽 귀 */}
      <ellipse
        cx="96"
        cy={38 + earOffset}
        rx="16"
        ry="22"
        fill={DOG_COLORS.ear}
        transform={`rotate(14, 96, ${38 + earOffset})`}
      />

      {/* 얼굴 */}
      <circle cx="70" cy="78" r="48" fill={DOG_COLORS.body} />

      {/* 눈 */}
      <path
        d={eyes.left}
        stroke={DOG_COLORS.eyeStroke}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={eyes.right}
        stroke={DOG_COLORS.eyeStroke}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* 코 */}
      <ellipse cx="70" cy="94" rx="10" ry="7" fill={DOG_COLORS.nose} />
      <ellipse cx="67" cy="91" rx="3" ry="2" fill="white" opacity="0.4" />
    </svg>
  );
}
