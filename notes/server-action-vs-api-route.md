# Server Action vs API Route 학습 노트

## 핵심 질문
> Server Action에서 FormData로 배열 데이터를 다루는 한계는 무엇인가?
> API Route와 Server Action의 도입 기준은 어떻게 세울 것인가?

---

## 1. FormData의 구조적 한계

FormData는 **평면적 키-값 쌍** 구조다. 중첩 객체나 배열을 자연스럽게 표현할 수 없다.

### get() vs getAll()

```ts
formData.get('symptoms')     // 첫 번째 값만 반환 — 나머지 무시
formData.getAll('symptoms')  // string[] 반환은 되지만 타입 추론 끊김
```

### Object.fromEntries() 함정

```ts
const obj = Object.fromEntries(formData)
// 같은 name 키가 여러 개면 마지막 값만 살아남음 — 배열 소실
```

### 중첩 객체 전송 불가 → 꼼수 강제

```tsx
// 보내고 싶은 데이터
const weeklySchedule = [
  { day: "mon", bed_time: "23:00", wake_time: "07:00" },
  { day: "tue", bed_time: "00:30", wake_time: "08:00" },
]

// FormData로 표현하려면 JSON.stringify 강제
<input type="hidden" name="schedule" value={JSON.stringify(weeklySchedule)} />

// Server Action에서 역직렬화 — 타입 없음, 에러 처리도 수동
const raw = formData.get('schedule') as string
const schedule = JSON.parse(raw)
// → Server Action의 자동 직렬화 이점이 사라짐
```

---

## 2. 이 프로젝트에서 실제 체감한 한계

배열 데이터 문제가 아니라 **멀티스텝 폼의 상태 누적** 문제였다.

### OnboardingForm의 hidden input 브릿지 패턴

```
Step 0 → setAge("28")        ← React state에 저장
Step 1 → setGender("male")   ← React state에 저장
...
Step 4 → setNapDuration("30") ← React state에 저장

마지막 단계에서만 <form> 렌더:
  <input type="hidden" name="age" value={age} />
  <input type="hidden" name="gender" value={gender} />
  ... → formAction 호출
```

`<form>`이 마지막 단계에만 존재. 그 전까지 `<button type="button">`으로 state만 갱신.
FormData가 스텝 간 상태 누적을 표현 못 하니까 **React state = 임시 저장소 / hidden input = 브릿지**.

### 이 패턴의 문제점

| 문제 | 설명 |
|---|---|
| 타입 안전성 훼손 | 잘 만든 React state를 문자열로 직렬화했다가 서버에서 재파싱 → 타입 추론 끊김 |
| DOM 낭비 | 화면에 안 보이는 방대한 상태를 위해 의미 없는 hidden input DOM 노드 생성 |
| 불필요한 우회 | 현대 Next.js에서는 Server Action을 직접 함수로 호출 가능 |

---

## 3. 더 나은 구조: Server Action을 비동기 함수로 직접 호출

```tsx
// ❌ hidden input 브릿지 패턴
<form action={formAction}>
  <input type="hidden" name="age" value={age} />
  ...
</form>

// ✅ Server Action을 직접 호출
<button
  type="button"
  onClick={() => submitOnboarding({ age, gender, bedTime, wakeTime, sleepQuality, hasNarcolepsy, napDuration })}
>
  완료
</button>
```

```ts
// actions.ts — FormData 대신 순수 객체
export async function submitOnboarding(data: OnboardingInput) {
  const parsed = onboardingSchema.safeParse(data)
  // z.coerce 불필요, 타입 그대로 전달됨
}
```

**장점:**
- 타입 추론 유지
- hidden input DOM 노드 없음
- Zod 스키마에서 `z.coerce` 불필요

---

## 4. API Route vs Server Action 선택 기준

| 판단 기준 | Server Action | API Route |
|---|---|---|
| **데이터 구조** | 스칼라값 또는 직접 함수 인자로 넘기는 객체 | 외부에서 JSON으로 수신해야 할 때 |
| **호출 주체** | 폼 submit, 내부 컴포넌트 | 외부 서비스, 서드파티 webhook |
| **HTTP 제어** | 불필요 (redirect/revalidate 충분) | 커스텀 status code, 헤더 필요 |
| **점진적 향상** | JS 꺼져도 동작해야 할 때 | JS 필수 인터랙션 |

### 판단 로직

```
외부 서비스가 호출하는가? → API Route
커스텀 HTTP 응답이 필요한가? → API Route
그 외 내부 뮤테이션 → Server Action (단, FormData가 불편하면 직접 함수 호출)
```

---

## 5. 정리

- `FormData` = 평면 키-값. 배열은 `getAll()`로 가능하지만 중첩 객체는 불가.
- 중첩 객체를 FormData로 보내면 `JSON.stringify → hidden input → JSON.parse` 강제 → 타입 단절.
- 이 프로젝트의 실제 한계는 **멀티스텝 상태 누적**이었고, hidden input 브릿지로 우회함.
- 현대 Next.js에서는 **Server Action을 비동기 함수로 직접 호출**하면 이 우회 자체가 불필요.
- Progressive Enhancement가 필요한 상황이 아니라면 `formAction` 대신 `onClick={() => serverAction(stateObj)}` 패턴이 더 깔끔함.
