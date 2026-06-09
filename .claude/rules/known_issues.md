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
