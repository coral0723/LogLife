# 이번 세션에 파일 수정이 있었으면 test + lint 권고
$today = Get-Date -Format 'yyyy-MM-dd'
$sessionLogs = Get-ChildItem ".dev/session-logs" -Recurse -Filter "${today}_*.jsonl" -ErrorAction SilentlyContinue
$hasFileChanges = $false

foreach ($log in $sessionLogs) {
    $lines = Get-Content $log.FullName -ErrorAction SilentlyContinue
    foreach ($line in $lines) {
        try {
            $entry = $line | ConvertFrom-Json
            if ($entry.type -eq 'file') { $hasFileChanges = $true; break }
        } catch {}
    }
    if ($hasFileChanges) { break }
}

if ($hasFileChanges) {
    Write-Output "[test reminder] 이번 세션에 파일 수정이 있었습니다. pnpm test && pnpm lint 실행을 권장합니다."
}