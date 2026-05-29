---
description: 현재 브랜치 변경사항을 OWASP 기준으로 보안 감사하고 마크다운 보고서를 출력
---

현재 브랜치의 main 대비 변경사항을 `oh-my-claudecode:security-reviewer` 에이전트에 위임해 보안 감사한다. 파일 수정 없이 마크다운 보고서만 출력한다.

## 입력 형식

```
/security-review [집중 포인트(선택, 자유 텍스트)]
```

집중 포인트는 명령어 다음 줄에 bullet으로 나열한다.
없으면 OWASP Top 10 전체 기준으로 검사한다.

## 절차

1. **범위 수집**
   - 아래 명령을 실행해 컨텍스트를 수집한다:
     ```
     git rev-parse --abbrev-ref HEAD
     git log main..HEAD --oneline
     git diff main...HEAD --name-only
     git diff main...HEAD
     ```
   - 변경 커밋이 없으면 "main 대비 변경사항이 없습니다." 출력 후 종료.
   - diff가 250KB를 초과하면 `git diff main...HEAD --stat`으로 대체하고 에이전트에 "diff 생략됨" 명시.

2. **집중 포인트 확인**
   - 인자로 집중 포인트가 전달된 경우 → 그대로 3단계로 진행.
   - 인자가 없는 경우 → `AskUserQuestion` 도구로 묻기:
     - question: `추가로 집중해서 검사할 포인트가 있나요?`
     - header: `집중 포인트`
     - multiSelect: false
     - options:
       - `없음` — OWASP Top 10 전체 기준으로 검사
       - `직접 입력` — 다음 턴에 자유 텍스트로 입력받는다

3. **에이전트 위임** ← 집중 포인트 확인 직후 반드시 실행한다. 멈추지 말 것.
   - `oh-my-claudecode:security-reviewer` 에이전트에 아래 내용을 전달해 분석을 위임한다:

   ```
   프로젝트: c:\Users\user\Documents\LogLife (Next.js, TypeScript, Prisma, NextAuth)
   브랜치: {브랜치명}
   커밋 목록:
   {git log 결과}

   변경 파일:
   {git diff --name-only 결과}

   Diff:
   {git diff 결과 또는 "diff 생략됨 — --stat 결과: ..."}

   집중 포인트: {사용자 집중 포인트 또는 "없음 (전체 검사)"}

   ---

   위 변경사항을 보안 감사하라. 아래 지침을 따른다:

   검사 기준 (OWASP Top 10 포함):
   - 인증/인가: auth() 가드 누락, 권한 우회, JWT 취약점
   - 인젝션: SQL, 커맨드, XSS (dangerouslySetInnerHTML 등 unsafe 패턴만)
   - 비밀 정보: API 키 하드코딩, NEXT_PUBLIC_ 잘못된 접두사
   - 데이터 노출: 민감 정보 로그, PII 유출, API 응답 과다 노출
   - 암호화: 취약 알고리즘, 부적절한 키 관리

   허위 경보 필터링 — 아래는 보고 금지:
   - DoS, 레이트 리밋, 리소스 고갈
   - React/Angular 컴포넌트의 일반 XSS (unsafe 메서드 없을 시)
   - 클라이언트 사이드 인증 검사 누락 (서버에서 처리)
   - 이론적 취약점 (실제 공격 경로가 없는 것)
   - 테스트 파일 내 취약점
   - 아웃데이트 라이브러리 CVE

   confidence ≥ 8인 항목만 보고한다.

   출력 형식 (마크다운):
   # Vuln N: {카테고리}: `{파일:라인}`
   * Severity: High / Medium / Low
   * Description: ...
   * Exploit Scenario: ...
   * Recommendation: ...

   취약점이 없으면 "발견된 취약점 없음 (confidence ≥ 8 기준)" 한 줄만 출력.
   ```

4. **결과 출력**
   - 에이전트가 반환한 보고서를 그대로 출력한다.
   - 보고서 맨 앞에 한 줄 요약을 추가한다:
     `**보안 감사 완료** — 브랜치: {브랜치명} | High: N건 / Medium: N건 / Low: N건`

## 금지

- 파일 수정 금지 (보고서 출력만).
- `git push` 금지.
- 빌드/테스트/lint 부수 실행 금지.
- confidence < 8 항목 보고 금지.
