import fs from 'fs';
import path from 'path';

import { test as setup } from '@playwright/test';

const authFile = path.join(__dirname, '.auth/user.json');

setup('E2E 테스트 유저 로그인', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto('/e2e-login');
  await page.locator('#e2e-login-btn').click();

  // Server Action → signIn('credentials') → /main으로 리다이렉트
  await page.waitForURL('/main', { timeout: 15_000 });

  // 세션 쿠키를 포함한 스토리지 상태 저장
  await page.context().storageState({ path: authFile });
});
