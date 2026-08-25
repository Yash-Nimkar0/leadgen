# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.test.ts >> Dashboard E2E >> User Registration, Login, Project Creation, and Dashboard Flow
- Location: e2e.test.ts:8:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/login\?registered=true/
Received string:  "http://localhost:3000/register"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    11 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:3000/register"

```

```yaml
- alert
- heading "Create an account" [level=2]
- paragraph: Start monitoring Reddit for opportunities.
- text: Email address
- textbox "Email address": test-297c0103-e5e2-4b7e-8ad3-f841ef592ae4@example.com
- text: Password
- textbox "Password":
  - /placeholder: Password (min 8 characters)
  - text: password123456
- button "Creating account..." [disabled]
- link "Already have an account? Sign in":
  - /url: /login
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { v4 as uuid } from 'uuid';
  3  | 
  4  | test.describe('Dashboard E2E', () => {
  5  |   const userEmail = `test-${uuid()}@example.com`;
  6  |   const userPassword = 'password123456';
  7  |   
  8  |   test('User Registration, Login, Project Creation, and Dashboard Flow', async ({ page }) => {
  9  |     // 1. Landing Page
  10 |     await page.goto('http://localhost:3000/');
  11 |     await expect(page.locator('text=Reddit Intent').first()).toBeVisible();
  12 |     await expect(page.locator('text=Find customers when they are ready to buy')).toBeVisible();
  13 | 
  14 |     // 2. Registration
  15 |     await page.click('text=Sign up');
  16 |     await expect(page).toHaveURL(/.*\/register/);
  17 |     await page.fill('input[name="email"]', userEmail);
  18 |     await page.fill('input[name="password"]', userPassword);
  19 |     await page.click('button[type="submit"]');
  20 | 
  21 |     // Should redirect to login with success message
> 22 |     await expect(page).toHaveURL(/.*\/login\?registered=true/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  23 |     await expect(page.locator('text=Account created successfully')).toBeVisible();
  24 | 
  25 |     // 3. Login
  26 |     await page.fill('input[name="email"]', userEmail);
  27 |     await page.fill('input[name="password"]', userPassword);
  28 |     await page.click('button[type="submit"]');
  29 | 
  30 |     // Should redirect to dashboard
  31 |     await expect(page).toHaveURL(/.*\/dashboard/);
  32 |     await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  33 |     await expect(page.locator('text=Create your first project')).toBeVisible();
  34 | 
  35 |     // 4. Create Project
  36 |     await page.click('text=New Project');
  37 |     await expect(page).toHaveURL(/.*\/projects\/new/);
  38 |     
  39 |     await page.fill('input[name="name"]', 'Playwright Test Project');
  40 |     await page.fill('textarea[name="productDescription"]', 'Testing automated AI intent detection');
  41 |     await page.fill('input[name="keywords"]', 'playwright, e2e, testing');
  42 |     await page.fill('input[name="sources"]', 'playwright, javascript');
  43 |     
  44 |     await page.click('button[type="submit"]');
  45 | 
  46 |     // Should redirect to leads inbox
  47 |     await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9-]+\/leads/);
  48 |     await expect(page.locator('h1')).toContainText('Playwright Test Project Leads');
  49 | 
  50 |     // 5. Navigate to Settings
  51 |     await page.goto(page.url().replace('/leads', '/settings'));
  52 |     await page.fill('input[name="name"]', 'Playwright Test Project Updated');
  53 |     await page.click('button[type="submit"]');
  54 |     await expect(page.locator('text=Settings updated successfully')).toBeVisible();
  55 | 
  56 |     // 6. Navigate back to Dashboard and Run Mock Ingestion
  57 |     await page.goto('http://localhost:3000/dashboard');
  58 |     await expect(page.locator('text=Playwright Test Project Updated').first()).toBeVisible();
  59 |     
  60 |     await page.click('text=Run Mock Ingestion');
  61 |     await expect(page.locator('text=Success:')).toBeVisible({ timeout: 30000 });
  62 | 
  63 |     // 7. Check Leads Inbox for Mock Data
  64 |     await page.click('text=Playwright Test Project Updated');
  65 |     await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9-]+\/leads/);
  66 |     
  67 |     // There should be leads now
  68 |     const leads = page.locator('text=View details');
  69 |     await expect(leads.first()).toBeVisible();
  70 | 
  71 |     // 8. Open a Lead
  72 |     await leads.first().click();
  73 |     await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9-]+\/leads\/[a-zA-Z0-9-]+/);
  74 |     
  75 |     // 9. Mark Viewed
  76 |     await page.click('text=Mark Viewed');
  77 |     await expect(page.locator('text=Mark Unread')).toBeVisible();
  78 | 
  79 |     // 10. Dismiss
  80 |     await page.click('text=Dismiss');
  81 |     await expect(page.locator('text=Restore')).toBeVisible();
  82 | 
  83 |     // 11. Test IDOR - Logout and try accessing it
  84 |     const currentUrl = page.url();
  85 |     await page.click('text=Sign out');
  86 |     await expect(page).toHaveURL('http://localhost:3000/');
  87 | 
  88 |     // Try accessing lead directly
  89 |     await page.goto(currentUrl);
  90 |     // Should be redirected to login
  91 |     await expect(page).toHaveURL(/.*\/login/);
  92 |   });
  93 | });
  94 | 
```