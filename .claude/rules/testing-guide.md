---
description: 테스트 작성 규칙 (테스트 파일에 자동 적용)
globs:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/__tests__/**"
  - "vitest.config.ts"
  - "vitest.setup.ts"
  - "stories/**"
  - "tests/**"
---

# Testing Guide

## 스택

- **Vitest** — 단위 / 컴포넌트 테스트. `vitest.config.ts`에서 `unit` / `storybook` 프로젝트 분리.
- **MSW** — API 모킹 전용. fetch / Prisma를 직접 mock 하지 말 것.
- **Playwright** — E2E 전용. Vitest로 E2E 작성 금지.
- **Storybook 10** — 컴포넌트 카탈로그 (story 자체가 시각 회귀 테스트).

## 작성 규칙

- 테스트 파일 위치: 대상 파일 옆 `*.test.ts(x)` 또는 `__tests__/` 폴더. 전역 인프라 코드는 `tests/`.
- Server Action 단위 테스트는 직접 import 호출 (HTTP 라운드트립 X).
- MSW handler는 `tests/msw/handlers/`에 도메인별로 분리.
- 외부 API(Google Places 등)는 반드시 MSW로 mocking — 실제 호출 금지(비용 0원 원칙).

## 금지

- DB / Prisma mocking 금지. SQLite in-memory or 테스트 전용 schema 사용.
- `Date`/`Math.random` 직접 사용 금지 — `vi.useFakeTimers()` / 시드 고정.
- 테스트 안에서 `console.log` 잔존 금지.

## 참고

- 상세 기술 스택은 [`docs/plan-spec.md`](../../docs/plan-spec.md) §2 참조.
- 테스트 미작성 항목은 같은 문서의 §"알려진 한계" 또는 [`work-logs`](../../.dev/work-logs/) 참조.
