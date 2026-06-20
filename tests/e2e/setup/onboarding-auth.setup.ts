import fs from 'fs';
import path from 'path';

import { test as setup } from '@playwright/test';

const unborderedAuthFile = path.join(__dirname, '.auth/unboarded.json');

setup('E2E 미온보딩 유저 로그인', async ({ page }) => {
  fs.mkdirSync(path.dirname(unborderedAuthFile), { recursive: true });

  await page.goto('/e2e-login-unboarded');
  await page.locator('#e2e-login-btn').click();

  await page.waitForURL('/onboarding', { timeout: 15_000 });

  await page.context().storageState({ path: unborderedAuthFile });
});
