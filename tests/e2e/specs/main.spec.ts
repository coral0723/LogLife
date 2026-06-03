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

async function openKRDetailView(page: Page) {
  await page.goto('/main');
  await expect(page.locator('.animate-spin')).not.toBeVisible({
    timeout: GLOBE_READY_TIMEOUT,
  });
  await clickPin(page, 'KR');
  const item = page.getByRole('listitem').filter({ hasText: '경복궁 방문' });
  await expect(item).toBeVisible({ timeout: 8_000 });
  await item.click();
  await expect(page.locator('h2').filter({ hasText: '경복궁 방문' })).toBeVisible({
    timeout: 5_000,
  });
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

  test('KR 핀 클릭 → CountrySlidePanel 표시', async ({ page }) => {
    await page.goto('/main');
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });

    await clickPin(page, 'KR');

    // CountrySlidePanel이 열리고 KR 버킷리스트 목록이 로드됨
    await expect(page.getByRole('button', { name: '닫기' })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('listitem').filter({ hasText: '경복궁 방문' })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('listitem').filter({ hasText: '한라산 등반' })).toBeVisible();
  });

  test('CountrySlidePanel 배경 클릭 → 패널 닫힘', async ({ page }) => {
    await page.goto('/main');
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });

    await clickPin(page, 'KR');
    await expect(page.getByRole('button', { name: '닫기' })).toBeVisible({ timeout: 5_000 });

    // 패널은 하단 고정 → 좌상단(80, 80)이 backdrop 영역이므로 닫힘
    await page.mouse.click(80, 80);
    await expect(page.getByRole('button', { name: '닫기' })).not.toBeVisible();
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

  test('CountrySlidePanel → BucketDetailView 상세 진입', async ({ page }) => {
    await openKRDetailView(page);

    await expect(page.locator('h2').filter({ hasText: '경복궁 방문' })).toBeVisible();
    await expect(page.getByText('달성', { exact: true })).toBeVisible();
    await expect(page.getByText('경복궁, 서울')).toBeVisible();
    await expect(page.getByRole('button', { name: '목록으로 돌아가기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '공유하기' })).toBeVisible();
  });

  test('BucketDetailView → 뒤로가기 → 목록 복귀', async ({ page }) => {
    await openKRDetailView(page);

    await page.getByRole('button', { name: '목록으로 돌아가기' }).click();

    await expect(
      page.getByRole('listitem').filter({ hasText: '경복궁 방문' }),
    ).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '닫기' })).toBeVisible();
  });

  test('BucketDetailView → 공유 버튼 → 클립보드 복사', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openKRDetailView(page);

    await page.getByRole('button', { name: '공유하기' }).click();
    await expect(page.getByText('링크 복사됨')).toBeVisible();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('/b/');
  });

  test('@modal 인터셉팅 라우트 — 공유 링크 → 모달 → 뒤로가기', async ({ page }) => {
    await openKRDetailView(page);

    // Next.js Link를 force-click해 소프트 내비게이션으로 인터셉팅 라우트 트리거
    // (plain <a> 클릭은 Next.js 라우터를 우회해 전체 페이지 이동이 일어남)
    await page.locator('[data-testid="share-page-link"]').click({ force: true });

    // ModalDetailClient: 전체 화면 검정 배경 (z-70, CountrySlidePanel z-61 위)
    const modal = page.locator('.bg-zinc-950');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('h2').filter({ hasText: '경복궁 방문' })).toBeVisible();
    await expect(modal.getByRole('button', { name: '목록으로 돌아가기' })).toBeVisible();

    // 뒤로가기 → /main 복귀
    await modal.getByRole('button', { name: '목록으로 돌아가기' }).click();
    await expect(page).toHaveURL(/\/main/);
  });
});
