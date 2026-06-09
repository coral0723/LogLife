# chore/15-harness-structure-optimization 작업 정리

> 작성일: 2026-06-09
> 베이스: `main` (ad0f5b9 — PR #14 merge 시점)
> 관련 이슈: #15 — 하네스 구조 최적화

## 1. 한눈에 보기

PR #14에서 정비된 폴더 구조를 바탕으로 **AI 하네스(CLAUDE.md · 규칙 파일 · 스킬 · 훅)를 일관성 있게 정비**한 브랜치다.
중복 제거, 신규 규칙 파일 추가, 스킬 토큰 최적화, Stop 훅 개선이 주요 작업이다.

### 커밋 스택 (base → HEAD)

| 커밋 | 내용 |
|---|---|
| 6927421 | docs: plan_spec.md를 실제 구현 결정에 맞게 갱신 |
| f04c70b | docs: Next.js 16 라우트 작성 규칙 문서 추가 |
| b6c3f54 | chore: .dev 폴더 구조 정리 및 PR 가이드 보강 |
| f6ff365 | docs: 메인·사용자 페이지 네비게이션 사양 갱신 |
| c70f040 | docs: 프로필 아바타 프리셋 방식으로 스펙 업데이트 |
| 7c3fc09 | docs: 규칙 파일 중복 제거 및 단일 출처 정리 |
| 927bfe4 | chore: 하네스 규칙 파일 보완 — 폴더 구조·테스트 위치·검증 지침 추가 |
| 4fd671e | chore: code_style.md에 globs 추가 |
| 066e44d | chore: 장시간 명령에 run_in_background 지침 추가 |
| 0f093b7 | chore: Stop 훅에 파일 수정 시 test/lint 권고 메시지 추가 |
| a3ddbe5 | chore: /learnings 스킬 및 known_issues 룰 파일 추가 |
| 2d88a33 | chore: 룰 파일에 globs frontmatter 추가 |
| 4ba8005 | chore: /e2e 스킬 토큰 최적화 |
| dff8edf | chore: /test 스킬 토큰 최적화 |
| 53b222c | docs: /test·/e2e 스킬 에이전트 중복 호출 최적화 교훈 기록 |

---

## 2. docs 갱신

### plan_spec.md

[plan_spec.md](../../docs/plan_spec.md) — 코드 구현 이후 실제 결정사항과 불일치하던 내용을 전반적으로 정렬.
ADR·기술 스택·페이지 사양 섹션을 현재 구현 기준으로 재작성했다.

### 페이지 사양 갱신 (네비게이션 · 아바타)

- 메인·사용자 페이지 하단 탭 네비게이션 UX 사양을 현재 동작에 맞게 수정
- 프로필 아바타: 사용자 업로드 방식 → 프리셋 이미지 선택 방식으로 변경
  - 이유: Supabase Storage 비용 0원 원칙 적용 (이미지 업로드 금지)

---

## 3. 하네스 규칙 파일 정비

### CLAUDE.md 구조 정리 (7c3fc09 · b6c3f54 · 066e44d)

[CLAUDE.md](../../CLAUDE.md)

- `.dev/` 폴더 설명을 "무엇을 저장하는가" 기준으로 재작성
  - `troubleshooting/` 폴더 항목 제거 (`.dev/` 구조에서 실제 삭제됨)
  - `work-logs/` 사용 기준 명시: 큰 기능에만, 작은 브랜치는 PR 본문 + `/changelog`로 충분
  - `scratchpad/` 정의 보강: "작업 종료 후 삭제, 비어 있는 게 정상"
- 산출물/검증 섹션에 `run_in_background: true` 지침 추가
  - 대상: `pnpm build`, `pnpm test`, `pnpm lint`
- 상황별 룰 참조 목록에 두 항목 추가:
  - 라우트/페이지 작성 시 → `nextjs16.md`
  - 디버깅·이상 증상 발견 시 → `known_issues.md`
- Goal-Driven Execution 예시에 "컴포넌트/함수 수정 후 pnpm test" 케이스 추가

### 규칙 파일 globs frontmatter (2d88a33 · 4fd671e)

모든 `.claude/rules/*.md` 파일에 `globs:` frontmatter를 추가해 IDE·OMC가 파일 범위를 인식하도록 했다.

| 파일 | globs |
|---|---|
| [code_style.md](.claude/rules/code_style.md) | `src/**/*.{ts,tsx}` 등 |
| [nextjs16.md](.claude/rules/nextjs16.md) | `app/**/*.{ts,tsx}` |
| [known_issues.md](.claude/rules/known_issues.md) | `app/**/*.{ts,tsx}` |
| [testing_guide.md](.claude/rules/testing_guide.md) | `**/__tests__/**`, `**/*.test.*` |
| [security.md](.claude/rules/security.md) | `src/app/api/**` 등 |

### 신규 규칙 파일: nextjs16.md (f04c70b)

[.claude/rules/nextjs16.md](.claude/rules/nextjs16.md)

Next.js 16 App Router에서 반복적으로 틀리는 패턴을 집약:
- `params` / `searchParams` / `cookies()` / `headers()` 전부 **async → await** 필수
- `proxy.ts` 사용 (`middleware` deprecated)
- `PageProps` / `LayoutProps` / `RouteContext` import 불필요 (`next typegen` 자동 생성)
- 작성 전 체크리스트 포함

### 신규 규칙 파일: known_issues.md (a3ddbe5)

[.claude/rules/known_issues.md](.claude/rules/known_issues.md)

이미 원인이 밝혀진 버그를 정리해 디버깅 중복 조사를 방지:
- **Next.js 16 dev 뒤로가기 하이드레이션 버그** (`#93413`)
  - 증상: `/main` 뒤로가기 시 StarField·GlobeView 고착
  - 앱 코드 버그 아님. 프로덕션 정상. F5로 우회.

---

## 4. /learnings 스킬 신설 (a3ddbe5)

[.claude/commands/learnings.md](.claude/commands/learnings.md)

세션에서 발견한 패턴·버그·주의점을 **이중 저장**하는 워크플로:

```
세션 종료 시:
  1. 교훈 수집 (대화 전체 분석)
  2. .dev/learnings/YYYY-MM-DD_{topic}.md — 상세 기록
  3. .claude/rules/*.md — 컴팩트 1-2줄 append (라우팅 기준 있음)
  4. AskUserQuestion으로 사용자 확인 후 저장
  5. git commit → 다른 기기에서 git pull 시 자동 sync
```

| 교훈 유형 | 저장 위치 |
|---|---|
| 버그·환경 사실 | `known_issues.md` |
| 코딩 스타일·구조 패턴 | `code_style.md` |
| 테스트 패턴 | `testing_guide.md` |
| 보안·인증 | `security.md` |
| 배포·빌드 주의 | `deploy.md` |

---

## 5. Stop 훅 개선 (0f093b7)

[.claude/hooks/stop-changelog-reminder.ps1](.claude/hooks/stop-changelog-reminder.ps1)

기존 changelog 미기록 커밋 알림에 **파일 수정 감지 후 test/lint 권고** 메시지를 추가:

- 오늘 날짜 session-log(`.dev/session-logs/YYYY-MM-DD_*.jsonl`) 에서 `type: file` 엔트리 탐색
- 파일 수정 이력이 있으면: `"pnpm test && pnpm lint 실행을 권장합니다."` 출력
- 세션 종료 시 자동 실행되므로 별도 호출 불필요

---

## 6. 스킬 토큰 최적화 (/test · /e2e)

두 스킬 모두 **에이전트에 파일 내용을 통째로 전달하던 패턴을 제거**하는 방향으로 최적화했다.

### /test 스킬 (dff8edf)

[.claude/commands/test.md](.claude/commands/test.md)

**Before**: test-engineer 에이전트 2회 호출
1. 케이스 도출 (파일 내용 포함해 전달)
2. 승인 후 파일 작성 (파일 내용 다시 전달)

**After**: test-engineer 에이전트 1회 호출
- 파일 **경로만** 전달 → 에이전트가 직접 Read
- 케이스 도출 → AskUserQuestion → 파일 작성을 에이전트 내부에서 일괄 처리

### /e2e 스킬 (4ba8005)

[.claude/commands/e2e.md](.claude/commands/e2e.md)

- 시나리오 도출: test-engineer 에이전트 위임 제거 → 스킬 자체가 직접 처리
- qa-tester 에이전트 호출 시: 파일 내용 대신 **파일 경로만** 전달

---

## 7. 교훈 / 주의사항

- **에이전트 파일 내용 전달 금지** — 파일이 크면 컨텍스트가 폭발. 항상 경로만 전달하고 에이전트가 Read하게 할 것.
  상세: [.dev/learnings/2026-06-09_skill_agent_call_optimization.md](.dev/learnings/2026-06-09_skill_agent_call_optimization.md)
- **known_issues.md 먼저 확인** — 디버깅 시작 전에 이미 원인이 밝혀진 증상인지 확인.
- **globs frontmatter** — 규칙 파일 신규 추가 시 항상 `globs:` 섹션 포함.
