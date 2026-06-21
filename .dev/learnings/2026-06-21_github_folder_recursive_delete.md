# .github 하위 파일 삭제 시 상위 폴더까지 삭제하는 실수

> 작성일: 2026-06-21
> 브랜치: `chore/deploy-prep`
> 결론: **특정 파일만 삭제할 때는 해당 파일 경로만 지정. 빈 폴더 정리를 위해 상위 디렉토리에 -Recurse 금지.**

## 증상 / 문제
`supabase-keepalive.yml` 하나를 삭제한 뒤, `workflows/` 폴더가 비었다는 이유로
`Remove-Item -Recurse .github`를 실행 → `.github/ISSUE_TEMPLATE/custom.md`,
`.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/chromatic.yml` 전부 삭제됨.

## 원인 / 패턴
- "빈 폴더 정리"를 목적으로 상위 디렉토리에 `-Recurse`를 적용
- `.github` 폴더에 다른 파일이 있는지 사전 확인 없이 삭제 진행

## 결론 및 참고
- 특정 파일 삭제 시 **반드시 해당 파일 경로만 지정** (`Remove-Item -Force "경로/파일명"`)
- 상위 폴더 삭제 전 `Get-ChildItem -Recurse` 또는 `git ls-tree`로 내용물 먼저 확인
- 복원: `git checkout HEAD -- .github`
