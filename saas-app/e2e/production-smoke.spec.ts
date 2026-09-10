import { test, expect } from '@playwright/test';

test.describe('Production Deployment Smoke Tests', () => {
  test('Auth pages load and render cleanly', async ({ page }) => {
    // 1. Check Login Page
    await page.goto('/auth/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // 2. Check Sign Up Page
    await page.goto('/auth/signup');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // 3. Check Forgot Password Page
    await page.goto('/auth/forgot-password');
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('Webhook endpoint rejects invalid signatures gracefully', async ({ request }) => {
    // Attempt unauthenticated / invalid webhook request to Mayar endpoint
    const response = await request.post('/api/webhooks/mayar', {
      data: { event: 'test.ping' },
      headers: {
        'x-mayar-signature': 'invalid_signature_hash'
      }
    });

    // Expect 400 Bad Request or 401 Unauthorized
    expect([400, 401]).toContain(response.status());
  });
});
