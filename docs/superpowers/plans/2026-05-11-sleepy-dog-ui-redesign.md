# Sleepy Dog UI 전면 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 수면/기분/낮잠 트래킹 앱 전체 UI를 Sleepy Dog 테마로 전면 리디자인 — 웜 베이지 팔레트, Nunito 폰트, Framer Motion 애니메이션, SVG 강아지 캐릭터 적용

**Architecture:** Bottom-up 방식 — 디자인 시스템 토큰 → 공통 컴포넌트(JellyButton, SleepyDog, MoodFace) → 각 페이지 순서로 빌드. 서버 액션/DAL/Supabase 연동 코드는 일체 수정하지 않음.

**Tech Stack:** Next.js App Router, Tailwind CSS v4 (@theme inline), framer-motion, shadcn/ui, Recharts, next/font/google (Nunito)

---

## Task 1: framer-motion 설치 + 디자인 시스템 기반

**Files:**
- Install: `framer-motion`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: framer-motion 설치**

```bash
npm install framer-motion
```

Expected output: `added N packages` (no errors)

- [ ] **Step 2: globals.css — Sleepy Dog 색상 토큰 + Nunito 폰트 변수 추가**

`app/globals.css` 의 `@theme inline { ... }` 블록 안에 다음을 추가 (기존 내용 유지, 맨 아래에 추가):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-nunito);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  /* Sleepy Dog 팔레트 */
  --color-cream: #FDF6EC;
  --color-warm-white: #FFFBF5;
  --color-paw-brown: #C8956C;
  --color-paw-brown-light: #E8C4A0;
  --color-sleepy-yellow: #FFD97D;
  --color-sleepy-yellow-light: #FFF3C4;
  --color-bark-dark: #5C3D2E;
  --color-bark-mid: #A07850;
  --color-bark-light: #D4B896;
  --color-nose-pink: #F4A7B9;
}

:root {
  --radius: 0.625rem;
  --background: #FDF6EC;
  --foreground: #5C3D2E;
  --card: #FFFBF5;
  --card-foreground: #5C3D2E;
  --popover: #FFFBF5;
  --popover-foreground: #5C3D2E;
  --primary: #C8956C;
  --primary-foreground: #FFFBF5;
  --secondary: #FFF3C4;
  --secondary-foreground: #5C3D2E;
  --muted: #F5ECD8;
  --muted-foreground: #A07850;
  --accent: #FFD97D;
  --accent-foreground: #5C3D2E;
  --destructive: oklch(0.577 0.245 27.325);
  --border: #E8C4A0;
  --input: #E8C4A0;
  --ring: #C8956C;
  --chart-1: #C8956C;
  --chart-2: #FFD97D;
  --chart-3: #F4A7B9;
  --chart-4: #A07850;
  --chart-5: #E8C4A0;
  --sidebar: #FFFBF5;
  --sidebar-foreground: #5C3D2E;
  --sidebar-primary: #C8956C;
  --sidebar-primary-foreground: #FFFBF5;
  --sidebar-accent: #FFF3C4;
  --sidebar-accent-foreground: #5C3D2E;
  --sidebar-border: #E8C4A0;
  --sidebar-ring: #C8956C;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
```

- [ ] **Step 3: layout.tsx — Nunito 폰트 적용**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sleepy Dog Tracker",
  description: "수면, 기분, 낮잠을 기록하는 트래커",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${nunito.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 개발 서버 실행해서 폰트/색상 적용 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열어서 배경이 베이지색이고 폰트가 둥글게 바뀌었는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add app/globals.css app/layout.tsx package.json package-lock.json
git commit -m "feat: install framer-motion, apply Sleepy Dog design tokens and Nunito font"
```

---

## Task 2: JellyButton 공통 컴포넌트

**Files:**
- Create: `components/ui/JellyButton.tsx`

- [ ] **Step 1: JellyButton 생성**

```tsx
// components/ui/JellyButton.tsx
"use client";

import { motion } from "framer-motion";
import { type ReactNode, type ComponentPropsWithoutRef } from "react";

type JellyButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
  asChild?: false;
};

export function JellyButton({
  children,
  className,
  disabled,
  ...props
}: JellyButtonProps) {
  return (
    <motion.button
      {...props}
      disabled={disabled}
      className={className}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/ui/JellyButton.tsx
git commit -m "feat: add JellyButton spring animation wrapper"
```

---

## Task 3: SleepyDog SVG 컴포넌트

**Files:**
- Create: `components/SleepyDog/SleepyDog.tsx`
- Create: `components/SleepyDog/index.ts`

- [ ] **Step 1: SleepyDog.tsx 생성**

> Context7 참고: framer-motion SVG motion 컴포넌트 (motion.ellipse, motion.path, motion.circle, motion.rect)

```tsx
// components/SleepyDog/SleepyDog.tsx
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
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M116,71 Q122,75 128,71"
          stroke={DOG_COLORS.eyeStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{ d: ["M116,71 Q122,75 128,71", "M116,73 Q122,75 128,73", "M116,71 Q122,75 128,71"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
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
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="122" cy="71" r="5.5"
          fill={DOG_COLORS.eyeStroke}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
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
            ease: "easeInOut",
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
          transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
        }
      : {};
  const rightLegAnim =
    state === "running"
      ? {
          y: [0, -10, 0],
          transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
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
            ease: "easeInOut",
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
            ease: "easeInOut",
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
            ease: "easeInOut",
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
            ease: "easeInOut",
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
            ease: "easeInOut",
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
```

- [ ] **Step 2: index.ts 생성**

```ts
// components/SleepyDog/index.ts
export { SleepyDog } from "./SleepyDog";
export type { DogState } from "./SleepyDog";
```

- [ ] **Step 3: 커밋**

```bash
git add components/SleepyDog/
git commit -m "feat: add SleepyDog SVG component with 6 animated states"
```

---

## Task 4: MoodFace 컴포넌트

**Files:**
- Create: `components/SleepyDog/MoodFace.tsx`

- [ ] **Step 1: MoodFace.tsx 생성**

```tsx
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
```

- [ ] **Step 2: index.ts에 export 추가**

```ts
// components/SleepyDog/index.ts
export { SleepyDog } from "./SleepyDog";
export { MoodFace } from "./MoodFace";
export type { DogState } from "./SleepyDog";
```

- [ ] **Step 3: 커밋**

```bash
git add components/SleepyDog/
git commit -m "feat: add MoodFace component with score-based dog expressions"
```

---

## Task 5: 랜딩 + 로그인 페이지 리디자인

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/login/page.tsx`
- Modify: `app/login/GoogleSignInButton.tsx`

- [ ] **Step 1: 랜딩 페이지 (`app/page.tsx`) 리디자인**

```tsx
// app/page.tsx
import Link from "next/link";
import { SleepyDog } from "@/components/SleepyDog";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream gap-8 px-4">
      <div className="flex flex-col items-center gap-6">
        <SleepyDog state="sleeping" size="lg" />

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-bark-dark tracking-tight">
            Hello, Sleepy Dog! 🌙
          </h1>
          <p className="text-bark-mid text-lg font-medium">
            오늘의 수면과 기분을 기록해보세요
          </p>
        </div>

        <Link
          href="/login"
          className="rounded-full bg-paw-brown px-8 py-3 text-base font-bold text-warm-white shadow-md transition hover:bg-paw-brown-light hover:text-bark-dark"
        >
          시작하기 →
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 로그인 페이지 (`app/login/page.tsx`) 리디자인**

```tsx
// app/login/page.tsx
import { GoogleSignInButton } from "./GoogleSignInButton";
import { SleepyDog } from "@/components/SleepyDog";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 gap-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <SleepyDog state="sleeping" size="md" />

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-bark-dark">로그인</h1>
          <p className="text-bark-mid text-sm font-medium">
            계속하려면 로그인하세요
          </p>
        </div>

        <div className="w-full rounded-3xl bg-warm-white p-8 shadow-[0_4px_24px_rgba(200,149,108,0.12)]">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: GoogleSignInButton 리디자인 (JellyButton 적용)**

```tsx
// app/login/GoogleSignInButton.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { JellyButton } from "@/components/ui/JellyButton";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "로그인 중 오류가 발생했습니다.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <JellyButton
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex h-13 w-full items-center justify-center gap-3 rounded-full border-2 border-paw-brown-light bg-cream px-5 font-bold text-bark-dark shadow-sm disabled:opacity-60 disabled:pointer-events-none"
      >
        {loading ? (
          <span className="text-sm">연결 중...</span>
        ) : (
          <>
            <GoogleIcon className="h-5 w-5 shrink-0" />
            <span>Google로 로그인</span>
          </>
        )}
      </JellyButton>
      {error && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
```

- [ ] **Step 4: 개발 서버에서 랜딩/로그인 페이지 확인**

`http://localhost:3000` 과 `http://localhost:3000/login` 에서 강아지 SVG, 베이지 배경, 둥근 버튼 확인.

- [ ] **Step 5: 커밋**

```bash
git add app/page.tsx app/login/page.tsx app/login/GoogleSignInButton.tsx
git commit -m "feat: redesign landing and login pages with Sleepy Dog theme"
```

---

## Task 6: 온보딩 스텝퍼 리디자인

**Files:**
- Modify: `app/onboarding/page.tsx`
- Modify: `app/onboarding/OnboardingForm.tsx`

- [ ] **Step 1: onboarding/page.tsx 업데이트**

```tsx
// app/onboarding/page.tsx
import { OnboardingForm } from "./OnboardingForm";
import { SleepyDog } from "@/components/SleepyDog";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-8">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <SleepyDog state="tilting" size="md" />
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-bark-dark">
            안녕하세요! 🐾
          </h1>
          <p className="text-bark-mid text-sm mt-1 font-medium">
            몇 가지만 알려주세요
          </p>
        </div>
        <div className="w-full rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] overflow-hidden">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: OnboardingForm.tsx — 4단계 스텝퍼로 전면 교체**

> Context7 참고: framer-motion AnimatePresence + motion.div x 슬라이드

```tsx
// app/onboarding/OnboardingForm.tsx
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
  { id: 3, question: "낮잠은 얼마나 자요?" },
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

  // 로컬 값 상태
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
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

      {/* 단계 질문 + 입력 (슬라이드 트랜지션) */}
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

            {/* 스텝 0: 나이 */}
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

            {/* 스텝 1: 성별 */}
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

            {/* 스텝 2: 취침/기상 시간 */}
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

            {/* 스텝 3: 낮잠 + 기면증 */}
            {step === 3 && (
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

      {/* 에러 표시 */}
      {state?.errors?._form && (
        <p className="mt-3 text-sm text-red-500 font-medium" role="alert">
          {state.errors._form}
        </p>
      )}

      {/* 네비게이션 버튼 */}
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
          /* 마지막 단계: 실제 폼 제출 */
          <form action={formAction} className="flex-1" ref={formRef}>
            <input type="hidden" name="age" value={age} />
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="usual_bed_time" value={bedTime} />
            <input type="hidden" name="usual_wake_time" value={wakeTime} />
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
```

- [ ] **Step 3: `/onboarding` 페이지 확인**

`http://localhost:3000/onboarding` 에서 단계별 슬라이드 트랜지션, 강아지 갸웃 애니메이션, 버튼 스프링 효과 확인.

- [ ] **Step 4: 커밋**

```bash
git add app/onboarding/page.tsx app/onboarding/OnboardingForm.tsx
git commit -m "feat: redesign onboarding as animated 4-step stepper"
```

---

## Task 7: 네비게이션 바 리디자인

**Files:**
- Modify: `app/dashboard/(with-nav)/layout.tsx`

- [ ] **Step 1: layout.tsx 리디자인**

```tsx
// app/dashboard/(with-nav)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "🏠 홈" },
  { href: "/dashboard/checkin", label: "🌙 수면" },
  { href: "/dashboard/mood-checkin", label: "🐾 기분" },
  { href: "/dashboard/nap-checkin", label: "💤 낮잠" },
];

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-10 border-b border-paw-brown-light bg-warm-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl gap-1 px-4 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? "bg-sleepy-yellow text-bark-dark"
                    : "text-bark-mid hover:bg-sleepy-yellow-light hover:text-bark-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add app/dashboard/\(with-nav\)/layout.tsx
git commit -m "feat: redesign navigation bar with active state and warm palette"
```

---

## Task 8: 대시보드 공통 카드 컴포넌트 리디자인

**Files:**
- Modify: `components/Header.tsx`
- Modify: `components/TodayCard.tsx`
- Modify: `components/Last7DaysCard.tsx`

- [ ] **Step 1: Header.tsx 리디자인**

```tsx
// components/Header.tsx
import { getCachedUser } from "@/lib/dal";

export default async function UserHeader() {
  const user = await getCachedUser();

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "사용자";

  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <header className="px-4 pt-6 pb-2">
      <p className="text-bark-mid text-sm font-medium">{dateStr}</p>
      <h1 className="text-2xl font-extrabold text-bark-dark mt-0.5">
        안녕하세요, {displayName}님 🐾
      </h1>
    </header>
  );
}
```

- [ ] **Step 2: TodayCard.tsx 리디자인**

```tsx
// components/TodayCard.tsx
import Link from "next/link";
import {
  getCachedUser,
  getUserProfile,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";
import { getTodayStartTs, getTodayISO } from "@/utils/date";

const LOG_ITEMS = [
  {
    key: "sleep",
    label: "수면 기록",
    icon: "🌙",
    href: "/dashboard/checkin",
  },
  {
    key: "mood",
    label: "기분 체크인",
    icon: "🐾",
    href: "/dashboard/mood-checkin",
  },
  {
    key: "nap",
    label: "낮잠",
    icon: "💤",
    href: "/dashboard/nap-checkin",
  },
];

export default async function TodayCard() {
  const user = await getCachedUser();
  await getUserProfile();

  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  const hasTodayLog = sleepLogs.some((log) => log.sleep_date === todayISO);
  const todayMoodCount = moodLogs.filter(
    (log) => log.log_time >= todayStartTs,
  ).length;
  const todayNapCount = napLogs.filter(
    (log) => log.start_time >= todayStartTs,
  ).length;

  const statusMap: Record<string, string> = {
    sleep: hasTodayLog ? "기록됨 ✓" : "없음",
    mood: `${todayMoodCount}회`,
    nap: `${todayNapCount}회`,
  };
  const doneMap: Record<string, boolean> = {
    sleep: hasTodayLog,
    mood: todayMoodCount > 0,
    nap: todayNapCount > 0,
  };

  return (
    <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5 flex-1">
      <h2 className="text-base font-extrabold text-bark-dark mb-4">오늘</h2>
      <ul className="flex flex-col gap-3">
        {LOG_ITEMS.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-bark-mid">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <span className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${
                  doneMap[item.key] ? "text-paw-brown" : "text-bark-light"
                }`}
              >
                {statusMap[item.key]}
              </span>
              <Link
                href={item.href}
                className="rounded-full bg-sleepy-yellow px-3 py-1 text-xs font-bold text-bark-dark transition hover:bg-sleepy-yellow-light"
              >
                기록하기
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Last7DaysCard.tsx 리디자인**

```tsx
// components/Last7DaysCard.tsx
import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";
import { durationMinutes, formatDuration } from "@/utils/date";

export default async function Last7DaysCard() {
  const user = await getCachedUser();

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  const avgMinutesLast7 =
    sleepLogs.length > 0
      ? Math.round(
          sleepLogs.reduce(
            (s, l) => s + durationMinutes(l.bed_time, l.wake_time),
            0,
          ) / sleepLogs.length,
        )
      : null;

  const avgMoodLast7 =
    moodLogs.length > 0
      ? Math.round(
          (moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length) * 10,
        ) / 10
      : null;

  const totalNapMinLast7 = napLogs.reduce(
    (s, n) => s + durationMinutes(n.start_time, n.end_time),
    0,
  );

  const stats = [
    {
      icon: "🌙",
      label: "평균 수면",
      value: avgMinutesLast7 != null ? formatDuration(avgMinutesLast7) : "—",
    },
    {
      icon: "🐾",
      label: "평균 기분",
      value: avgMoodLast7 != null ? `${avgMoodLast7} / 5` : "—",
    },
    {
      icon: "💤",
      label: "낮잠",
      value:
        napLogs.length > 0
          ? `${napLogs.length}회 · ${formatDuration(totalNapMinLast7)}`
          : "—",
    },
  ];

  return (
    <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5 flex-1">
      <h2 className="text-base font-extrabold text-bark-dark mb-4">최근 7일</h2>
      <ul className="flex flex-col gap-3">
        {stats.map((stat) => (
          <li key={stat.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-bark-mid">
              <span>{stat.icon}</span>
              {stat.label}
            </span>
            <span className="text-sm font-bold text-bark-dark">
              {stat.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add components/Header.tsx components/TodayCard.tsx components/Last7DaysCard.tsx
git commit -m "feat: redesign dashboard card components with warm palette"
```

---

## Task 9: 대시보드 메인 페이지 + 강아지 상태 조건부 렌더

**Files:**
- Create: `components/DogStatusWidget.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: DogStatusWidget.tsx 생성 (클라이언트 컴포넌트)**

```tsx
// components/DogStatusWidget.tsx
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
```

- [ ] **Step 2: dashboard/page.tsx 리디자인**

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";
import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";
import Header from "@/components/Header";
import TodayCard from "@/components/TodayCard";
import Last7DaysCard from "@/components/Last7DaysCard";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";
import { MoodChart } from "@/app/dashboard/(with-nav)/mood-checkin/MoodChart";
import { NapChart } from "@/app/dashboard/(with-nav)/nap-checkin/NapChart";
import { DogStatusWidget } from "@/components/DogStatusWidget";
import { durationMinutes } from "@/utils/date";
import { getTodayISO, getTodayStartTs } from "@/utils/date";
import type { DogState } from "@/components/SleepyDog";

// 스켈레톤 — 기존 컴포넌트 그대로 활용
import HeaderSkeleton from "@/components/Skeleton/HeaderSkeleton";
import TodayCardSkeleton from "@/components/Skeleton/TodayCardSkeleton";
import Last7DaysCardSkeleton from "@/components/Skeleton/Last7DaysCardSkeleton";
import SleepChartWrapperSkeleton from "@/components/Skeleton/SleepChartWrapperSkeleton";
import MoodChartWrapperSkeleton from "@/components/Skeleton/MoodChartWrapperSkeleton";
import NapChartWrapperSkeleton from "@/components/Skeleton/NapChartWrapperSkeleton";

async function resolveDogState(): Promise<DogState> {
  const user = await getCachedUser();
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
  ]);

  const todaySleep = sleepLogs.find((l) => l.sleep_date === todayISO);
  const todayMoodCount = moodLogs.filter((l) => l.log_time >= todayStartTs).length;
  const todayNapCount = napLogs.filter((l) => l.start_time >= todayStartTs).length;

  if (!todaySleep) return "waiting";

  const sleepMin = durationMinutes(todaySleep.bed_time, todaySleep.wake_time);

  if (todayMoodCount > 0 && todayNapCount > 0 && sleepMin >= 360) return "running";
  if (sleepMin >= 420) return "happy";  // 7시간 이상
  if (sleepMin < 360) return "drowsy";  // 6시간 미만
  return "sleeping";
}

export default async function DashboardPage() {
  const user = await getCachedUser();
  const dogState = await resolveDogState();

  const sleepPromise = getCachedSleepLogs7Days(user.id);
  const moodPromise = getCachedMoodLogs7Days(user.id);
  const napPromise = getCachedNapLogs7Days(user.id);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 space-y-4">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>

        {/* 강아지 위젯 + 오늘 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DogStatusWidget state={dogState} />
          <Suspense fallback={<TodayCardSkeleton />}>
            <TodayCard />
          </Suspense>
        </div>

        {/* 7일 요약 */}
        <Suspense fallback={<Last7DaysCardSkeleton />}>
          <Last7DaysCard />
        </Suspense>

        {/* 차트 그리드 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Suspense fallback={<SleepChartWrapperSkeleton />}>
            <SleepCharts sleepPromise={sleepPromise} />
          </Suspense>
          <Suspense fallback={<MoodChartWrapperSkeleton />}>
            <MoodChart moodPromise={moodPromise} />
          </Suspense>
          <Suspense fallback={<NapChartWrapperSkeleton />}>
            <NapChart napPromise={napPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add app/dashboard/page.tsx components/DogStatusWidget.tsx
git commit -m "feat: add dog state widget to dashboard with conditional animation"
```

---

## Task 10: 수면 체크인 페이지 + 차트 리디자인

**Files:**
- Modify: `app/dashboard/(with-nav)/checkin/page.tsx`
- Modify: `app/dashboard/(with-nav)/checkin/SleepLogForm.tsx`
- Modify: `app/dashboard/(with-nav)/checkin/SleepCharts.tsx`

- [ ] **Step 1: checkin/page.tsx 확인 후 리디자인**

```bash
cat app/dashboard/\(with-nav\)/checkin/page.tsx
```

아래로 교체:

```tsx
// app/dashboard/(with-nav)/checkin/page.tsx
import { getTodayISO } from "@/utils/date";
import { getCachedUser, getLatestSleepLog } from "@/lib/dal";
import { SleepLogForm } from "./SleepLogForm";
import { SleepCharts } from "./SleepCharts";
import { getCachedSleepLogs7Days } from "@/lib/dal";
import { Suspense } from "react";
import SleepChartWrapperSkeleton from "@/components/Skeleton/SleepChartWrapperSkeleton";
import { SleepyDog } from "@/components/SleepyDog";

export default async function CheckinPage() {
  const today = getTodayISO();
  const user = await getCachedUser();
  const [initialLog, sleepPromise] = await Promise.all([
    getLatestSleepLog(user.id),
    getCachedSleepLogs7Days(user.id),
  ]);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <SleepyDog state="sleeping" size="sm" />
          <h1 className="text-xl font-extrabold text-bark-dark">수면 기록</h1>
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <SleepLogForm today={today} initialLog={initialLog} />
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <Suspense fallback={<SleepChartWrapperSkeleton />}>
            <SleepCharts sleepPromise={Promise.resolve(sleepPromise)} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: SleepLogForm.tsx 리디자인**

```tsx
// app/dashboard/(with-nav)/checkin/SleepLogForm.tsx
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
```

- [ ] **Step 3: SleepCharts.tsx 리디자인 (웜 팔레트 + 둥근 막대)**

> Context7 참고: recharts Bar radius, animationDuration

```tsx
// app/dashboard/(with-nav)/checkin/SleepCharts.tsx
"use client";

import { use, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getTodayISO, durationMinutes, formatDuration } from "@/utils/date";

export type SleepLogRaw = {
  sleep_date: string;
  bed_time: string;
  wake_time: string;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function SleepCharts({
  sleepPromise,
}: {
  sleepPromise: Promise<SleepLogRaw[]>;
}) {
  const logs = use(sleepPromise);

  const chartData = useMemo(() => {
    const today = getTodayISO();
    const byDate: Record<string, { minutes: number; bedTime: string; wakeTime: string }> = {};
    for (const row of logs) {
      if (row.sleep_date <= today) {
        byDate[row.sleep_date] = {
          minutes: durationMinutes(row.bed_time, row.wake_time),
          bedTime: formatTime(row.bed_time),
          wakeTime: formatTime(row.wake_time),
        };
      }
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const entry = byDate[dateStr];
      return {
        date: dateStr.slice(5).replace("-", "/"),
        duration: entry ? entry.minutes / 60 : null,
        durationLabel: entry ? formatDuration(entry.minutes) : "기록 없음",
        bedTime: entry?.bedTime ?? null,
        wakeTime: entry?.wakeTime ?? null,
      };
    });
  }, [logs]);

  return (
    <div>
      <h3 className="text-base font-extrabold text-bark-dark mb-4">
        🌙 최근 수면 시간
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={32}
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}h`}
              domain={[0, (max: number) => Math.max(10, Math.ceil(max) + 1)]}
            />
            <Tooltip
              cursor={{ fill: "#FFF3C4", radius: 8 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="rounded-2xl border border-paw-brown-light bg-warm-white px-3 py-2 shadow-md">
                    <p className="text-xs text-bark-mid font-medium">{p.date}</p>
                    <p className="font-bold text-bark-dark">{p.durationLabel}</p>
                    {p.bedTime && p.wakeTime && (
                      <p className="text-xs text-bark-mid">
                        {p.bedTime} → {p.wakeTime}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="duration"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
              isAnimationActive
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.duration ? "#C8956C" : "#E8C4A0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add "app/dashboard/(with-nav)/checkin/"
git commit -m "feat: redesign sleep checkin page, form, and chart"
```

---

## Task 11: 기분 체크인 페이지 + 표정 라디오 + 차트

**Files:**
- Modify: `app/dashboard/(with-nav)/mood-checkin/page.tsx`
- Modify: `app/dashboard/(with-nav)/mood-checkin/MoodLogForm.tsx`
- Modify: `app/dashboard/(with-nav)/mood-checkin/MoodChart.tsx`

- [ ] **Step 1: mood-checkin/page.tsx 리디자인**

```tsx
// app/dashboard/(with-nav)/mood-checkin/page.tsx
import { MoodLogForm } from "./MoodLogForm";
import { MoodChart } from "./MoodChart";
import { getCachedUser, getCachedMoodLogs7Days } from "@/lib/dal";
import { SleepyDog } from "@/components/SleepyDog";

export default async function MoodCheckinPage() {
  const user = await getCachedUser();
  const moodPromise = getCachedMoodLogs7Days(user.id);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <SleepyDog state="happy" size="sm" />
          <h1 className="text-xl font-extrabold text-bark-dark">기분 기록</h1>
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <MoodLogForm />
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <MoodChart moodPromise={moodPromise} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: MoodLogForm.tsx 리디자인 (MoodFace 커스텀 라디오)**

```tsx
// app/dashboard/(with-nav)/mood-checkin/MoodLogForm.tsx
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

      {/* 기분 표정 라디오 */}
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
```

- [ ] **Step 3: MoodChart.tsx 리디자인**

```tsx
// app/dashboard/(with-nav)/mood-checkin/MoodChart.tsx
"use client";

import { use, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getTodayISO } from "@/utils/date";

type MoodLogRaw = { score: number; log_time: string };

export function MoodChart({
  moodPromise,
}: {
  moodPromise: Promise<MoodLogRaw[]>;
}) {
  const logs = use(moodPromise);

  const chartData = useMemo(() => {
    const today = getTodayISO();
    const byDate: Record<string, number[]> = {};
    for (const row of logs) {
      const date = row.log_time.slice(0, 10);
      if (date <= today) {
        byDate[date] = [...(byDate[date] ?? []), row.score];
      }
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const scores = byDate[dateStr];
      const avg = scores
        ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
        : null;
      return {
        date: dateStr.slice(5).replace("-", "/"),
        avg,
        label: avg ? `${avg} / 5` : "기록 없음",
      };
    });
  }, [logs]);

  return (
    <div>
      <h3 className="text-base font-extrabold text-bark-dark mb-4">
        🐾 기분 변화
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={28}
              domain={[0, 5]}
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip
              cursor={{ fill: "#FFF3C4", radius: 8 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="rounded-2xl border border-paw-brown-light bg-warm-white px-3 py-2 shadow-md">
                    <p className="text-xs text-bark-mid font-medium">{p.date}</p>
                    <p className="font-bold text-bark-dark">{p.label}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="avg"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
              isAnimationActive
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.avg ? "#F4A7B9" : "#E8C4A0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add "app/dashboard/(with-nav)/mood-checkin/"
git commit -m "feat: redesign mood checkin with MoodFace radio and animated chart"
```

---

## Task 12: 낮잠 체크인 페이지 + 차트 리디자인

**Files:**
- Modify: `app/dashboard/(with-nav)/nap-checkin/page.tsx`
- Modify: `app/dashboard/(with-nav)/nap-checkin/NapLogForm.tsx`
- Modify: `app/dashboard/(with-nav)/nap-checkin/NapChart.tsx`

- [ ] **Step 1: nap-checkin/page.tsx 리디자인**

```tsx
// app/dashboard/(with-nav)/nap-checkin/page.tsx
import { NapLogForm } from "./NapLogForm";
import { NapChart } from "./NapChart";
import { getCachedUser, getCachedNapLogs7Days } from "@/lib/dal";
import { SleepyDog } from "@/components/SleepyDog";

export default async function NapCheckinPage() {
  const user = await getCachedUser();
  const napPromise = getCachedNapLogs7Days(user.id);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <SleepyDog state="sleeping" size="sm" />
          <h1 className="text-xl font-extrabold text-bark-dark">낮잠 기록</h1>
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <NapLogForm />
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <NapChart napPromise={napPromise} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: NapLogForm.tsx 리디자인**

```tsx
// app/dashboard/(with-nav)/nap-checkin/NapLogForm.tsx
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
```

- [ ] **Step 3: NapChart.tsx 리디자인**

```tsx
// app/dashboard/(with-nav)/nap-checkin/NapChart.tsx
"use client";

import { use, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getTodayISO, durationMinutes, formatDuration } from "@/utils/date";

type NapLogRaw = { start_time: string; end_time: string };

export function NapChart({ napPromise }: { napPromise: Promise<NapLogRaw[]> }) {
  const logs = use(napPromise);

  const chartData = useMemo(() => {
    const today = getTodayISO();
    const byDate: Record<string, number> = {};
    for (const row of logs) {
      const date = row.start_time.slice(0, 10);
      if (date <= today) {
        byDate[date] = (byDate[date] ?? 0) + durationMinutes(row.start_time, row.end_time);
      }
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const minutes = byDate[dateStr] ?? null;
      return {
        date: dateStr.slice(5).replace("-", "/"),
        minutes,
        label: minutes != null ? formatDuration(minutes) : "기록 없음",
      };
    });
  }, [logs]);

  return (
    <div>
      <h3 className="text-base font-extrabold text-bark-dark mb-4">
        💤 낮잠 시간
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={36}
              tick={{ fontSize: 11, fill: "#A07850", fontFamily: "Nunito" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip
              cursor={{ fill: "#FFF3C4", radius: 8 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="rounded-2xl border border-paw-brown-light bg-warm-white px-3 py-2 shadow-md">
                    <p className="text-xs text-bark-mid font-medium">{p.date}</p>
                    <p className="font-bold text-bark-dark">{p.label}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="minutes"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
              isAnimationActive
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.minutes ? "#FFD97D" : "#E8C4A0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add "app/dashboard/(with-nav)/nap-checkin/"
git commit -m "feat: redesign nap checkin page, form, and chart"
```

---

## Task 13: 스켈레톤 컴포넌트 팔레트 통일 + 최종 확인

**Files:**
- Modify: `components/Skeleton/*.tsx` (배경색만 변경)

- [ ] **Step 1: 스켈레톤 배경색 일괄 업데이트**

각 스켈레톤 파일에서 `bg-zinc-*` → `bg-paw-brown-light/30` 로 변경.

```bash
# 수정 대상 파일 확인
ls components/Skeleton/
```

각 파일을 열어 `className` 안의 `bg-zinc-200`, `bg-zinc-700` 등을 `bg-paw-brown-light/30` 으로 변경. 예시:

```tsx
// 변경 전
<div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
// 변경 후
<div className="h-6 w-48 rounded-xl bg-paw-brown-light/30" />
```

- [ ] **Step 2: 전체 앱 동작 확인**

```bash
npm run dev
```

아래 페이지 순서로 확인:
1. `http://localhost:3000` — 랜딩 (강아지 숨쉬기, 베이지 배경)
2. `http://localhost:3000/login` — 로그인 (JellyButton 스프링)
3. `http://localhost:3000/onboarding` — 스텝퍼 슬라이드 트랜지션
4. `http://localhost:3000/dashboard` — 강아지 상태 카드, 차트
5. `http://localhost:3000/dashboard/checkin` — 수면 폼 + 차트
6. `http://localhost:3000/dashboard/mood-checkin` — MoodFace 라디오
7. `http://localhost:3000/dashboard/nap-checkin` — 낮잠 폼 + 차트

- [ ] **Step 3: 빌드 오류 확인**

```bash
npm run build
```

Expected: `✓ Compiled successfully` (에러 없음)

- [ ] **Step 4: 최종 커밋**

```bash
git add components/Skeleton/
git commit -m "feat: update skeleton components to match Sleepy Dog palette"
```

---

## 파일 요약

### 신규 생성
| 파일 | 역할 |
|------|------|
| `components/ui/JellyButton.tsx` | 스프링 애니메이션 버튼 래퍼 |
| `components/SleepyDog/SleepyDog.tsx` | 6가지 상태 SVG 강아지 |
| `components/SleepyDog/MoodFace.tsx` | 기분 1-5 표정 SVG |
| `components/SleepyDog/index.ts` | re-export |
| `components/DogStatusWidget.tsx` | 대시보드 강아지 상태 위젯 |

### 수정
| 파일 | 변경 내용 |
|------|----------|
| `app/globals.css` | 색상 토큰, Nunito 폰트 변수 |
| `app/layout.tsx` | Nunito 폰트 적용 |
| `app/page.tsx` | 랜딩 리디자인 |
| `app/login/page.tsx` | 로그인 리디자인 |
| `app/login/GoogleSignInButton.tsx` | JellyButton 적용 |
| `app/onboarding/page.tsx` | 스텝퍼 래퍼 |
| `app/onboarding/OnboardingForm.tsx` | 4단계 대화형 스텝퍼 |
| `app/dashboard/page.tsx` | 카드 그리드 + 강아지 상태 |
| `app/dashboard/(with-nav)/layout.tsx` | 네비게이션 리디자인 |
| `app/dashboard/(with-nav)/checkin/page.tsx` | 체크인 페이지 |
| `app/dashboard/(with-nav)/checkin/SleepLogForm.tsx` | 폼 리디자인 |
| `app/dashboard/(with-nav)/checkin/SleepCharts.tsx` | 차트 팔레트 |
| `app/dashboard/(with-nav)/mood-checkin/page.tsx` | 기분 페이지 |
| `app/dashboard/(with-nav)/mood-checkin/MoodLogForm.tsx` | 표정 라디오 |
| `app/dashboard/(with-nav)/mood-checkin/MoodChart.tsx` | 차트 팔레트 |
| `app/dashboard/(with-nav)/nap-checkin/page.tsx` | 낮잠 페이지 |
| `app/dashboard/(with-nav)/nap-checkin/NapLogForm.tsx` | 폼 리디자인 |
| `app/dashboard/(with-nav)/nap-checkin/NapChart.tsx` | 차트 팔레트 |
| `components/Header.tsx` | 날짜 + 스타일 |
| `components/TodayCard.tsx` | 카드 리디자인 |
| `components/Last7DaysCard.tsx` | 카드 리디자인 |
| `components/Skeleton/*.tsx` | 팔레트 통일 |
