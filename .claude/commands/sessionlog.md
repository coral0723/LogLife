---
description: 세션 로그(JSONL)를 읽어 Notion "AI Agent Logs" DB에 기록
---

# /sessionlog

`.dev/session-logs/`에 훅이 쌓은 세션 로그를 Notion에 푸시한다.

## 금지

- Notion DB ID / Page ID를 추측하지 말 것 — 검색으로 찾아야 함
- JSONL에 없는 내용을 추가하거나 추측하지 말 것
- 세션 로그 파일을 수정하지 말 것

---

## 절차

### 1. 세션 로그 파일 선택

```powershell
Get-ChildItem .dev/session-logs -Filter "*.jsonl" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

- 파일이 1개면 자동 선택
- 2개 이상이면 목록을 출력하고 사용자에게 어느 파일을 푸시할지 확인

### 2. JSONL 파싱 및 집계

선택한 파일을 읽어 다음 3그룹으로 분류한다:

| 그룹 | 조건 |
|---|---|
| Prompts | `type == 'prompt'` |
| Files Modified | `type == 'file'` (action: write/edit) |
| Commands Run | `type == 'cmd'` |

### 3. Anomaly 감지

```bash
git diff main..HEAD --name-only
```

결과(브랜치에서 이미 수정된 파일 목록)를 구한다.
Files Modified 중 이 목록에 없는 파일 = **Anomaly 후보** (이번 세션에서 처음 건드린 파일).

### 4. 사용자 보완 입력 수집

아래 3가지만 묻는다. 없으면 `(해당 없음)`.

```
1. 이 세션의 한 줄 목표 — 무엇을 하려 했나요?
2. 태그 — feat / fix / refactor / debug / chore
3. PR 링크 — (없으면 공란)
```

### 5. Notion "AI Agent Logs" DB 탐색

`mcp__claude_ai_Notion__notion-search`로 "AI Agent Logs" DB를 검색한다.

- DB가 없으면 사용자에게 안내:
  ```
  ⚠️ Notion에 "AI Agent Logs" 데이터베이스가 없습니다.
  ✈️ LogLife 페이지 하위에 아래 속성으로 DB를 먼저 만들어 주세요:
  - Title (제목)
  - Branch (선택)
  - Date (날짜)
  - Tags (다중 선택: feat/fix/refactor/debug/chore)
  - Status (선택: 진행중/완료)
  - PR Link (URL)
  - Has Anomalies (체크박스)
  ```

### 6. Notion 페이지 생성

`mcp__claude_ai_Notion__notion-create-pages`로 "AI Agent Logs" DB에 신규 페이지 생성.

**Properties:**

| 필드 | 값 |
|---|---|
| Title | `{브랜치명} · {YYYY-MM-DD HH:MM}` (JSONL 첫 항목 ts 기준) |
| Branch | `git branch --show-current` |
| Date | JSONL 첫 항목 날짜 |
| Tags | 사용자 입력 |
| Status | 사용자 입력 (진행중/완료) |
| PR Link | 사용자 입력 |
| Has Anomalies | Anomaly 후보 존재 여부 (true/false) |

**본문 (4섹션):**

```markdown
## Prompts
1. {prompt 1}
2. {prompt 2}
...

## Files Modified
- **write** `{path}`
- **edit**  `{path}`
...

## Commands Run
{cmd 1}
{cmd 2}
...

## Anomalies
⚠️ `{path}` — 브랜치 히스토리에 없는 파일이 이 세션에서 수정됨
(없으면 "없음")
```

### 7. 완료 보고

```
✅ Notion 기록 완료
- 페이지: {Notion 페이지 URL}
- Prompts: N건 / Files: M건 / Commands: L건
- Anomalies: {건수 또는 "없음"}
```