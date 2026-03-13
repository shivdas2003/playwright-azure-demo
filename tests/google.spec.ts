import { test, expect } from '@playwright/test';

test('Open Google homepage', async ({ page }) => {

  await page.goto('https://www.google.com');

  const title = await page.title();

  console.log("Page title:", title);

  await expect(page).toHaveTitle(/Google/);

});