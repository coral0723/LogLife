# LogLife — Project Map

## Engineering Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"
- "Modify component/function" → "Run `pnpm test` after to verify existing tests still pass"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 어디서 무엇을 읽을지

### 🔵 작업 직전 항상
- 비즈니스 / 도메인 / ADR / 페이지 사양 → [docs/plan_spec.md](docs/plan_spec.md)
- 0원 운영 제약 → [docs/cost_constraint.md](docs/cost_constraint.md)
- **Next.js 16 / Prisma 7 / React 19** 코드 작성 시 → context7 MCP로 공식 문서 먼저 조회 (수동 prefix 불필요, 자동 적용)

### 🟢 상황별 룰 ([.claude/rules/](.claude/rules/))
- 코드 작성 시 → [code_style.md](.claude/rules/code_style.md)
- 테스트 작성/수정 시 → [testing_guide.md](.claude/rules/testing_guide.md)
- auth / api / .env 만질 때 → [security.md](.claude/rules/security.md)
- 배포 / next.config / Vercel 관련 → [deploy.md](.claude/rules/deploy.md)
- 라우트/페이지(page/layout/route.ts) 작성 시 → [nextjs16.md](.claude/rules/nextjs16.md)
- 디버깅·이상 증상 발견 시 → [known_issues.md](.claude/rules/known_issues.md)

### 🟣 AI 작업 흔적 ([.dev/](.dev/))
- 여러 커밋 · 복잡한 호출 관계가 얽힌 큰 기능의 구조 정리 → [work-logs/](.dev/work-logs/) (작은 브랜치는 PR 본문 + `/changelog`로 충분, 굳이 작성하지 않음)
- 새로 알게 된 패턴 · 주의점 · 재현하기 까다로웠던 오류 기록 → [learnings/](.dev/learnings/)
- 작업 중 임시 메모 (작업 종료 후 삭제 — 비어있는 게 정상 상태) → [scratchpad/](.dev/scratchpad/)

## 산출물 / 검증
- 빌드: `pnpm build`, 결과 `.next/` (정적 export 시 `out/`)
- 테스트: `pnpm test` (Vitest) — 인프라는 `tests/`. E2E는 Playwright
- Lint: `pnpm lint`
- 장시간 명령(`pnpm build` / `pnpm test` / `pnpm lint`)은 `run_in_background: true`로 실행

## 영구 금지
- `git add -A` / `git add .` (민감 파일 우회 위험)
- `--no-verify`, `--amend`, `--no-gpg-sign`
- `.env.example` 제외 `.env.*` 직접 수정
- API key에 `NEXT_PUBLIC_` 접두사
- OMC `ralph` / `ralplan` 스킬 추천 · 실행 (토큰 비용)
