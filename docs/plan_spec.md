# LogLife — Plan Spec

작성일: 2026-05-19

## 1. 프로젝트 개요

- **이름**: LogLife
- **컨셉**: "죽기 전에 하고 싶은 것들" 버킷리스트를 등록·달성해나가는 **인생 경험 아카이브** 서비스
- **포지셔닝**: 할 일 앱(X) / 여행 앱(X) / 인생 경험 아카이브(O)
- **핵심 비주얼**: 지구본 위에 달성/미달성 핀
- **비용 원칙**: 자비 0원 운영 — 모든 외부 서비스 무료 티어 내에서 동작

## 2. 기술 스택

### 프론트엔드
- Next.js 16.2.5 (App Router) / React 19.2.4
- TanStack Query 5, Zustand 5
- NextAuth v5 (beta) — Google/Kakao OAuth
- Serwist (PWA — installable만 사용, 오프라인 X)
- Tailwind v4
- **globe.gl** (별도 설치 필요, html-markers 모드)
- **Google Maps JavaScript API** — Places Autocomplete 전용

### 백엔드
- Next.js API Routes / Server Actions
- Prisma ORM + Supabase PostgreSQL
- Zod (검증)
- **Google Places API**: Autocomplete, Place Details, Place Photos

### 테스트/개발
- Vitest (`unit`, `storybook` 프로젝트 분리)
- MSW (API 모킹)
- Playwright (E2E)
- Storybook 10
- Chromatic (Storybook 시각 회귀 CI — GitHub Actions 자동 배포)

### AI 개발 도구 (MCP)

| 서버 | 패키지 | 용도 |
|---|---|---|
| context7 | `@upstash/context7-mcp` | Next.js 16 / Prisma 7 / React 19 최신 공식 문서 실시간 조회 |
| playwright | `@playwright/mcp` | 브라우저 자동화 — E2E/시각 확인 |
| notionApi | `@notionhq/notion-mcp-server` | Notion DB 연동 — changelog/sessionlog 등 |

> 설정 파일: `.mcp.json` (프로젝트 루트). 추후 Playwright MCP, GitHub MCP 추가 예정.

**테스트 파일 배치 규칙 (feat/5에서 확립)**
- lib 함수 테스트: `src/lib/__tests__/*.test.ts`
- 컴포넌트 테스트: 해당 `_components/__tests__/*.test.tsx` (co-location)
- E2E 시나리오: `tests/e2e/specs/*.spec.ts`
- E2E 인프라 (globalSetup/Teardown/auth): `tests/e2e/setup/`

## 3. 핵심 아키텍처 의사결정 (ADR)

| # | 결정 사항 | 선택 | 핵심 이유 |
|---|---|---|---|
| AD-01 | Globe LOD 전환 | **나라 단위 고정** | 줌 레벨 무관하게 나라별 핀 하나만 표시. 줌 기반 전환은 구현 복잡도 대비 UX 이득이 불확실하여 제외 |
| AD-02 | 마커 클러스터링 | **country_code 기반** | 나라당 핀 1개. `GROUP BY countryCode`. 핀에 해당 나라의 버킷리스트 개수 표시 |
| AD-03 | 위치 데이터 모델 | **place_id + 좌표 + countryCode + displayName** | 나라 단위 클러스터링(AD-01/AD-02)에 맞춰 행정 계층(시/구/동) 정규화는 제외. Places API 재호출 최소화 + 클러스터링/필터 인덱스 가능 |
| AD-04 | Places 사진 | **서버 API route 프록시 + Next Image 캐시** | `/api/places/photo?ref=...` 응답을 Next Image가 자동 캐시. ToS 준수 + 추가 비용 0 |
| AD-05 | 인증/세션 | **NextAuth v5 + Prisma Adapter + JWT session** | PWA 장기 로그인, OAuth 전용 → 강제 로그아웃 시나리오 거의 없음. 추후 `tokenVersion` 패턴으로 semi-stateful 확장 가능 |
| AD-06 | 친구 관계 | **양방향 friend (request → accept)** | 비공개 컨텐츠 + "인생 경험 아카이브" 성격에 정합 |
| AD-07 | 공개 범위 | **3단계: private / friends / public** | 항목별 가시성 제어 |
| AD-08 | 공유 URL | **`/u/[username]` + `/b/[token]`** | 사용자 페이지는 SEO 유리한 username 경로, 개별 버킷리스트는 추측 불가 토큰 (link-only 공유 겸용) |
| AD-09 | 버킷리스트 상태 | **`achieved` boolean + `achievedAt` timestamp** | 단순. `achievedAt - createdAt`으로 모든 통계 처리. 만료 판정은 UTC 자정 기준(`new Date(new Date().setUTCHours(0,0,0,0))`)으로 수행하여 타임존 편차를 방지 |
| AD-10 | 달성 처리 UX | **토글 즉시 달성 + 축하 팝업** | 마찰 최소화. 사진 업로드/소감은 v1 제외 (비용·복잡도) |
| AD-11 | 공유/본인 데이터 캐싱 | **TanStack Query Hydration + Server Action `revalidatePath`** | Next 캐시 태그(`updateTag`/`revalidateTag`) 대신 클라이언트 캐싱은 TanStack Query(`dehydrate`/`HydrationBoundary`, `/b/[token]` 참고)로, 본인 변경(달성 토글·CRUD) 후 SSR 갱신은 Server Action의 `revalidatePath`(`src/actions/bucketList/actions.ts`)로 처리. 캐시 메커니즘을 하나로 통일해 학습 곡선·일관성 확보 |
| AD-12 | 통계 집계 | **매 요청 Prisma aggregate** | 개인 단위 소규모 데이터셋. 조기 최적화 회피, 추후 materialized view 이행 가능 |
| AD-13 | 카드 라우팅 | **메인 globe: 슬라이드업 패널 / 기타: Parallel + Intercepting Routes** | 메인 globe 핀 클릭은 슬라이드업 패널(목록→상세 인라인 전환). 프로필·사용자 페이지 카드 클릭은 `(.)b/[id]` 인터셉트 + `@modal` 슬롯 + `/b/[token]` 풀페이지 fallback. **Next 16**: 모든 parallel slot에 `default.js` 의무(`app/(app)/@modal/default.tsx`에서 `null` 반환). 없으면 빌드 실패 |
| AD-14 | 위치 검색 UX | **Places Autocomplete only (지도 클릭 X)** | 비용 절감 (session token으로 single transaction 과금). 미세 위치는 본문 텍스트로 보완 |
| AD-15 | 친구 페이지 v1 | **친구 리스트 + 검색/정렬 + 3개 위젯** | 공통 버킷리스트 매칭, 친구들의 핫 플레이스 Top 5, 함께 달성 모먼트 — LogLife 차별화 핵심 |
| AD-16 | PWA 오프라인 | **온라인 필수** | 네트워크 미연결 시 풀스크린 안내 팝업으로 모든 인터랙션 차단. Serwist는 manifest/installable만 사용 |

## 4. 데이터 모델 (Prisma 가이드)

### `User`
- `id` (cuid)
- `email` (unique)
- `username` (unique, `/u/[username]` URL)
- `displayName`
- `profileImageUrl` — OAuth provider 제공값
- `provider` (`google` | `kakao`)
- `providerAccountId`
- `createdAt`, `updatedAt`
- (선택) `tokenVersion` (Int, default 0) — 향후 강제 로그아웃용 자리만 마련

### `Friendship`
- `id`
- `requesterId` (User)
- `addresseeId` (User)
- `status` (`PENDING` | `ACCEPTED`)
- `createdAt`, `respondedAt`
- `@@unique([requesterId, addresseeId])`
- 양방향 조회는 `(userAId, userBId)` 정렬해 저장하거나 양방향 인덱스

### `BucketList`
- `id` (cuid)
- `shareToken` (unique, opaque — `/b/[token]`)
- `userId`
- `title`, `description`
- `visibility` (`PRIVATE` | `FRIENDS` | `PUBLIC`)
- `deadlineAt` (DateTime?)
- `difficulty` (Int 1–5)
- `excitement` (Int 1–5)
- `achieved` (Boolean, default false)
- `achievedAt` (DateTime?)
- **위치 필드** — `placeId`, `lat`, `lng`, `countryCode`, `displayName`
- `createdAt`, `updatedAt`
- 인덱스: `(userId, achieved)`, `(placeId)`, `(visibility)`

### (선택) `Place`
- `placeId` 기준 비정규화 캐시. v1에서는 BucketList에 inline해도 충분.

## 5. 라우트 구조 (App Router)

```
src/app/
  page.tsx                         # 6. 랜딩 페이지 (SSG, 디자인 후순위)
  (auth)/
    login/page.tsx                 # Google/Kakao 버튼
  (afterLogin)/                    # 인증 필요 그룹
    layout.tsx                     # 인증 공통 레이아웃
    (withNav)/                     # 항상 BottomNav가 표시되는 페이지 그룹
      layout.tsx                   # BottomNav 포함 레이아웃
      profile/page.tsx             # 2. 프로필 (본인)
      friends/page.tsx             # 4. 친구 페이지
    main/
      layout.tsx                   # BottomNav 없음 — 빈 상태 예외 처리
      page.tsx                     # 1. 메인 globe — 핀 있을 때만 BottomNav 렌더
    create/page.tsx                # 3. 버킷리스트 작성
    @modal/
      default.tsx                  # Next 16 의무: 매칭 안될 때 null 반환
      (.)b/[token]/page.tsx        # 카드 인터셉팅 모달
  u/[username]/
    page.tsx                       # 5. 사용자 페이지 (공개 globe)
    profile/page.tsx               # 친구일 때 프로필 보기
  b/[token]/page.tsx               # b = bucket list — 공유 풀페이지 (인터셉팅 fallback 겸용)
  api/
    places/
      photo/route.ts               # Google Places Photo 프록시
      autocomplete/route.ts        # session token 관리
    auth/[...nextauth]/route.ts
```

> **`(withNav)` 그룹 분리 이유**
> `profile`, `friends`는 항상 BottomNav를 표시하므로 `(withNav)/layout.tsx` 한 곳에서 선언한다.
> `main`은 버킷리스트 데이터가 없는 신규 유저 진입 시 BottomNav를 숨겨야 하므로 `(withNav)` 밖에 두고, `page.tsx`에서 `pins.length > 0`일 때만 조건부 렌더링한다.

> **폴더링 확장 가이드 (TODO)**
> 현재는 메인 페이지 1개라 `_components/` 하나에 모든 공유 컴포넌트를 배치 중.
> 페이지가 4개 이상으로 늘어나거나 같은 폴더에 컴포넌트/함수가 10개를 초과하면
> 도메인·기능 단위 서브폴더 분리(예: `_components/nav/`, `_components/globe/`,
> `src/lib/bucketlist/`, `src/lib/user/`)를 검토한다.

> **Next 16 라우트 작성 규칙**
> 모든 page/layout 작성 시 공통 적용 규칙·체크리스트는 [`.claude/rules/nextjs16.md`](../.claude/rules/nextjs16.md) 참고.

## 6. 페이지별 사양 요약

### 1) 메인 페이지 — `/main`
- 정중앙 react-globe.gl (html-markers, 어두운 단색 배경)
- 본인의 모든 버킷리스트 핀 (visibility 무관)
- **나라별 핀 하나** — 핀에 해당 나라의 버킷리스트 개수 표시 (AD-01, AD-02)

- 핀 클릭 → **슬라이드업 패널** (아래에서 위로 올라옴):
  1. 해당 나라의 버킷리스트 목록
  2. 목록 아이템 클릭 → 패널 내용이 해당 버킷리스트 상세로 전환
  3. 상세에서 좌상단 뒤로가기 버튼 → 목록 복귀
  4. 패널 상단 드래그 다운 또는 화살표 아이콘 클릭 → 패널 닫힘 (데스크톱은 화살표 아이콘만)
- 하단 중앙 네비 버튼 (양쪽 둥근 캡슐): `프로필 | 메인 | 친구`

### 2) 프로필 페이지 — `/profile`
- 상단 뱃지: OAuth 프로필 사진 + 이름
- 대시보드 위젯:
  - 작성한 버킷리스트 수
  - 마감 임박 순 리스트
  - 난이도 × 설레임 2×2 매트릭스 ("지금 도전 vs 나중에")
  - 평균 달성 소요 기간, 가장 오래 미룬 항목, 달성이 빠른 카테고리
- 위젯의 카드 클릭 → 인터셉팅 카드 모달
- 우상단 작성 버튼 → `/create`

### 3) 작성 페이지 — `/create`
- 입력: 제목, 내용, 위치 (Places Autocomplete only, AD-14), 마감일, 난이도/설레임 1–5, visibility (private/friends/public)
- Autocomplete: session token으로 single transaction 과금
- 선택 시점에 Place Details 1회 호출 → `placeId + 좌표 + 행정 계층` 저장 (AD-03)

### 4) 친구 페이지 — `/friends`
- 친구 리스트 + 친구 추가
- 친구 클릭 → `/u/[username]` 이동
- **검색/정렬** (닉네임 검색, 정렬: 최근 활동순 / 달성 많은순 / 가나다순)
- **위젯 1 — 공통 버킷리스트 매칭**
  - "나와 ㅇㅇ이 모두 등록한 곳" — `placeId` 또는 `(country_code, city)` 일치
  - 둘 다 미달성인 항목 우선 (= 같이 갈 후보)
  - `SELECT … FROM BucketList me JOIN BucketList fr ON me.placeId = fr.placeId WHERE me.userId = :me AND fr.userId IN (:friendIds) AND fr.visibility IN ('FRIENDS','PUBLIC')`
- **위젯 2 — 친구들의 핫 플레이스 Top 5**
  - 친구들이 가장 많이 등록한 도시/국가 랭킹
  - `GROUP BY (countryCode, displayName) ORDER BY COUNT(*) DESC LIMIT 5`
- **위젯 3 — 함께 달성 모먼트**
  - 같은 `placeId`를 비슷한 시기(±30일)에 달성한 친구와 묶어서 표시
  - 정서 컨텍스트("이 시점에 친구 ㅇㅇ도 같은 곳에 있었어요")
  - `WHERE me.achieved AND fr.achieved AND ABS(me.achievedAt - fr.achievedAt) <= 30 days AND me.placeId = fr.placeId`
- 모든 위젯은 친구의 `visibility ∈ {FRIENDS, PUBLIC}` 항목만 노출 (PRIVATE 제외 — RLS는 아니어도 API route에서 강제)

#### 공유하기 버튼 공개 범위 정책 (현재 구현 상태 및 향후 계획)
- 현재 `PUBLIC` 아이템에서만 공유하기 버튼이 노출됨
- `PRIVATE` 아이템은 공유하기 버튼을 숨겨 `/b/[token]` 링크 생성 자체를 차단
- **미구현 — 친구 구현 후 수정 예정**: `FRIENDS` 아이템도 현재는 공유하기 버튼이 노출되지 않음
  - 친구 시스템 구현 후 `FRIENDS` 아이템에도 공유하기 버튼을 표시하도록 변경
  - `/b/[token]` 접근 시: 친구 관계이면 정상 렌더링, 친구가 아니거나 비로그인이면 별도 안내 UI 표시

### 5) 사용자 페이지 — `/u/[username]`
- 검은 단색 + 정중앙 globe, 비공개 제외 핀만
- 좌상단 프로필 배지 + (친구 아닐 때) 친구 추가 아이콘
- 배지 클릭: 친구이면 `/u/[username]/profile`(프로필 페이지와 동일 UI), 아니면 이동 없음
- **SEO**: Server Component + OG/Twitter 메타 + JSON-LD `Person`
- `/b/[token]`: noindex 메타 (link-only 공유 의도)

### 6) 랜딩 페이지 — `/`
- 비로그인 사용자 진입 시. 감성 디자인은 추후 `Design.md`에서 정의
- Google/Kakao 버튼 우선, 디자인은 최후순위
- SSG + 메타 태그

## 7. 외부 서비스 비용 전략 (자비 0원 원칙)

본 프로젝트는 **취업용 포트폴리오** 성격이라 사용자 수가 많지 않을 전망. 다만 무료 한도를 넘으면 청구가 발생하는 서비스가 있으므로 **배포 전** 안전장치 일괄 적용한다 (섹션 7.2 참고).

### 7.1 정상 트래픽 시 무료 한도 추정

- **Supabase 무료 티어**: DB 500MB, egress 5GB/월. 사용자 사진 업로드 미지원으로 용량/대역폭 압박 최소화
- **Vercel Hobby**: Bandwidth 100GB/월, Image Optimization 5,000회/월 — 개인 프로젝트 규모 충분
- **Google Maps Platform**: 매월 $200 무료 크레딧
  - Autocomplete (session token) + Place Details = 1 트랜잭션으로 과금 ($0.017/건) → 월 약 **11,700 버킷리스트 등록**까지 무료
  - Place Photos는 `/api/places/photo` 프록시 → Next Image 캐시로 사진당 1회만 호출. **Next 16에서 `images.minimumCacheTTL` 기본값이 60s → 14400s(4h)로 상향되어 LogLife 사진 캐시 효율에 호재**. Places 사진은 거의 안 바뀌므로 기본값 유지 권장
  - 위치 등록 시점에 `placeId + 좌표 + 행정 계층`을 모두 저장 → 이후 reverse geocode 호출 없음
- **NextAuth Google/Kakao**: 무료
- **카카오 디벨로퍼스 OAuth**: 무료

### 7.2 배포 전 안전장치 체크리스트 (필수)

기능 개발은 우선 진행하고, **배포 직전 일괄 적용 후 한 번 더 확인**한다.

- [ ] Google Cloud Console에서 Maps API **일일 quota 하드 캡** 설정 (예: 일 500 호출)
- [ ] Google Maps API key의 **HTTP referrer 제한** — 배포 도메인(`*.vercel.app` 또는 커스텀)만 허용
- [ ] API Routes rate limiting — `/api/places/*`는 인증된 사용자 IP당 분당 30회
- [ ] `/api/places/*` 진입 시 `auth()` 검증 통과 후에만 외부 API 호출 (비로그인 차단)
- [ ] Vercel 사용량 80% 도달 시 이메일 알림 설정
- [ ] Supabase 프로젝트 health check ping — GitHub Actions cron (`*/3 * * *`)으로 일시 정지 방지
- [ ] `next.config` 의 `images` 설정에서 `unoptimized` 옵션 사용 금지 (= Image Optimization 캐시 보장)
- [ ] `next.config.images.remotePatterns`에 Google Places photo 프록시 도메인은 **불필요**(same-origin `/api/places/photo`). 외부 호스트 직접 임베드 시에만 등록 — `images.domains`는 Next 16에서 deprecated
- [ ] Next 16 기본값으로 `images.qualities = [75]`만 허용 → 다른 quality 값 쓰는 컴포넌트가 있다면 `images.qualities` 명시
- [ ] `.env`의 API key가 클라이언트 번들에 노출되지 않는지 확인 (`NEXT_PUBLIC_` 접두사 없는지)

### 7.3 Vercel Pro 업그레이드 트리거

⚠️ Vercel Hobby는 **비상업적 사용**만 허용. 다음 기능을 도입하면 약관 위반이며 **Pro ($20/월) 업그레이드 필수**:

- 광고 게시 (AdSense, 직접 배너 등)
- 결제 시스템 연동 (Stripe, 토스페이먼츠 등)
- 유료 멤버십 / 프리미엄 기능
- B2B 비즈니스 용도 / 의뢰 받은 외주

> 현재 LogLife 기획에는 위 항목이 없으므로 Hobby 유지. 향후 수익화 결정 시 본 섹션 재검토.

## 8. v1 비스코프 (Out of Scope)

- 사용자 직접 사진 업로드 (비용)
- 달성 시 소감/일기 (추후 도입)
- 친구 활동 피드 / 친구 카드 미니 통계 / 통합 친구 글로브 / 마감 임박 위젯 / 팁 매칭 / 친구 추천 / 친구 그룹핑 (대시보드 후보 중 v1 미선택분)
- 차단/신고
- 알림 시스템 (이메일/푸시)
- 다국어 (한국어 UI만, 사용자 콘텐츠는 그대로)
- 오프라인 작성 + 백그라운드 sync
- 전체 버킷리스트 검색

## 9. 비기능 요구사항

### SEO
- `/u/[username]`: Server Component + Open Graph/Twitter 메타 + JSON-LD `Person`
- `/b/[token]`: `<meta name="robots" content="noindex">` (token URL의 검색엔진 노출 차단)
- 랜딩: 정적 SSG + 메타

### 성능 목표
- 카드 모달: 인터셉팅 라우트로 prefetch
- 이미지: Next Image (avif, `sizes` 지정)

### PWA
- Serwist manifest로 installable 보장
- 오프라인 진입 시 풀스크린 "인터넷 연결 안 됨" 안내 + 모든 인터랙션 차단

### 접근성 (TBD)
- Globe 인터랙션 대안 (키보드 네비게이션 또는 리스트 뷰 토글) — 추후 Design.md에서 결정

## 10. 작업 순서 제안

 1. 인증 + 데이터 모델 + Prisma 마이그레이션 (NextAuth v5 + Google 우선) ✅
 2. 버킷리스트 CRUD + 작성 페이지 (Places Autocomplete + Place Details) ✅
 3. 메인 globe 페이지 — 핀 표시 + 팝업 카드 임시 구현 (슬라이드업 패널은 4번에서 완성) ✅
4. 카드 인터셉팅 라우트 (`@modal/(.)b/[token]` + 풀페이지 fallback + 슬라이드업 패널 완성) ✅
5. 프로필 페이지 대시보드 (Prisma aggregate)
6. 친구 시스템 (request / accept) + 친구 리스트 UI
7. 친구 페이지 위젯 — 검색/정렬, 공통 매칭, 핫 플레이스 Top 5, 함께 달성 모먼트
8. 사용자 페이지 `/u/[username]` + 공유 토큰 `/b/[token]`
9. Globe LOD/클러스터링 마감
10. 랜딩 페이지 + 카카오 OAuth + 디자인
11. PWA 마감 + 오프라인 차단 팝업
12. **배포 전**: 섹션 7.2 안전장치 체크리스트 일괄 적용 → 한 번 더 확인 후 배포

## 11. Next.js 16 주의사항 (AGENTS.md 지침)

Next.js 16은 **breaking changes 다수**.

본 스펙이 가정한 Next 16 API들:
- App Router의 **Parallel + Intercepting Routes** (`@modal`, `(.)`/`(..)` 규칙)
- Server Components + Server Actions + `revalidatePath` / TanStack Query Hydration (AD-11)
- `next/image` 캐싱 동작
- NextAuth v5 (beta) 통합

### 11.1 v16에서 반영해야 하는 breaking changes

| 영역 | v15 → v16 변화 | LogLife 영향 |
|---|---|---|
| Async Request APIs | `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` 동기 접근 **완전 제거** | 모든 page/layout/route handler에서 `await` 적용. `PageProps<'/u/[username]'>` 헬퍼 사용 |
| `revalidateTag` 시그니처 | 2번째 인자(cacheLife profile) **필수** | LogLife는 미채택 (AD-11 — `revalidatePath` + TanStack Query Hydration 사용) |
| `updateTag` (신규) | Server Action 전용, 즉시 만료 = read-your-own-writes | LogLife는 미채택 (AD-11 — `revalidatePath` + TanStack Query Hydration 사용) |
| `refresh()` (신규) | Server Action 안에서 클라이언트 라우터 새로고침 | 알림 카운트 등 곁가지 갱신 |
| Parallel slots `default.js` | 모든 slot에 의무화. 없으면 빌드 실패 | `app/(app)/@modal/default.tsx` 필수 (AD-13) |
| `middleware` → `proxy` | 파일·named export 모두 rename. **proxy 런타임 nodejs 고정 (edge 불가)** | NextAuth v5 미들웨어 사용 시 edge 패턴 검토 |
| `next/image` 기본값 | `minimumCacheTTL` 60s→14400s, `qualities` `[75]` only, `images.domains` deprecated | AD-04 캐시 효율 호재. 다른 quality 값 쓰면 명시 |
| Turbopack 기본 | `next dev`/`next build`에 기본 사용 | `package.json` 스크립트에서 `--turbopack` 플래그 제거. webpack 커스텀 설정 있으면 빌드 실패 |
| Node 20.9+ | Node 18 미지원, TS 5.1+ | Vercel 빌드 노드 버전 확인 |
| `next lint` 제거 | ESLint Flat Config 기본 | `pnpm lint`는 ESLint 직접 호출로 구성 |
| `serverRuntimeConfig`/`publicRuntimeConfig` 제거 | env 변수만 사용 | 이미 plan-spec과 일치 |
| `experimental.dynamicIO` → `cacheComponents` | top-level 옵션으로 승격 | 11.2 참조 |
| `experimental_ppr` 세그먼트 옵션 제거 | PPR은 `cacheComponents`로 일원화 | 11.2 참조 |

### 11.2 Cache Components 채택 여부

`next.config.ts`의 `cacheComponents: true`는 v16의 새 캐시/PPR 모델. 활성화 시:

- `fetch`는 **기본적으로 캐시되지 않음** → 캐시하려면 함수에 `'use cache'` 디렉티브 + `cacheLife()` 필수
- 캐시도 안 되고 `<Suspense>`로도 안 감싼 컴포넌트는 빌드 시 `Uncached data was accessed outside of <Suspense>` 에러
- `cacheTag(tag)` + `updateTag(tag)` / `revalidateTag(tag, profile)`로 무효화

**LogLife v1 방침**: `cacheComponents: false` 로 시작. 이유:
- 개인 데이터 위주(타이틀 페이지마다 사용자별 동적) → PPR 이득이 크지 않음
- NextAuth v5 + Prisma 학습 곡선이 이미 있음. 캐시 모델까지 신규 도입은 위험
- 1차 배포 후 globe·랜딩 같은 정적/캐시 가능 영역이 확장되면 마이그레이션 가이드(`migrating-to-cache-components.md`) 따라 전환

> 코드 작성 시 확인할 라우트 작성 체크리스트는 [`.claude/rules/nextjs16.md`](../.claude/rules/nextjs16.md) 참고.

## 12. 미결 / 추후 결정 사항

- 글로브 인터랙션의 접근성 대안 (Design.md에서 결정)
- 랜딩 페이지의 감성 디자인 톤·매너 (Design.md)
- v2 후보: 친구 활동 피드, 공통 버킷리스트 매칭, 소감/사진 보강, 알림
