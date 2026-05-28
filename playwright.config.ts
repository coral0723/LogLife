import fs from 'fs';
import { defineConfig, devices } from '@playwright/test';

// globalSetup의 Prisma 클라이언트가 DATABASE_URL을 읽을 수 있도록 .env.local 로드
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf-8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .forEach(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) process.env[key] = val;
    });
}

// Playwright 실행 시 항상 E2E=true — 테스트 전용 Credentials 프로바이더 활성화
process.env.E2E = 'true';

const authFile = 'tests/e2e/.auth/user.json';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  globalSetup: './tests/e2e/global.setup.ts',
  globalTeardown: './tests/e2e/global.teardown.ts',
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['auth-setup'],
    },
  ],
  // 일반 dev(3000)와 충돌하지 않도록 포트 3001 사용
  webServer: {
    command: 'pnpm exec next dev -p 3001',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E: 'true',
    },
  },
});
