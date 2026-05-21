---
name: LogLife 비용 0원 운영 원칙
description: LogLife는 자비 0원 운영. 안전장치는 배포 직전 일괄 적용, 광고/결제 도입 시 Vercel Pro 필요
type: project
originSessionId: 802af141-d902-4326-acba-d5a5dc64ae81
---
LogLife 프로젝트의 모든 아키텍처 결정은 **자비 지출 0원** 제약을 만족해야 한다.

**Why**: 사용자가 명시한 절대적 제약 — "내 돈을 1원도 쓸 예정이 아니야". 본 프로젝트는 **공부용 포트폴리오** 성격이라 사용자 수가 많지 않을 전망이므로 무료 한도 내 운영 가능.

**How to apply**:
- 사용자 업로드 사진 저장 금지 (Supabase Storage 미사용)
- Places Photos는 Next Image 캐시로 호출량 최소화, 영구 미러링 금지
- Places Autocomplete는 반드시 session token으로 묶어 1 트랜잭션 과금
- 위치 등록 시 `placeId + 좌표 + 행정 계층`을 한 번에 저장해 이후 reverse geocode 호출 0
- Supabase DB 500MB / egress 5GB / Vercel Hobby 100GB bandwidth / Image Optimization 5,000회 한계 의식
- 기능 추가 제안 시 "이게 무료 한도 안에서 가능한가?" 먼저 검토

**안전장치 적용 타이밍** — 기능 개발은 우선 진행, **배포 직전 일괄 적용 후 한 번 더 확인**:
- Google Maps API 일일 quota 하드 캡 + HTTP referrer 제한
- API Routes rate limiting + 인증 검증
- Vercel 사용량 알림, Supabase health check ping
- 자세한 체크리스트는 `docs/plan-spec.md` 섹션 7.2

**Vercel Pro 업그레이드 트리거** — 다음 기능 도입 시 Hobby 약관 위반이므로 Pro ($20/월) 필수임을 사용자에게 즉시 알릴 것:
- 광고 게시 (AdSense 등)
- 결제 시스템 연동 (Stripe, 토스페이먼츠 등)
- 유료 멤버십 / 프리미엄 기능
- B2B 비즈니스 용도 / 외주 작업

현재 기획엔 없음 → Hobby 유지. 향후 사용자가 위 기능을 언급/도입 시도하면 반드시 짚고 넘어갈 것.
