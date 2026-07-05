$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$reader = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), $utf8NoBom)
$data = $reader.ReadToEnd() | ConvertFrom-Json

$branch = (git branch --show-current 2>$null) -replace '[/\\:]', '-'
$sid = $data.session_id.Substring(0, [Math]::Min(8, $data.session_id.Length))
$dir = ".dev/session-logs/$branch"
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

$log = "$dir/$(Get-Date -Format 'yyyy-MM-dd')_${sid}.jsonl"
$json = @{ts=(Get-Date -Format 'o'); type='prompt'; content=$data.prompt} | ConvertTo-Json -Compress
[System.IO.File]::AppendAllText($log, "$json`n", $utf8NoBom)
