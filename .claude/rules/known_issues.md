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
