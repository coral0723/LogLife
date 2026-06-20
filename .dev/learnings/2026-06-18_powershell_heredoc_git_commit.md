# git commit -m 에 PowerShell here-string 사용 시 @ 접두사 오염

> 작성일: 2026-06-18
> 브랜치: `feat/33-landing-login-ui`
> 결론: **Bash 도구에서 PowerShell `@'...'@` 문법 사용 금지 — POSIX sh가 `@`를 리터럴로 처리해 커밋 제목이 `@ feat:...`로 오염됨**

## 증상 / 문제

Bash 도구로 아래 명령 실행 시:
```bash
git commit -m @'
feat: 제목
- 본문
'@
```
커밋 제목이 `@ feat: 제목`으로 오염됨 (이번 세션 포함 2회 이상 반복).

## 원인 / 패턴

Bash 도구는 Git Bash(POSIX sh) 환경. `@'...'@`는 PowerShell here-string 문법이지만
POSIX sh는 이를 해석하지 않고 리터럴로 파싱:
- `@` → 리터럴 at sign
- `'...'` → 단일 인용 문자열
- `@` → 다시 리터럴 at sign

결과적으로 git에 전달되는 `-m` 인자가 `@\nfeat:...@` 형태가 돼 첫 줄이 `@`로 시작.

## 결론 및 참고

Bash 도구에서 멀티라인 커밋 메시지는 반드시 아래 둘 중 하나 사용:

```bash
# 방법 1: 이중 인용부호 (짧은 메시지)
git commit -m "feat: 제목

- 본문 1
- 본문 2"

# 방법 2: POSIX heredoc (권장)
git commit -m "$(cat <<'EOF'
feat: 제목

- 본문 1
- 본문 2
EOF
)"
```

PowerShell 도구 사용 시에는 `@'...'@` 사용 가능 (PowerShell 환경이므로 정상 파싱).
