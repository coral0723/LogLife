---
description: 현재 브랜치의 작업 내용을 work-log 형식으로 정리해 Notion BranchLog DB에 기록
---

# /branchlog

현재 브랜치에서 한 작업을 분석해 work-log 형식 문서 초안을 작성하고, 확인 후 Notion "BranchLog" DB에 페이지로 기록한다.

## 절차

### 1. 브랜치 정보 수집

- `git branch --show-current` → `<branch>`
- `<branch>` ∈ {`main`, `master`, `develop`} 이면 `정리할 작업 브랜치가 아닙니다.` 한 줄 출력 후 종료.
- base 결정: `<branch>`가 `develop`이면 `<base>`=`main`, 그 외(`feat/*`, `fix/*`, `chore/*`, `docs/*` 등)는 `<base>`=`develop`. (pr.md와 동일 로직)
- `git log <base>..HEAD --format="%h %s" --no-merges` — 0줄이면 `정리할 커밋 없음 (base=<base>)` 출력 후 종료.
- `git diff <base>...HEAD --stat` — 변경 파일 목록 확인.
- `git merge-base <base> HEAD` — 베이스 시점 해시.
- 이슈 번호: `<branch>`에 정규식 `^[a-z]+/(\d+)-` 매칭 → `<issueNo>` (매칭 안 되면 생략).
  - 매칭되면 `gh issue view <issueNo> --json title -q .title`로 이슈 제목 조회. 실패해도 재시도 없이 생략하고 진행.

### 2. 작업 정리 문서 초안 작성

`git diff <base>...HEAD`로 실제 변경 내용을 확인하며 아래 형식으로 작성한다 (기존 `.dev/work-logs/*.md`와 동일 구조):

```
# <branch> 작업 정리

> 작성일: YYYY-MM-DD
> 베이스: `<base>` (<merge-base-hash> 시점)
> 관련 이슈: #<issueNo> — <이슈 제목>

## 1. 한눈에 보기
(이 브랜치가 하는 일 1-3문단 요약)

### 커밋 스택 (`<base>` → HEAD)
| 커밋 | 내용 |
|---|---|
| <hash> | <message> |

### 변경 파일 요약
| 파일 | 종류 | 역할 |
|---|---|---|
| <path> | 신규/수정 | <역할> |

## 2. ~ N-1. 영역별 상세
(커밋을 의미 단위로 그룹화해 구현 패턴·구조·호출 관계 설명. 필요 시 호출 그래프를 코드블록으로 포함)

## N. 교훈 / 참고 / 알려진 한계
- <발견한 패턴, 제약, TODO>
```

- 추측 금지 — `git diff`/`git log`로 확인되지 않는 내용은 쓰지 않는다.
- 전체 초안을 출력한다.

### 3. 사용자 확인

`AskUserQuestion`:
- 질문: `위 내용으로 Notion BranchLog에 기록할까요?`
- 선택지: `Yes` / `수정 필요` (의견 반영 후 2번 재작성) / `취소`

### 4. 속성 값 결정

- **Tags**: `<branch>` prefix → `feat`/`fix`/`chore`/`refactor`/`docs`/`style`/`test` 중 하나.
- **Status**: `AskUserQuestion` — `진행중` / `완료`.
- **Date**: 오늘 날짜 (ISO). 기존 페이지가 있어도 이 실행 시점으로 갱신.
- **PR Link**: 비워둠 (사용자가 PR 생성 후 직접 작성).

### 5. Notion BranchLog DB 탐색

`mcp__claude_ai_Notion__notion-search`로 "BranchLog" 검색 → 검색된 데이터베이스를 `mcp__claude_ai_Notion__notion-fetch`로 조회해 data source URL(`collection://<id>`)을 확보 → `<dataSourceUrl>` / `<dataSourceId>`.

- 찾지 못하면:
  ```
  ⚠️ Notion에 "BranchLog" DB가 없습니다.
  ✈️ LogLife 페이지 하위에 Branch(제목) / Date / Tags / Status / PR Link 속성으로 먼저 생성해 주세요.
  ```
  종료.

### 6. 페이지 생성 또는 갱신

`mcp__claude_ai_Notion__notion-search`(`query`: `<branch>`, `data_source_url`: `<dataSourceUrl>`, `query_type`: `"internal"`)로 Branch == `<branch>`인 기존 페이지 검색.

**없으면 — 신규 생성**

`mcp__claude_ai_Notion__notion-create-pages`로 생성. `parent`: `{"type": "data_source_id", "data_source_id": "<dataSourceId>"}`

| 속성 | 값 | properties 키 형식 |
|---|---|---|
| Branch | `<branch>` | `"Branch": "<branch>"` (title) |
| Date | 오늘 | `"date:Date:start": "YYYY-MM-DD"` |
| Tags | 4번에서 결정한 값 | `"Tags": "[\"feat\"]"` (JSON 배열 문자열, multi_select) |
| Status | 4번에서 결정한 값 | `"Status": "진행중"` 또는 `"완료"` |

`content`는 7번 규칙에 따른 Notion-flavored Markdown 문자열.

**있으면 — 갱신**

`AskUserQuestion`: `이미 "<branch>" 기록이 있습니다. 본문을 덮어쓸까요?` — `덮어쓰기` / `취소`

- 덮어쓰기: `mcp__claude_ai_Notion__notion-update-page`(`command: "replace_content"`, `new_str`: 7번 규칙으로 작성한 새 본문, `allow_deleting_content: true`)로 본문 전체 교체.
- 이어서 같은 페이지에 `command: "update_properties"`로 Date(오늘) / Status(4번 값) 갱신, Tags는 기존 값과 합집합.

### 7. 본문 → Notion-flavored Markdown 변환 규칙

전체 `content`는 raw block JSON이 아닌 **하나의 Notion-flavored Markdown 문자열**이다.

1. 최상단에 2번 초안의 `>` 메타 인용구(작성일/베이스/관련 이슈)를 한 줄로 — 줄바꿈은 `<br>`로 표현.
2. 이후 `##` 단위로 섹션을 나눠 각각 `## 제목 {toggle="true"}` 헤딩으로 변환한다 (헤딩 자체가 토글이 됨).
3. 토글 본문은 탭 1단 들여쓰기 + 4-backtick(` ```` `) `markdown` 코드펜스로 감싼다. 내부는 해당 섹션의 `##` 다음 줄부터 다음 `##` 전까지(`###` 이하 포함) 원문 그대로. 4-backtick을 쓰는 이유: 섹션 본문에 3-backtick 코드펜스가 중첩될 수 있어서다.
4. 글자 수·블록 개수 제한 없음 — 완성된 문자열을 `notion-create-pages`(`content`) 또는 `notion-update-page`(`new_str`)에 그대로 전달.

예시:
`````
## 1. 한눈에 보기 {toggle="true"}
	````markdown
	이 브랜치는 ...

	### 커밋 스택
	| 커밋 | 내용 |
	|---|---|
	...
	````
`````

### 8. 완료 보고 (한 줄 + 요약)

```
✅ Notion BranchLog 기록 완료
- 브랜치: <branch>
- 페이지: <Notion 페이지 URL>
- 섹션: N개
```

## 금지

- `.env*` 파일 접근 금지.
- Notion DB ID / Page ID 추측 금지 — 검색으로 찾을 것.
- `git commit`, `git push`, PR 생성 금지.
- 빌드/테스트/lint 등 부수 작업 금지.
- 추측으로 작성하지 말 것 — `git diff`/`git log`로 확인된 내용만 기록.