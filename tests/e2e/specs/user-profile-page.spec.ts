import { test, expect } from '@playwright/test';

const GLOBE_READY_TIMEOUT = 25_000;

test.describe('/u/[username] 사용자 프로필 페이지 E2E', () => {
  // ─── 시나리오 1: 비로그인 골든패스 ────────────────────────────────
  test.describe('비로그인', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('골든패스 — /u/e2e-test-user 접근, 뒤로가기, 친구추가 → 로그인 리다이렉트, BottomNav 없음', async ({ page }) => {
      // 페이지 렌더링 확인 (404 아님)
      await page.goto('/u/e2e-test-user');
      await expect(page).not.toHaveURL(/\/not-found|\/404/);
      await expect(page.getByText('E2E Test')).toBeVisible({ timeout: 5_000 });

      // 뒤로가기 링크 클릭 → / 이동 확인
      await page.getByRole('link', { name: '뒤로가기' }).click();
      await expect(page).toHaveURL('/');

      // 친구추가 아이콘 클릭 → /login 리다이렉트 확인
      await page.goto('/u/e2e-test-user');
      await page.getByRole('link', { name: '친구 추가' }).click();
      await expect(page).toHaveURL(/\/login/);

      // BottomNav 없음 — role="navigation" 엘리먼트 없음
      await page.goto('/u/e2e-test-user');
      await expect(page.getByRole('navigation')).not.toBeVisible();
    });
  });

  // ─── 시나리오 2: 로그인 → 자기 프로필 미리보기 (isSelf) ──────────
  test('로그인 → 자기 프로필 (isSelf) — 친구추가 없음, ShareProfileButton 노출, 지구본 로딩 완료', async ({ page }) => {
    await page.goto('/u/e2e-test-user');

    // 친구추가 아이콘이 없어야 함 (isSelf)
    await expect(page.getByRole('button', { name: '친구 추가' })).not.toBeVisible();

    // ShareProfileButton 노출 확인 (고정 우상단)
    await expect(page.getByRole('button', { name: '프로필 공유' })).toBeVisible({ timeout: 5_000 });

    // 지구본 로딩 스피너 사라짐 확인
    await expect(page.locator('.animate-spin')).not.toBeVisible({
      timeout: GLOBE_READY_TIMEOUT,
    });
  });

  // ─── 시나리오 3: UserPageHeader 프로필 배지 클릭 → 전체 프로필 페이지 ─
  // /u/[username]은 (afterLogin) 밖에 있어 @modal 슬롯이 비활성 → 전체 페이지로 이동
  test('UserPageHeader 프로필 배지 클릭 → /u/e2e-test-user/profile 전체 페이지 열고 닫기', async ({ page }) => {
    // 지구본 로딩(최대 25s) + 프로필 페이지 이동·렌더링 시간을 확보하기 위해 타임아웃 연장
    test.setTimeout(60_000);
    await page.goto('/u/e2e-test-user');

    // GlobeClient 로딩 오버레이(z-[100])가 UserPageHeader(z-30)를 가리므로
    // 오버레이가 사라진 뒤 클릭해야 링크에 이벤트가 전달됨
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: GLOBE_READY_TIMEOUT });

    // 아바타+닉네임 링크(/u/e2e-test-user/profile) 클릭
    await page.getByRole('link', { name: 'E2E Test' }).click();

    // @modal 인터셉트 없음 → /u/e2e-test-user/profile 전체 페이지로 이동
    await expect(page).toHaveURL(/\/u\/e2e-test-user\/profile/, { timeout: 5_000 });

    // X(닫기) 링크 클릭 → URL이 /u/e2e-test-user로 복귀
    await page.getByRole('link', { name: '닫기' }).click();
    await expect(page).toHaveURL(/\/u\/e2e-test-user$/);
  });

  // ─── 시나리오 4: /friends → /u/[username] 정상 진입 (404 해소) ────
  // TODO: 이 테스트 활성화를 위해 global.setup.ts에 다음을 추가해야 합니다:
  // - 2번째 유저(e2e-friend-user) 생성
  // - Friendship 레코드(requesterId: user.id, addresseeId: friend.id, status: 'ACCEPTED') 생성
  // - 완료 후 test.fixme → test 로 변경
  test.fixme('/friends 친구 목록 → /u/e2e-friend-user 정상 진입 (404 해소)', async ({ page }) => {
    await page.goto('/friends');

    // 친구 목록에서 e2e-friend-user 링크 클릭
    await page.getByRole('link', { name: 'e2e-friend-user' }).click({ force: true });

    // /u/e2e-friend-user 정상 진입 확인 (404 아님, 페이지 렌더링 됨)
    await expect(page).toHaveURL(/\/u\/e2e-friend-user/);
    await expect(page).not.toHaveURL(/\/not-found|\/404/);
    await expect(page.getByText('e2e-friend-user')).toBeVisible({ timeout: 5_000 });
  });
});
