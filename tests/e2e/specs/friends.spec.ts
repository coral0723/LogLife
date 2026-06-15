import { test, expect } from '@playwright/test';

const GLOBE_READY_TIMEOUT = 25_000;
const SEARCH_DEBOUNCE_MS = 300;

test.describe('/friends 페이지 E2E', () => {
  test('골든패스 — 페이지 구성 요소 및 빈 상태 노출', async ({ page }) => {
    await page.goto('/friends');

    await expect(page.getByRole('heading', { name: '친구', level: 2 })).toBeVisible();

    const requestsToggle = page.getByRole('button', { name: '받은 친구 요청' });
    const friendsToggle = page.getByRole('button', { name: '친구', exact: true });
    await expect(requestsToggle).toBeVisible();
    await expect(friendsToggle).toBeVisible();

    await expect(
      page.getByPlaceholder('이름 또는 아이디로 검색'),
    ).toBeVisible();

    // 3개 위젯 섹션
    await expect(page.getByText('친구와 겹치는 버킷리스트', { exact: true })).toBeVisible();
    await expect(page.getByText('친구들의 인기 장소', { exact: true })).toBeVisible();
    await expect(page.getByText('함께 달성한 모먼트', { exact: true })).toBeVisible();

    // 토글 섹션 펼치기 → 빈 상태 문구 확인
    await requestsToggle.click();
    await expect(page.getByText('받은 요청이 없습니다')).toBeVisible();

    await friendsToggle.click();
    await expect(page.getByText('아직 친구가 없어요')).toBeVisible();

    // 위젯 빈 상태
    await expect(page.getByText('친구와 겹치는 버킷리스트가 없어요')).toBeVisible();
    await expect(page.getByText('친구들의 인기 장소가 없어요')).toBeVisible();
    await expect(page.getByText('함께 달성한 모먼트가 없어요')).toBeVisible();
  });

  test('섹션 펼침/접힘 — aria-expanded 토글 및 빈 상태 텍스트 표시', async ({ page }) => {
    await page.goto('/friends');

    const requestsToggle = page.getByRole('button', { name: '받은 친구 요청' });
    await expect(requestsToggle).toHaveAttribute('aria-expanded', 'false');

    await requestsToggle.click();
    await expect(requestsToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('받은 요청이 없습니다')).toBeVisible();

    await requestsToggle.click();
    await expect(requestsToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('받은 요청이 없습니다')).not.toBeVisible();

    const friendsToggle = page.getByRole('button', { name: '친구', exact: true });
    await expect(friendsToggle).toHaveAttribute('aria-expanded', 'false');

    await friendsToggle.click();
    await expect(friendsToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('아직 친구가 없어요')).toBeVisible();

    await friendsToggle.click();
    await expect(friendsToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('아직 친구가 없어요')).not.toBeVisible();
  });

  test('친구 검색 — 결과 없음', async ({ page }) => {
    await page.goto('/friends');

    const searchInput = page.getByPlaceholder('이름 또는 아이디로 검색');
    await searchInput.fill('zzz-nonexistent-user-9999');

    await expect(page.getByText('검색 결과가 없습니다')).toBeVisible({
      timeout: SEARCH_DEBOUNCE_MS + 5_000,
    });
  });

  test('FriendBadge → 친구 모달 — 인터셉팅 라우트로 열고 닫기', async ({ page }) => {
    await page.goto('/main');
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });

    const friendBadge = page.getByRole('link', { name: '친구' });
    await expect(friendBadge).toBeVisible();
    await expect(page.getByLabel('새 친구 요청 있음')).not.toBeVisible();

    // Next.js Link를 force-click해 소프트 내비게이션으로 인터셉팅 라우트 트리거
    await friendBadge.click({ force: true });

    const modal = page.locator('.bg-zinc-950');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('h2').filter({ hasText: '친구' })).toBeVisible();

    await modal.getByRole('button', { name: '닫기' }).click();
    await expect(modal).not.toBeVisible();
    await expect(page).toHaveURL(/\/main/);
  });
});
