import { redirect } from 'next/navigation';

// E2E 테스트 전용 — 의도적 렌더링 에러 트리거. 프로덕션에서는 루트로 리다이렉트
export default function E2EErrorPage() {
  if (process.env.E2E !== 'true') redirect('/');

  throw new Error('E2E 테스트 전용 에러');
}
