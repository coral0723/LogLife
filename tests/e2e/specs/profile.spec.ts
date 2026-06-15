import { test, expect } from '@playwright/test';

import { AVATAR_LABELS } from '@/lib/avatar';

const NEW_NICKNAME = 'E2E수정닉네임';

test.describe('/profile 페이지 E2E', () => {
  test('프로필 사진 변경 — 아바타 선택 후 변경', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('button', { name: '프로필 변경' })).toBeVisible();
    await page.getByRole('button', { name: '프로필 변경' }).click();

    // 아바타 선택 그리드 노출
    await expect(page.getByText('프로필 선택')).toBeVisible();

    const confirmButton = page.getByRole('button', { name: '변경하기' });

    // 진입 직후 현재 아바타와 동일한 항목이 선택된 상태 → 비활성화
    await expect(confirmButton).toBeDisabled();

    // 현재 아바타와 다른 아바타("강아지") 선택
    await page.getByRole('button', { name: `${AVATAR_LABELS['/avatars/dog.png']} 아바타로 변경` }).click();
    await expect(confirmButton).toBeEnabled();

    await confirmButton.click();

    // 패널 닫힘 (아바타 그리드 사라짐)
    await expect(page.getByText('프로필 선택')).not.toBeVisible();

    // 화면 상단 이미지 src가 dog.png로 변경됨
    await expect(page.locator('img[src="/avatars/dog.png"]').first()).toBeVisible();
  });

  test('닉네임 변경 — 입력 후 변경', async ({ page }) => {
    await page.goto('/profile');

    const nicknameRow = page.getByRole('button', { name: /^닉네임/ });
    await expect(nicknameRow).toBeVisible();
    await expect(nicknameRow.getByText('E2E Test')).toBeVisible();

    await nicknameRow.click();

    // 닉네임 변경 패널 노출, input에 현재 닉네임 prefill
    await expect(page.getByText('닉네임 변경')).toBeVisible();
    const nicknameInput = page.getByRole('textbox');
    await expect(nicknameInput).toHaveValue('E2E Test');

    const confirmButton = page.getByRole('button', { name: '변경하기' });

    // prefill 상태(현재값과 동일)에서는 비활성화
    await expect(confirmButton).toBeDisabled();

    // 새 닉네임으로 변경
    await nicknameInput.fill(NEW_NICKNAME);
    await expect(confirmButton).toBeEnabled();

    await confirmButton.click();

    // 패널 닫힘, 닉네임 행에 새 닉네임 반영
    await expect(page.getByText('닉네임 변경')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /^닉네임/ }).getByText(NEW_NICKNAME)).toBeVisible();
  });

  test('로그아웃 — 확인 다이얼로그 수락 시 / 로 리다이렉트', async ({ page }) => {
    await page.goto('/profile');

    page.on('dialog', (dialog) => dialog.accept());

    await page.getByRole('button', { name: '로그아웃' }).click();

    await page.waitForURL('/');
  });

  test('탈퇴하기 — 확인 다이얼로그 취소 시 페이지 유지', async ({ page }) => {
    await page.goto('/profile');

    page.on('dialog', (dialog) => dialog.dismiss());

    await page.getByRole('button', { name: '탈퇴하기' }).click();

    // 다이얼로그 취소 → 삭제 미실행, 페이지 유지
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('button', { name: '탈퇴하기' })).toBeVisible();
  });
});
