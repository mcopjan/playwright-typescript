import { test, expect } from '@playwright/test';

//$env:USERNAME=""; $env:PASSWORD=""; npx playwright test --headed --project=chromium --ui

test('Sign_Igel12_IPKG', async ({ page }) => {
  const username = process.env.USERNAME!;
  const password = process.env.PASSWORD!;
  await page.goto('https://appcreator.igel.com/');
  await page.getByRole('button', { name: 'Let’s login' }).click();
  await page.getByRole('textbox', { name: 'name@host.com' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'submit' }).click();
  await expect(page.locator('#root')).toContainText('Create my App');
});