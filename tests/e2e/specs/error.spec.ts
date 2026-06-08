import { test, expect } from '@playwright/test';

test.describe('error.tsx E2E', () => {
  test('골든 패스 — 에러 발생 시 에러 페이지 표시', async ({ page }) => {
    await page.goto('/e2e-error');

    await expect(page.getByRole('heading', { name: '잠시 길을 잃은 것 같아요' })).toBeVisible();
    await expect(page.getByText('페이지를 불러오는 중 예기치 않은 문제가 생겼어요')).toBeVisible();
    await expect(page.getByRole('button', { name: '다시 시도하기' })).toBeVisible();
  });

  test('인터랙션 — 다시 시도하기 버튼 클릭 시 재시도 후 에러 페이지 재표시', async ({ page }) => {
    await page.goto('/e2e-error');

    const heading = page.getByRole('heading', { name: '잠시 길을 잃은 것 같아요' });
    await expect(heading).toBeVisible();

    await page.getByRole('button', { name: '다시 시도하기' }).click();

    // 트리거 라우트는 항상 throw하므로 reset() 이후에도 에러 페이지가 다시 표시됨
    await expect(heading).toBeVisible();
  });
});
