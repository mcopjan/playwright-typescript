import { test, expect } from '@playwright/test';

//$env:USERNAME=""; $env:PASSWORD=""; npx playwright test --headed --project=chromium --ui

test('Sign_Igel12_IPKG', async ({ page }) => {
  const username = process.env.USERNAME!;
  const password = process.env.PASSWORD!;
  // LOGIN
  await page.goto('https://appcreator.igel.com/');
  await page.getByRole('button', { name: 'Let’s login' }).click();
  await page.getByRole('textbox', { name: 'name@host.com' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'submit' }).click();

  // CREATE APP FORM
  const createBtn = page.getByRole('button', { name: 'Create my App' });
  await expect(createBtn).toBeVisible();
  await createBtn.click();
  const filePath = 'C:/Users/marti/Downloads/controlupedgedx-2.17.7+7852.1.rc.1.zip'; //tbd will be configurable
  const browseButton = page.getByRole('button', { name: 'Browse File' });
  const fileChooserPromise = page.waitForEvent('filechooser');
  await browseButton.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);

  await page.waitForResponse(response =>
    response.request().method() === 'POST' &&
    response.url().includes('/upload/') &&
    response.status() === 200
  );

  await expect(page.locator('#root')).toContainText('Completed', {
    timeout: 15000 // 15 seconds
  });

  const filePath2 = 'C:/Users/marti/Downloads/sipagent.tar.bz2';

  // 1️⃣ Set the file on the hidden input
  const fileInput = page.locator('input.chakra-input[type="file"]');
  await fileInput.setInputFiles(filePath2);

  // 2️⃣ Click the Upload button (wait for it to become enabled)
  const uploadButton = page.locator('div[role="presentation"] button', { hasText: 'Upload' });
  await expect(uploadButton).toBeEnabled({ timeout: 10_000 }); // wait until enabled

  const handle = await uploadButton.elementHandle();
  if (!handle) throw new Error('Upload button not found');

  // click via page.evaluate
  await page.evaluate(btn => (btn as HTMLElement).click(), handle);

  await expect(
    page.getByText('You can change the app properties if required before you create it.')
  ).toBeVisible({ timeout: 180000 }); // 3 minutes

  const [download] = await Promise.all([
    page.waitForEvent('download'),       // waits for the download to start
    page.getByRole('button', { name: 'Download PDF' }).click() // trigger download
  ]);

  // Optionally save to a path
  const path = await download.path();
  console.log('Downloaded file path:', path);

  // Wait until the app enables the checkbox
  const checkboxLabel = page.locator('label:has-text("I confirm that I have read, understood and agree to the Terms of Use.")');
  await expect(checkboxLabel).toHaveAttribute('data-checked', { timeout: 120_000 });

  await page.getByRole('button', { name: 'Build' }).click();


});
