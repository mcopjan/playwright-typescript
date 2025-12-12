import { test, expect } from '@playwright/test';

test('Navigate to a Tenant and login', async ({ page }) => {
  await page.goto('https://qacloud-three.sip.controlup.com/');
  await page.getByTestId('EdgeDX_SignInPage_SignInPage_div_40').getByTestId('EdgeDX_SignInPage_SignInPage_input').click();
  await page.getByTestId('EdgeDX_SignInPage_SignInPage_div_40').getByTestId('EdgeDX_SignInPage_SignInPage_input').fill('testuser@gmail.com');
  await page.getByTestId('EdgeDX_SignInPage_SignInPage_div_40').getByTestId('EdgeDX_SignInPage_SignInPage_input').press('Tab');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123987123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByTestId('EdgeDX_ConfirmationModal_ConfirmationModal_p')).toContainText('The username and / or password was invalid!');
  await page.getByTestId('EdgeDX_ConfirmationModal_ConfirmationModal_button').click();
});
