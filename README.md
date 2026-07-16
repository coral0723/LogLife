# 🌍 LogLife — 버킷리스트를 지구본 위에 기록하는 서비스

<div align="center">
  <img width="1920" height="1080" alt="LogLife 표지" src="https://github.com/user-attachments/assets/e30a8063-42bf-44e2-8915-a499d9447f56" />
</div>

- **배포 URL** : https://loglife-rho.vercel.app/

<br>

## 프로젝트 소개  
**LogLife**는 "죽기 전에 하고 싶은 것들"을 버킷리스트로 등록하고 달성해나가는 인생 경험 아카이브 서비스입니다.  
단순한 할 일 앱이나 여행 앱이 아닌, 버킷리스트를 지구본 위에 핀으로 시각화하고 친구들과 공유하는 경험 기록 공간입니다.  
**Google Places API**와 **Globe.gl**을 활용해 버킷리스트 항목을 지구본 위에 표현하며, PWA로 모바일에서도 설치해 사용할 수 있습니다.  

<br>

## 1. 개발 스택

### 프론트엔드

| 용도 | 기술 |
|---|---|
| 풀스택 프레임워크 | <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /> |
| UI 라이브러리 | <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /> |
| 타입 시스템 | <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /> |
| 스타일링 | <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /> |
| 서버 상태 관리 | <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="TanStack Query" /> |
| 클라이언트 상태 관리 | <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logoColor=white" alt="Zustand" /> |
| 애니메이션 | <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /> |
| 3D 지구본 시각화 | <img src="https://img.shields.io/badge/react--globe.gl-000000?style=for-the-badge&logoColor=white" alt="react-globe.gl" /> |
| 인증 (OAuth) | <img src="https://img.shields.io/badge/NextAuth.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="NextAuth.js" /> |
| PWA / 서비스 워커 | <img src="https://img.shields.io/badge/Serwist-5A0FC8?style=for-the-badge&logoColor=white" alt="Serwist" /> |

### 백엔드

| 용도 | 기술 |
|---|---|
| ORM / DB 스키마 | <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /> |
| 데이터베이스 | <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /> |
| 입력 유효성 검증 | <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" /> |
| 장소 검색 · 자동완성 | <img src="https://img.shields.io/badge/Google_Places_API-4285F4?style=for-the-badge&logo=google-maps&logoColor=white" alt="Google Places API" /> |

### 테스트 / CI

| 용도 | 기술 |
|---|---|
| 단위 · 컴포넌트 테스트 | <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" /> |
| API 모킹 | <img src="https://img.shields.io/badge/MSW-FF6A33?style=for-the-badge&logoColor=white" alt="MSW" /> |
| E2E 테스트 | <img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" /> |
| 컴포넌트 카탈로그 | <img src="https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white" alt="Storybook" /> |
| 시각 회귀 테스트 · CI | <img src="https://img.shields.io/badge/Chromatic-FC521F?style=for-the-badge&logoColor=white" alt="Chromatic" /> |

### 배포

| 용도 | 기술 |
|---|---|
| 배포 플랫폼 | <img src="https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /> |

<br>

## 2. 주요 기능

<div align="center">
  
| **메인 페이지** |
|:---:|
| <img width="240" alt="3D 지구본 핀 시각화" src="https://github.com/user-attachments/assets/c6bf9b52-bdf5-4527-8b3f-05344658d494" /> |

| **🟡 금색** | **🔴 붉은색** | **⬜ 회색** |
|:---:|:---:|:---:|
| 전부 달성 | 하나라도 마감일이 지남 | 그 외의 경우 |

</div>

- 지구본을 드래그해 자유롭게 회전하며 등록한 버킷리스트 핀을 한눈에 확인할 수 있습니다.
- 핀은 국가별로 클러스터링되어 개수가 함께 표시됩니다.
- 핀 색상은 해당 국가 버킷리스트의 달성 상태에 따라 변경됩니다.

<br>

<div align="center">

| **버킷리스트 작성** |
|:---:|
| <img width="240" alt="버킷리스트 작성" src="https://github.com/user-attachments/assets/87246c2a-eb31-4fd8-923a-ec3fa8c8bc63" /> |

</div>

- 하단 내비게이션의 우측 버튼을 누르면 작성 패널이 나타납니다.
- 제목, 내용, 장소, 난이도, 설레임, 공개 범위를 입력해 버킷리스트를 작성할 수 있습니다.

<br>

<div align="center">

| **버킷리스트 상세 화면** |
|:---:|
| <img src="https://github.com/user-attachments/assets/63b07968-1e72-4790-b373-9ee666194bfe" width="240" alt="핀 클릭 → 목록 → 상세" /> |

</div>

- 핀을 클릭하면 해당 국가의 버킷리스트 목록이 슬라이드업 패널로 표시됩니다.
- 항목을 선택하면 버킷리스트 상세 화면으로 전환됩니다.
- 우측 상단의 버튼을 통해 공유할 수 있습니다.

<br>

<div align="center">

| **버킷리스트 상태 변경** |
|:---:|
| <img src="https://github.com/user-attachments/assets/439de303-c4c5-4c7e-9318-0e30bce1efdf" width="240" alt="달성 토글 + 축하 팝업" /> |

</div>

- **미달성 항목**은 달성 처리할 수 있습니다.
- **달성한 항목**은 미달성 상태로 되돌릴 수 있습니다.
- **마감일이 지난 항목**은 새 마감일을 지정할 수 있습니다.

<br>

<div align="center">

| **대시보드 위젯** |
|:---:|
| <img src="https://github.com/user-attachments/assets/7a9ed893-42a6-41a0-9102-080124e519b6" width="240" alt="대시보드 위젯" /> |

</div>

- 하단 내비게이션의 대시보드 버튼을 클릭하면 4개의 통계 위젯을 확인할 수 있습니다.
- 매트릭스 위젯을 클릭하면 상세 슬라이드 패널로 전환됩니다.  

<br>

<div align="center">

| **친구 페이지** | **친구 추가** |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/4ae5f7c5-c509-4778-a77c-542351c59633" width="240" alt="친구 페이지" /> | <img src="https://github.com/user-attachments/assets/4cd2dd5c-4ec1-4b51-91d7-c9f0a3ccde2a" width="240" alt="친구 추가" /> |

</div>

- 친구 아이콘을 클릭하면 친구 목록 페이지로 이동합니다.
- 친구 이름을 클릭하면 해당 사용자의 버킷리스트 페이지를 확인할 수 있습니다.
- 친구 페이지에서 닉네임으로 사용자를 검색하고 친구 요청을 보낼 수 있습니다.

<br>

<div align="center">

| **프로필 배지** | **프로필 사진 변경** | **닉네임 변경** |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/984eedac-e369-4fab-96b8-87cb660ac0d3" width="240" alt="프로필 배지" /> | <img src="https://github.com/user-attachments/assets/68f22489-a8df-4762-96ec-194fcb2a2064" width="240" alt="프로필 사진 변경" /> | <img src="https://github.com/user-attachments/assets/589492e4-eba8-4fd5-a193-dc17e64fd165" width="240" alt="닉네임 변경" /> |

</div>

- 프로필 배지를 클릭하면 내 프로필 화면으로 이동합니다.
- 프로필 화면에서 변경 버튼을 클릭해 프리셋 아바타 중 원하는 사진으로 변경할 수 있습니다.
- 프로필 화면에서 닉네임 변경 버튼을 클릭해 새로운 닉네임으로 수정할 수 있습니다.

<br>

## 3. 아키텍처 구조
별도 백엔드 서버 없이 **Next.js App Router** 위에서 **인증·DB·외부 API**를 모두 처리하는 서버리스 아키텍처입니다.  
```mermaid
flowchart TD
    User(["사용자\nBrowser / PWA"])

    subgraph Vercel["Vercel — Next.js 16"]
        SSR["SSR / RSC\n페이지 렌더링"]
        API["API Routes\nPlaces 프록시 · Auth 콜백"]
        SA["Server Actions\n버킷리스트 CRUD"]
    end

    subgraph Supabase["Supabase"]
        PG[("PostgreSQL")]
    end

    OAuth["Google / Kakao OAuth 2.0"]
    Places["Google Places API\nAutocomplete · Details · Photos"]

    User -->|HTTPS| SSR
    User -->|OAuth 로그인| OAuth
    OAuth -->|"NextAuth v5 콜백"| API
    SSR --> SA
    SA -->|"Prisma ORM"| PG
    API -->|"Prisma ORM"| PG
    API -->|"서버 프록시"| Places
```

<br>

## 4. ERD

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String username UK
        String name
        String image
        Boolean isOnboarded
        Int tokenVersion
        DateTime createdAt
        DateTime updatedAt
    }

    Account {
        String id PK
        String userId FK
        String provider
        String providerAccountId
        String type
    }

    Session {
        String id PK
        String userId FK
        String sessionToken UK
        DateTime expires
    }

    BucketList {
        String id PK
        String shareToken UK
        String userId FK
        String title
        String description
        Visibility visibility
        DateTime deadlineAt
        Int difficulty
        Int excitement
        Boolean achieved
        DateTime achievedAt
        String placeId
        Float lat
        Float lng
        String countryCode
        String displayName
        DateTime createdAt
        DateTime updatedAt
    }

    Friendship {
        String id PK
        String requesterId FK
        String addresseeId FK
        FriendshipStatus status
        DateTime createdAt
        DateTime respondedAt
    }

    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ BucketList : "owns"
    User ||--o{ Friendship : "sends"
    User ||--o{ Friendship : "receives"
```

<br>

## 5. 디렉토리 구조  
- **컴포넌트** — 라우트가 아닌 기능 단위()로 구성
- **데이터 레이어** — `actions/`(쓰기) · `app/api/`(읽기·프록시) · `src/api/`(클라이언트 fetch) 세 레이어로 분리
- **라우팅** — Parallel + Intercepting Routes로 모달을 URL 기반으로 관리

### 파일 트리  
```
LogLife/
├── prisma/
│   └── schema.prisma             # DB 스키마 정의 (User·BucketList·Friendship 등 5개 모델)
├── public/
│   ├── avatars/                  # 10종 프리셋 아바타
│   ├── geo/
│   │   └── countries-110m.json   # 지구본 국가 폴리곤 데이터
│   ├── icons/
│   └── manifest.json             # PWA manifest
├── src/
│   ├── actions/                  # Server Actions — 도메인별 mutation
│   ├── api/                      # 클라이언트 fetch 함수 — 도메인별 파일로 분류
│   ├── app/
│   │   ├── (afterLogin)/
│   │   │   ├── @modal/           # Parallel + Intercepting Routes (모달 오버레이)
│   │   │   ├── friends/
│   │   │   ├── main/
│   │   │   ├── onboarding/
│   │   │   └── profile/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (e2e)/                # E2E 테스트 전용 라우트
│   │   ├── _providers/           # TanStack Query·NextAuth 등 전역 Provider 래퍼
│   │   ├── api/                  # Route Handlers — 도메인별 읽기·프록시 (auth·places 포함)
│   │   ├── b/[token]/            # 공유 풀페이지
│   │   ├── u/[username]/         # 공개 사용자 페이지
│   │   ├── layout.tsx            # 루트 레이아웃 (폰트·메타데이터·Provider 마운트)
│   │   ├── page.tsx              # 랜딩 페이지
│   │   └── sw.ts                 # PWA Service Worker
│   ├── auth.ts                   # NextAuth v5 설정 (OAuth 제공자·콜백·세션 전략)
│   ├── components/               # 기능 단위(bucket·dashboard·friends·globe·nav 등)로 분류
│   ├── lib/                      # 순수 유틸·도메인 로직 — 도메인별 분류 (bucketList·friend·date 등)
│   └── types/                    # next-auth 세션 타입 확장 등 전역 공유 타입
├── tests/
│   └── e2e/
│       ├── setup/                # globalSetup / teardown / auth
│       └── specs/                # E2E 시나리오
├── docs/                         # 프로젝트 문서
│   ├── plan_spec.md              # 비즈니스 도메인 사양 · ADR · 페이지 사양
│   ├── cost_constraint.md        # 0원 운영 제약 정의
│   └── templates/                # commit · issue · PR 메시지 양식
├── .storybook/                   # Storybook 설정 (addon·webpack·preview)
├── .claude/                      # Claude Code 하네스 설정
│   ├── rules/                    # 작업 유형별 규칙 파일 (code_style·security·deploy·testing 등 8종)
│   ├── skills/                   # 로컬 스킬 정의 (/commit·/pr·/handoff·/e2e 등)
│   ├── hooks/                    # PreToolUse·PostToolUse 이벤트 훅 스크립트
│   ├── memory/                   # 세션 간 자동 메모리 저장소 (MEMORY.md + 개별 md 파일)
│   └── settings.json             # 도구 권한·환경변수·hooks 등록
├── .dev/                         # AI 작업 흔적 (git 추적 제외)
│   ├── learnings/                # 작업 중 발견한 패턴·이슈·재현 어려웠던 오류 기록
│   └── scratchpad/               # 임시 메모 (작업 종료 후 삭제 — 비어있는 게 정상)
├── CLAUDE.md                     # AI 작업 지침·규칙 맵 (작업 전 필독)
├── AGENTS.md                     # AI 에이전트 설정 파일
├── proxy.ts                      # Next.js 16 미들웨어 대체 라우팅 프록시
├── next.config.ts                # Next.js 빌드·이미지·PWA 설정
├── vitest.config.ts              # unit·storybook 프로젝트 분리 테스트 설정
└── package.json
```

### 코드 레이어 구조 다이어그램
```mermaid
flowchart TD

subgraph group_app["Next.js App"]
  node_src_app_root["App shell<br/>nextjs shell<br/>[layout.tsx]"]
  node_src_app_auth["Auth routes<br/>route group<br/>[page.tsx]"]
  node_src_app_afterlogin["App routes<br/>route group<br/>[layout.tsx]"]
  node_src_app_modal["Modal routes<br/>parallel routes<br/>[default.tsx]"]
  node_src_app_e2e["E2E routes<br/>test routes<br/>[page.tsx]"]
end

subgraph group_ui["UI Components"]
  node_src_store["Client stores<br/>state stores<br/>[globeStore.ts]"]
  node_src_components_globe(("Globe view<br/>visualization UI<br/>[GlobeView.tsx]"))
  node_src_components_bucket["Bucket tools<br/>feature UI"]
  node_src_components_friends["Friends UI<br/>feature UI<br/>[FriendsView.tsx]"]
  node_src_components_dashboard["Dashboard UI<br/>feature UI<br/>[DashboardPanel.tsx]"]
  node_src_components_profile["Profile UI<br/>feature UI"]
  node_src_components_user["Public profile UI<br/>feature UI"]
  node_src_components_landing["Landing UI<br/>marketing UI<br/>[HeroContent.tsx]"]
  node_src_components_shared["Shared UI<br/>base UI<br/>[Button.tsx]"]
end

subgraph group_logic["Domain Logic"]
  node_src_lib_domain["Domain helpers<br/>pure logic<br/>[bucketStatus.ts]"]
end

subgraph group_data["Data Layer"]
  node_src_app_api_auth["Auth callback<br/>api route<br/>[route.ts]"]
  node_src_app_api_data["Read APIs<br/>api routes<br/>[route.ts]"]
  node_src_actions["Server actions<br/>mutation layer<br/>[actions.ts]"]
  node_src_auth["NextAuth setup<br/>auth config<br/>[auth.ts]"]
  node_src_lib_prisma[("Prisma access<br/>db client<br/>[prisma.ts]")]
  node_prisma_schema["DB schema<br/>[schema.prisma]"]
end

subgraph group_workflow["Workflow"]
  node_tests_workflow["Tests<br/>quality stack<br/>[vitest.config.ts]"]
  node_ops_workflow["Dev workflow<br/>tooling rules<br/>[CLAUDE.md]"]
end

node_src_app_root -->|"routes to"| node_src_app_auth
node_src_app_root -->|"hosts"| node_src_app_afterlogin
node_src_app_afterlogin -->|"overlays"| node_src_app_modal
node_src_app_afterlogin -->|"renders"| node_src_components_globe
node_src_app_afterlogin -->|"renders"| node_src_components_dashboard
node_src_app_afterlogin -->|"renders"| node_src_components_friends
node_src_app_afterlogin -->|"renders"| node_src_components_profile
node_src_app_afterlogin -->|"renders"| node_src_components_bucket
node_src_app_auth -->|"uses"| node_src_auth
node_src_app_api_auth -->|"calls"| node_src_auth
node_src_app_api_data -->|"reads/writes"| node_src_lib_prisma
node_src_actions -->|"mutates"| node_src_lib_prisma
node_src_lib_prisma -->|"implements"| node_prisma_schema
node_src_app_api_data -->|"computes"| node_src_lib_domain
node_src_actions -->|"validates"| node_src_lib_domain
node_src_components_globe -->|"uses"| node_src_store
node_src_components_bucket -->|"fetches"| node_src_app_api_data
node_src_components_friends -->|"fetches"| node_src_app_api_data
node_src_components_dashboard -->|"fetches"| node_src_app_api_data
node_src_components_profile -->|"submits"| node_src_actions
node_src_components_user -->|"fetches"| node_src_app_api_data
node_src_components_landing -->|"reuses"| node_src_components_globe
node_tests_workflow -.->|"covers"| node_src_components_shared
node_tests_workflow -.->|"stabilizes"| node_src_app_e2e
node_ops_workflow -.->|"guides"| node_src_actions

click node_src_app_root "https://github.com/coral0723/loglife/blob/main/src/app/layout.tsx"
click node_src_app_auth "https://github.com/coral0723/loglife/blob/main/src/app/(auth)/login/page.tsx"
click node_src_app_afterlogin "https://github.com/coral0723/loglife/blob/main/src/app/(afterLogin)/layout.tsx"
click node_src_app_modal "https://github.com/coral0723/loglife/blob/main/src/app/(afterLogin)/@modal/default.tsx"
click node_src_app_e2e "https://github.com/coral0723/loglife/blob/main/src/app/(e2e)/e2e-login/page.tsx"
click node_src_app_api_auth "https://github.com/coral0723/loglife/blob/main/src/app/api/auth/[...nextauth]/route.ts"
click node_src_app_api_data "https://github.com/coral0723/loglife/blob/main/src/app/api/bucketlists/[id]/route.ts"
click node_src_actions "https://github.com/coral0723/loglife/blob/main/src/actions/user/actions.ts"
click node_src_auth "https://github.com/coral0723/loglife/blob/main/src/auth.ts"
click node_src_lib_prisma "https://github.com/coral0723/loglife/blob/main/src/lib/prisma.ts"
click node_prisma_schema "https://github.com/coral0723/loglife/blob/main/prisma/schema.prisma"
click node_src_lib_domain "https://github.com/coral0723/loglife/blob/main/src/lib/bucketList/bucketStatus.ts"
click node_src_store "https://github.com/coral0723/loglife/blob/main/src/store/globeStore.ts"
click node_src_components_globe "https://github.com/coral0723/loglife/blob/main/src/components/globe/GlobeView.tsx"
click node_src_components_bucket "https://github.com/coral0723/loglife/blob/main/src/components/bucket/BucketDetailView.tsx"
click node_src_components_friends "https://github.com/coral0723/loglife/blob/main/src/components/friends/FriendsView.tsx"
click node_src_components_dashboard "https://github.com/coral0723/loglife/blob/main/src/components/dashboard/DashboardPanel.tsx"
click node_src_components_profile "https://github.com/coral0723/loglife/blob/main/src/components/profile/ProfileSettingsView.tsx"
click node_src_components_user "https://github.com/coral0723/loglife/blob/main/src/components/user/PublicProfileView.tsx"
click node_src_components_landing "https://github.com/coral0723/loglife/blob/main/src/components/landing/HeroContent.tsx"
click node_src_components_shared "https://github.com/coral0723/loglife/blob/main/src/components/ui/Button.tsx"
click node_tests_workflow "https://github.com/coral0723/loglife/blob/main/vitest.config.ts"
click node_ops_workflow "https://github.com/coral0723/loglife/blob/main/CLAUDE.md"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_src_app_root,node_src_app_auth,node_src_app_afterlogin,node_src_app_modal,node_src_app_e2e toneBlue
class node_src_store,node_src_components_globe,node_src_components_bucket,node_src_components_friends,node_src_components_dashboard,node_src_components_profile,node_src_components_user,node_src_components_landing,node_src_components_shared toneAmber
class node_src_lib_domain toneMint
class node_src_app_api_auth,node_src_app_api_data,node_src_actions,node_src_auth,node_src_lib_prisma,node_prisma_schema toneRose
class node_tests_workflow,node_ops_workflow toneIndigo
```
<br>

## 6. AI 워크플로우

```mermaid
flowchart TD
    User(["👤 사용자"])

    subgraph P1["① 계획 → 승인 → 구현"]
        Plan["Plan Mode\n계획 수립"]
        Approve{"사용자 승인"}
        Impl["구현 작업\nClaude Code"]
    end

    subgraph P2["② 역할별 AI 분리"]
        subgraph Auto["자동 위임 — OMC"]
            direction LR
            explore["explore"]
            executor["executor"]
            debugger["debugger"]
        end
        subgraph Gates["수동 검증 게이트 — 새 세션"]
            direction LR
            test["/test\ntest-engineer"]
            e2e["/e2e\nqa-tester"]
            sec["/security-review\nsecurity-reviewer"]
            qual["/quality-review\ncode-reviewer"]
        end
        Gemini["Gemini Code Assistant\n교차 리뷰"]
    end

    subgraph P3["③ 로그 파이프라인"]
        direction LR
        Hooks["훅 자동 수집\nUserPromptSubmit · PostToolUse"]
        JSONL[".dev/session-logs/*.jsonl"]
        NotionLog["Notion DB\n/sessionlog · /branchlog"]
    end

    subgraph P4["④ 지식 누적 루프"]
        direction LR
        Learnings["/learnings\n.dev/learnings/"]
        Rules[".claude/rules/\nknown_issues · code_style · security · testing · deploy"]
    end

    User --> Plan
    Plan --> Approve
    Approve -->|반려| Plan
    Approve -->|승인| Impl
    Impl <-->|복잡한 작업 자동 분해| Auto
    Impl -->|단계 완료| Gates
    Gates -->|PR 단계| Gemini
    Auto ~~~ Hooks
    Impl --> Hooks
    Hooks --> JSONL --> NotionLog
    Hooks ~~~ Learnings
    Impl -->|실수 반복| Learnings
    Learnings --> Rules
    Rules -.->|다음 세션 자동 주입| Impl
```

### 1️⃣ Plan Mode 선진입과 사용자 승인 강제

AI는 즉시 구현하려는 경향이 있기에 방향이 틀린 채 작업이 끝나면 되돌리는 비용이 큽니다.  
그래서 아래의 방법으로 작업을 진행했습니다.   

- **규칙화**: CLAUDE.md에 Karpathy 4원칙과 **"Plan Mode 우선, 승인 전 구현 금지"** 명시
- **운영**: 기능 세션마다 **Plan Mode 진입 → 계획 수립 → 사용자 승인 → 구현** 순서 준수

### 2️⃣ AI 역할을 분리하여 구현과 검증을 독립시키는 품질 관리 구조 설계

- **컨텍스트 격리**: 다른 역할 에이전트는 항상 새 세션으로 전환 — 구현 컨텍스트 오염 방지
- **자동 위임**: 구현 중 OMC가 `explore` · `executor` 등 서브에이전트를 자동 선택해 복잡 작업을 전문 역할로 분해
- **수동 검증 게이트**: 단계별 전용 스킬 수동 호출:
  - `/test` (test-engineer) — 코드 작성 후
  - `/e2e` (qa-tester) — 기능 흐름 완성 후
  - `/security-review` (security-reviewer) — auth · api 작업 후
  - `/quality-review` (code-reviewer) — PR 전
- **교차 리뷰**: PR 단계에서 **Gemini Code Assistant** 추가 — 동일 AI 편향 해소

### 3️⃣ AI의 반복 실수를 지식으로 축적하는 Learning Loop 설계

- **포착**: `/learnings` 스킬로 `.dev/learnings/YYYY-MM-DD_{topic}.md`에 증상 · 원인 · 결론 구조화
- **압축**: 핵심 1~2줄로 요약 후 유형별 md 파일에 누적:
  - 버그 · 환경 → `known_issues.md`
  - 코딩 스타일 → `code_style.md`
  - 테스트 → `testing_guide.md`
  - 보안 → `security.md`
  - 배포 → `deploy.md`
- **자동 활성화**: CLAUDE.md에 매핑 명시 → 다음 세션부터 자동 주입. 이상 증상 발견 시 `known_issues.md` 우선 확인

### 4️⃣ AI 작업을 추적 가능한 형태로 기록하는 로그 파이프라인 설계

- **훅 자동 수집**: `UserPromptSubmit` · `PostToolUse` 시 프롬프트 텍스트 · 파일 수정 · 명령어 실행을 `.dev/session-logs/{브랜치}/{YYYY-MM-DD}_{세션ID 앞 8자}.jsonl`에 실시간 기록
- **세션 로그**(`/sessionlog`): — JSONL을 선택하면 Notion "SessionLog" DB에 챕터별 정리
- **브랜치 로그**(`/branchlog`): — `git diff` · `git log` 기반 분석·정리 후 Notion "BranchLog" DB에 기록. `/pr` 실행 시 큰 작업 브랜치로 판단되면 자동 권장

<br>

## 7. 로컬 실행 방법

### 사전 요구사항

```
Node.js 20.9+
pnpm 10+
```

### 환경변수 설정

`.env.example`을 복사해 `.env` 파일을 생성하고 아래 값을 채운다.

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=verify-full"

# NextAuth v5
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_KAKAO_ID=""
AUTH_KAKAO_SECRET=""

# Google Places API (서버 전용)
GOOGLE_PLACES_API_KEY=""
```

### 설치 및 DB 초기화

로컬 DB 설치 불필요 — Vercel Neon(서버리스 PostgreSQL)에 직접 연결

```bash
pnpm install                  # 패키지 설치 + prisma generate (postinstall 자동 실행)
pnpm prisma migrate deploy    # 마이그레이션 Neon DB에 적용
```

### 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3000 에서 확인

### 테스트 실행

```bash
pnpm test              # 단위 테스트 (Vitest)
pnpm test:e2e:ui       # E2E 테스트 (Playwright UI 모드)
pnpm storybook         # 컴포넌트 카탈로그 (포트 6006)
```
