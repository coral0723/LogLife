---
description: 보안 민감 영역 규칙 (auth/api/env 파일에 자동 적용)
globs:
  - "auth.ts"
  - "proxy.ts"
  - "app/api/**"
  - "app/(auth)/**"
  - "lib/rateLimit.ts"
  - ".env*"
  - "prisma/**"
---

# Security

## .env 파일 처리

- **`.env.example` 외 `.env.*` 직접 수정 절대 금지.**
- 변경이 필요하면 변경값과 키 이름만 사용자에게 알리고, 사용자가 직접 편집한다.
- `.env*` 파일을 커밋에 포함시키지 말 것 (`/commit` 스킬이 차단하지만 수동 작업에서도 확인).

## API Key 노출

- 서버 전용 키에 **`NEXT_PUBLIC_` 접두사 절대 금지** (브라우저 번들로 흘러나감).
- 예: `GOOGLE_PLACES_API_KEY`, `DATABASE_URL`, `AUTH_SECRET` 등은 모두 서버 전용.
- 클라이언트가 필요로 하는 외부 호출은 **반드시 자체 API Route를 프록시**로 두고 서버에서 키를 붙인다.

## Server Action / Route Handler

- 첫 줄에 `auth()` 또는 `requireUserId()` 가드 필수. 가드 없는 mutation 금지.
- 본인 데이터만 변경하도록: `updateMany` / `deleteMany` + `where: { id, userId }` 패턴.
  - `update({ where: { id } })`는 타 유저 데이터를 추측 ID로 건드릴 수 있으므로 금지.
- 입력은 Zod schema로 parse 한 뒤 사용 (raw `req.json()` 직접 사용 금지).

## 외부 API 호출 순서

1. `auth()` 통과
2. `lib/rateLimit.ts`의 `checkRateLimit` 통과 (키: `places:${userId}` 등)
3. 외부 fetch
4. 응답 정규화 (Google 원형 응답 그대로 클라이언트에 노출 금지)

## 참고

- 인증/세션 모델 (AD-05) → [`docs/plan_spec.md`](../../docs/plan_spec.md)
- Places 프록시 / 레이트 리밋 구현 패턴 → [`.dev/learnings/2026-06-14_places_proxy_ratelimit_pattern.md`](../../.dev/learnings/2026-06-14_places_proxy_ratelimit_pattern.md)