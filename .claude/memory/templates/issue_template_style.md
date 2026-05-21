---
name: issue-template-style
description: "LogLife 이슈 템플릿 작성 양식 — 간결한 한국어, AI 느낌 배제, Todo는 5개 내외의 구체적 액션"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4f28b335-d43f-4c67-a6f6-7ae678fdc882
---

이슈 템플릿 작성 시 아래 양식을 지킨다.

**형식**
- 제목: `tag: 한국어 제목` (feat/fix/chore/docs 등, [[commit-message-format]]과 동일 태그 규칙)
- `## Issue 📌` 본문: 2~3줄, 무엇을/왜를 간결히. ADR 번호·Next.js 16 주의사항 같은 메타 설명은 넣지 않는다
- `## Todo ✔️` 본문: 체크박스 5개 내외, 각 항목은 한 줄의 구체적 액션(파일 경로·명령어 포함 권장)

**Why:** 사용자가 직접 보여준 예전 이슈 템플릿(Category/Todo 모델 정의 이슈)이 이 톤. AI 특유의 장황한 설명·과도한 Todo 분해·메타 설명(관련 ADR, 주의사항 블록)을 싫어한다.

**How to apply:** "이슈 템플릿 작성해줘" 류 요청 시 이 양식 사용. Todo는 작업 단위로 묶어 5개 내외로 압축하고, 한 줄 안에 핵심 동작 + 대상 파일/명령어가 보이도록 작성.
