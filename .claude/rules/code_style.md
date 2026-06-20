---
description: 코드 스타일 규칙 (전역)
globs:
  - "**/*.ts"
  - "**/*.tsx"
---

# Code Style

## 타입 선언

- 객체 타입 선언 키워드는 `interface`가 아닌 `type`을 사용한다.
  - 예: `type Props = { ... }`

## 네이밍

- **컴포넌트 파일·식별자**: PascalCase
  - 예: `PlacesAutocomplete.tsx`, `CreateBucketListForm.tsx`
  - 예외: Next App Router 예약 파일은 소문자 그대로 — `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `default.tsx`, `route.ts`, `template.tsx`, `proxy.ts`, `auth.ts`
- **그 외 식별자·일반 파일**: camelCase
  - 예: `rateLimit.ts`, `getUserId()`, `useDebounce`
- **`.md` 파일명**: snake_case
  - 예: `commit_message.md`, `feat-3-bucketlist-crud.md` (kebab-case는 작업 브랜치 식별자 등 외부 출처 그대로 유지)

## 주석

- 주석은 **한국어**로 작성.
- 기본은 주석 없음. WHY가 비자명할 때만 한 줄 — 숨은 제약, 미묘한 invariant, 특정 버그 워크어라운드.
- WHAT을 설명하는 주석 금지(잘 지은 식별자가 이미 설명).

## 함수 길이

- **40줄 초과** 시 분리 검토 (JSX 포함 시 60줄까지 허용).
- 분리 기준은 "한 함수 = 한 책임". 단순히 줄 수를 줄이려고 의미 없는 헬퍼를 만들지 말 것.
- Server Action, Route Handler, RSC `page`/`layout`은 본문이 길어지면 도메인 로직을 `lib/` 또는 같은 폴더 내 `actions.ts`/`helpers.ts`로 추출.

## 파일·폴더 구조

- **컴포넌트 위치**: 기능 단위로 `src/components/{feature}/`에 배치 (라우트 기준 아님)
  - feature 목록: `ui` (원자), `nav`, `bucket`, `dashboard`, `friends`, `profile`, `onboarding`, `globe`, `user`, `landing`
  - 예: `src/components/bucket/CreatePanel.tsx`, `src/components/ui/Button.tsx`
  - `@modal/` 하위 `*ModalClient.tsx`처럼 얇은 라우트 래퍼만 라우트 폴더(`_components/`)에 유지
- **컴포넌트 분리**: 한 파일 안에 컴포넌트가 2개 이상이면 별도 파일로 분리
- **API 요청 로직**: `src/api/` 폴더에 카테고리별로 배치. 신규 작성 전 기존 파일 확인
  - 예: `src/api/bucketlists.ts`, `src/api/places.ts`
- **단순 로직**: `src/lib/` 폴더에 카테고리별로 배치. 신규 작성 전 기존 파일 확인
  - 예: `src/lib/bucketList/`, `src/lib/username.ts`
- **api vs lib 구분**: 외부 fetch 호출 → `src/api/`, 순수 유틸·변환 로직 → `src/lib/`
- **타입 co-location**: 타입은 사용하는 파일·폴더 가까이 정의. 전역 공유 타입만 `src/types/`

## 컴포넌트 재사용

- 동일한 디자인이 필요하면 새 컴포넌트를 복사해 만들지 말 것
- 기존 컴포넌트에 onClick / variant / className props를 확장해 재사용
- props가 3개 이상 늘어나는 경우에만 별도 컴포넌트 분리 검토
- 공유 Button, Badge 등 원자 컴포넌트는 `src/components/ui/`에 위치

## 일반

- 들여쓰기·세미콜론·따옴표는 ESLint / Prettier 설정을 따른다 (수동 결정 금지).
- 사용하지 않는 import / 변수는 본인 변경이 만든 것만 제거. 인접 dead code는 손대지 말 것.
