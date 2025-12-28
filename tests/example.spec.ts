import { test, expect } from '@playwright/test';

//$env:USERNAME=""; $env:PASSWORD=""; npx playwright test --headed --project=chromium --ui

test('Sign_Igel12_IPKG', async ({ page }) => {
  test.setTimeout(360_000); // Set test timeout to 6 minutes
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

  const uploadContainer = page.locator('div:has(input[type="file"][accept*="zip"])').nth(-1);
  await expect(uploadContainer).toBeVisible({ timeout: 15_000 });

  const browseButton = uploadContainer.getByRole('button', { name: 'Browse File' });
  await expect(browseButton).toBeEnabled({ timeout: 10_000 });

  const fileInput = uploadContainer.locator('input[type="file"][accept*="zip"]');

  // Retry logic
  const maxRetries = 5;
  let completed = false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Upload attempt ${attempt}`);

    // Trigger the file chooser
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      browseButton.click()
    ]);

    // Set the file
    await fileChooser.setFiles(filePath);

    // Wait for the POST request to succeed
    try {
      await page.waitForResponse(response =>
        response.url().includes('/upload/') &&
        response.request().method() === 'POST' &&
        response.status() === 200,
        { timeout: 30_000 } // adjust if needed
      );
    } catch (err) {
      console.warn(`Upload POST failed on attempt ${attempt}: ${err}`);
      if (attempt === maxRetries) throw err;
      continue; // retry
    }

    // Wait for the "Completed" label
    try {
      await expect(page.getByText('Completed')).toBeVisible({ timeout: 30_000 });
      completed = true;
      console.log('Upload completed!');
      break;
    } catch {
      console.warn(`"Completed" label not found on attempt ${attempt}`);
      if (attempt === maxRetries) throw new Error('Upload failed after max retries');
      // optionally clear the file input or refresh component before retrying
    }
  }

  if (!completed) {
    throw new Error('Upload did not complete after retries');
  }




  const filePath2 = 'C:/Users/marti/Downloads/sipagent.tar.bz2';

  // 1️⃣ Set the file on the hidden input
  const fileInput2 = page.locator('input.chakra-input[type="file"]');
  await fileInput2.setInputFiles(filePath2);

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

  const checkboxControl = page.locator('span.chakra-checkbox__control');

  await expect(checkboxControl).not.toHaveAttribute('data-disabled', '', {
    timeout: 120_000
  });

  await checkboxControl.click();

  await page.getByRole('button', { name: 'Build' }).click();

  const downloadAppButton = page.getByRole('button', { name: 'Download App' });

  await expect(downloadAppButton).toBeVisible({ timeout: 5 * 60 * 1000 });
  const [appDownload] = await Promise.all([
    page.waitForEvent('download'),
    downloadAppButton.click()
  ]);

  const savePath = 'C:/Users/marti/Downloads/' + appDownload.suggestedFilename();
  await appDownload.saveAs(savePath);
  console.log('App downloaded to:', savePath);

});
