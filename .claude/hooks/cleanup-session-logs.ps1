# /sessionlog로 처리되지 않은 채 오래된 세션 로그를 자동 정리
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$retentionDays = 14
$root = ".dev/session-logs"
if (!(Test-Path $root)) { exit 0 }

$cutoff = (Get-Date).AddDays(-$retentionDays)
$deleted = 0

Get-ChildItem $root -Recurse -Filter "*.jsonl" -File | Where-Object { $_.LastWriteTime -lt $cutoff } | ForEach-Object {
    Remove-Item $_.FullName -Force
    $deleted++
}

Get-ChildItem $root -Directory | Where-Object { (Get-ChildItem $_.FullName -File -ErrorAction SilentlyContinue).Count -eq 0 } | Remove-Item -Force -Recurse

if ($deleted -gt 0) {
    $msg = "[session-log cleanup] ${retentionDays}일 지난 로그 ${deleted}개 삭제`n"
    $writer = New-Object System.IO.StreamWriter([Console]::OpenStandardOutput(), $utf8NoBom)
    $writer.Write($msg)
    $writer.Flush()
}
