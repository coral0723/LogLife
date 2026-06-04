$data = [Console]::In.ReadToEnd() | ConvertFrom-Json
$branch = (git branch --show-current 2>$null) -replace '[/\\:]', '-'
$dir = ".dev/session-logs"
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

# 세션 내에서 동일한 파일명 유지 (당일 기준)
$sessionFile = "$dir/.session"
if ((Test-Path $sessionFile) -and ((Get-Item $sessionFile).LastWriteTime.Date -eq (Get-Date).Date)) {
    $sid = Get-Content $sessionFile -Raw
} else {
    $sid = Get-Date -Format 'HHmm'
    $sid | Set-Content $sessionFile -NoNewline
}

$log = "$dir/$(Get-Date -Format 'yyyy-MM-dd')_${sid}_${branch}.jsonl"
@{ts=(Get-Date -Format 'o'); type='prompt'; content=$data.prompt} |
    ConvertTo-Json -Compress | Add-Content -Path $log