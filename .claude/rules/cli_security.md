---
description: Bash·PowerShell 명령 실행 전 자동 주입되는 CLI 보안 규칙 (와일드카드 허용 환경)
---

# CLI 보안 규칙

`.claude/settings.json`이 `Bash(*)` / `PowerShell(*)` 와일드카드로 설정돼 있어 모든 셸 명령이 권한 프롬프트 없이 실행된다. 아래 유형은 **사용자 명시적 확인 없이 절대 실행 금지**.

## 파괴적 삭제

- `rm -rf`, `Remove-Item -Recurse -Force` — 프로젝트 루트 밖 경로 또는 `.git/`, `node_modules/` 이외 대상
- `git clean -fd`, `git checkout -- .`, `git restore .` — 미커밋 작업물 전체 삭제
- DB 직접 조작: `DROP TABLE`, `DELETE FROM ... WHERE 1=1`, Prisma `db push --force-reset`

## Git 기록 파괴

- `git push --force` / `--force-with-lease` — main·develop 브랜치 대상
- `git reset --hard` — 커밋 히스토리 되돌리기
- `git rebase -i`, `git filter-branch`, `git filter-repo` — 기록 재작성
- `git commit --amend` — 이미 push된 커밋 대상

## 비밀 정보 노출

- `cat .env*`, `type .env*`, `Get-Content .env*` — 환경 변수 파일 출력
- `echo $DATABASE_URL` 등 시크릿 값을 터미널에 직접 출력
- `git diff HEAD` 결과에 `.env` 변경이 포함된 경우 커밋 전 중단

## 외부로 데이터 전송

- `curl -d "$(cat .env)"`, `Invoke-WebRequest -Body` 등 민감 파일 내용을 외부 URL에 전송
- 프로젝트 파일을 파이프로 외부 서비스에 업로드하는 명령

## 시스템·프로세스 조작

- `taskkill`, `Stop-Process`, `kill -9` — Node/Next 개발 서버 외 시스템 프로세스 종료
- 레지스트리 수정: `reg add`, `Set-ItemProperty HKLM:\...`
- 시스템 전역 패키지 수정: `npm install -g`, `pnpm add -g` (프로젝트 외부 영향)
