---
description: 세션 로그(JSONL)를 읽어 Notion "SessionLog" DB에 기록
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

### 2. JSONL 파싱 — 챕터 묶기

선택한 파일을 읽어 `ts` 순으로 정렬한 뒤, 각 `prompt` 항목을 챕터 기준점으로 삼아 후속 액션을 묶는다:

```
chapters = []
current = null

for entry in ts_sorted_entries:
    if entry.type == 'prompt':
        if current: chapters.append(current)
        current = { prompt: entry.content, ts: entry.ts, actions: [] }
    elif entry.type in ['file', 'cmd']:
        if current:
            current.actions.append(entry)
        else:
            # 첫 프롬프트 이전 액션
            current = { prompt: '(프롬프트 이전 액션)', ts: entry.ts, actions: [entry] }

if current: chapters.append(current)
```

각 챕터는 **프롬프트 원문 전체** + 해당 프롬프트 이후 다음 프롬프트 전까지의 `file`/`cmd` 액션 목록으로 구성된다.

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

### 5. Notion "SessionLog" DB 탐색

`mcp__claude_ai_Notion__notion-search`로 "SessionLog" DB를 검색한다.

- DB가 없으면 사용자에게 안내:
  ```
  ⚠️ Notion에 "SessionLog" 데이터베이스가 없습니다.
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

`mcp__claude_ai_Notion__notion-create-pages`로 "SessionLog" DB에 신규 페이지 생성.

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

**본문:**

`## Session Flow` heading_2 블록 이후, 챕터마다 toggle 블록 1개:

```json
{
  "type": "toggle",
  "toggle": {
    "rich_text": [{ "type": "text", "text": { "content": "1. {prompt 원문}" } }],
    "children": [
      { "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [{ "type": "text", "text": { "content": "📝 edit: src/app/page.tsx" } }] } },
      { "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [{ "type": "text", "text": { "content": "⚡ PowerShell: git status" } }] } }
    ]
  }
}
```

- 파일 액션: `📝 {action}: {path}` (action = write / edit)
- 커맨드 액션: `⚡ {tool}: {cmd}`
- 액션이 없는 챕터: children에 `paragraph` 블록으로 `(액션 없음)` 표시
- 프롬프트가 2000자 초과 시: `rich_text` 배열에 2000자 단위로 분할해 이어붙임

Anomaly가 있으면 마지막에 `## Anomalies` heading_2 + bulleted_list_item으로 목록 추가:

```
⚠️ {path} — 브랜치 히스토리에 없는 파일이 이 세션에서 수정됨
```

### 7. 완료 보고

```
✅ Notion 기록 완료
- 페이지: {Notion 페이지 URL}
- 챕터: N개 / 총 액션: M건
- Anomalies: {건수 또는 "없음"}
```