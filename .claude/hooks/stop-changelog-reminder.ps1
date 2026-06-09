$cursorFile = ".dev/changelog-cursor.txt"
$cursor = if (Test-Path $cursorFile) { (Get-Content $cursorFile -Raw).Trim() } else { "" }

$range = if ($cursor) { "$cursor..HEAD" } else { "HEAD" }
$newCommits = git log $range --oneline 2>$null | Where-Object { $_ -ne "" }

if ($newCommits) {
    $count = @($newCommits).Count
    Write-Output "[changelog reminder] $count unlogged commit(s) found. Run /changelog before closing the session."
}

# 이번 세션에 파일 수정이 있었으면 test + lint 권고
$today = Get-Date -Format 'yyyy-MM-dd'
$sessionLogs = Get-ChildItem ".dev/session-logs" -Filter "${today}_*.jsonl" -ErrorAction SilentlyContinue
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
