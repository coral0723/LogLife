import { test, expect } from '@playwright/test';

test.describe('not-found.tsx E2E', () => {
  test('골든 패스 — 존재하지 않는 경로 접속 시 404 페이지 표시', async ({ page }) => {
    await page.goto('/이런-페이지-없음-e2e');

    await expect(page.getByRole('heading', { name: '여기는 아직 핀이 꽂히지 않은 곳이에요' })).toBeVisible();
    await expect(page.getByText('주소를 다시 확인하거나, 처음으로 돌아가 보세요.')).toBeVisible();
    await expect(page.getByRole('link', { name: '처음으로 돌아가기' })).toBeVisible();
  });

  test('인터랙션 — 처음으로 돌아가기 링크 클릭 시 루트 경로로 이동', async ({ page }) => {
    await page.goto('/이런-페이지-없음-e2e');

    await page.getByRole('link', { name: '처음으로 돌아가기' }).click();

    await expect(page).toHaveURL('/');
  });
});
