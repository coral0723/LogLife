---
description: 배포 관련 주의사항 (전역, next.config·vercel 설정 변경 시 필독)
globs:
  - "next.config.*"
  - "package.json"
  - "vercel.json"
  - ".github/workflows/**"
---

# Deploy

## 배포 직전 체크리스트

기능 개발은 우선 진행하고, **배포 직전 일괄 적용 후 한 번 더 확인**.

- [ ] Google Cloud Console에서 Maps API **일일 quota 하드 캡** (예: 일 500 호출)
- [ ] Google Maps API key의 **HTTP referrer 제한** — 배포 도메인만 허용
- [ ] API Routes rate limiting — `/api/places/*`는 인증된 사용자 IP당 분당 30회 (`lib/rate-limit.ts`)
- [ ] `/api/places/*` 진입 시 `auth()` 검증 통과 후에만 외부 API 호출 (비로그인 차단)
- [ ] Vercel 사용량 80% 도달 시 이메일 알림 설정
- [ ] Supabase 프로젝트 health check ping — GitHub Actions cron (`*/3 * * *`)으로 일시 정지 방지
- [ ] `next.config`의 `images` 설정에서 `unoptimized` 옵션 사용 금지 (Image Optimization 캐시 보장)
- [ ] `images.qualities`에 75 외 값을 쓰는 컴포넌트가 있다면 명시 (Next 16 기본값은 `[75]`만)
- [ ] `.env`의 API key가 클라이언트 번들에 노출되지 않는지 확인 (`NEXT_PUBLIC_` 없는지)

원본: [`docs/plan-spec.md`](../../docs/plan-spec.md) §7.2

## 무료 한도 한계 (의식만 — 도달 시 알림)

| 서비스 | 한도 |
|---|---|
| Supabase | DB 500MB / egress 5GB/월 |
| Vercel Hobby | Bandwidth 100GB/월, Image Optimization 5,000회/월 |
| Google Maps | $200 무료 크레딧/월 (Autocomplete+Details 1트랜잭션 $0.017) |

## Vercel Hobby 약관 트리거

다음 기능을 도입하면 약관 위반 → **즉시 사용자에게 Pro($20/월) 안내**:

- 광고 게시 (AdSense, 직접 배너 등)
- 결제 시스템 연동 (Stripe, 토스페이먼츠 등)
- 유료 멤버십 / 프리미엄 기능
- B2B 비즈니스 용도 / 의뢰 받은 외주

원본: [`docs/cost-constraint.md`](../../docs/cost-constraint.md)

## Next 16 빌드 주의

- `pnpm build` 기본이 Turbopack. webpack 커스텀 설정 있으면 빌드 실패.
- Node 20.9+ 필수. Vercel 빌드 노드 버전 확인.
- `next lint` 제거 → `pnpm lint`는 ESLint 직접 호출.
- 빌드 산출물: SSR 기본은 `.next/`. 정적 export 시 `out/`.
