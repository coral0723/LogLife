---
name: feedback-commands
description: 커스텀 명령(.claude/commands/) 관련 교훈
metadata:
  type: feedback
---

## 명령 버그는 해당 명령 파일을 직접 수정한다

어떤 커스텀 명령(`/commit`, `/pr`, `/handoff` 등)에서 동작 버그가 발견되면, `.claude/memory/`에 별도 파일을 만들지 말고 해당 `.claude/commands/*.md` 파일을 직접 수정한다.

**Why:** 메모리는 미래 세션의 참고 맥락일 뿐, 실행 흐름을 강제하지 못한다. 명령 파일을 직접 고쳐야 매번 호출 시 수정된 지시를 따른다.

**How to apply:** 명령 실행 중 버그 발견 → 해당 `.claude/commands/*.md` 열어서 문제 있는 단계 수정. 메모리 파일 신설 금지.

---

## /commit: AskUserQuestion "Yes" 후 반드시 커밋 실행

`AskUserQuestion`으로 "Yes" 응답을 받은 직후 즉시 `git commit`을 실행해야 한다. 응답 수신 후 멈추지 말 것.

**Why:** 스킬 컨텍스트가 AskUserQuestion 반환 후 종료된 것으로 오인하여 step 7을 건너뛰는 패턴이 반복됨 (2026-05-27).

**How to apply:** 이미 `commit.md` step 7에 "응답을 받은 즉시 실행, 멈추지 말 것" 명시 완료. 해당 파일이 근거.
