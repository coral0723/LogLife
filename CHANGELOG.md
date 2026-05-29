# Changelog

## [2026-05-29]

### 추가

- 빈 버킷리스트 상태에서 CirclePlusIcon 표시 및 /create 라우팅 (472dcc7)
- 지구본 핀 크기를 줌 레벨에 비례해 자동 확대 (7e8ad28)
- 메인 지구본 로딩 스피너 추가 (8eb5c52)
- 메인 페이지 지구본 뷰 구현 (6ae3d1d)
- (afterLogin) 라우트 그룹 및 메인 지구본 페이지 구현 (f7b6e81)

### 수정

- GlobeView 지구본 레이스 컨디션 및 에러 처리 수정 (a250936)
- E2E 인증 세션 파일 경로 불일치 수정 (aaee881)
- /commit 스킬 Yes 응답 후 커밋 미실행 버그 수정 (dd00c4d)
- Storybook staticDirs 경로를 Linux CI 호환으로 수정 (968a169)
- pnpm-workspace.yaml에 packages 필드 누락 수정 (58c849e)
- 지구본 로딩 중 BottomNav가 보이는 문제 수정 (d46cf53)
- 메인 지구본 핀 위치 튐 현상 수정 (e0fdb10)
- 마감일 유효성 및 expired 판단 기준 수정 (d4979a8)

### 변경

- 테스트 폴더 구조 개선 및 test/e2e 스킬 추가 (e25a09a)
- 빈 버킷리스트 상태에서 BottomNav 숨김 및 (withNav) 라우트 그룹 추가 (d0cd634)
- BottomNav을 재사용 가능한 컴포넌트로 변경 및 Storybook 문서화 (dcf61b4)
- 소스 코드를 src/ 디렉토리로 이동 (22428ad)
- PlacesAutocomplete를 (afterLogin)/_components로 이동 (7a162a2)
- 메인 지구본 초기 시점을 한국 중심으로 변경 (4fefcf4)
- 메인 지구본 핀을 map marker 디자인으로 개선 (c3a3a22)
- 메인 페이지 지구본 시각 개선 및 별 배경 추가 (c546bd9)
- 메인 지구본 색상 테마 및 ocean 텍스처 개선 (71cc7c7)
- 메인 지구본 뷰 색상 테마 변경 (a630ddb)

### 문서

- SSL 모드 수정 및 라우트 구조 문서 갱신 (dcfd6a5)
- GlobeView Storybook 문서화 (58601f7)
- LoadingSpinner Storybook 문서화 (d1bf084)
- 메인 globe 핀 UX 설계 변경 반영 (2447f5c)
- CLAUDE.md 중복 섹션 제거 (bc2cedc)

### 기타

- /quality-review 로컬 슬래시 커맨드 추가 (c302fda)
- /e2e 스킬 4단계 에이전트를 qa-tester로 변경 (4c19574)
- /security-review 프로젝트 로컬 슬래시 커맨드 추가 (74a0505)
- E2E 백도어 프로덕션 가드 추가 (50bb876)
- /test·/e2e 스킬에 test-engineer 에이전트 위임 추가 (70eb120)
- Playwright E2E 인프라 추가 및 Globe 페이지 시나리오 작성 (56ee13c)
- GlobeClient 단위 테스트 추가 (e3964f7)
- BottomNav 단위 테스트 추가 (5c98c6d)
- CirclePlusIcon 단위 테스트 추가 (becfb85)
- LoadingSpinner 단위 테스트 추가 (44a2d5b)
- .claude/memory 폴더 구조 추가 및 gitignore 설정 (68c1e81)
- lib 단위 테스트 __tests__ 폴더로 정리 (8b2e836)
- Gemini PR 자동 리뷰 GitHub Actions 워크플로우 추가 (81747dd)
- pnpm 빌드 설정을 pnpm-workspace.yaml로 이전 (888ee95)
- Chromatic 배포 트리거를 전체 브랜치로 확장 (7b2d88a)
- Chromatic GitHub Actions 배포 워크플로우 추가 (6610e62)
- 모바일 지구본 크기 반응형 조정 (1359766)
- taste-skill 프론트엔드 디자인 스킬 설치 (b1561ab)

## [2026-05-24]

### 변경

- AI 문서·규칙 폴더 구조 재설계 (1e339f5)

### 기타

- Bash·PowerShell 실행 전 CLI 보안 규칙 자동 주입 훅 추가 (5e04c0f)
- Claude Code 권한 허용 목록을 와일드카드로 단순화 (5b40968)
- 파일명 네이밍 규칙 통일 (PascalCase·camelCase·snake_case) (72040a5)
- /handoff 슬래시 커맨드 추가 (c672feb)
- /pr 슬래시 커맨드 추가 (ebbaaee)
- /commit 슬래시 커맨드 추가 (8689f9e)

## [2026-05-22]

### 추가

- 버킷리스트 작성 페이지 및 자동완성 UX 보완 (8259621)
- Places Autocomplete 클라이언트 컴포넌트 추가 (972207c)
- Places Details 라우트와 공유 레이트 리밋 추가 (57a0109)
- Places Autocomplete 서버 프록시 라우트 추가 (5109b76)
- 버킷리스트 CRUD Server Action 및 Zod 스키마 추가 (7a129b7)

### 문서

- 버킷리스트 작성 브랜치 작업 정리 문서 추가 (2cefc33)
- AGENTS.md에 Karpathy 엔지니어링 가이드라인 4원칙 추가 (5870567)

### 기타

- Prisma config가 .env.local을 읽도록 수정 (8362234)
- pnpm/git/prisma 명령 권한 허용 목록 추가 (3801cf6)
- gh CLI 및 GitHub WebFetch 권한 허용 목록 추가 (0c91fae)
- .claude 메모리·설정 레포지토리로 이관 (9efcad5)
- username 생성 로직 추출 및 단위 테스트 추가 (c08c2ad)

## [2026-05-21]

### 문서

- plan-spec에 Next.js 16 변경사항 반영 (60b9f90)
- LogLife plan spec 추가 (58498d0)

### 기타

- 초기 DB 마이그레이션 적용 (2574adb)
- Prisma Client 초기화 (dd4f76a)
- Prisma ORM 및 데이터 모델 스키마 추가 (2dbdf47)
- Claude Code 런타임 폴더 gitignore 추가 (bc41291)
- 프론트엔드 기초 기술 스택 설치 (9a081ee)
- README.md 추가 (de7935c)
- PR 템플릿 경로 수정 (bd85b23)
- PR 템플릿 추가 (02cd286)
- 이슈 템플릿 추가 (3e347fe)
