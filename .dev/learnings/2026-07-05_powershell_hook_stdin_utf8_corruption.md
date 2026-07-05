# PowerShell 훅 stdin 읽기 — 콘솔 코드페이지로 인한 한글 손상 (복구 불가)

> 작성일: 2026-07-05
> 브랜치: `fix/50-login-redirect-main`
> 결론: **`[Console]::In.ReadToEnd()`로 훅 stdin을 읽으면 안 됨 — 반드시 UTF-8 StreamReader로 명시 디코딩**

## 증상 / 문제

`.dev/session-logs/*.jsonl` 세션 로그 파일에서 한글이 포함된 프롬프트가 다음처럼 깨져 있었다:

```
?�재 ?�션?�서???�업?� ?��? ?�고 계획�??�워??HANDOFF.md???�성??거야
```

단순한 표시 인코딩 문제(뷰어가 잘못된 인코딩으로 렌더링)로 보였으나, 바이트를 직접 확인한 결과 실제로는 **파일에 저장된 바이트 자체가 손상**되어 있었다 — 즉 어떤 인코딩으로 다시 읽어도 복구 불가능한 상태.

## 원인 / 패턴

`.claude/hooks/log-prompt.ps1`, `log-tool.ps1`은 `.claude/settings.json`에서 `powershell -NoProfile -File ...` (Windows PowerShell 5.1)로 실행되며, 첫 줄이 다음과 같았다:

```powershell
$data = [Console]::In.ReadToEnd() | ConvertFrom-Json
```

`[Console]::In`은 `Console.InputEncoding`을 사용해 디코딩하는데, 이 값은 **OS 콘솔 코드페이지**(한글 Windows에서는 cp949)가 기본값이다. 반면 Claude Code가 훅에 넘기는 JSON 페이로드는 UTF-8이다.

UTF-8 바이트 스트림을 cp949로 잘못 디코딩하면, cp949로 매핑되지 않는 바이트 시퀀스는 cp949의 기본 대체 문자인 `?`(0x3F)로 치환된다. 이 치환은 **읽는 시점에 발생**하며 `ConvertFrom-Json`이 실행되기도 전에 이미 원본 정보가 사라진다 — 즉 로그 파일에 한 번 기록되면 복구할 방법이 없다.

바이트 덤프로 실제 확인한 예:
- `현재`의 UTF-8 인코딩 `ED 98 84 EC 9E AC` 중 `ED`가 `3F`로 치환되고 `98`은 통째로 유실 → `3F 84 EC 9E AC`로 저장됨

추가로, 읽기 쪽을 고친 뒤에도 쓰기 쪽(`Add-Content -Path $log`, 인코딩 미지정)이 시스템 기본 코드페이지(cp949)로 파일을 쓰고 있었다. 이 경우는 유효한 cp949 바이트라 정보 손실은 없지만, UTF-8을 기대하는 다른 도구(Read 도구, Notion 업로드 등)가 열면 다시 깨져 보인다.

## 배제한 가설

- 뷰어/에디터의 표시 인코딩 문제 — 바이트 덤프로 직접 확인해 배제 (실제 바이트가 손상됨)
- `known_issues.md`에 이미 있는 "PowerShell UTF-8 파일 쓰기 — BOM 함정"과 동일 이슈라고 생각했으나, 그건 쓰기 시 `System.Text.Encoding.UTF8`의 BOM 포함 문제이고, 이번 건은 **읽기 시점의 코드페이지 오디코딩**이 근본 원인이라는 점에서 다름 (쓰기 문제는 부가적으로 함께 발견됨)

## 결론 및 참고

두 지점 모두 인코딩을 명시해야 한다:

```powershell
# 읽기: 콘솔 코드페이지 대신 UTF-8 명시
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$reader = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), $utf8NoBom)
$data = $reader.ReadToEnd() | ConvertFrom-Json

# 쓰기: Add-Content 대신 AppendAllText + 명시적 인코딩
$json = $entry | ConvertTo-Json -Compress
[System.IO.File]::AppendAllText($log, "$json`n", $utf8NoBom)
```

`.claude/hooks/log-prompt.ps1`, `log-tool.ps1`에 적용 완료 (2026-07-05).

기존에 손상된 세션 로그(`2026-07-05_1003_develop.jsonl` 등 다수)는 복구 불가 — 재수집 불가능하므로 그대로 둔다.

**일반화**: PowerShell 훅이 Claude Code로부터 stdin으로 non-ASCII 페이로드를 받는 모든 곳(다른 훅 스크립트를 새로 작성할 때도)에 동일 패턴 적용 필요. 코드페이지가 cp949가 아닌 다른 로케일 환경에서도 `[Console]::In` / `Console.InputEncoding` 기본값이 UTF-8이 아닐 수 있으므로 항상 명시.

## 추가 발견 (2026-07-05, 같은 세션) — 세 번째 함정: `.ps1` 소스 파일 자체의 BOM

세션 로그 정리 훅(`cleanup-session-logs.ps1`)을 새로 만들면서 스크립트 안에 한글 문자열 리터럴(`"14일 지난 로그 ${n}개 삭제"`)을 하드코딩했는데, `[Console]::OpenStandardOutput()` + `StreamWriter(UTF8Encoding($false))`로 stdout에 직접 써도 여전히 깨졌다.

원인은 stdin/stdout이 아니라 **`.ps1` 파일 자체**였다: 파일을 BOM 없이 저장하면, Windows PowerShell 5.1이 스크립트를 파싱할 때 시스템 기본 코드페이지(cp949)로 소스 텍스트를 읽는다. 파일의 실제 바이트는 유효한 UTF-8(한글 리터럴 포함)인데, 이걸 cp949로 잘못 디코딩하면서 **문자열 리터럴 자체가 메모리에 로드되는 시점에 이미 깨진다** — 이후 아무리 stdout 인코딩을 신경 써도 소용없다.

```powershell
# 고치기 전: BOM 없는 UTF-8로 저장된 .ps1 → 한글 리터럴이 파싱 단계에서 깨짐
# 고치기: 파일 자체를 UTF-8 BOM 포함으로 재저장
$content = [System.IO.File]::ReadAllText($path, (New-Object System.Text.UTF8Encoding $false))
$utf8Bom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($path, $content, $utf8Bom)
```

**중요한 역설**: 이 프로젝트의 기존 규칙("PowerShell UTF-8 파일 쓰기 — BOM 함정")은 *데이터 파일*(JSON 등)에 BOM을 넣지 말라는 것이었다. 하지만 이건 **PowerShell이 직접 파싱하는 `.ps1` 소스 파일**의 경우라 반대로 BOM이 있어야 한다 — 데이터 파일과 스크립트 소스 파일은 규칙이 다르다.

**일반화**: 한글(또는 non-ASCII) 문자열 리터럴을 `.ps1` 파일에 직접 하드코딩해야 한다면, 그 파일은 UTF-8 BOM 포함으로 저장할 것. 반대로 그 스크립트가 만들어내는 데이터 파일(JSON, 로그 등)은 BOM 없이 저장할 것.
