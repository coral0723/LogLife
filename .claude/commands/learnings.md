---
description: 세션에서 배운 점을 .dev/learnings/에 기록하고 .claude/rules/에 컴팩트 룰로 반영
---

# /learnings

세션에서 새로 알게 된 패턴·버그·주의점을 `.dev/learnings/`에 상세 기록하고,
핵심만 추출해 `.claude/rules/`에 반영한다. git 트래킹으로 두 기기 자동 sync.

## 절차

### 1. 교훈 수집

현재 세션 대화 전체를 바탕으로 새로 발견한 패턴·버그·주의점을 추론해 사용자에게 제시한다.

```
이번 세션에서 기록할 만한 교훈:
- <추론한 교훈 1>
- <추론한 교훈 2>

추가할 내용이 있거나 수정이 필요하면 알려주세요.
```

없으면 사용자에게 직접 입력 요청.

### 2. 상세 파일 초안 작성

아래 형식으로 `.dev/learnings/YYYY-MM-DD_{snake_case_topic}.md` 초안을 작성한다.
오늘 날짜는 `date` 명령으로 확인.

```markdown
# {제목 — 증상 또는 패턴 한 줄 요약}

> 작성일: YYYY-MM-DD
> 브랜치: `<branch>`
> 결론: **<한 줄 결론>**

## 증상 / 문제
<발견한 상황>

## 원인 / 패턴
<실제 원인 또는 패턴>

## 배제한 가설
<있으면 기재, 없으면 섹션 삭제>

## 결론 및 참고
<적용 방법, 링크 등>
```

### 3. 컴팩트 요약 + 라우팅 결정

1-2줄 요약을 추출하고 아래 기준으로 저장 위치를 결정한다.

| 교훈 유형 | 저장 위치 |
|---|---|
| 버그·환경 사실·"이건 조사 불필요" | `.claude/rules/known_issues.md` append |
| 코딩 스타일·파일 구조 패턴 | `.claude/rules/code_style.md` append |
| 테스트 패턴 | `.claude/rules/testing_guide.md` append |
| 보안·인증 패턴 | `.claude/rules/security.md` append |
| 배포·빌드 주의사항 | `.claude/rules/deploy.md` append |

### 4. 초안 출력

상세 파일 전체 내용과 컴팩트 요약(목적지 포함)을 함께 출력한다.

### 5. 사용자 확인

`AskUserQuestion` 도구로 아래 질문을 한다.

- 질문: `위 내용으로 저장할까요?`
- 선택지:
  - `Yes` — 두 파일 모두 저장
  - `No` — 취소

### 6-A. Yes 선택 시

1. `Write` 도구로 `.dev/learnings/YYYY-MM-DD_{topic}.md` 저장
2. `Edit` 도구로 해당 `.claude/rules/*.md` 파일 끝에 컴팩트 요약 append
3. 아래 메시지 출력

```
저장 완료.
- .dev/learnings/YYYY-MM-DD_{topic}.md
- .claude/rules/{파일명}.md (컴팩트 요약 추가)

git commit 후 다른 기기에서 git pull 하면 동기화됩니다.
```

### 6-B. No 선택 시

```
learnings를 취소했습니다. 저장된 파일 없음.
```

## 금지

- `.env*` 파일 접근 금지
- auto-memory(`~/.claude/...`) 수정 금지 (크로스 디바이스 sync 불가)
- git commit 금지 (사용자가 직접)
- `.dev/learnings/` 외 다른 `.dev/` 파일 수정 금지
