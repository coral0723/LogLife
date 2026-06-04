# 메인 페이지 뒤로가기 시 스피너 고착 — Next 16 dev 하이드레이션 버그

> 작성일: 2026-05-31
> 브랜치: `feat/7-card-intercepting-route`
> 결론: **앱 코드 버그 아님. Next.js 16 개발 모드 전용 회귀(이슈 #93413). 프로덕션 정상.**

## 증상

메인(`/main`)에서 다른 경로로 이동 후 **브라우저 뒤로가기**로 복귀하면:
- `LoadingSpinner`(`fixed inset-0 z-[100] bg-white`)가 사라지지 않고 고착
- 지구본·StarField 둘 다 안 보임 (스피너를 주석처리해도 StarField 안 나옴 → spinner가 가린 게 아님)
- F5 새로고침하면 즉시 정상

## 진짜 원인

뒤로가기(`back_forward` 네비게이션) 시 서버 HTML은 정상 복원되지만 **React 하이드레이션이 실행되지 않는다.** 그 결과 모든 클라이언트 컴포넌트의 effect가 안 돈다:
- `StarField`의 canvas 그리기 `useEffect` 미실행 → canvas가 기본 크기(300×150) 그대로, 별 안 그려짐
- `GlobeView`의 size 측정·`onReady`(스피너 해제) 미실행 → 스피너 고착, Globe 미렌더

즉 `GlobeView`/`GlobeClient`/`StarField` 코드는 무고하다. HANDOFF.md 1~5차 세션이 이 컴포넌트들을 반복 수정했지만 전부 실패한 이유.

## 배제한 가설 (Playwright 진단으로 측정)

| 가설 | 측정 결과 |
|---|---|
| bfcache 복원 (effect 미재실행이 정상) | ✗ `pageshow.persisted=false` (bfcache 아님) |
| dev stale chunk 404 | ✗ 네트워크 4xx/5xx 0건 |
| `@modal` parallel route 간섭 | ✗ 슬롯을 private 폴더로 제거해도 재현 |
| children `default.tsx` 누락 | ✗ default 렌더 안 됨, 실제 페이지 HTML은 DOM에 정상 존재 |

## 개발 vs 프로덕션 (직접 검증)

루트 레이아웃에 마운트 로그를 찍는 프로브 컴포넌트를 심고 `로그인 → 404 → 뒤로가기`로 측정:

| 환경 | 뒤로가기 후 프로브 재마운트 | 판정 |
|---|---|---|
| `next dev` | 0회 | 하이드레이션 실패 |
| `next build && next start` | 1회 | **정상** |

→ 프로덕션은 영향 없음. (Next 16.2.5 / React 19.2.4 기준)

## 참고

- GitHub: [vercel/next.js#93413](https://github.com/vercel/next.js/issues/93413) — "Bug When Navigating Back in Development". Next 15는 정상, 16에서 회귀. 2026-05-31 기준 미해결.
- 대응: dev에서는 F5. 앱 코드 수정 불필요. Next 패치 시 해소 예상.
