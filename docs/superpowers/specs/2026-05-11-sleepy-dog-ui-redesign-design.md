# Sleepy Dog UI 전면 리디자인 — 디자인 스펙

**날짜**: 2026-05-11
**범위**: 전체 페이지 (랜딩, 로그인, 온보딩, 대시보드, 3개 체크인)
**모드**: 라이트 모드 전용
**접근 방식**: Bottom-up (디자인 시스템 → 컴포넌트 → 페이지)

---

## 1. 디자인 시스템 토큰

### 색상 팔레트

| 토큰 | 값 | 용도 |
|------|-----|------|
| `cream` | `#FDF6EC` | 페이지 배경 |
| `warm-white` | `#FFFBF5` | 카드 배경 |
| `paw-brown` | `#C8956C` | 강조색 (버튼, 아이콘) |
| `paw-brown-light` | `#E8C4A0` | 호버, 보조 강조 |
| `sleepy-yellow` | `#FFD97D` | 포인트 컬러 (배지, 차트) |
| `sleepy-yellow-light` | `#FFF3C4` | 카드 배경 변형 |
| `bark-dark` | `#5C3D2E` | 주 텍스트 |
| `bark-mid` | `#A07850` | 보조 텍스트 |
| `bark-light` | `#D4B896` | 비활성/플레이스홀더 |
| `nose-pink` | `#F4A7B9` | 기분 5점 색상 |

### 타이포그래피
- **폰트**: Nunito (Google Fonts, `next/font/google`)
- 헤딩: `font-bold`
- 본문: `font-medium`
- `font-sans` → Nunito로 전역 적용

### 공통 컴포넌트 스타일
- 카드: `rounded-3xl`, `shadow-[0_4px_24px_rgba(200,149,108,0.12)]`, 배경 `warm-white`
- 버튼: `rounded-full`, 스프링 호버/탭 애니메이션 (`JellyButton` 래퍼)
- 인풋: `rounded-2xl`, `border-paw-brown-light`, 포커스 `ring-paw-brown`

---

## 2. 강아지 SVG 컴포넌트

### 컴포넌트: `<SleepyDog />`
**파일**: `components/SleepyDog/index.tsx`

### Props
```ts
type SleepyDogProps = {
  state: "sleeping" | "happy" | "running" | "drowsy" | "tilting" | "waiting"
  size?: "sm" | "md" | "lg"  // sm=80px, md=120px, lg=200px
}
```

### 상태별 애니메이션

| 상태 | 트리거 조건 | 애니메이션 |
|------|------------|-----------|
| `sleeping` | 기본/빈 상태 | 몸통 오르내림(숨쉬기), 눈 감음 |
| `happy` | 수면 ≥ 7시간 달성 | 꼬리 좌우 흔들기, 귀 살짝 들림 |
| `running` | 오늘 3개 기록 모두 완료 | 앞발 교대 달리기 모션 |
| `drowsy` | 수면 < 6시간 | 머리 꾸벅꾸벅, 눈 반쯤 감김 |
| `tilting` | 온보딩 질문 중 | 고개 15° 좌우 갸웃거림 |
| `waiting` | 데이터 없는 빈 상태 | 앞발로 땅 긁기, 초롱초롱한 눈 |

### SVG 구조 (미니멀 지오메트릭)
- `body`: 타원 (메인 몸통)
- `head`: 원 (머리)
- `ears`: 두 개의 타원 (귀)
- `eyes`: 원 or 호(arc) — 상태별로 모양 변화
- `nose`: 작은 타원 (코)
- `tail`: 베지어 곡선 path (꼬리)
- `front-legs`: 두 개의 둥근 rect (앞발)

각 요소는 `motion.ellipse`, `motion.path`, `motion.rect` 등으로 래핑.

### MoodFace 컴포넌트: `<MoodFace />`
**파일**: `components/SleepyDog/MoodFace.tsx`

기분 점수 1~5에 따라 강아지 표정을 렌더링하는 인라인 SVG.

| 점수 | 눈 모양 | 귀 상태 |
|------|--------|--------|
| 1 | ㅠㅠ (슬픈 눈) | 축 처짐 |
| 2 | 반쯤 내려감 | 약간 처짐 |
| 3 | 평범한 원 | 중립 |
| 4 | 반달 (웃는 눈) | 중립 |
| 5 | 반달 + 귀 올라감 | 올라감 |

선택 시 `scale 1 → 1.3 → 1` 스프링 바운스.

---

## 3. 공통 컴포넌트

### `<JellyButton />`
**파일**: `components/ui/JellyButton.tsx`

모든 클릭 가능한 요소에 적용하는 Framer Motion 래퍼.
```ts
whileHover: { scale: 1.05 }
whileTap: { scale: 0.95 }
transition: { type: "spring", stiffness: 400, damping: 17 }
```

---

## 4. Framer Motion 패턴

### 카드 등장 (staggerChildren)
```ts
// 부모 컨테이너
variants: {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}
// 자식 카드
variants: {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}
```

### 온보딩 슬라이드 (AnimatePresence)
```ts
initial: { x: 300, opacity: 0 }
animate: { x: 0, opacity: 1 }
exit: { x: -300, opacity: 0 }
// AnimatePresence mode="wait"
```

### 숨쉬기 (무한 반복)
```ts
animate: { scaleY: [1, 1.04, 1] }
transition: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
```

### 바 차트 등장
Recharts 기본 애니메이션 활용:
- `isAnimationActive={true}`
- `animationBegin={0}`
- `animationDuration={800}`
- `animationEasing="ease-out"`

---

## 5. 페이지별 레이아웃

### `/` 랜딩 + `/login`
- 전체 화면 중앙 정렬, 배경 `cream`
- "Hello, Sleepy Dog! 🌙" 텍스트 fadeIn
- `<SleepyDog state="sleeping" size="lg" />` — 화면 중앙
- Google 로그인 버튼: `rounded-full`, `paw-brown` 배경
- 버튼 호버 → `JellyButton` 스프링 + 강아지 꼬리 흔들기 트리거

### `/onboarding` (4단계 스텝퍼)

| 스텝 | 질문 | 입력 타입 |
|------|------|-----------|
| 1 | "몇 살이에요?" | 숫자 인풋 |
| 2 | "성별은요?" | 큰 선택 버튼 3개 |
| 3 | "평소 몇 시에 자고 일어나요?" | 시간 피커 2개 |
| 4 | "낮잠은 얼마나 자요? (기면증 여부 포함)" | 버튼 선택 |

- 상단 고정: `<SleepyDog state="tilting" size="md" />`
- 스텝 전환: `AnimatePresence` 슬라이드
- 하단: dot indicator + 다음 버튼 (`JellyButton`)
- 기존 서버 액션 `submitOnboarding` 유지, 폼 구조만 변경

### `/dashboard`
레이아웃:
```
Header (이름 + 날짜)
SleepyDog (조건부 상태) | Today 카드
Last 7 Days 카드
Sleep/Mood/Nap 차트
```

강아지 상태 결정 로직:
- 수면 기록 없음 → `waiting`
- 수면 < 6시간 → `drowsy`
- 오늘 3개 기록 완료 → `running`
- 수면 ≥ 7시간 → `happy`
- 기본 → `sleeping`

카드 등장: `staggerChildren` 0.1s 순차 fadeUp

### `/dashboard/checkin` (수면)
- 상단: `<SleepyDog state="sleeping" size="sm" />`
- 폼: 날짜, 취침 시간, 기상 시간 (`rounded-2xl` 인풋)
- 저장 버튼: `JellyButton`
- 하단: 7일 바 차트 (막대 끝 `rounded-full`, 등장 애니메이션)

### `/dashboard/mood-checkin` (기분)
- `<MoodFace />` 커스텀 라디오 (1~5 표정 버튼)
- 선택 시 스프링 바운스
- 메모 텍스트에어리어
- 저장 버튼: `JellyButton`
- 하단: 일별 평균 기분 바 차트

### `/dashboard/nap-checkin` (낮잠)
- 상단: `<SleepyDog state="sleeping" size="sm" />`
- 폼: 날짜, 시작/종료 시간
- 저장 버튼: `JellyButton`
- 하단: 일별 총 낮잠 시간 바 차트

---

## 6. 파일 구조

### 신규 파일
```
components/
├── SleepyDog/
│   ├── index.tsx
│   ├── MoodFace.tsx
│   └── states/
│       ├── Sleeping.tsx
│       ├── Happy.tsx
│       ├── Running.tsx
│       ├── Drowsy.tsx
│       ├── Tilting.tsx
│       └── Waiting.tsx
└── ui/
    └── JellyButton.tsx
```

### 수정 파일
```
app/globals.css                          # CSS 토큰, Nunito 폰트
app/layout.tsx                           # 폰트 적용
tailwind.config.ts                       # 색상 토큰 추가
app/page.tsx                             # 랜딩 리디자인
app/login/page.tsx                       # 로그인 리디자인
app/login/GoogleSignInButton.tsx         # 스프링 애니메이션
app/onboarding/page.tsx                  # 스텝퍼 래퍼
app/onboarding/OnboardingForm.tsx        # 대화형 스텝퍼 UI
app/dashboard/page.tsx                   # 카드 그리드
app/dashboard/(with-nav)/layout.tsx      # 네비게이션 스타일
app/dashboard/(with-nav)/checkin/SleepLogForm.tsx
app/dashboard/(with-nav)/checkin/SleepCharts.tsx
app/dashboard/(with-nav)/mood-checkin/MoodLogForm.tsx
app/dashboard/(with-nav)/mood-checkin/MoodChart.tsx
app/dashboard/(with-nav)/nap-checkin/NapLogForm.tsx
app/dashboard/(with-nav)/nap-checkin/NapChart.tsx
components/Header.tsx
components/TodayCard.tsx
components/Last7DaysCard.tsx
```

---

## 7. 설치 패키지

```bash
npm install framer-motion
```

---

## 8. Context7 MCP 활용 대상

| 라이브러리 | 확인할 내용 |
|-----------|-----------|
| `framer-motion` | `AnimatePresence`, SVG motion 요소, `useAnimate` |
| `next/font/google` | Nunito App Router 적용법 |
| `recharts` | `animationBegin`, 커스텀 rounded bar shape |

---

## 9. 제약 사항

- 기존 서버 액션, DAL, Supabase 연동 코드는 변경하지 않음
- 데이터 모델 변경 없음
- 라이트 모드 전용 (다크 모드는 향후 과제)
- 기존 shadcn/ui 컴포넌트 위에 스타일 오버라이드 방식 사용
