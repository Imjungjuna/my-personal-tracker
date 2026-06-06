# Next.js 서버 렌더링 & 캐싱 정리

## 1. SSG vs Dynamic Rendering

Next.js App Router는 기본적으로 정적 렌더링(SSG) 시도.
단, 아래 함수 감지 시 **자동으로 Dynamic Rendering** 전환:

- `cookies()` from `next/headers`
- `headers()` from `next/headers`
- `searchParams` (page props)

Dynamic Rendering = 매 요청마다 서버에서 실행. `Date.now()` 같은 코드도 요청 시점 기준.

---

## 2. cookies() 실행 위치

| 함수 | 실행 위치 | 역할 |
|---|---|---|
| `document.cookie` | 브라우저 | 클라이언트 쿠키 읽기 |
| `cookies()` from `next/headers` | Next.js 서버 (Node.js) | HTTP 요청 헤더의 Cookie 읽기 |

브라우저 API 아님. HTTP 요청이 Next.js 서버에 도달할 때 요청 헤더의 `Cookie: ...`를 서버에서 읽는 것.

---

## 3. createServerClient 흐름

```
브라우저 → (HTTP 요청) → Next.js 서버 (Node.js)
                              ├─ cookies()로 쿠키 읽음
                              ├─ createServerClient() 생성
                              └─ Supabase API 서버로 HTTP 요청
```

`@supabase/ssr`의 `createServerClient`는 Next.js 서버에서 실행.
Supabase 자체 서버를 "경유"하는 게 아니라, **Next.js 서버 → Supabase REST API** 직접 호출.

---

## 4. React cache()

```ts
import { cache } from "react"

export const getCachedUser = cache(async () => { ... })
```

### 목적: 단일 요청 내 중복 API 호출 제거

```
DashboardPage
  ├─ StatCards        → getCachedUser() → Supabase API 호출 (첫 번째)
  ├─ TodayMetricsCard → getCachedUser() → 캐시 hit (API 안 부름)
  └─ SomeOtherCard    → getCachedUser() → 캐시 hit (API 안 부름)
```

- SSG 캐싱 아님 (디스크/CDN 저장 X)
- **요청 스코프** — 요청이 끝나면 캐시 사라짐
- 다음 요청에서 다시 API 호출

---

## 5. redirect()와 캐시 스코프

`redirect()` 호출 시:
- HTTP 302 응답 던지고 현재 요청 **즉시 종료**
- `cache()`된 결과가 있어도 요청 스코프 자체가 소멸
- 리다이렉트된 새 요청은 완전히 새 스코프 → 캐시 초기화

"무효화"가 아니라 요청 스코프 소멸.
