const { test, expect } = require('@playwright/test');

test('MK-V preview reuses inspectable assembly and real offline A/B audio', async ({ page }) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/hardware-mkv.html');
  await expect(page).toHaveTitle(/त्रिSHUL VANI/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('.mkv-hero img')).toHaveJSProperty('complete', true);
  await expect(page.locator('#backend-status')).toHaveText('OFFLINE PYTHON DSP CONNECTED');
  await page.locator('#assembly').scrollIntoViewIfNeeded();
  const frame = page.frameLocator('#mkv-assembly-frame');
  await expect(frame.locator('#viewer')).toBeVisible();
  await page.getByRole('button', { name: 'Connection bench' }).click();
  await expect(frame.locator('#wire-list')).toContainText('mic1.OUT');
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await page.locator('#mkv-noise').selectOption('impulse');
  await page.getByRole('button', { name: 'Generate measured software comparison' }).click();
  await expect(page.locator('#mkv-run-status')).toContainText(/Software run .* complete/, { timeout: 90000 });
  await expect(page.locator('#mkv-run-id')).toContainText('SYNTHETIC');
  await expect(page.locator('#mkv-audio')).toHaveAttribute('src', /\/api\/experiments\/[^/]+\/audio\/raw/);
  await expect(page.locator('#mkv-mute')).toBeChecked();
  expect(await page.locator('#mkv-raw-wave').evaluate(canvas => {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    return data.some((n, i) => i % 4 === 3 && n > 0);
  })).toBeTruthy();
  await page.locator('#mkv-audio').evaluate(audio => { audio.currentTime = 1; });
  await page.getByRole('button', { name: 'Switch RAW ↔ HYBRID' }).click();
  await expect(page.locator('#mkv-audio')).toHaveAttribute('src', /\/audio\/hybrid/);
  await expect.poll(() => page.locator('#mkv-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0.8);
  await expect(page.locator('#mkv-download')).toHaveAttribute('href', /\/audio\/hybrid/);
  await expect(page.locator('#mkv-metrics')).toContainText('Output SNR');
  expect(errors).toEqual([]);
});

test('MK-V remains honest and navigable when the software backend is unavailable', async ({ page }) => {
  await page.route('**/api/meta', route => route.abort());
  await page.goto('/hardware-mkv.html');
  await expect(page.locator('#backend-status')).toHaveText('AUDIO PROCESSOR UNAVAILABLE');
  await expect(page.locator('#mkv-run')).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Open original MK-IV separately' })).toHaveAttribute('href', '/hardware.html');
  await expect(page.locator('#engineering')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
});

test('five noise situations produce distinct, measured audio runs', async ({ request }) => {
  test.setTimeout(120000);
  const scenarios = ['factory', 'engine', 'wind', 'impulse', 'crowd'];
  const ids = new Set();
  for (const noise of scenarios) {
    const response = await request.post('/api/experiments/simulate', {
      data: { noise, snr_db: -4, seed: 42, duration_s: 1.5 },
    });
    expect(response.ok(), `${noise} API status`).toBeTruthy();
    const report = await response.json();
    expect(report.noise).toBe(noise);
    expect(report.source).toBe('synthetic');
    expect(report.waveforms.raw.length).toBeGreaterThan(0);
    expect(report.waveforms.hybrid.length).toBeGreaterThan(0);
    expect(Number.isFinite(report.metrics.raw.snr_db)).toBeTruthy();
    expect(Number.isFinite(report.metrics.hybrid.snr_db)).toBeTruthy();
    const wav = await request.get(`/api/experiments/${report.id}/audio/hybrid`);
    expect(wav.ok()).toBeTruthy();
    expect((await wav.body()).subarray(0, 4).toString('ascii')).toBe('RIFF');
    ids.add(report.id);
  }
  expect(ids.size).toBe(scenarios.length);
});
