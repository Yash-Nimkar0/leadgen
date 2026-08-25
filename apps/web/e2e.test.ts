import { test, expect } from '@playwright/test';
import { v4 as uuid } from 'uuid';

test.describe('Dashboard E2E', () => {
  const userEmail = `test-${uuid()}@example.com`;
  const userPassword = 'password123456';
  
  test('User Registration, Login, Project Creation, and Dashboard Flow', async ({ page }) => {
    // 1. Landing Page
    await page.goto('http://localhost:3000/');
    await expect(page.locator('text=Reddit Intent').first()).toBeVisible();
    await expect(page.locator('text=Find customers when they are ready to buy')).toBeVisible();

    // 2. Registration
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/register/);
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', userPassword);
    await page.click('button[type="submit"]');

    // Should redirect to login with success message
    await expect(page).toHaveURL(/.*\/login\?registered=true/);
    await expect(page.locator('text=Account created successfully')).toBeVisible();

    // 3. Login
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', userPassword);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.locator('text=Create your first project')).toBeVisible();

    // 4. Create Project
    await page.click('text=New Project');
    await expect(page).toHaveURL(/.*\/projects\/new/);
    
    await page.fill('input[name="name"]', 'Playwright Test Project');
    await page.fill('textarea[name="productDescription"]', 'Testing automated AI intent detection');
    await page.fill('input[name="keywords"]', 'playwright, e2e, testing');
    await page.fill('input[name="sources"]', 'playwright, javascript');
    
    await page.click('button[type="submit"]');

    // Should redirect to leads inbox
    await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9-]+\/leads/);
    await expect(page.locator('h1')).toContainText('Playwright Test Project Leads');

    // 5. Navigate to Settings
    await page.goto(page.url().replace('/leads', '/settings'));
    await page.fill('input[name="name"]', 'Playwright Test Project Updated');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Settings updated successfully')).toBeVisible();

    // 6. Navigate back to Dashboard and Run Mock Ingestion
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('text=Playwright Test Project Updated').first()).toBeVisible();
    
    await page.click('text=Run Mock Ingestion');
    await expect(page.locator('text=Success:')).toBeVisible({ timeout: 30000 });

    // 7. Check Leads Inbox for Mock Data
    await page.click('text=Playwright Test Project Updated');
    await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9-]+\/leads/);
    
    // There should be leads now
    const leads = page.locator('text=View details');
    await expect(leads.first()).toBeVisible();

    // 8. Open a Lead
    await leads.first().click();
    await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9-]+\/leads\/[a-zA-Z0-9-]+/);
    
    // 9. Mark Viewed
    await page.click('text=Mark Viewed');
    await expect(page.locator('text=Mark Unread')).toBeVisible();

    // 10. Dismiss
    await page.click('text=Dismiss');
    await expect(page.locator('text=Restore')).toBeVisible();

    // 11. Test IDOR - Logout and try accessing it
    const currentUrl = page.url();
    await page.click('text=Sign out');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Try accessing lead directly
    await page.goto(currentUrl);
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
