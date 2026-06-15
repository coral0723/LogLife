import { redirect } from 'next/navigation';

import { signIn } from '@/auth';

// E2E 테스트 전용 로그인 페이지 — 프로덕션에서는 루트로 리다이렉트
export default function E2ELoginPage() {
  if (process.env.E2E !== 'true') redirect('/');

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <form
        action={async () => {
          'use server';
          await signIn('credentials', {
            email: 'e2e-test@loglife.local',
            redirectTo: '/main',
          });
        }}
      >
        <button id="e2e-login-btn" type="submit">
          E2E Login
        </button>
      </form>
    </main>
  );
}
