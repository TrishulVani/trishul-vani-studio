const { test, expect } = require('@playwright/test');

test('virtual assembly, circuit, controller logic and real DSP handoff', async ({ page }) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/hardware.html');
  await expect(page.locator('#modelFallback')).toBeHidden();
  await expect(page.locator('#viewer')).toBeVisible();
  await expect(page.locator('#wiring-state')).toHaveText('Virtual signal path ready');
  await page.getByRole('button', { name: 'Exploded', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Exploded', exact: true })).toHaveClass(/active/);
  await page.getByRole('button', { name: 'Remove wire 1', exact: true }).click();
  await expect(page.locator('#wiring-issues')).toContainText('Primary microphone');
  await page.getByRole('button', { name: 'Close-talk microphone OUT CH 1' }).click();
  await page.getByRole('button', { name: 'Shared-clock stereo capture IN1 CH 1' }).click();
  await expect(page.locator('#wiring-state')).toHaveText('Virtual signal path ready');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await expect(page.locator('#serial-output')).toContainText('SIMULATION COMPLETE');
  await expect(page.locator('#serial-output')).toContainText('UART READY → pico1.RX');
  await page.locator('#test-duration').selectOption('1.5');
  await page.getByRole('button', { name: 'Run connected DSP test' }).click();
  await expect(page.locator('#test-status')).toContainText(/Software run .* complete/, { timeout: 90000 });
  await expect(page.locator('#test-player')).toHaveAttribute('src', /\/api\/experiments\/[^/]+\/audio\/hybrid/);
  await page.getByRole('link', { name: 'Open result in V2 Audio Laboratory' }).click();
  await expect(page).toHaveURL(/index\.html\?design=2&run=.*&track=hybrid#audio-lab/);
  await expect(page.locator('#run-tag')).toContainText('RUN /', { timeout: 30000 });
  await expect(page.locator('#track-title')).toHaveText('TRISHUL Hybrid');
  expect(errors).toEqual([]);
});

test('V2 Hindi mark is legible and hardware layout fits viewport', async ({ page }) => {
  await page.goto('/index.html?design=2');
  const mark = page.locator('.sidebar .deva-wordmark [lang="hi"]');
  await expect(mark).toHaveText('त्रि');
  expect(await mark.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(20);
  await page.goto('/hardware.html');
  await expect(page.locator('.hardware-brand [lang="hi"]')).toHaveText('त्रि');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
});
