const { test, expect } = require('@playwright/test');

test('six-scene story remains navigable and connected', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/experience.html');
  await expect(page.getByRole('heading', { name: /When noise rises/ })).toBeVisible();
  await expect(page.locator('main section')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await expect(page.getByRole('link', { name: 'Launch research lab' }).first()).toHaveAttribute('href', '/index.html?design=2#audio-lab');
  await page.getByRole('link', { name: 'Explore how it works' }).click();
  await expect(page).toHaveURL(/#problem$/);
  await expect(page.getByText('DSP fallback; not neural AI')).toBeVisible();
  expect(errors).toEqual([]);
});

test('microphone scene responds to scroll while keeping its content readable', async ({ page }) => {
  await page.goto('/experience.html');
  const scene = page.locator('#concept');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene.locator('.floating-mic')).toHaveCount(2);
  const before = await scene.evaluate(element => getComputedStyle(element).getPropertyValue('--float-a').trim());
  await page.evaluate(() => scrollBy(0, 280));
  await expect.poll(() => scene.evaluate(element => getComputedStyle(element).getPropertyValue('--float-a').trim())).not.toBe(before);
  await expect(page.getByRole('heading', { name: /Two ears for the environment/ })).toBeVisible();
  const cards = page.locator('#policies .policy-grid article');
  await expect(cards).toHaveCount(3);
  await cards.first().scrollIntoViewIfNeeded();
  const cardBefore = await cards.first().evaluate(element => getComputedStyle(element).transform);
  await page.evaluate(() => scrollBy(0, 240));
  await expect.poll(() => cards.first().evaluate(element => getComputedStyle(element).transform)).not.toBe(cardBefore);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('real processor generates a user-triggered synthetic comparison', async ({ page, request }) => {
  await page.goto('/experience.html');
  await expect(page.locator('#evidence-content')).not.toHaveText(/Checking this visitor/);
  await page.getByRole('button', { name: 'Generate a synthetic example' }).click();
  await expect(page.getByText(/Synthetic example ready/)).toBeVisible({ timeout: 45000 });
  await expect(page.locator('#spectrum-caption')).toContainText('Measured STFT', { timeout: 45000 });
  await expect(page.locator('#comparison-wave')).toHaveAttribute('aria-label', /Measured RMS envelope/);
  await page.getByRole('button', { name: /01 Raw input/ }).click();
  const src = await page.locator('#comparison-audio').getAttribute('src');
  expect(src).toMatch(/^\/api\/experiments\/[a-f0-9]{12}\/audio\/raw$/);
  const audio = await request.get(src);
  expect(audio.ok()).toBeTruthy();
  expect(audio.headers()['content-type']).toContain('audio/wav');
  await page.getByRole('button', { name: /02 Hybrid output/ }).click();
  await expect(page.locator('#comparison-audio')).toHaveAttribute('src', /\/audio\/hybrid$/);
});

test('reduced motion and disconnected processor keep navigation usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', route => route.abort());
  await page.goto('/experience.html');
  await expect(page.getByText(/processor is unavailable/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Spectral Studio' })).toHaveAttribute('href', '/studio.html?design=2');
  await page.getByRole('link', { name: 'Launch research lab' }).first().click();
  await expect(page).toHaveURL(/index\.html\?design=2#audio-lab/);
});

test('laboratory runs a measured experiment and exports evidence', async ({ page, request }) => {
  await page.goto('/index.html?design=2');
  await expect(page.locator('.status-pill')).toContainText('PROCESSOR CONNECTED');
  await page.getByRole('button', { name: 'Run signal analysis' }).click();
  const wav = page.getByRole('link', { name: 'Download selected WAV' });
  await expect(wav).toHaveAttribute('href', /\/api\/experiments\/[a-f0-9]{12}\/audio\/raw$/, { timeout: 45000 });
  const csv = page.getByRole('link', { name: 'EXPORT CSV' });
  await expect(csv).toHaveAttribute('href', /\/api\/experiments\/[a-f0-9]{12}\/export\.csv$/);
  expect((await request.get(await wav.getAttribute('href'))).ok()).toBeTruthy();
  const exported = await request.get(await csv.getAttribute('href'));
  expect(exported.ok()).toBeTruthy();
  expect(await exported.text()).toContain('snr_db');
  await expect(page.locator('#stoi-result')).toHaveText('—');
});

test('Spectral Studio edits a real signal without replacing the source', async ({ page, request }) => {
  await page.goto('/studio.html?design=2');
  await page.getByRole('button', { name: 'Try a test signal' }).click();
  await expect(page.getByRole('button', { name: 'Apply edit' })).toBeEnabled({ timeout: 45000 });
  const original = await page.getByRole('link', { name: '↓ Export WAV' }).getAttribute('href');
  expect(original).toMatch(/\/audio\/source$/);
  await page.getByRole('button', { name: 'Apply edit' }).click();
  await expect(page.getByRole('button', { name: /Spectral edit · 1 operations/ })).toBeVisible({ timeout: 45000 });
  await expect(page.getByRole('button', { name: /Original · locked/ })).toBeVisible();
  const edited = await page.getByRole('link', { name: '↓ Export WAV' }).getAttribute('href');
  expect(edited).not.toBe(original);
  expect((await request.get(original)).ok()).toBeTruthy();
  expect((await request.get(edited)).ok()).toBeTruthy();
  await page.getByRole('button', { name: /Undo/ }).click();
  await expect(page.getByRole('button', { name: /Redo/ })).toBeEnabled();
});
