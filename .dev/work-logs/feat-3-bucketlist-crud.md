# feat/3-bucketlist-crud-create-page 작업 정리

> 작성일: 2026-05-22
> 베이스: `main` (8362234 시점)
> 관련 이슈: #3 — 버킷리스트 작성 페이지 + Places Autocomplete 연동

## 1. 한눈에 보기

이 브랜치는 **버킷리스트 작성(C)** 흐름의 첫 수직 슬라이스다. 
폼 → 위치 자동완성 → 서버 액션 → DB 저장까지 이어진다. 
R/U/D 액션 함수는 같은 파일에 미리 만들어 뒀지만 UI는 아직 Create만 있다.

### 커밋 스택 (`main` → HEAD)

| 커밋 | 내용 |
|---|---|
| 3801cf6 | chore: pnpm/git/prisma 명령 권한 허용 목록 추가 |
| 7a129b7 | feat: 버킷리스트 CRUD Server Action + Zod 스키마 |
| 5109b76 | feat: Places Autocomplete 서버 프록시 라우트 |
| 57a0109 | feat: Places Details 라우트 + 공유 레이트 리밋 |
| 972207c | feat: Places Autocomplete 클라이언트 컴포넌트 |
| 8259621 | feat: 버킷리스트 작성 페이지 + 자동완성 UX 보완 |
| 8362234 | chore: Prisma config가 `.env.local`을 읽도록 수정 |

### 변경 파일 요약

| 파일 | 종류 | 역할 |
|---|---|---|
| [app/(app)/create/page.tsx](../../app/(app)/create/page.tsx) | 신규 (RSC) | 작성 페이지 라우트, 인증 가드 |
| [app/(app)/create/CreateForm.tsx](../../app/(app)/create/CreateForm.tsx) | 신규 (CC) | 폼 상태 + Server Action 호출 |
| [app/(app)/create/actions.ts](../../app/(app)/create/actions.ts) | 신규 (Server Action) | 버킷리스트 CRUD + 캐시 무효화 |
| [components/PlacesAutocomplete.tsx](../../components/PlacesAutocomplete.tsx) | 신규 (CC) | 자동완성 입력 + 키보드 a11y |
| [app/api/places/autocomplete/route.ts](../../app/api/places/autocomplete/route.ts) | 신규 (Route Handler) | Google `places:autocomplete` 프록시 |
| [app/api/places/details/route.ts](../../app/api/places/details/route.ts) | 신규 (Route Handler) | Google Place Details 프록시 + 정규화 |
| [lib/rateLimit.ts](../../lib/rateLimit.ts) | 신규 | in-memory 슬라이딩 윈도우 레이트 리밋 |
| [.env.example](../../.env.example) | 수정 | `GOOGLE_MAPS_API_KEY` → `GOOGLE_PLACES_API_KEY` |
| [prisma.config.ts](../../prisma.config.ts) | 수정 | `.env` → `.env.local` 로드 |
| [package.json](../../package.json) | 수정 | `zod` 추가 |
| [.claude/settings.json](../../.claude/settings.json) | 수정 | 도구 권한 허용 목록 확장 |

## 2. 호출 그래프

```
[브라우저]
  └─ /create  (RSC: page.tsx)
       └─ <CreateBucketListForm>  (CC: CreateForm.tsx)
            ├─ 폼 입력 (제목/내용/마감/난이도/설레임/공개범위)
            ├─ <PlacesAutocomplete>  (CC: components/PlacesAutocomplete.tsx)
            │    ├─ debounce 300ms 후 fetch
            │    │    └─ POST /api/places/autocomplete  → Google Places API (Autocomplete)
            │    └─ 항목 선택 시 fetch
            │         └─ GET /api/places/details        → Google Places API (Place Details)
            │              └─ 좌표/국가/행정구역 정규화 후 반환
            └─ 제출 → startTransition()
                 └─ createBucketList(input)  (Server Action: actions.ts)
                      ├─ auth() 검증
                      ├─ Zod parse
                      ├─ prisma.bucketList.create
                      ├─ updateTag(`bucketlist:user:${userId}`)
                      ├─ revalidatePath("/")
                      └─ router.push("/")
```

## 3. 파일별 상세

### `app/(app)/create/page.tsx`

- **역할**: 작성 페이지 진입점. Server Component.
- **인증 가드**: `auth()` 호출 후 세션이 없으면 `/login`으로 redirect.
- **렌더**: 제목 + `<CreateBucketListForm />` 만 포함. 폼 상태는 클라이언트에 위임.

### `app/(app)/create/CreateForm.tsx`

- **역할**: 폼 상태와 제출 흐름을 담당하는 Client Component.
- **위치 데이터**: `useState<NormalizedPlace | null>`로 보관, `<PlacesAutocomplete onSelect={setPlace} />` 콜백으로 주입.
- **제출**: `useTransition`으로 비동기 처리. `createBucketList`를 직접 호출 (fetch 불필요 — Server Action 특성).
- **에러**: `try/catch`로 받아 `<p role="alert">`에 표시.
- **성공 시**: `router.push("/")`로 홈 이동 (홈은 아직 미구현 → 빈 페이지).

### `app/(app)/create/actions.ts`

```
"use server" 파일. 4개 함수 export.
```

| 함수 | 역할 | 캐시 처리 |
|---|---|---|
| `createBucketList` | 생성. `{ id, shareToken }` 반환 | `updateTag` + `revalidatePath("/")` |
| `updateBucketList` | `updateMany(where: { id, userId })`로 본인 데이터만 수정 | `updateTag` + `revalidatePath("/")` |
| `deleteBucketList` | `deleteMany(where: { id, userId })`로 본인 데이터만 삭제 | `updateTag` + `revalidatePath("/")` |
| `toggleAchieved` | `achieved` 토글 + `achievedAt` 동기화 | `updateTag` + `revalidatePath("/")` |

- **공통 가드**: `requireUserId()` 헬퍼가 세션 검증.
- **Zod 스키마**: `bucketListInputSchema`로 모든 입력값 검증 (좌표 범위, 문자열 길이, `Visibility` enum 등).
- **권한 모델**: `updateMany/deleteMany + where: { id, userId }`로 **타 유저 데이터 변경 차단**. (id 추측만으론 못 건드림)
- **태그 네이밍**: `bucketlist:user:${userId}` — 유저 단위로 묶어 무효화.

### `components/PlacesAutocomplete.tsx`

- **목적**: Google Places 비용 최적화를 위한 **session token 기반 자동완성**.
- **session token**: `crypto.randomUUID()`로 생성, 항목 선택 직후 새 토큰으로 회전 (Google 권장 — Autocomplete + 1회 Details까지 single transaction 과금).
- **debounce**: 300ms. `useEffect` 안에서 `setTimeout` + `AbortController`로 진행 중인 요청 취소.
- **`skipNextFetchRef`**: 항목 선택 시 input 텍스트가 변경되는데, 그게 새 검색을 트리거하지 않도록 차단.
- **키보드 a11y**: `role="combobox"` / `role="listbox"` / `aria-activedescendant`, ↑↓ Enter Esc 처리.
- **TanStack Query를 안 쓰는 이유**: 단일 진입 컴포넌트이고 debounce+cancel만 필요해서 직접 처리가 더 가벼움. 추후 친구 페이지/Globe 같은 다중 쿼리 화면 들어갈 때 도입 예정.

### `app/api/places/autocomplete/route.ts`

- **메서드**: `POST` (Google v1 `places:autocomplete`가 POST).
- **권한**: `auth()` 필수 → 미로그인 401.
- **레이트 리밋**: `places:${userId}` 키로 60초당 30회.
- **입력 검증**: `input` 길이 1-200, `sessionToken` 8-128, `languageCode` 기본 `ko`, `regionCode` 선택.
- **응답 정규화**: `{ suggestions: [{ placeId, text }] }` 형태로만 노출 (Google 원형 응답 그대로 전달 X).
- **에러 매핑**: 키 미설정 500 / 잘못된 입력 400 / upstream 실패 502 / 레이트 리밋 429.

### `app/api/places/details/route.ts`

- **메서드**: `GET` (단건 조회).
- **FieldMask**: `id,displayName,location,addressComponents`만 요청 → 비용 최소화 (필드별 과금 모델).
- **`normalize()`**: addressComponents에서 country / admin1 / city를 뽑아 `NormalizedPlace`로 평탄화.
  - `country.shortText` (ISO 2자리)
  - `admin1Code` = `administrative_area_level_1.shortText`
  - `cityName` = `locality.longText` 우선, 없으면 `sublocality_level_1.longText`
  - 필수값(`placeId`, `displayName`, `lat`, `lng`, `country`) 누락 시 502.
- **저장될 형태**: 이 normalize 결과가 `BucketList`의 위치 컬럼 그대로 들어감 (AD-03 정합).

### `lib/rateLimit.ts`

- **구현**: `Map<key, number[]>` 기반 슬라이딩 윈도우.
- **공유**: autocomplete + details 라우트가 **같은 `places:${userId}` 키**로 합산 카운트. (한쪽 폭주가 다른 쪽도 차단)
- **제약**:
  - **in-memory only** — 서버 재시작 시 초기화, **멀티 인스턴스 환경에서 일관성 없음**.
  - 만료된 타임스탬프를 자동 정리하지 않아 idle 키가 메모리에 쌓일 수 있음 (현재 규모에선 무시 가능).

### `prisma.config.ts`

- `.env` → `.env.local`로 변경. 로컬 개발/스튜디오가 Next.js와 같은 환경변수를 사용하도록 통일.

## 4. 데이터 흐름

```
[유저 입력]
   ↓
[CreateBucketListForm 상태]
   - title, description, deadlineAt, difficulty, excitement, visibility
   - place: NormalizedPlace | null
   ↓ 제출
[createBucketList(input)]
   ↓ Zod parse
[bucketListInputSchema]
   - 위치 필드: placeId, lat, lng, countryCode, admin1Code, cityName, displayName
   - 메타: title, description, visibility, deadlineAt, difficulty, excitement
   ↓
[prisma.bucketList.create]
   ↓
[updateTag(`bucketlist:user:${userId}`) + revalidatePath("/")]
   ↓
[홈으로 redirect]
```

## 5. 현재 구조 vs 향후 변경 예정

### 5-1. 캐시 무효화는 "선제 코드" 상태

지금 `updateTag(...)`는 호출되지만 **`cacheTag(...)`로 태그를 붙인 캐시 함수가 아직 없다.** 즉 실효는 옆에 있는 `revalidatePath("/")`뿐이다.

→ 홈/목록 페이지를 구현할 때 `"use cache" + cacheTag('bucketlist:user:...')` 패턴으로 캐시를 도입하면 비로소 의미를 갖게 된다. AD-11 흐름:

```ts
async function getMyBucketLists(userId: string) {
  "use cache";
  cacheTag(`bucketlist:user:${userId}`);
  return prisma.bucketList.findMany({ where: { userId } });
}
```

전제: `next.config.ts`에 `cacheComponents: true` 플래그 필요.

### 5-2. 레이트 리밋은 단일 인스턴스 한정

[lib/rateLimit.ts](../../lib/rateLimit.ts)는 in-memory. 배포가 멀티 인스턴스로 확장되면 Upstash Redis / Vercel KV 등으로 이행해야 한다. v1 무료 운영 범위에선 충분.

### 5-3. TanStack Query 도입 시점

- 현재: 자동완성 한 곳만 fetch가 필요해서 직접 처리.
- 도입 예정 화면: 친구 페이지 위젯 (AD-15), Globe 동적 핀, 옵티미스틱 달성 토글.
- 패턴: 서버 컴포넌트가 초기 데이터를 박아 보내고 → 클라이언트가 `HydrationBoundary`로 이어받기.

### 5-4. R/U/D UI 미구현

`actions.ts`에 `updateBucketList`, `deleteBucketList`, `toggleAchieved`는 만들어 뒀지만 호출하는 UI가 아직 없다. 다음 작업:
- 목록/카드 컴포넌트 (홈)
- 카드 상세 (Parallel + Intercepting Route, AD-13)
- 카드 내부 달성 토글 / 수정 모달 / 삭제 버튼

### 5-5. 폼 UX 보완 여지

- 위치 미선택 시 클라이언트 에러만 표시 — 서버 에러 메시지도 동일하게 노출되지만, 폼 필드 옆에 인라인 에러를 붙이려면 `useActionState` 패턴으로 마이그레이션 고려.
- 마감일은 `<input type="date">` — 모바일 PWA에서 네이티브 피커 의존. v1 OK.
- `defaultValue="PUBLIC"`은 비용 0원·"공유 중심" 컨셉과 맞물려 의도된 선택. PRIVATE 기본으로 바꿀지 추후 합의 필요.

## 6. 환경 변수 / 의존성

### 새로 필요한 ENV

| 키 | 위치 | 용도 |
|---|---|---|
| `GOOGLE_PLACES_API_KEY` | `.env.local` (서버 전용) | Places Autocomplete / Details 호출 |

> 기존 `GOOGLE_MAPS_API_KEY`는 [.env.example](../../.env.example)에서 제거. **`NEXT_PUBLIC_` 접두어 금지** (브라우저 노출 시 키 도용 위험).

### 새 패키지

- `zod ^4.4.3` — Server Action 입력 검증 / Route Handler 쿼리 검증.

## 7. 알려진 한계 / TODO

- [ ] 홈/목록 페이지 미구현 → `revalidatePath("/")`의 효과를 확인할 수 없음.
- [ ] `cacheTag` 적용 전이라 `updateTag`는 사실상 no-op.
- [ ] `updateBucketList` / `deleteBucketList` / `toggleAchieved`를 호출하는 UI 없음.
- [ ] 레이트 리밋이 in-memory — 멀티 인스턴스에서 부정확.
- [ ] Places API 실패 시 사용자 메시지가 모두 한국어 고정 (i18n 미고려).
- [ ] 폼 유효성 에러를 필드별로 표시하지 않음 (전체 에러만).
- [ ] 테스트 (Vitest / Playwright) 미작성.
