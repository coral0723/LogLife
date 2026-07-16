# 이번 세션에 파일 수정이 있었으면 수정 경로 패턴에 따라 리뷰 스킬 권고
$stdout = New-Object System.IO.StreamWriter([Console]::OpenStandardOutput(), (New-Object System.Text.UTF8Encoding $false))
$today = Get-Date -Format 'yyyy-MM-dd'
$sessionLogs = Get-ChildItem ".dev/session-logs" -Recurse -Filter "${today}_*.jsonl" -ErrorAction SilentlyContinue
$changedPaths = @()

foreach ($log in $sessionLogs) {
    $lines = Get-Content $log.FullName -ErrorAction SilentlyContinue
    foreach ($line in $lines) {
        try {
            $entry = $line | ConvertFrom-Json
            if ($entry.type -eq 'file' -and $entry.path) { $changedPaths += $entry.path }
        } catch {}
    }
}

if ($changedPaths.Count -eq 0) { exit 0 }

$messages = @()
if ($changedPaths -match '(src[\\/]app[\\/]api|auth)') {
    $messages += "[review reminder] auth/api 변경 감지 — /security-review 권장"
}
if ($changedPaths -match '(_components|src[\\/]components|src[\\/]lib)') {
    $messages += "[review reminder] 컴포넌트·lib 변경 감지 — /test, /e2e 권장"
}
$messages += "[test reminder] 이번 세션에 파일 수정이 있었습니다. pnpm test && pnpm lint 실행을 권장합니다."
$messages += "[review reminder] /quality-review 권장"

$messages | ForEach-Object { $stdout.WriteLine($_) }
$stdout.Flush()