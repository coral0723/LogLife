import { test, expect, type Page } from '@playwright/test';

const GLOBE_READY_TIMEOUT = 25_000;

/**
 * Globe.gl의 CSS2DRenderer가 DOM에 추가한 핀 엘리먼트를 찾아 onclick 트리거.
 * SVG defs 안의 그라디언트 ID(pin-{code}-body)를 기준으로 부모 div까지 탐색.
 */
async function clickPin(page: Page, countryCode: string) {
  await page.waitForFunction(
    (code) => !!document.getElementById(`pin-${code}-body`),
    countryCode,
    { timeout: 10_000 },
  );
  await page.evaluate((code) => {
    const gradient = document.getElementById(`pin-${code}-body`)!;
    const svg = gradient.closest('svg')!;
    const inner = svg.parentElement!;       // inner div
    const scaleWrapper = inner.parentElement!; // .pin-scale-wrapper
    const el = scaleWrapper.parentElement!; // 최외곽 div (onclick 보유)
    el.click();
  }, countryCode);
}

test.describe('/main 페이지 E2E', () => {
  // ─── 미인증 (storageState 비워서 쿠키 없는 상태 재현) ───────────
  test.describe('미인증', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('/main 직접 접근 → /login 리다이렉트', async ({ page }) => {
      await page.goto('/main');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  // ─── 인증 (storageState 적용 — chromium 프로젝트 기본값) ─────────
  test('지구본 렌더링 — 로딩 스피너 사라짐', async ({ page }) => {
    await page.goto('/main');
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });
  });

  test('KR 핀 클릭 → 팝업 카드 표시', async ({ page }) => {
    await page.goto('/main');
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });

    await clickPin(page, 'KR');

    // KR: count=2(등록), achievedCount=1(달성) → "1/2" 배지
    await expect(page.getByText('KR')).toBeVisible();
    await expect(page.getByText('2개 등록')).toBeVisible();
    await expect(page.getByText('1개 달성')).toBeVisible();
    await expect(page.getByText('1/2')).toBeVisible();
  });

  test('팝업 배경 클릭 → 팝업 닫힘', async ({ page }) => {
    await page.goto('/main');
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });

    await clickPin(page, 'KR');
    await expect(page.getByText('2개 등록')).toBeVisible();

    // 팝업은 bottom-24 left-1/2 위치 → 좌상단(80, 80) 클릭으로 닫기
    await page.mouse.click(80, 80);
    await expect(page.getByText('2개 등록')).not.toBeVisible();
  });

  test('하단 네비게이션 — 3개 탭 표시 및 탭 전환', async ({ page }) => {
    await page.goto('/main');
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });

    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: '프로필' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '메인' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '친구' })).toBeVisible();

    // 프로필 탭 클릭 → URL 전환 확인
    await nav.getByRole('link', { name: '프로필' }).click();
    await expect(page).toHaveURL('/profile');
  });
});
