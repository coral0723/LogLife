# PreToolUse(Bash|PowerShell): 위험 명령 패턴 감지 시에만 차단. 클린 명령은 무출력(exit 0).
$reader = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), (New-Object System.Text.UTF8Encoding $false))
$raw = $reader.ReadToEnd()
try { $payload = $raw | ConvertFrom-Json } catch { exit 0 }
$cmd = if ($payload.tool_input.command) { $payload.tool_input.command } else { $payload.tool_input.Command }
if (-not $cmd) { exit 0 }

# cli_security.md 5개 카테고리 → 정규식 (설명, 패턴) 쌍
$rules = @(
  @('파괴적 삭제: 프로젝트 밖/루트 대상 rm -rf (따옴표·분리옵션·역순 옵션·롱플래그 포함)', 'rm\b(?=.*(?:^|\s)(-[a-zA-Z]*r|--recursive))(?=.*(?:^|\s)(-[a-zA-Z]*f|--force))\s+.*(?:^|\s)["''`]?(/|~|\.\.|[A-Za-z]:)'),
  @('파괴적 삭제: Remove-Item 및 별칭(rm/ri/del/erase/rd/rmdir) -Recurse -Force (git/node_modules 외)', '(Remove-Item|\b(rm|ri|del|erase|rd|rmdir)\b)(?!.*(node_modules|\.git))(?=.*(?:^|\s)-[Rr][a-zA-Z]*)(?=.*(?:^|\s)-[Ff][Oo][a-zA-Z]*)'),
  @('미커밋 작업물 전체 삭제', 'git\s+(clean\b(?=.*(?:^|\s)(-[a-zA-Z]*f|--force))|checkout\s+--\s+["''`]?\.|restore\s+["''`]?\.)'),
  @('DB 파괴', '(DROP\s+TABLE|DELETE\s+FROM.*WHERE\s+1\s*=\s*1|db\s+push\s+--force-reset)'),
  @('git 기록 파괴: force push', 'git\s+push\b.*((?:^|\s)-f\b|--force)'),
  @('git 기록 파괴: reset/rebase/filter', 'git\s+(reset\s+--hard|rebase\s+(-i\b|--interactive)|filter-branch|filter-repo)'),
  @('금지 플래그', '(--(no-verify|amend|no-gpg-sign)|git\s+commit\b.*(?:^|\s)-n\b)'),
  @('시크릿 출력: .env 파일', '(cat|type|Get-Content|gc)\s+[^|;]*\.env(?!\.example)'),
  @('시크릿 외부 전송', '(curl|Invoke-WebRequest|iwr|wget)\s+.*(\.env|DATABASE_URL|AUTH_SECRET)'),
  @('시스템 프로세스 종료 (node/next 제외)', '(taskkill|Stop-Process|spps|kill)\s+(?!.*(node|next))'),
  @('레지스트리/전역 패키지', '(reg\s+add|Set-ItemProperty\s+HKLM|(npm|pnpm)\s+(install|add)\b.*((?:^|\s)-g\b|--global))')
)
foreach ($r in $rules) {
  if ($cmd -match $r[1]) {
    $stderr = New-Object System.IO.StreamWriter([Console]::OpenStandardError(), (New-Object System.Text.UTF8Encoding $false))
    $stderr.Write("[cli-security] 차단: $($r[0]) — .claude/rules/cli_security.md 참조. 사용자에게 명시적 확인을 받은 경우에만 진행 방법을 안내할 것.")
    $stderr.Flush()
    exit 2
  }
}
exit 0
