---
description: E2E 시나리오 제안 → 사용자 승인 → 테스트 작성 → Playwright UI 자동 실행
---

지정한 페이지/기능의 E2E 테스트를 작성한다. 시나리오 목록을 먼저 제안하고 사용자가 선택한 항목만 작성한 뒤 Playwright UI 모드를 자동 실행한다.

## 입력 형식

```
/e2e [페이지 경로 또는 기능 설명]
```

경로/설명이 없으면 현재 브랜치명과 최근 커밋을 보고 대상을 추론한다.

## 절차

1. **대상 파악**
   - 인자가 있으면 해당 경로의 page.tsx와 관련 컴포넌트를 Read 도구로 읽는다.
   - 인자가 없으면 `git branch --show-current`와 `git log -5 --oneline`으로 최근 작업을 파악한다.
   - 이미 작성된 스펙이 있으면(`tests/e2e/specs/`) 내용을 읽어 중복 시나리오를 피한다.

2. **시나리오 제안 및 선택**
   - `oh-my-claudecode:test-engineer` 에이전트에 대상 파일 내용과 기존 스펙을 전달해 시나리오 도출을 위임한다.
   - `AskUserQuestion` 도구로 묻기:
     - question: `어떤 시나리오를 E2E로 테스트할까요? (복수 선택 가능)`
     - header: `E2E 시나리오`
     - multiSelect: true
     - options: 아래 기준으로 도출한 시나리오를 4개 이내로 제시
   - 시나리오가 4개를 넘으면 우선순위 높은 것만 추린다.

3. **분기 처리** ← AskUserQuestion 응답을 받은 즉시 이 단계를 반드시 실행한다.
   - 선택 항목이 0개이면 "시나리오를 선택하지 않아 취소합니다." 출력 후 종료.
   - 1개 이상 선택하면 4단계로 진행.

4. **스펙 파일 작성**
   - `oh-my-claudecode:qa-tester` 에이전트에 선택된 시나리오 목록, 관련 컴포넌트 내용, 저장 경로를 전달해 파일 작성을 위임한다.
   - 저장 위치: `tests/e2e/specs/<기능명>.spec.ts`
   - 기존 스펙 파일이 있으면 새 시나리오를 추가(Edit), 없으면 새 파일 생성(Write).
   - global.setup.ts에서 시드된 테스트 데이터(KR·JP 버킷리스트, 테스트 유저)를 활용한다.
   - `tests/e2e/setup/auth.setup.ts`가 저장한 `.auth/user.json`을 storageState로 쓰는 chromium 프로젝트에서 실행됨을 전제로 작성.

5. **Playwright UI 실행**
   - "테스트 파일 작성 완료. Playwright UI를 실행합니다." 출력.
   - `pnpm test:e2e:ui` 실행 — 브라우저 UI 창이 열리면 스킬 종료.
   - (서버가 없어도 playwright.config.ts의 webServer가 자동으로 포트 3001에 Next.js를 기동함.)

## 시나리오 도출 기준

- **golden path**: 페이지 진입 후 핵심 엘리먼트 노출 확인
- **빈 상태**: 데이터가 없는 사용자일 때 UI 확인
- **인터랙션**: 클릭/입력 → 결과 변화 확인
- **에러/로딩**: MSW로 제어 가능한 경우에만 포함

## 금지

- 사용자 승인 없이 파일 작성 금지.
- `tests/e2e/setup/` 폴더(인프라 파일) 수정 금지.
- Vitest로 E2E 테스트 작성 금지.
- `pnpm test:e2e` (headless) 자동 실행 금지 — UI 모드(`test:e2e:ui`)만 사용.
