# 🌍 LogLife — 죽기 전에 하고 싶은 것들을 지구본 위에 기록하는 서비스

<div align="center">
  <img width="300" height="300" alt="logo" src="https://github.com/user-attachments/assets/59fdc361-2518-48c8-8663-d48d33446d70" />
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
