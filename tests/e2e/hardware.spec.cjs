const { test, expect } = require('@playwright/test');

test('virtual assembly, circuit, controller logic and real DSP handoff', async ({ page }) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/hardware.html');
  await expect(page.locator('#modelFallback')).toBeHidden();
  await expect(page.locator('#viewer')).toBeVisible();
  await page.waitForFunction(() => Boolean(window.hardwareModelV2 && window.hardwareBenchV2));
  await expect(page.locator('#wiring-state')).toHaveText('Virtual signal path ready');
  await page.getByRole('button', { name: 'Exploded', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Exploded', exact: true })).toHaveClass(/active/);
  await page.getByRole('button', { name: 'Remove wire 1', exact: true }).click();
  await expect(page.locator('#wiring-issues')).toContainText('Primary microphone');
  await page.getByRole('button', { name: 'Close-talk microphone OUT CH 1' }).click();
  await page.getByRole('button', { name: 'Shared-clock stereo capture IN1 CH 1' }).click();
  await expect(page.locator('#wiring-state')).toHaveText('Virtual signal path ready');
  await page.getByRole('button', { name: 'Deploy & run virtual rig' }).click();
  await expect(page.locator('#serial-output')).toContainText('SIMULATION COMPLETE');
  await expect(page.locator('#serial-output')).toContainText('UART READY → pico1.RX');
  await expect(page.locator('#rig-summary')).toContainText('6 / 6 virtual tasks ready');
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

test('a one-line code change changes virtual tasks and blocks audio route', async ({ page }) => {
  await page.goto('/hardware.html');
  await page.waitForFunction(() => Boolean(window.hardwareBenchV2));
  await page.locator('#code-input').fill('MODE SPECTRAL\nSTREAM OFF\nSET GPIO17 LOW\nSEND UART READY');
  await page.getByRole('button', { name: 'Deploy & run virtual rig' }).click();
  await expect(page.locator('#task-results')).toContainText('Receiver audio route');
  await expect(page.locator('#task-results')).toContainText('STREAM OFF');
  await expect(page.locator('#model-device-status')).toContainText('OUTPUT MUTED');
  await page.getByRole('button', { name: 'Run connected DSP test' }).click();
  await expect(page.locator('#test-status')).toContainText('Virtual path blocked');
  await page.locator('#code-input').fill('MODE SPECTRAL\nSTREAM ON\nSET GPIO17 HIGH\nSEND UART READY');
  await page.getByRole('button', { name: 'Deploy & run virtual rig' }).click();
  await expect(page.locator('#test-track')).toHaveValue('spectral');
  await expect(page.locator('#task-results')).toContainText('READY · Receiver audio route');
  await expect(page.locator('#model-device-status')).toContainText('OUTPUT ON');
  await page.locator('#code-input').fill('MODE SPECTRAL\nSTREAM ON\nWRONG COMMAND');
  await page.getByRole('button', { name: 'Deploy & run virtual rig' }).click();
  await expect(page.locator('#serial-output')).toContainText('pi1:L3: unsupported');
  await expect(page.locator('#rig-summary')).toContainText('deploy stopped');
});

test('hardware laboratory is available inside V2 without replacing V1', async ({ page }) => {
  await page.goto('/index.html?design=2#hardware-lab');
  const frame = page.frameLocator('#hardware-lab-frame');
  await expect(frame.locator('#model-title')).toBeVisible();
  await expect(frame.locator('#code-input')).toBeVisible();
  await page.goto('/index.html');
  await expect(page.locator('#hardware-lab')).toBeHidden();
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

test('the same green favicon and Hindi brand appear across site pages', async ({ page }) => {
  for (const route of ['/index.html', '/index.html?design=2', '/experience.html', '/studio.html', '/hardware.html', '/hardware-mkv.html', '/about.html']) {
    await page.goto(route);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.svg/);
    await expect(page).toHaveTitle(/त्रिSHUL VANI/);
  }
});

test('wire and 3D part inspectors trace source, sink and unverified physical state', async ({ page }) => {
  await page.goto('/hardware.html');
  await page.waitForFunction(() => Boolean(window.hardwareModelV2 && window.hardwareBenchV2));
  await page.getByRole('button', { name: 'Inspect wire 1', exact: true }).click();
  await expect(page.locator('#connection-inspector')).toContainText('Close-talk microphone OUT');
  await expect(page.locator('#connection-inspector')).toContainText('Physical status');
  await page.getByRole('button', { name: 'SINGLE BOARD COMPUTER' }).click();
  await expect(page.locator('#part-connections')).toContainText('pi1.USB');
});

test('Pico and ESP scripts propagate pin and UART states through virtual nets', async ({ page }) => {
  await page.goto('/hardware.html');
  await page.waitForFunction(() => Boolean(window.hardwareBenchV2));
  await page.locator('#code-board').selectOption('pico1');
  await page.locator('#code-input').fill('SET GP15 LOW\nREAD GP14\nSEND UART STATUS_LOW');
  await page.locator('#code-board').selectOption('esp1');
  await page.locator('#code-input').fill('SET GPIO5 LOW\nREAD GPIO4\nLOG sensor idle');
  await page.getByRole('button', { name: 'Deploy & run virtual rig' }).click();
  await expect(page.locator('#serial-output')).toContainText('pico1:L1 0 ms SET GP15 LOW');
  await expect(page.locator('#serial-output')).toContainText('esp1:L2 0 ms GPIO4 → HIGH');
  await expect(page.locator('#serial-output')).toContainText('pico1:L3 0 ms UART STATUS_LOW → pi1.RX');
  await expect(page.locator('#virtual-pins')).toContainText('pico1.GP15 LOW');
  await expect(page.locator('#virtual-pins')).toContainText('esp1.GPIO5 LOW');
  await page.locator('#code-board').selectOption('pi1');
  await page.locator('#code-input').fill('MODE HYBRID\nSTREAM ON\nSET GPIO17 LOW');
  await page.getByRole('button', { name: 'Deploy & run virtual rig' }).click();
  await expect(page.locator('#serial-output')).toContainText('esp1:L2 0 ms GPIO4 → LOW');
  await expect(page.locator('#task-results')).toContainText('BLOCKED · ESP32 control input');
});
