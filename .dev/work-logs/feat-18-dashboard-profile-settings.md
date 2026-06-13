# feat/18-dashboard-profile-settings 작업 정리

> 작성일: 2026-06-13
> 베이스: `chore/15-harness-structure-optimization` 머지 시점 (fa25b38 — PR #16)
> 관련 이슈: #18 — 메인 화면 대시보드 패널 + 프로필 설정
> 상태: PR #19로 머지 완료 (main에 포함됨)

## 1. 한눈에 보기

[plan_spec.md](../../docs/plan_spec.md) AD-17(페이지 이동 없는 컴포넌트 슬라이드 패널/오버레이 진입 패턴)을 기반으로 두 축의 기능을 구현한 대규모 브랜치다.

1. **대시보드 슬라이드 패널** — BottomNav 좌측 메뉴로 진입, 버킷리스트 통계 위젯 4종을 카드형으로 표시
2. **프로필 배지 + 설정** — 메인 화면 좌상단 프로필 배지, `/profile` 인터셉팅 라우트에서 아바타·닉네임 변경, 로그아웃/탈퇴 제공

총 56개 커밋, 68개 파일 변경 (+4056/-96). 신규 아바타 프리셋 이미지 10종 포함.

### 작업 영역 요약

| 영역 | 핵심 결과물 |
|---|---|
| 2. BottomNav 진입점 | 프로필 메뉴 → 대시보드 메뉴 교체, 슬라이드 패널 컨테이너, `withNav` 레이아웃 제거 |
| 3. 대시보드 위젯 4종 | BucketCount / UpcomingDeadlines / DifficultyExcitementMatrix / AchievementStats — 각 API route + lib 계산 로직 + 테스트 + Storybook |
| 4. 위젯 패널 합성 | DashboardPanel, MatrixSlidePanel — 버킷리스트 상태 변경 시 캐시 동기화 |
| 5. 프로필 배지 | ProfileBadge + 아바타 프리셋 10종, 신규 가입 시 랜덤 아바타 배정 |
| 6. 프로필 설정 | `/profile` 인터셉트, 아바타/닉네임 변경 Server Action + Panel UI, 로그아웃/탈퇴 |
| 7. 마무리 버그 수정 | createContext 오류, race condition, 접근성, 마감 위젯 누락 (QA 라운드) |

---

## 2. 대시보드 진입점 (BottomNav)

- `e4c93ca` 기존 프로필 메뉴를 대시보드 메뉴로 교체
- `d90b939` AD-17 — "페이지 이동 없이 컴포넌트 슬라이드 패널로 연다" 패턴을 plan_spec.md에 문서화 (대시보드/작성 패널, 프로필/친구 오버레이 공통 원칙)
- `c805668` BottomNav 클릭 시 DashboardPanel 오픈
- `cfe636e` 더 이상 쓰지 않는 `withNav` 레이아웃 제거

`src/app/(afterLogin)/_components/BottomNav.tsx`

---

## 3. 대시보드 위젯 4종

각 위젯은 동일한 패턴(API route → lib 계산 함수 → 위젯 컴포넌트 → 단위 테스트 → Storybook)으로 구현했다.

### 버킷리스트 개수 — BucketCountWidget
- `cfbdb5b` API 추가, `96e8810` 위젯 분리, `aac59b8`/`170e4a4` 테스트·Storybook
- `src/app/api/dashboard/bucket-count/route.ts`, `src/app/(afterLogin)/_components/BucketCountWidget.tsx`

### 마감 임박 리스트 — UpcomingDeadlinesWidget
- `e172db3` API 추가, `223881d` API 연결 및 컴포넌트 분리, `0a509d3`/`338ef09` 테스트·Storybook
- `src/app/api/dashboard/upcoming-deadlines/route.ts`, `src/app/(afterLogin)/_components/UpcomingDeadlinesWidget.tsx`

### 난이도×설렘 매트릭스 — DifficultyExcitementMatrixWidget
- `40ffefd` API 추가, `ee16f09` 디자인 구현, `1e24b2a` 컴포넌트 분리, `d53238c` 디자인 디테일 보완, `62ea653`/`b04f5f5` 테스트·Storybook
- [src/lib/bucketList/difficultyExcitementMatrix.ts](../../src/lib/bucketList/difficultyExcitementMatrix.ts) — 2×2 매트릭스 분류 로직
- `src/app/(afterLogin)/_components/DifficultyExcitementMatrixWidget.tsx` + `MatrixSlidePanel.tsx`(카드 클릭 시 상세뷰 전환 패널을 별도 분리)

### 달성 통계 — AchievementStatsWidget
- `bebb0c1` API 추가, `de5e37f` 컴포넌트 분리(refactor), `daa782e`/`e414b53` 테스트·Storybook
- [src/lib/bucketList/achievementStats.ts](../../src/lib/bucketList/achievementStats.ts) — 평균 달성 소요 기간 · 가장 오래 미룬 항목 · 달성이 빠른 카테고리

---

## 4. 위젯 패널 합성 (DashboardPanel)

`src/app/(afterLogin)/_components/DashboardPanel.tsx` — 4개 위젯을 framer-motion 좌측 슬라이드 패널로 합성. `isOpen` prop을 각 위젯에 전달해 패널이 열릴 때만 쿼리가 실행되도록 구성.

- `1e743a3` Storybook Vitest 테스트에서 `__dirname`/next-auth 모킹 오류 해결 (공통 테스트 인프라 이슈)
- `c880032` BottomNav 테스트·Storybook이 "프로필→대시보드" 메뉴 전환을 반영하지 못해 발생한 오류 수정
- `a072060` 버킷리스트 상태 변경(달성 체크 등) 시 대시보드 위젯들의 TanStack Query 캐시를 무효화해 즉시 동기화
- `cc959b1`/`042c77c` 패널 합성 단위 테스트 + Storybook 문서화

---

## 5. 프로필 배지 + 아바타 프리셋 (메인 화면)

[src/lib/avatar.ts](../../src/lib/avatar.ts) — `public/avatars/`에 10종 프리셋(고양이·강아지·여우·판다·부엉이·펭귄·초록공룡·회색로봇·마법사·우주비행사) 정의, `getRandomAvatarPath()` 제공.

- `503ab3c` 프리셋 이미지 10종 추가 (`public/avatars/*.png`)
- `d46f80e` 신규 가입 시 `getRandomAvatarPath()`로 랜덤 아바타 자동 배정
- `747d250` [src/api/user.ts](../../src/api/user.ts), `src/app/api/me/route.ts` — 내 정보(아바타/닉네임) 조회 API
- `15fd14d`/`69d607d` 메인 화면 좌상단 `ProfileBadge.tsx` 추가 + 단위 테스트
- `22ddc1d`/`e537662`/`9d8afb0` 목업 기준 디자인 · 반응형 · 로딩/에러 상태 보완 + Storybook

---

## 6. 프로필 설정 (`/profile` 인터셉트)

AD-17 패턴에 따라 모바일은 풀스크린, 데스크탑은 바텀시트로 오버레이된다.

- `src/app/(afterLogin)/@modal/(.)profile/page.tsx` + `ProfileModalClient.tsx` — 인터셉팅 라우트
- `src/app/(afterLogin)/profile/page.tsx` — 직접 진입(새로고침) 시 풀페이지 폴백
- `src/app/(afterLogin)/profile/_components/ProfileSettingsView.tsx` — `view / avatar / nickname` 3-모드 상태머신. TanStack Query로 현재 사용자 정보 조회 + mutation 성공 시 캐시 직접 갱신(`setQueryData`)

커밋: `d038e2f` (모달/페이지 골격)

### 아바타 변경
- `b4d98d8`/`b7da76a` [src/actions/user/actions.ts](../../src/actions/user/actions.ts) `updateAvatar` Server Action + 단위 테스트
- `89c6414`/`b4a9c37`/`5a5c95e`/`bae1bd6` `AvatarEditPanel.tsx` — 프리셋 10종 그리드 선택 UI + 컴포넌트/Provider 단위 테스트 + Storybook

### 닉네임 변경
- `2f72afa`/`285b7b1` `updateNickname` Server Action + 단위 테스트
- `362efe1`/`c125871`/`d376987`/`b1fea11` `NicknameEditPanel.tsx` — 입력 검증 + 에러 메시지 처리 + 컴포넌트/흐름 테스트 + Storybook

### 로그아웃 / 탈퇴
- `de5638b` 로그아웃 확인 모달 + 로그아웃 후 `/login` 리다이렉트
- `0b2d613` `deleteAccount` Server Action 연결, 탈퇴하기 버튼 동작 구현

---

## 7. 마무리 버그 수정 (QA 라운드)

- `bdf0f46` `/profile` 직접 새로고침 시 발생하던 `createContext` 오류 수정 — 클라이언트 Provider가 누락된 SSR 경로 케이스
- `a10019f`/`8b1190d` ProfileBadge 화면별 디자인/이미지 마진 보완
- `87aa0a2` UpcomingDeadlinesWidget에서 "오늘 마감"인 항목이 날짜 비교 오류로 목록에서 누락되던 문제 수정
- `e4a4624` 아바타 선택 버튼에 `aria-label` 접근성 라벨 추가
- `49881cc` MatrixSlidePanel — 카드 클릭 → 상세뷰 전환 시 race condition 수정

---

## 8. 교훈 / 참고

- AD-17(`docs/plan_spec.md`)은 대시보드/작성/프로필/친구 4곳에 공통 적용하는 오버레이 패턴 정의다. 이번 브랜치는 그중 **대시보드**와 **프로필** 두 항목을 구현했고, **친구**와 **작성 패널 통합**은 차기 브랜치 과제로 남아 있다.
- 위젯 4종 모두 "API route → `lib/bucketList/*` 순수 계산 함수 → 컴포넌트 → 테스트 → Storybook" 동일 구조로 작업해 일관성을 유지했다.
- 기능 구현 커밋들 뒤에 별도의 QA/버그 수정 묶음(§7)이 따라온다 — 인터셉팅 라우트 새로고침, 날짜 비교, race condition 등은 통합 후에야 드러나는 종류의 결함이라 향후 비슷한 인터셉팅 라우트/패널 작업 시 새로고침·연속 클릭 케이스를 미리 점검할 것.
