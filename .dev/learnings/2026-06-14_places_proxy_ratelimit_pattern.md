# Google Places 프록시 + 공유 레이트 리밋 구현 패턴

> 작성일: 2026-06-14
> 브랜치: `feat/3-bucketlist-crud-create-page`
> 결론: **외부 API는 자체 Route Handler로 프록시하고, 연관된 엔드포인트는 같은 레이트 리밋 키로 묶어 합산 카운트한다**

## 패턴 / 구현

### app/api/places/autocomplete/route.ts
- 메서드: `POST` (Google v1 `places:autocomplete`가 POST)
- `auth()` 필수 → 미로그인 401
- 레이트 리밋: `places:${userId}` 키로 60초당 30회
- 입력 검증: `input` 길이 1-200, `sessionToken` 8-128, `languageCode` 기본 `ko`, `regionCode` 선택
- 응답 정규화: `{ suggestions: [{ placeId, text }] }` 형태로만 노출 (Google 원형 응답 그대로 전달 X)
- 에러 매핑: 키 미설정 500 / 잘못된 입력 400 / upstream 실패 502 / 레이트 리밋 429

### app/api/places/details/route.ts
- 메서드: `GET` (단건 조회)
- FieldMask: `id,displayName,location,addressComponents`만 요청 → 비용 최소화 (필드별 과금 모델)
- `normalize()`: addressComponents에서 country / admin1 / city를 뽑아 `NormalizedPlace`로 평탄화
  - `country.shortText` (ISO 2자리)
  - `admin1Code` = `administrative_area_level_1.shortText`
  - `cityName` = `locality.longText` 우선, 없으면 `sublocality_level_1.longText`
  - 필수값(`placeId`, `displayName`, `lat`, `lng`, `country`) 누락 시 502

### lib/rateLimit.ts
- 구현: `Map<key, number[]>` 기반 슬라이딩 윈도우
- 공유: autocomplete + details 라우트가 **같은 `places:${userId}` 키**로 합산 카운트 (한쪽 폭주가 다른 쪽도 차단)
- 제약: in-memory only — 서버 재시작 시 초기화, 멀티 인스턴스 환경에서 일관성 없음 (확장 시 Upstash Redis / Vercel KV로 이행)

### Session token (자동완성 비용 최적화)
- `crypto.randomUUID()`로 생성, 항목 선택 직후 새 토큰으로 회전 (Google 권장 — Autocomplete + 1회 Details까지 single transaction 과금)

## 결론 및 참고
- 외부 API 호출 순서 원칙: `auth()` → `checkRateLimit` → 외부 fetch → 응답 정규화 ([security.md](../../.claude/rules/security.md))
