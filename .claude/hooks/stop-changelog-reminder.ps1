$cursorFile = ".dev/changelog-cursor.txt"
$cursor = if (Test-Path $cursorFile) { (Get-Content $cursorFile -Raw).Trim() } else { "" }

$range = if ($cursor) { "$cursor..HEAD" } else { "HEAD" }
$newCommits = git log $range --oneline 2>$null | Where-Object { $_ -ne "" }

if ($newCommits) {
    $count = @($newCommits).Count
    Write-Output "[changelog reminder] $count unlogged commit(s) found. Run /changelog before closing the session."
}
