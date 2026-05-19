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

## 3. 핵심 아키텍처 의사결정 (ADR)

| # | 결정 사항 | 선택 | 핵심 이유 |
|---|---|---|---|
| AD-01 | Globe LOD 전환 | **줌 + 핀 밀도 적응형** | 현재 시야의 핀 개수 임계치 초과 시 한 단계 상위 행정 단위로 자동 합침 |
| AD-02 | 마커 클러스터링 | **행정구역 기반** | `country_code → admin1 → city` 단위 GROUP BY. "한국에 깃발, 서울에 깃발" 컨셉에 정합 |
| AD-03 | 위치 데이터 모델 | **place_id + 좌표 + 정규화된 행정 계층** | 클러스터링/통계/필터 인덱스 가능, Places API 재호출 최소화 |
| AD-04 | Places 사진 | **서버 API route 프록시 + Next Image 캐시** | `/api/places/photo?ref=...` 응답을 Next Image가 자동 캐시. ToS 준수 + 추가 비용 0 |
| AD-05 | 인증/세션 | **NextAuth v5 + Prisma Adapter + JWT session** | PWA 장기 로그인, OAuth 전용 → 강제 로그아웃 시나리오 거의 없음. 추후 `tokenVersion` 패턴으로 semi-stateful 확장 가능 |
| AD-06 | 친구 관계 | **양방향 friend (request → accept)** | 비공개 컨텐츠 + "인생 경험 아카이브" 성격에 정합 |
| AD-07 | 공개 범위 | **3단계: private / friends / public** | 항목별 가시성 제어 |
| AD-08 | 공유 URL | **`/u/[username]` + `/b/[token]`** | 사용자 페이지는 SEO 유리한 username 경로, 개별 버킷리스트는 추측 불가 토큰 (link-only 공유 겸용) |
| AD-09 | 버킷리스트 상태 | **`achieved` boolean + `achievedAt` timestamp** | 단순. `achievedAt - createdAt`으로 모든 통계 처리 |
| AD-10 | 달성 처리 UX | **토글 즉시 달성 + 축하 팝업** | 마찰 최소화. 사진 업로드/소감은 v1 제외 (비용·복잡도) |
| AD-11 | 공유 페이지 렌더링 | **Server Component + fetch cache + revalidatePath** | Next 16 추세. 사용자가 수정 시 server action에서 `revalidatePath`/`revalidateTag` 호출 |
| AD-12 | 통계 집계 | **매 요청 Prisma aggregate** | 개인 단위 소규모 데이터셋. 조기 최적화 회피, 추후 materialized view 이행 가능 |
| AD-13 | 카드 라우팅 | **Parallel + Intercepting Routes** | `(.)b/[id]` 인터셉트 + `@modal` 슬롯 + `/b/[token]` 풀 페이지 fallback. 공유/딥링크/새로고침 모두 자연 처리 |
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
- **위치 필드** — `placeId`, `lat`, `lng`, `countryCode`, `admin1Code`, `cityName`, `displayName`
- `createdAt`, `updatedAt`
- 인덱스: `(userId, achieved)`, `(countryCode, admin1Code, cityName)`, `(visibility)`

### (선택) `Place`
- `placeId` 기준 비정규화 캐시. v1에서는 BucketList에 inline해도 충분.

## 5. 라우트 구조 (App Router)

```
app/
  (landing)/
    page.tsx                       # 6. 랜딩 페이지 (SSG, 디자인 후순위)
  (auth)/
    login/page.tsx                 # Google/Kakao 버튼
  (app)/                           # 인증 필요 그룹
    layout.tsx                     # 하단 네비 (프로필 | 메인 | 친구)
    page.tsx                       # 1. 메인 globe
    profile/page.tsx               # 2. 프로필 (본인)
    friends/page.tsx               # 4. 친구 페이지
    create/page.tsx                # 3. 버킷리스트 작성
    @modal/
      (.)b/[token]/page.tsx        # 카드 인터셉팅 모달
  u/[username]/
    page.tsx                       # 5. 사용자 페이지 (공개 globe)
    profile/page.tsx               # 친구일 때 프로필 보기
  b/[token]/page.tsx               # 공유 풀페이지 (인터셉팅 fallback 겸용)
  api/
    places/
      photo/route.ts               # Google Places Photo 프록시
      autocomplete/route.ts        # session token 관리
    auth/[...nextauth]/route.ts
```

## 6. 페이지별 사양 요약

### 1) 메인 페이지 — `/`
- 정중앙 globe.gl (html-markers, 어두운 단색 배경, 별 없음)
- 본인의 모든 버킷리스트 핀 (visibility 무관)
- 달성/미달성 핀 모양 구분
- LOD: 줌 + 시야 핀 밀도 기준 자동 행정 클러스터링 (AD-01, AD-02)
- 핀 클릭 → 인터셉팅 모달 (`/b/[token]`, 모바일은 풀스크린, 데스크톱은 팝업)
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
  - `GROUP BY (countryCode, admin1Code, cityName) ORDER BY COUNT(*) DESC LIMIT 5`
- **위젯 3 — 함께 달성 모먼트**
  - 같은 `placeId`를 비슷한 시기(±30일)에 달성한 친구와 묶어서 표시
  - 정서 컨텍스트("이 시점에 친구 ㅇㅇ도 같은 곳에 있었어요")
  - `WHERE me.achieved AND fr.achieved AND ABS(me.achievedAt - fr.achievedAt) <= 30 days AND me.placeId = fr.placeId`
- 모든 위젯은 친구의 `visibility ∈ {FRIENDS, PUBLIC}` 항목만 노출 (PRIVATE 제외 — RLS는 아니어도 API route에서 강제)

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
  - Place Photos는 `/api/places/photo` 프록시 → Next Image 캐시로 사진당 1회만 호출
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
- Globe 한 화면 마커 ≤ 200개 (클러스터링으로 강제)
- 카드 모달: 인터셉팅 라우트로 prefetch
- 이미지: Next Image (avif, `sizes` 지정)

### PWA
- Serwist manifest로 installable 보장
- 오프라인 진입 시 풀스크린 "인터넷 연결 안 됨" 안내 + 모든 인터랙션 차단

### 접근성 (TBD)
- Globe 인터랙션 대안 (키보드 네비게이션 또는 리스트 뷰 토글) — 추후 Design.md에서 결정

## 10. 작업 순서 제안

1. 인증 + 데이터 모델 + Prisma 마이그레이션 (NextAuth v5 + Google 우선)
2. 버킷리스트 CRUD + 작성 페이지 (Places Autocomplete + Place Details)
3. 메인 globe 페이지 (핀 표시만, 클러스터링은 후순위)
4. 카드 인터셉팅 라우트 (`@modal/(.)b/[token]` + 풀페이지 fallback)
5. 프로필 페이지 대시보드 (Prisma aggregate)
6. 친구 시스템 (request / accept) + 친구 리스트 UI
7. 친구 페이지 위젯 — 검색/정렬, 공통 매칭, 핫 플레이스 Top 5, 함께 달성 모먼트
8. 사용자 페이지 `/u/[username]` + 공유 토큰 `/b/[token]`
9. Globe LOD/클러스터링 마감
10. 랜딩 페이지 + 카카오 OAuth + 디자인
11. PWA 마감 + 오프라인 차단 팝업
12. **배포 전**: 섹션 7.2 안전장치 체크리스트 일괄 적용 → 한 번 더 확인 후 배포

## 11. Next.js 16 주의사항 (AGENTS.md 지침)

`AGENTS.md`: Next.js 16은 **breaking changes 다수**. 실제 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드 확인 필수.

본 스펙이 가정한 Next 16 API들:
- App Router의 **Parallel + Intercepting Routes** (`@modal`, `(.)`/`(..)` 규칙)
- Server Components + **fetch cache** + `revalidatePath` / `revalidateTag`
- Server Actions
- `next/image` 캐싱 동작
- NextAuth v5 (beta) 통합

위 API들은 구현 시점에 16의 deprecation/breaking change 노트를 반드시 확인할 것.

## 12. 미결 / 추후 결정 사항

- 글로브 인터랙션의 접근성 대안 (Design.md에서 결정)
- 랜딩 페이지의 감성 디자인 톤·매너 (Design.md)
- v2 후보: 친구 활동 피드, 공통 버킷리스트 매칭, 소감/사진 보강, 알림
