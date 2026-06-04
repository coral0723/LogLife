---
description: git 커밋을 Notion ChangeLog DB에 날짜별로 기록
---

Notion ChangeLog DB에 오늘 날짜 페이지를 생성하거나 갱신한다.
토큰 절약 우선. 부수 작업(테스트, 빌드, 검증) 금지.

## 절차

### 1. 앵커 읽기

```powershell
Get-Content .dev/changelog-cursor.txt -ErrorAction SilentlyContinue
```

- 내용이 있으면 그 값이 `<since>` 해시.
- 파일이 없거나 비어 있으면 `<since>` = 빈 문자열 (전체 커밋 대상).

### 2. 신규 커밋 수집

- `<since>` 있음: `git log <since>..HEAD --format="%h %s" --no-merges`
- `<since>` 없음: `git log HEAD --format="%h %s" --no-merges`
- 결과가 0줄이면 "갱신할 커밋 없음"만 출력하고 종료.

### 3. 태그별 분류

| 태그 | 섹션 |
|---|---|
| feat | 추가 |
| fix | 수정 |
| refactor, style | 변경 |
| docs | 문서 |
| chore, build, ci, test | 기타 |
| (그 외) | 기타 |

### 4. Notion ChangeLog DB 탐색

`mcp__claude_ai_Notion__notion-search`로 "ChangeLog"를 검색한다.

- DB를 찾지 못하면:
  ```
  ⚠️ Notion에 "ChangeLog" DB가 없습니다.
  ✈️ LogLife 페이지 하위에 먼저 생성해 주세요.
  ```
  종료.

### 5. 오늘 날짜 페이지 처리

`mcp__notionApi__API-query-data-source`로 ChangeLog DB를 조회해
Title == 오늘(YYYY-MM-DD)인 페이지를 찾는다.

**없으면 — 신규 생성**
`mcp__claude_ai_Notion__notion-create-pages`로 생성.

Properties:
| 필드 | 값 |
|---|---|
| Title | YYYY-MM-DD |
| Date | 오늘 ISO 날짜 |
| Sections | 등장한 섹션 multi-select |
| Commits | 커밋 건수 |

본문 형식:
```
### 추가
- 인증 추가 (abc1234)

### 수정
- 핀 클릭 버그 수정 (def5678)
```

**있으면 — 갱신**
`mcp__notionApi__API-patch-block-children`으로 새 섹션 블록을 본문 끝에 append.
`mcp__notionApi__API-patch-page`로 Sections(합집합), Commits(누적 합) 속성 갱신.

### 6. 앵커 갱신

```powershell
git rev-parse --short HEAD | Set-Content .dev/changelog-cursor.txt -NoNewline
```

### 7. 보고 (한 줄)

예: `갱신 완료: 5건 추가 (추가 2, 수정 1, 기타 2) → Notion ChangeLog`

## 금지

- CHANGELOG.md 수정/생성 금지.
- 커밋/푸시 금지.
- 커밋 본문 불릿 사용 금지 (제목만).
- 분류 애매 시 사용자에게 묻지 말고 기타로 처리.