---
name: PR 템플릿 양식
description: LogLife PR 템플릿 — Related Issue / Description / Screenshot / Notes 4섹션, 카테고리 그룹화
---

PR 본문 작성 시 아래 양식을 지킨다. 템플릿 파일은 `.github/PULL_REQUEST_TEMPLATE.md`.

**4섹션 구조 (순서·이모지 고정)**

```
## 📌 Related Issue
#N — 이슈 제목

## 🚀 Description
(카테고리 굵은 글씨 그룹 + bullet)

## 📸 Screenshot
(캡쳐할 항목 리스트 + "(작성자가 첨부)")

## 📢 Notes
(메이저 버전 변경·환경변수·후속 이슈·결정 사유 등 컨텍스트)
```

**제목**: `tag: 한국어 제목` (feat/fix/chore/docs 등, [[commit-message-format]]과 동일)

**Description 본문 규칙**
- 카테고리별 **굵은 글씨** subsection으로 그룹화 (예: `**데이터 모델**`, `**인증**`, `**라우트 보호**`).
- 각 그룹 안에 짧은 bullet 리스트. AI 특유의 장황한 설명·과도한 분해 금지.
- 파일 경로·식별자·플래그 등 구체값을 가능하면 한 줄에 함께 노출.

**Screenshot 본문 규칙**
- 어떤 장면을 캡쳐할지 항목으로 적고, 마지막에 `(작성자가 첨부)`로 닫는다.

**Notes 본문 규칙**
- 메이저 버전 변경(예: Next 16 / NextAuth v5 / Prisma v7)으로 기존 가이드와 다른 점.
- 환경변수·DB·외부 서비스 셋업 메모.
- 본 PR 범위 밖으로 미룬 후속 작업.

**Why:** [[issue-template-style]]과 동일한 톤(간결한 한국어·AI 느낌 배제)을 PR에도 적용. 사용자는 카테고리 그룹화 + 짧은 bullet 조합으로 알려준 PR 본문(2026-05-21 Issue #1 PR)을 자연스럽다고 수용함.

**How to apply:** "PR 작성해줘" / "PR 내용 채워줘" 류 요청 시 위 4섹션 골격으로 작성. 브랜치 커밋 로그를 훑어 카테고리 그룹을 도출한 뒤, 각 그룹 안에 핵심 변경을 한 줄씩 정리. 스크린샷이 필요하면 캡쳐 대상만 명시하고 작성자에게 첨부 요청.
