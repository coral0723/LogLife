# PowerShell로 UTF-8 파일 편집 시 BOM 추가 및 git checkout 복원 함정

> 작성일: 2026-06-09
> 브랜치: `chore/15-harness-structure-optimization`
> 결론: **PowerShell 파일 쓰기는 NoBOM 인스턴스 필수, HEAD 복원은 restore --source=HEAD**

## 증상 / 문제

Edit 도구가 한국어 포함 `.md` 파일에서 `string not found` 오류를 반복 발생.
PowerShell `WriteAllText`로 우회했으나 첫 줄 `---`이 `--`로 손상되고 한국어가 깨짐.
`git checkout -- <file>`로 복원했으나 치환 내용이 사라지지 않아 혼란.

## 원인 / 패턴

1. **BOM 문제**: `[System.Text.Encoding]::UTF8`은 BOM 포함 인스턴스.
   `WriteAllText(path, text, Encoding.UTF8)`로 쓰면 파일 첫 3바이트에 BOM(`EF BB BF`) 추가.
   → git diff에 `﻿---` 표시, 이후 BOM 제거 시도 중 `---` → `--` 손상 발생.

2. **git checkout 복원 범위**: `git checkout -- <file>`은 워킹트리를 **인덱스(스테이지)**로 복원.
   스테이지에 이미 손상 버전이 올라가 있으면 복원해도 손상본이 남음.
   HEAD까지 완전 복원하려면 두 단계가 필요:
   ```
   git restore --source=HEAD -- <file>
   git restore --staged <file>
   ```

3. **Edit 도구 실패 원인**: Windows에서 한국어 UTF-8 파일 편집 시 Edit 도구가 string-not-found를 낼 수 있음 (인코딩 매칭 문제 추정). 재현 조건 불명확.

## 배제한 가설

- 파일 자체 인코딩 손상 — 아니었음, 원본은 UTF-8 NoBOM 정상
- `String.Replace`가 한국어 포함 패턴을 못 찾는다 — 아니었음, 인덱스 기준으로 정상 탐색됨

## 결론 및 참고

- PowerShell로 파일 쓸 때: `New-Object System.Text.UTF8Encoding $false` 사용 (NoBOM)
- git HEAD 완전 복원: `git restore --source=HEAD -- <file> && git restore --staged <file>`
- Edit 도구 실패 시 PowerShell 우회 가능하나 인코딩 인스턴스 주의
