const { test, expect } = require('@playwright/test');

test('mobile lab opens on Overview and bottom navigation switches working sections', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile tab navigation is specific to the phone layout.');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/lab.html?design=2');
  await expect(page.locator('body')).toHaveAttribute('data-mobile-view', 'overview');
  await expect(page.locator('#audio-lab')).toBeHidden();
  await expect(page.locator('.quick-metrics')).toBeVisible();
  await expect(page.locator('#environments')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();

  await page.getByRole('link', { name: 'Audio laboratory', exact: true }).click();
  await expect(page).toHaveURL(/#audio-lab$/);
  await expect(page.locator('body')).toHaveAttribute('data-mobile-view', 'audio');
  await expect(page.locator('#audio-lab')).toBeVisible();
  await expect(page.locator('#analytics')).toBeHidden();

  await page.getByRole('link', { name: 'Signal intelligence', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-mobile-view', 'analytics');
  await expect(page.locator('#analytics')).toBeVisible();
  await expect(page.locator('#history')).toBeVisible();
  await expect(page.locator('#audio-lab')).toBeHidden();

  await page.goBack();
  await expect(page.locator('body')).toHaveAttribute('data-mobile-view', 'audio');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  expect(errors).toEqual([]);
});
