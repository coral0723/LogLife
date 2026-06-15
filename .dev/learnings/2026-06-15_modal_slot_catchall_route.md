# @modal 슬롯이 미매칭 라우트에서 이전 모달을 유지하는 문제 — catch-all로 해결

> 작성일: 2026-06-15
> 브랜치: `feat/27-user-profile-page`
> 결론: **Next.js parallel routes `@modal` 슬롯은 현재 URL과 매칭되는 라우트가 없으면 "이전에 활성화된 상태"를 그대로 유지한다 — `[...catchAll]/page.tsx`가 `null`을 반환하도록 추가해야 다른 페이지로 이동 시 모달이 닫힌다.**

## 증상 / 문제

`/friends`는 `@modal/(.)friends/page.tsx`로 인터셉트되어 `fixed inset-0 z-70` 오버레이(`FriendsModalClient`)로 렌더링된다. 이 상태에서 `FriendListSection`의 `<Link href={`/u/${friend.username}`}>`을 클릭하면 `children` 슬롯은 `/u/[username]/page.tsx`로 정상 전환되지만, `@modal` 슬롯은 `FriendsModalClient`를 계속 렌더링해 새 페이지를 가렸다.

## 원인 / 패턴

Next.js 공식 문서(`parallel-routes.mdx` "Closing the modal" 섹션): `<Link>`로 현재 슬롯이 매칭하지 않는 라우트로 이동하면, 그 슬롯은 **이전에 활성화된 상태를 그대로 유지**한다. `default.tsx`는 풀 리로드·초기 로드 시에만 쓰이는 fallback이라 소프트 내비게이션에는 적용되지 않는다.

`(afterLogin)/@modal`에는 `(.)friends`, `(.)profile`, `(.)b/[token]`, `(.)u/[username]/profile`만 있고 `/u/[username]`(프로필 모달 없는 버전)을 매칭하는 라우트가 없어서 발생했다.

## 결론 및 참고

`src/app/(afterLogin)/@modal/[...catchAll]/page.tsx`를 추가해 `null`을 반환하면, `@modal`이 매칭하지 못하는 모든 URL(`/u/[username]`, `/main`, `/create` 등)에서 이 catch-all이 선택되어 `@modal` 슬롯을 닫는다.

- 새 `@modal` 인터셉트 라우트(`(.)xxx`)를 추가해도 구체적 라우트가 catch-all보다 우선 매칭되므로 기존 동작에 영향 없음.
- 참고: https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes#closing-the-modal
