# Next.js 16 라우트 작성 규칙

## 공통 적용 (모든 page/layout)
- `params`, `searchParams`, `cookies()`, `headers()` 전부 **async** → 반드시 `await`. 동기 접근 제거됨.
- 페이지 컴포넌트는 `async function Page(props: PageProps<'/u/[username]'>) { const { username } = await props.params }` 패턴 사용.
- `PageProps` / `LayoutProps` / `RouteContext` 헬퍼는 `next dev` 또는 `next typegen` 실행 시 전역 생성됨 → import 불필요.
- 미들웨어 대신 **`proxy.ts`** 사용 (`middleware` 파일·named export 모두 deprecated). proxy 런타임은 nodejs 고정 (edge 불가). NextAuth v5 미들웨어 사용 시 edge 패턴 제약 확인.

## 작성 전 체크리스트
- [ ] page/layout 컴포넌트는 `async` + `await props.params` / `await props.searchParams`
- [ ] `cookies()` / `headers()` 호출 시 `await`
- [ ] 본인 변경 후 SSR 갱신은 Server Action의 `revalidatePath`, 클라이언트 캐싱은 TanStack Query Hydration (AD-11 참고)
- [ ] 새로 추가하는 parallel slot에는 `default.tsx` 동봉
- [ ] 미들웨어 필요 시 `proxy.ts`로 작성 (edge 런타임 의존성 점검)
- [ ] 이미지 quality 75 외 값 사용 시 `next.config.images.qualities` 추가

## 참고
- 아키텍처 결정 근거(ADR)·breaking changes 상세 → [`docs/plan_spec.md`](../../docs/plan_spec.md) §11