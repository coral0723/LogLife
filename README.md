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
