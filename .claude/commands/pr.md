---
description: 현재 브랜치 커밋으로 LogLife PR 양식 초안 생성 (제목+본문 출력만, 생성은 사용자가)
---

현재 브랜치에서 한 작업을 모아 LogLife PR 양식(4섹션)에 맞춘 **제목과 본문 초안만 출력**한다. 토큰을 아끼는 게 우선이므로 아래 절차만 정확히 따른다. `gh pr create`, `git push`, 빌드/테스트/lint 등 부수 작업은 일체 금지.

## 절차

1. **현재 브랜치와 base 결정**
   - `git branch --show-current` 실행 → `<current>`.
   - `<current>` == `develop` 이면 `<base>` = `main`, 그 외(`feat/*`, `fix/*`, `chore/*`, `docs/*` 등)는 `<base>` = `develop`.
   - `<current>` 가 `main` 또는 `master` 면 `PR 만들 작업 브랜치가 아닙니다.` 한 줄만 출력하고 종료.

2. **Related Issue 번호 추출**
   - `<current>` 에 정규식 `^[a-z]+/(\d+)-` 매칭.
   - 매칭 성공이면 그룹1 = `<issueNo>`, 실패면 `<issueNo>` = `?` (본문에 `#?` 로 노출 → 작성자가 수정).

3. **커밋 수집**
   - `git log <base>..HEAD --format="%h %s%n%b---" --no-merges` 실행.
   - 출력 0줄이면 ``PR로 만들 커밋 없음 (base=`<base>`)`` 한 줄만 출력하고 종료.
   - 본문에 포함된 `Co-Authored-By:` 푸터는 분석에서 무시한다.

4. **양식 로드**
   - `docs/templates/pr_template.md` 를 Read 도구로 읽어 4섹션 구조와 톤 규칙 확인.
   - 섹션 헤더(이모지 포함)는 `.github/PULL_REQUEST_TEMPLATE.md` 원본을 그대로 사용.

5. **PR 제목 생성**
   - 형식: `tag: 한국어 제목` ([[commit-message-format]] 과 동일 태그 규칙: feat / fix / chore / docs / style / refactor).
   - tag 선택: ① 브랜치명 prefix(`feat/...` → `feat`) 우선, ② 없으면 수집된 커밋 중 다수 tag.
   - 한국어 제목은 브랜치 주제 한 줄 요약 (70자 이내, AI 장황체 금지).

6. **본문 생성 (4섹션 고정 순서)**

   ```
   ## 📌 Related Issue
   #<issueNo>

   ## 🚀 Description
   **<카테고리1>**
   - <핵심 변경 한 줄> (`경로/식별자` 노출)
   - ...

   **<카테고리2>**
   - ...

   ## 📸 Screenshot
   - <캡쳐할 장면>
   - ...

   (작성자가 첨부)

   ## 📢 Notes
   - <메이저 버전 / 환경변수 / 후속 작업 / 결정 사유 중 해당 항목만>
   ```

   - **카테고리 도출**: 커밋 제목·본문을 의미 단위로 묶는다 (예: "데이터 모델", "API 라우트", "UI 컴포넌트", "권한/설정"). 분류 애매해도 사용자에게 묻지 말고 가장 가까운 그룹에 넣는다.
   - **bullet 규칙**: 각 항목 한 줄, 파일 경로·식별자·플래그를 가능한 한 함께 노출. 과도한 분해 금지.
   - **Screenshot**: 명령형 한 줄 항목 + 마지막에 `(작성자가 첨부)` 한 줄. UI 변경 없는 PR이면 섹션 본문을 `- (해당 없음)` 한 줄로.
   - **Notes**: 환경변수 추가, 메이저 버전 차이(Next 16 / NextAuth v5 / Prisma v7 등), 본 PR 범위 밖 후속 작업이 있을 때만 bullet. 없으면 `- (해당 없음)`.

7. **출력**
   - 다음 형식 그대로 한 번에 출력하고 종료:

     ````
     base: <base> ← <current>  (이슈 #<issueNo>)

     ## 제목
     <생성한 제목>

     ## 본문
     ```markdown
     <4섹션 본문 전체>
     ```
     ````

   - 추가 안내 문구·`gh pr create` 예시 출력 금지 (work-log 제안 줄은 8번 절차에 따른 예외, gh pr create는 사용자가 GitHub 웹에서 직접 생성).

8. **work-log 작성 제안 (조건부, 한 줄)**
   - 6번에서 묶은 카테고리 수 ≥ 2 이고 3번에서 수집한 커밋 수 ≥ 5 이면, 출력 맨 끝에 한 줄만 덧붙인다:
     `📝 이 브랜치는 여러 영역에 걸친 큰 작업으로 보입니다 — PR 작성 후 .dev/work-logs/에 호출 그래프를 정리해두면 다음에 도움이 될 거예요.`
   - 조건 미충족 시 아무 것도 출력하지 않는다 (불필요한 안내로 토큰 낭비 금지).

## 금지

- `gh pr create`, `git push`, `git commit` 등 변경 작업 금지.
- 파일 쓰기 금지 (`PR_DRAFT.md` 같은 임시 파일도 만들지 말 것).
- 빌드/테스트/lint 부수 실행 금지.
- 카테고리 분류 애매하다고 사용자에게 묻지 말 것.
- 커밋 본문 불릿을 그대로 복붙하지 말 것 — 카테고리별로 통합·축약해 토큰 절약.
- `Co-Authored-By` 푸터를 본문에 포함하지 말 것.
