const { test, expect } = require('@playwright/test');

test('six-scene story remains navigable and connected', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/experience.html?story=1');
  await expect(page.getByRole('heading', { name: /When noise rises/ })).toBeVisible();
  await expect(page.locator('main section')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await expect(page.getByRole('link', { name: 'Enter TRISHUL VANI' }).first()).toHaveAttribute('href', '/index.html?design=2');
  await page.getByRole('link', { name: 'Explore how it works' }).click();
  await expect(page).toHaveURL(/#problem$/);
  await expect(page.getByText('DSP fallback; not neural AI')).toBeVisible();
  expect(errors).toEqual([]);
});

test('trident idles, scrolls forward, rewinds, and enters the working landing', async ({ page }) => {
  await page.goto('/experience.html');
  await expect(page.locator('#arrival')).toBeVisible();
  await expect(page.locator('.arrival-figure')).toHaveCount(0);
  await expect(page.locator('.arrival-weapon')).toHaveAttribute('src', '/assets/preview-trident-v2.webp');
  const spin = page.locator('.arrival-weapon-body');
  const before = await spin.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(300);
  expect(await spin.evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
  await expect(page).toHaveURL(/experience\.html$/);
  await page.locator('#arrival').dispatchEvent('wheel', { deltaY: 850, deltaMode: 0 });
  await expect(page.locator('#arrival-stage')).toContainText('THE TURN');
  await page.locator('#arrival').dispatchEvent('wheel', { deltaY: -760, deltaMode: 0 });
  await expect(page.locator('#arrival-stage')).toContainText('THE AWAKENING');
  await page.locator('#arrival').dispatchEvent('wheel', { deltaY: 2500, deltaMode: 0 });
  await expect(page).toHaveURL(/index\.html\?design=2$/, { timeout: 10000 });
  await expect(page.locator('.relaunch-story')).toBeVisible();
  await expect(page.getByRole('heading', { name: /The signal survives/i })).toBeVisible();
  await expect(page.locator('.relaunch-flight')).toHaveAttribute('src', '/assets/signal-operator-v2.png');
  await expect(page.locator('img[src*="microphone-v2"]')).toHaveCount(0);
});

test('intro can be skipped and Version 1 keeps its original landing', async ({ page }) => {
  await page.goto('/experience.html');
  await page.getByRole('button', { name: /Skip intro/i }).click();
  await expect(page).toHaveURL(/index\.html\?design=2$/);
  await expect(page.locator('.relaunch-story')).toBeVisible();
  await page.goto('/index.html');
  await expect(page.locator('.relaunch-story')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Clarity under pressure/i })).toBeVisible();
});

test('three environment cards become one reversible flight into the audio lab', async ({ page }) => {
  await page.goto('/index.html?design=2');
  await expect(page.locator('.v2-service-scene')).toHaveCount(0);
  const scene = page.locator('.v2-journey');
  await expect(scene).toHaveCount(1);
  await expect(scene.locator('.v2-journey-operator')).toHaveAttribute('src', '/assets/signal-operator-v2.png');
  await expect(scene.locator('.v2-journey-flight img')).toHaveAttribute('src', '/assets/operator-b2-journey-v2.png');
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const go = async progress => page.evaluate(progress => {
    const scene = document.querySelector('.v2-journey');
    const top = scene.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (scene.offsetHeight - scene.querySelector('.v2-journey-stage').clientHeight) * progress, behavior: 'instant' });
  }, progress);
  await go(.14);
  await expect(page.locator('#v2-journey-phase')).toContainText('APPROACH');
  const closeScale = await scene.evaluate(el => Number(el.style.getPropertyValue('--operator-scale')));
  await go(.58);
  await expect(page.locator('#v2-journey-phase')).toContainText('FLIGHT');
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--operator-scale')))).toBeLessThan(closeScale);
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--flight-opacity')))).toBeGreaterThan(.9);
  await go(.84);
  await expect(page.locator('#v2-journey-phase')).toContainText('BREAKTHROUGH');
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--shards-opacity')))).toBeGreaterThan(0);
  await go(.96);
  await expect(page.getByRole('link', { name: 'Enter the audio laboratory' })).toBeVisible();
  await page.getByRole('link', { name: 'Enter the audio laboratory' }).click();
  await expect(page).toHaveURL(/#audio-lab$/);
  await expect(page.getByRole('heading', { name: /Audio laboratory/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.goto('/index.html');
  await expect(page.locator('.v2-journey')).toBeHidden();
});

test('sound chamber grows to full width and the figure moves through it', async ({ page }) => {
  await page.goto('/index.html?design=2');
  const media = page.locator('.relaunch-media');
  const firstWidth = (await media.boundingBox()).width;
  expect(firstWidth).toBeLessThan(page.viewportSize().width * .97);
  await page.evaluate(() => { const scene = document.querySelector('.relaunch-story'); scrollTo(0, scene.offsetTop + (scene.offsetHeight - innerHeight) * .62); });
  await expect(page.locator('.relaunch-story')).toHaveAttribute('data-chapter', '2');
  await expect.poll(async () => (await media.boundingBox()).width).toBeGreaterThan(page.viewportSize().width * .98);
  await expect(page.locator('.relaunch-flight')).toBeVisible();
  await expect(page.locator('.relaunch-media-index')).toContainText('SEPARATE');
});

test('aircraft flyover follows scroll in both directions before the sound story', async ({ page }) => {
  await page.goto('/index.html?design=2');
  const flyover = page.locator('.flyover-v2');
  const craft = page.locator('.flyover-craft');
  await expect(flyover).toBeVisible();
  await expect(craft.locator('img')).toHaveAttribute('src', '/assets/b2-flyover-v2.webp');
  await expect(page.locator('.relaunch-story')).toBeVisible();
  const progress = async () => Number((await page.locator('#flyover-percent').innerText()).replace('%', ''));
  await page.evaluate(() => { const scene = document.querySelector('.flyover-v2'); scrollTo(0, scene.offsetTop + (scene.offsetHeight - innerHeight) * .66); });
  await expect.poll(progress).toBeGreaterThan(60);
  const forward = await craft.evaluate(el => getComputedStyle(el).transform);
  await page.evaluate(() => { const scene = document.querySelector('.flyover-v2'); scrollTo(0, scene.offsetTop + (scene.offsetHeight - innerHeight) * .23); });
  await expect.poll(progress).toBeLessThan(30);
  await expect(page.locator('#flyover-direction')).toContainText('REWINDING');
  expect(await craft.evaluate(el => getComputedStyle(el).transform)).not.toBe(forward);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.goto('/index.html');
  await expect(page.locator('.flyover-v2')).toHaveCount(0);
});

test('story launch reaches the redesigned working lab', async ({ page }) => {
  await page.goto('/experience.html?story=1');
  await page.getByRole('link', { name: 'Enter TRISHUL VANI' }).first().click();
  await expect(page.locator('.launch-portal.is-active .throw-object img')).toHaveCount(6);
  await expect(page).toHaveURL(/index\.html\?design=2$/);
  await expect(page.getByRole('heading', { name: /The signal survives/i })).toBeVisible();
  await expect(page.locator('.relaunch-story')).toBeVisible();
  await expect(page.locator('img[src*="microphone-v2"]')).toHaveCount(0);
});

test('microphone scene responds to scroll while keeping its content readable', async ({ page }) => {
  await page.goto('/experience.html?story=1');
  const scene = page.locator('#concept');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene.locator('.floating-source')).toHaveCount(2);
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
  await page.goto('/experience.html?story=1');
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
  await page.goto('/experience.html?story=1');
  await expect(page.getByText(/processor is unavailable/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Spectral Studio' })).toHaveAttribute('href', '/studio.html?design=2');
  await page.getByRole('link', { name: 'Enter TRISHUL VANI' }).first().click();
  await expect(page).toHaveURL(/index\.html\?design=2/);
});

test('laboratory runs a measured experiment and exports evidence', async ({ page, request }) => {
  await page.goto('/index.html?design=2');
  await expect(page.locator('.relaunch-story')).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; const scene = document.querySelector('.relaunch-story'); scrollTo(0, scene.offsetTop + (scene.offsetHeight - innerHeight) * .87); });
  await expect(page.locator('.relaunch-story')).toHaveAttribute('data-chapter', '3');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
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
