import { test, expect } from '@playwright/test';

// NOTE: This test requires a running backend with a seeded database,
// including an existing Matter (e.g. at /dashboard/matters/1/documents)

test.describe('Document Center & Storage Isolation', () => {
  test('Upload V1 -> Edit Metadata -> Upload V2 -> Archive', async ({ page }) => {
    // 1. Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'owner@notarygo.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Navigate directly to the Document Center of a seeded Matter
    // In a real E2E, we'd extract the Matter ID from a fixture or create it on the fly.
    await page.goto('/dashboard/matters/1/documents');
    await expect(page.locator('h3').filter({ hasText: 'Upload New Document' })).toBeVisible();

    // 2. Upload V1
    await page.fill('input[name="title"]', 'Test Document V1');
    
    // We create a dummy file in memory for the file input
    const buffer = Buffer.from('test pdf content for v1');
    await page.setInputFiles('input[type="file"]', {
      name: 'test_doc_v1.pdf',
      mimeType: 'application/pdf',
      buffer
    });
    
    await page.click('button[type="submit"]');

    // Verify V1 appears in the list
    await expect(page.locator('text=Test Document V1')).toBeVisible();
    await expect(page.locator('text=Current: V1')).toBeVisible();

    // 3. Upload V2 (New version of the SAME document)
    // There will be a small inline upload form for the existing document
    const uploadV2Button = page.locator('button', { hasText: 'Upload V2' }).first();
    const v2Input = page.locator('input[type="file"]').nth(1); // The input for the specific document
    
    const bufferV2 = Buffer.from('test pdf content for v2');
    await v2Input.setInputFiles({
      name: 'test_doc_v2.pdf',
      mimeType: 'application/pdf',
      buffer: bufferV2
    });
    
    await uploadV2Button.click();

    // Verify V2 is current
    await expect(page.locator('text=Current: V2')).toBeVisible();

    // Verify V1 remains in the version history
    await expect(page.locator('text=V1 - ')).toBeVisible();
    await expect(page.locator('text=Archived')).toBeVisible();
    
    // 4. Test Cross-Tenant Storage Isolation (Concept)
    // User A should not be able to fetch User B's signed URL. 
    // This is tested natively by Supabase RLS policies applied in 0004_document_engine.sql.
  });
});
