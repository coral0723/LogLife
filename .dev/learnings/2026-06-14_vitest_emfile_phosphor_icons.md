# Vitest unit 테스트 — EMFILE: too many open files (@phosphor-icons/react)

> 작성일: 2026-06-14
> 브랜치: `feat/24-friend-system`
> 결론: **설정으로 깔끔히 못 고침 — 영향받는 테스트 파일을 나눠서 실행**

## 증상 / 문제

`pnpm vitest run "src/app/(afterLogin)/friends" "src/app/api/friends"` 등으로 phosphor-icons를 import하는
테스트 파일 4개 이상을 같은 배치로 실행하면 일부 파일이 setup 단계에서
`EMFILE: too many open files, open '...@phosphor-icons/react/dist/defs/*.es.js'`로 실패 (0 tests run).

영향 파일: `FriendListSection.test.tsx`, `FriendRequestsSection.test.tsx`,
`UserSearchResultItem.test.tsx`, `UserSearchSection.test.tsx` (모두 phosphor-icons import).

## 원인 / 패턴

- `vitest.config.ts`의 `unit` 프로젝트는 `pool: 'vmThreads'` 사용 → 테스트 파일마다 새 V8 컨텍스트에서 모듈을 재평가.
- `@phosphor-icons/react`는 `dist/defs/`에 아이콘별 `.es.js` 파일이 ~1300개 있는 barrel 패키지.
- phosphor-icons를 import하는 테스트 파일이 동시에 여러 개(스레드 풀 단위) 실행되면
  동시에 열리는 파일 핸들 수가 Windows 프로세스 한도를 초과.
- 개별 파일 단독 실행 시에는 전부 정상 통과 (21/21 등).

## 시도했으나 기각한 해결책

1. **`poolOptions.vmThreads.maxThreads: 1`** — Vitest 4에서 `poolOptions` 자체가 제거됨
   (top-level 옵션으로 통합, deprecation 경고 발생).
2. **`fileParallelism: false`** (top-level, Vitest 4 권장 대안) — EMFILE은 해결되지만(10/10 파일 실행),
   `unit` 프로젝트 전체를 단일 스레드 순차 실행으로 바꿔 real-timer 기반 테스트
   (300ms 디바운스, 2000ms 토스트 등)에서 **실행마다 다른 파일이 랜덤하게 `waitFor`/`findBy`
   타임아웃으로 실패**하는 플레이키니스 유발.
   - 1차 실행: `UserSearchSection.test.tsx`에서 4개 실패
   - 2차 실행: `UserSearchResultItem.test.tsx`에서 5개 실패 (같은 테스트들은 단독 실행 시 항상 통과)
   - Windows 로컬 한정 문제(EMFILE)를 CI(Linux) 포함 전체 스위트에 영향 주는 변경으로
     "고치는" 트레이드오프가 나쁨 → 되돌림.
3. **(미시도)** `pool: 'forks'` 전환, `@phosphor-icons/react` 테스트용 stub alias —
   둘 다 전체 스위트 재검증이 필요한 더 큰 변경이라 보류.

## 결론 및 워크어라운드

- `vitest.config.ts`는 원상복구함 (diff 없음).
- phosphor-icons를 import하는 테스트 파일이 많이 섞인 배치에서 EMFILE이 뜨면,
  **파일 목록을 나눠서 여러 번 실행** (예: 2~3개씩). 개별 파일은 항상 정상 통과.
