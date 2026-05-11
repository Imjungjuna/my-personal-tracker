"use client";

import { motion } from "framer-motion";

export type DogState =
  | "sleeping"
  | "happy"
  | "running"
  | "drowsy"
  | "tilting"
  | "waiting";

const SIZE_MAP = { sm: 80, md: 120, lg: 180 };

const DOG_COLORS = {
  body: "#E8C4A0",
  ear: "#C8956C",
  eyeStroke: "#5C3D2E",
  nose: "#5C3D2E",
  tail: "#C8956C",
  legs: "#E8C4A0",
  legDark: "#C8956C",
};

// 눈 상태별 렌더
function Eyes({ state }: { state: DogState }) {
  // sleeping, happy → 닫힌 눈 (호 곡선)
  if (state === "sleeping" || state === "happy") {
    return (
      <>
        <motion.path
          d="M97,69 Q103,75 109,69"
          stroke={DOG_COLORS.eyeStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <motion.path
          d="M116,69 Q122,75 128,69"
          stroke={DOG_COLORS.eyeStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  }

  // drowsy → 반쯤 감긴 눈
  if (state === "drowsy") {
    return (
      <>
        <motion.path
          d="M97,71 Q103,75 109,71"
          stroke={DOG_COLORS.eyeStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{ d: ["M97,71 Q103,75 109,71", "M97,73 Q103,75 109,73", "M97,71 Q103,75 109,71"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as const }}
        />
        <motion.path
          d="M116,71 Q122,75 128,71"
          stroke={DOG_COLORS.eyeStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{ d: ["M116,71 Q122,75 128,71", "M116,73 Q122,75 128,73", "M116,71 Q122,75 128,71"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as const, delay: 0.2 }}
        />
      </>
    );
  }

  // waiting → 동그란 눈 (반짝이는 효과)
  if (state === "waiting") {
    return (
      <>
        <motion.circle
          cx="103" cy="71" r="5.5"
          fill={DOG_COLORS.eyeStroke}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
        />
        <motion.circle
          cx="122" cy="71" r="5.5"
          fill={DOG_COLORS.eyeStroke}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.15 }}
        />
        {/* 눈 하이라이트 */}
        <circle cx="106" cy="68" r="1.8" fill="white" />
        <circle cx="125" cy="68" r="1.8" fill="white" />
      </>
    );
  }

  // running, tilting → 일반 동그란 눈
  return (
    <>
      <circle cx="103" cy="71" r="5" fill={DOG_COLORS.eyeStroke} />
      <circle cx="122" cy="71" r="5" fill={DOG_COLORS.eyeStroke} />
      <circle cx="105.5" cy="69" r="1.5" fill="white" />
      <circle cx="124.5" cy="69" r="1.5" fill="white" />
    </>
  );
}

// 꼬리 — happy/running 시 흔들림
function Tail({ state }: { state: DogState }) {
  const wagAnim =
    state === "happy" || state === "running"
      ? {
          rotate: [0, 20, -20, 20, 0],
          transition: {
            duration: state === "running" ? 0.5 : 0.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {};

  return (
    <motion.path
      d="M38,112 C22,95 16,75 28,60"
      stroke={DOG_COLORS.tail}
      strokeWidth="10"
      strokeLinecap="round"
      fill="none"
      style={{ originX: "38px", originY: "112px" }}
      animate={wagAnim}
    />
  );
}

// 앞발 — running 시 교대로 올라감
function Legs({ state }: { state: DogState }) {
  const leftLegAnim =
    state === "running"
      ? {
          y: [0, -10, 0],
          transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" as const },
        }
      : {};
  const rightLegAnim =
    state === "running"
      ? {
          y: [0, -10, 0],
          transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" as const, delay: 0.2 },
        }
      : {};

  return (
    <>
      <motion.rect
        x="70" y="152" width="18" height="20" rx="9"
        fill={DOG_COLORS.legDark}
        animate={leftLegAnim}
      />
      <motion.rect
        x="96" y="152" width="18" height="20" rx="9"
        fill={DOG_COLORS.legDark}
        animate={rightLegAnim}
      />
    </>
  );
}

export function SleepyDog({
  state = "sleeping",
  size = "md",
}: {
  state?: DogState;
  size?: "sm" | "md" | "lg";
}) {
  const px = SIZE_MAP[size];

  // 몸통 숨쉬기 (sleeping, drowsy)
  const bodyBreathing =
    state === "sleeping" || state === "drowsy"
      ? {
          scaleY: [1, 1.04, 1],
          transition: {
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror" as const,
            ease: "easeInOut" as const,
          },
        }
      : {};

  // 머리 꾸벅 (drowsy)
  const headDrowsy =
    state === "drowsy"
      ? {
          rotate: [0, 8, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {};

  // 고개 갸웃 (tilting)
  const headTilting =
    state === "tilting"
      ? {
          rotate: [0, 12, -12, 12, 0],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {};

  // waiting — 살짝 통통 튀기
  const bodyWaiting =
    state === "waiting"
      ? {
          y: [0, -6, 0],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {};

  // happy — 작게 점프
  const bodyHappy =
    state === "happy"
      ? {
          y: [0, -4, 0],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {};

  const bodyAnimate = {
    ...bodyBreathing,
    ...bodyWaiting,
    ...bodyHappy,
  };

  const headAnimate = {
    ...headDrowsy,
    ...headTilting,
  };

  return (
    <svg
      width={px}
      height={px * (170 / 200)}
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`강아지 - ${state}`}
      role="img"
    >
      {/* 꼬리 (몸통 뒤에 그려야 하므로 먼저) */}
      <Tail state={state} />

      {/* 몸통 */}
      <motion.ellipse
        cx="110" cy="125" rx="65" ry="36"
        fill={DOG_COLORS.body}
        style={{ originX: "110px", originY: "125px" }}
        animate={bodyAnimate}
      />

      {/* 앞발 */}
      <Legs state={state} />

      {/* 머리 그룹 (갸웃/꾸벅 애니메이션 적용) */}
      <motion.g
        style={{ originX: "112px", originY: "90px" }}
        animate={headAnimate}
      >
        {/* 왼쪽 귀 */}
        <ellipse
          cx="92" cy="50"
          rx="13" ry="19"
          fill={DOG_COLORS.ear}
          transform="rotate(-18, 92, 50)"
        />
        {/* 오른쪽 귀 */}
        <ellipse
          cx="132" cy="48"
          rx="13" ry="19"
          fill={DOG_COLORS.ear}
          transform="rotate(14, 132, 48)"
        />

        {/* 머리 */}
        <circle cx="112" cy="78" r="34" fill={DOG_COLORS.body} />

        {/* 눈 */}
        <Eyes state={state} />

        {/* 코 */}
        <ellipse cx="113" cy="92" rx="8" ry="5.5" fill={DOG_COLORS.nose} />

        {/* 코 하이라이트 */}
        <ellipse cx="110" cy="90" rx="2.5" ry="1.5" fill="white" opacity="0.4" />
      </motion.g>
    </svg>
  );
}
