---
description: 이미 원인이 밝혀진 버그 목록 (디버깅 전 확인)
globs:
  - "app/**/*.ts"
  - "app/**/*.tsx"
---

# Known Issues

디버깅 시 먼저 확인. 이미 원인이 밝혀진 증상은 재조사하지 않는다.

---

## Next.js 16 dev 뒤로가기 하이드레이션 버그

- **증상**: `/main` 뒤로가기 시 스피너 고착, StarField·GlobeView 안 보임
- **원인**: Next.js 16 dev 전용 회귀 — 뒤로가기 시 React 하이드레이션 미실행 (이슈 #93413)
- **판정**: 앱 코드 버그 아님. 프로덕션(`next build && next start`)에서는 정상.
- **대응**: dev에서는 F5. 코드 수정 불필요. Next 패치 시 자동 해소.
- **상세**: `.dev/learnings/backnav_spinner_dev_hydration.md`

---

## PowerShell UTF-8 파일 쓰기 — BOM 함정

- `System.Text.Encoding.UTF8`은 BOM 포함 인스턴스 → 항상 `New-Object System.Text.UTF8Encoding $false` 사용
- `git checkout -- <file>`: 워킹트리를 **인덱스**로 복원 (HEAD 아님). HEAD 완전 복원 = `git restore --source=HEAD -- <file> && git restore --staged <file>`
- Edit 도구가 한국어 파일에서 string-not-found 내면 PowerShell WriteAllText로 우회 (NoBOM 인스턴스 필수)
- **상세**: `.dev/learnings/2026-06-09_powershell_utf8_file_edit.md`

---

## Vitest unit 테스트 — phosphor-icons import 시 EMFILE (Windows)

- **증상**: phosphor-icons를 import하는 테스트 파일 4개 이상을 같은 배치로 실행하면 일부가 `EMFILE: too many open files`로 setup 단계 실패 (0 tests run)
- **원인**: `pool: 'vmThreads'` + `@phosphor-icons/react`의 ~1300개 dist 파일 — 동시 import 시 Windows 파일 핸들 한도 초과
- **판정**: Windows 로컬 환경 한정 이슈. 개별 파일은 항상 정상 통과. `fileParallelism: false` 등으로 고치면 전체 스위트에 플레이키니스 유발 (트레이드오프 나쁨 — 적용하지 않음)
- **대응**: 설정 변경 불필요. 영향받는 테스트 파일은 나눠서(2~3개씩) 실행
- **상세**: `.dev/learnings/2026-06-14_vitest_emfile_phosphor_icons.md`

---

## Bash 도구에서 git commit 멀티라인 메시지 — PowerShell here-string 금지

- **증상**: 커밋 제목 앞에 `@ ` 접두사가 붙음 (예: `@ feat: 제목`)
- **원인**: Bash 도구(POSIX sh)에서 PowerShell `@'...'@` here-string을 파싱하지 못하고 `@`를 리터럴로 처리
- **대응**: Bash 도구에서는 `git commit -m "$(cat <<'EOF'...EOF)"` 패턴 또는 이중 인용부호 사용. `@'...'@` 금지.
- **상세**: `.dev/learnings/2026-06-18_powershell_heredoc_git_commit.md`

---

## .github 폴더 하위 파일 삭제 시 상위 폴더 전체 삭제 금지

- **패턴**: `workflows/` 안 파일 하나 삭제 후 "빈 폴더 정리" 목적으로 `.github`에 `-Recurse` 적용 → `ISSUE_TEMPLATE`, `PULL_REQUEST_TEMPLATE.md`, `chromatic.yml` 전부 삭제됨
- **대응**: 파일 삭제는 항상 대상 파일 경로만 지정. 상위 폴더 삭제 전 `git ls-tree HEAD .github`로 내용물 확인 필수
- **복원**: `git checkout HEAD -- .github`
- **상세**: `.dev/learnings/2026-06-21_github_folder_recursive_delete.md`

---

## PowerShell 훅 stdin 읽기 — 콘솔 코드페이지로 한글 손상 (복구 불가)

- **증상**: `.claude/hooks/*.ps1`에서 `[Console]::In.ReadToEnd()`로 stdin을 읽으면 한글이 `?`로 치환되며 손상 — 단순 표시 문제가 아니라 바이트 자체가 유실되어 복구 불가
- **원인**: `powershell -NoProfile -File`(PS 5.1)의 `Console.InputEncoding` 기본값이 OS 콘솔 코드페이지(한글 Windows는 cp949) — Claude Code가 보내는 UTF-8 JSON을 cp949로 오디코딩하며 매핑 안 되는 바이트를 `?`로 대체
- **대응**: stdin은 `New-Object System.IO.StreamReader([Console]::OpenStandardInput(), (New-Object System.Text.UTF8Encoding $false))`로 명시 디코딩. 파일 쓰기도 `Add-Content` 대신 `[System.IO.File]::AppendAllText($path, $text, $utf8NoBom)`으로 명시 (위 BOM 함정 항목과 함께 적용)
- **추가 함정**: `.ps1` 파일에 한글 리터럴을 직접 하드코딩할 땐 반대로 **파일 자체를 UTF-8 BOM 포함으로 저장**해야 함 — BOM 없으면 PS 5.1이 소스 파싱 시 cp949로 오디코딩해 리터럴이 파싱 단계에서 깨짐 (데이터 파일 BOM 금지 규칙과는 별개)
- **일반화**: non-ASCII stdin을 받는 신규 PowerShell 훅 작성 시 항상 동일 패턴 적용. 훅 스크립트에 한글 문자열을 하드코딩해야 하면 그 `.ps1` 파일은 BOM 포함으로 저장
- **상세**: `.dev/learnings/2026-07-05_powershell_hook_stdin_utf8_corruption.md`
