import { test, expect } from '@playwright/test';

test('debug: what renders at /library', async ({ page }) => {
  await page.goto('/library');
  await page.waitForLoadState('networkidle');
  console.log('URL:', page.url());
  const html = await page.content();
  console.log('Has login form:', html.includes('login-submit-btn'));
  console.log('Has library heading:', html.includes('Your Library'));
  console.log('Has loader:', html.includes('animate-spin'));
  console.log('Body snippet:', html.slice(0, 1500));
});