# dnd-kit Accessibility Portal 패턴

**관련 커밋:** `fix: portal dnd-kit accessibility divs to document.body to prevent invalid tbody DOM`
**수정 파일:** `app/(app)/goals/GoalDashboard.tsx`

---

## 1단계 — 중학생 수준

### 문제: 이상한 곳에 물건 넣기

HTML은 표(table)를 만들 때 규칙이 있어.

```
<table>
  <tbody>        ← 여기엔 <tr> (행)만 들어올 수 있어
    <tr>...</tr>
    <tr>...</tr>
  </tbody>
</table>
```

`<tbody>` 안에는 `<tr>` 태그만 있어야 해. 이건 HTML 규칙이야.

그런데 우리가 쓴 `DndContext` (드래그 기능 라이브러리) 는 화면에 안 보이는 `<div>` 2개를 몰래 만들어. 시각장애인이 쓰는 스크린 리더가 "지금 드래그 중이에요" 같은 말을 읽어줄 수 있도록.

문제는 이 `<div>` 들이 `<tbody>` 안에 들어가려 했다는 거야:

```
<tbody>
  <tr>...</tr>   ← 올바른 자식
  <tr>...</tr>   ← 올바른 자식
  <div>...</div> ← ❌ 규칙 위반! div는 tbody 안에 못 들어와
  <div>...</div> ← ❌ 규칙 위반!
</tbody>
```

브라우저가 이걸 보면 "이건 잘못됐어" 하고 `<div>` 를 표 바깥으로 강제로 옮겨. 그러면 React 가 생각하는 화면 구조랑 실제 브라우저 화면이 달라져서 오류가 생겨.

### 해결: 올바른 위치에 넣기

"저 `<div>` 들을 표 안 말고 페이지 맨 아래 (`document.body`) 에 붙여줘" 라고 지시하면 돼.

이걸 **Portal** 이라고 해. 리액트에서 어떤 요소를 코드상의 위치가 아닌 다른 DOM 위치에 렌더링하는 기능이야.

```
document.body
  ├── <div id="app">          ← 우리 앱
  │     └── <table>
  │           └── <tbody>
  │                 ├── <tr> ← 드래그 가능한 행들
  │                 └── <tr>
  │
  └── <div> (스크린 리더용)   ← portal로 여기에 붙음 ✅
  └── <div> (스크린 리더용)   ← portal로 여기에 붙음 ✅
```

코드 한 줄 추가:

```tsx
<DndContext
  accessibility={{ container: typeof document !== 'undefined' ? document.body : undefined }}
  ...
>
```

---

## 2단계 — 실무 수준

### 근본 원인: HTML 콘텐츠 모델 위반 + React DOM 불일치

**HTML 명세상** `<tbody>` 의 허용 자식은 `<tr>` 뿐이다 (Permitted content: zero or more `<tr>` elements). `<div>` 는 flow content로 table section 안에 들어올 수 없다.

**dnd-kit의 동작:**

`DndContext` 는 내부적으로 `@dnd-kit/accessibility` 의 `HiddenText` + `LiveRegion` 컴포넌트를 렌더링한다:

```js
// @dnd-kit/core/dist/core.esm.js
function Accessibility({ container, ... }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])  // ← 핵심

  if (!mounted) return null  // SSR + 초기 hydration: null 반환

  const markup = (
    <>
      <HiddenText ... />  {/* <div style="display:none"> */}
      <LiveRegion ... />  {/* <div role="status" aria-live="assertive"> */}
    </>
  )

  return container ? createPortal(markup, container) : markup  // ← portal 분기
}
```

**왜 hydration 에러가 아닌가:**

`useEffect` 는 서버에서 실행되지 않는다. `mounted` 초기값은 `false` → `Accessibility` 는 서버와 클라이언트 초기 렌더 모두 `null` 반환. 따라서 SSR HTML과 hydration 결과가 일치하므로 React hydration 단계에서는 에러가 없다.

**실제 문제 발생 시점:**

Hydration 완료 → `useEffect` 실행 → `mounted = true` → React가 `<div>` 2개를 DOM에 삽입 시도. 이 시점의 부모 노드는 `<tbody>`. 브라우저의 HTML parser는 이를 수용하지 않고 table foster parenting 알고리즘에 따라 `<div>` 를 table 외부로 이동시킨다.

결과: React fiber tree의 예상 DOM 구조 ≠ 실제 DOM. 이후 상태 업데이트 시 reconciler가 잘못된 노드를 참조 → 런타임 에러 또는 화면 깨짐.

### 해결: `accessibility.container` prop으로 portal 대상 지정

```tsx
accessibility={{ container: typeof document !== 'undefined' ? document.body : undefined }}
```

**`typeof document !== 'undefined'` 가드가 필요한 이유:**

Next.js는 서버에서 컴포넌트를 실행한다. 서버 환경(Node.js)에는 `document` 가 없다. `document.body` 를 직접 참조하면 `ReferenceError` 가 발생한다. `'use client'` 컴포넌트도 서버에서 초기 렌더링되므로 이 가드가 필요하다.

**동작 흐름:**

- 서버: `Accessibility` → `null` (mounted=false) → container 사용 안 함
- 클라이언트 초기: 동일
- 클라이언트 mount 후: `container = document.body` → `createPortal(markup, document.body)` → `<div>` 들이 `<tbody>` 가 아닌 `<body>` 의 직접 자식으로 삽입

React의 portal은 virtual DOM 트리 위치(DndContext 내부)와 실제 DOM 위치(body)를 분리한다. DndContext의 context는 정상적으로 table rows에 전달되면서, accessibility markup은 유효한 위치에 렌더링된다.

### 패턴 적용 기준

`DndContext` 를 테이블 안에서 쓸 때는 항상 이 prop을 추가해야 한다. 테이블 밖에서 쓸 때는 불필요하다 (inline 렌더링해도 `<div>` 가 유효한 위치에 들어가므로).

```tsx
// ✅ 테이블 외부: prop 불필요
<div>
  <DndContext ...>
    <SortableList />
  </DndContext>
</div>

// ✅ 테이블 내부: 반드시 container 지정
<table>
  <tbody>
    <DndContext accessibility={{ container: typeof document !== 'undefined' ? document.body : undefined }} ...>
      <SortableRows />
    </DndContext>
  </tbody>
</table>
```
