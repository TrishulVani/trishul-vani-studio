const { test, expect } = require('@playwright/test');

test('six-scene story remains navigable and connected', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/experience.html?story=1');
  await expect(page.getByRole('heading', { name: /When noise rises/ })).toBeVisible();
  await expect(page.locator('main section')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await expect(page.getByRole('link', { name: 'Enter त्रिSHUL VANI' }).first()).toHaveAttribute('href', '/lab.html?design=2');
  await page.getByRole('link', { name: 'Explore how it works' }).click();
  await expect(page).toHaveURL(/#problem$/);
  await expect(page.getByText('DSP fallback; not neural AI')).toBeVisible();
  expect(errors).toEqual([]);
});

test('root trident turns as an extruded 3D object, then reveals overview and lab', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#arrival')).toBeVisible();
  await expect(page.locator('.arrival-figure')).toHaveCount(0);
  await expect(page.locator('.arrival-weapon')).toHaveAttribute('src', '/assets/preview-trident-v2.webp');
  await expect(page.locator('.arrival-weapon-3d')).toBeVisible();
  await expect(page.locator('.arrival-weapon-body')).toHaveClass(/has-3d/);
  await expect(page.locator('.arrival-brand .v2-brand-glyph')).toBeVisible();
  await expect(page.locator('.arrival-brand [lang="hi"]')).toHaveText('त्रि');
  await expect(page.locator('.arrival[data-beat="0"] .arrival-beats [data-beat="0"]')).toBeVisible();
  const spin = page.locator('.arrival-weapon-body');
  expect(await spin.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.arrival-weapon-3d').evaluate(canvas => !!canvas.getContext('webgl'))).toBeTruthy();
  await expect(page).toHaveURL(/127\.0\.0\.1:8002\/$/);
  await page.locator('#arrival').dispatchEvent('wheel', { deltaY: 650, deltaMode: 0 });
  await expect(page.locator('#arrival-stage')).toContainText('THE TURN');
  await expect(page.locator('.arrival')).toHaveAttribute('data-beat', '1');
  await page.locator('#arrival').dispatchEvent('wheel', { deltaY: -760, deltaMode: 0 });
  await expect(page.locator('#arrival-stage')).toContainText('THE AWAKENING');
  await page.locator('#arrival').dispatchEvent('wheel', { deltaY: 2500, deltaMode: 0 });
  await expect(page).toHaveURL(/127\.0\.0\.1:8002\/$/, { timeout: 5000 });
  const app = page.frameLocator('#landing-frame');
  await expect(app.locator('#hero-title')).toBeVisible();
  await expect(app.getByRole('link', { name: 'Enter त्रिSHUL VANI' }).first()).toBeVisible();
  await app.getByRole('link', { name: 'Enter त्रिSHUL VANI' }).first().click();
  await expect(app.locator('#workspace-dashboard')).toBeVisible();
  await expect(app.locator('.workspace-dashboard-metric')).toHaveCount(4);
  await expect(app.locator('.workspace-dashboard-links>a')).toHaveCount(4);
  await expect(app.locator('.workspace-signal-plot')).toBeVisible();
  await expect(app.locator('.workspace-activity-panel')).toBeVisible();
  if (page.viewportSize().width > 700) {
    const navBottom = await app.locator('.sidebar').evaluate(el => el.getBoundingClientRect().bottom);
    const headingTop = await app.locator('#workspace-dashboard-title').evaluate(el => el.getBoundingClientRect().top);
    expect(headingTop).toBeGreaterThan(navBottom);
  }
  await expect(page.locator('#arrival')).toHaveCount(0);
});

test('intro skip returns the overview page before entering the working lab', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Enter site/i }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:8002\/$/, { timeout: 3000 });
  const app = page.frameLocator('#landing-frame');
  await expect(app.locator('#hero-title')).toBeVisible();
  await expect(app.getByRole('link', { name: 'Enter त्रिSHUL VANI' }).first()).toBeVisible();
});

test('studio back navigation returns to the overview inside the same site', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Enter site/i }).click();
  const app = page.frameLocator('#landing-frame');
  await expect(app.locator('#hero-title')).toBeVisible();
  await app.getByRole('link', { name: 'Enter त्रिSHUL VANI' }).first().click();
  await expect(app.locator('#workspace-dashboard')).toBeVisible();
  await app.getByRole('link', { name: /Spectral studio/ }).last().click();
  await expect(app.locator('.rail nav a.active')).toContainText('Spectral studio');
  await page.evaluate(() => history.back());
  await expect(app.locator('#hero-title')).toBeVisible();
  await expect(page).toHaveURL(/127\.0\.0\.1:8002\/$/);
});

test('the supplied gold mark appears throughout V2 without replacing V1 branding', async ({ page }) => {
  await page.goto('/lab.html?design=2');
  const sideMark = page.locator('.sidebar .v2-brand-glyph');
  expect(await sideMark.evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  await expect(page.locator('.sidebar .brand [lang="hi"]')).toHaveText('त्रि');
  await expect(page.locator('.flyover-brand .v2-brand-glyph')).toBeVisible();
  await expect(page.locator('.v2-journey-brand .v2-brand-glyph')).toBeVisible();
  await page.goto('/studio.html?design=2');
  await expect(page.locator('.rail .v2-brand-glyph')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('site-wide atmosphere changes with scroll and reverses without affecting V1', async ({ page }) => {
  await page.goto('/lab.html?design=2');
  await expect(page.locator('.tv-atmosphere > span')).toHaveCount(5);
  await expect(page.locator('body')).toHaveAttribute('data-tv-tone', 'navy');
  const firstNavy = await page.evaluate(() => Number(document.body.style.getPropertyValue('--tv-navy-opacity')));
  await page.locator('.nav-item[href="#audio-lab"]').click();
  await page.locator('#audio-lab').evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => Number(document.body.style.getPropertyValue('--tv-forest-opacity')))).toBeGreaterThan(.3);
  await page.locator('.nav-item[href="#overview"]').click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => Number(document.body.style.getPropertyValue('--tv-navy-opacity')))).toBeGreaterThanOrEqual(firstNavy - .01);
  await page.goto('/studio.html?design=2');
  await expect(page.locator('.tv-atmosphere')).toHaveCount(1);
  await page.goto('/index.html');
  await expect(page.locator('.tv-atmosphere')).toHaveCount(0);
});

test('the operator crosses ribbons and a glass barrier before cockpit flight and lab', async ({ page }) => {
  await page.goto('/lab.html?design=2');
  await expect(page.locator('.v2-service-scene')).toHaveCount(0);
  const scene = page.locator('.v2-journey');
  await expect(scene).toHaveCount(1);
  await expect(scene.locator('.v2-journey-operator')).toHaveAttribute('src', '/assets/signal-operator-v2.png');
  await expect(scene.locator('.v2-journey-flight img')).toHaveAttribute('src', '/assets/operator-b2-journey-v2.png');
  await expect(scene.locator('.v2-journey-passage img')).toHaveAttribute('src', '/assets/signal-corridor-plate-v2.png');
  await expect(scene.locator('.v2-journey-traveler')).toHaveAttribute('src', '/assets/operator-flight-cutout-v2.png');
  await expect(scene.locator('.v2-journey-ribbons textPath')).toHaveCount(3);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const go = async progress => page.evaluate(progress => {
    const scene = document.querySelector('.v2-journey');
    const top = scene.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (scene.offsetHeight - scene.querySelector('.v2-journey-stage').clientHeight) * progress, behavior: 'instant' });
  }, progress);
  await go(.14);
  await expect(page.locator('#v2-journey-phase')).toContainText('APPROACH');
  await scene.locator('.v2-journey-stage').dispatchEvent('pointermove', { clientX: 80, clientY: 120 });
  await expect.poll(() => scene.evaluate(el => el.style.getPropertyValue('--pointer-shift-x'))).not.toBe('0px');
  await scene.locator('.v2-journey-stage').dispatchEvent('pointerleave');
  await expect.poll(() => scene.evaluate(el => el.style.getPropertyValue('--pointer-shift-x'))).toBe('0px');
  await expect.poll(() => scene.evaluate(el => Number(el.style.getPropertyValue('--operator-scale')))).toBeGreaterThan(.8);
  const closeScale = await scene.evaluate(el => Number(el.style.getPropertyValue('--operator-scale')));
  await go(.35);
  await expect(page.locator('#v2-journey-phase')).toContainText('INTERSTELLAR');
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--passage-opacity')))).toBeGreaterThan(0);
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--ribbons-opacity')))).toBeGreaterThan(0);
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--voxels-opacity')))).toBeGreaterThan(0);
  const travelerBefore = await scene.evaluate(el => Number(el.style.getPropertyValue('--traveler-scale')));
  await go(.56);
  await expect(page.locator('#v2-journey-phase')).toContainText('GLASS BREAK');
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--operator-scale')))).toBeLessThan(closeScale);
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--shards-opacity')))).toBeGreaterThan(0);
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--traveler-scale')))).toBeGreaterThan(travelerBefore);
  await go(.78);
  await expect(page.locator('#v2-journey-phase')).toContainText('COCKPIT FLIGHT');
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--flight-opacity')))).toBeGreaterThan(.9);
  await go(.92);
  await expect(page.locator('#v2-journey-phase')).toContainText('FLY-OFF');
  expect(await scene.evaluate(el => Number(el.style.getPropertyValue('--departure-opacity')))).toBeGreaterThan(0);
  await go(.99);
  await expect(page.locator('#v2-journey-phase')).toContainText('AUDIO LABORATORY');
  await expect(page.getByRole('link', { name: 'Enter the audio laboratory' })).toBeVisible();
  await page.getByRole('link', { name: 'Enter the audio laboratory' }).click();
  await expect(page).toHaveURL(/#audio-lab$/);
  await expect(page.getByRole('heading', { name: /Audio laboratory/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.goto('/index.html');
  await expect(page.locator('.v2-journey')).toBeHidden();
});



test('story launch reaches the connected laboratory route', async ({ page }) => {
  await page.goto('/experience.html?story=1');
  await page.getByRole('link', { name: 'Enter त्रिSHUL VANI' }).first().click();
  await expect(page).toHaveURL(/lab\.html\?design=2$/);
  await page.locator('.nav-item[href="#audio-lab"]').click();
  await expect(page.locator('#audio-lab')).toBeVisible();
  await expect(page.locator('#run-btn')).toBeVisible();
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
  await page.getByRole('link', { name: 'Enter त्रिSHUL VANI' }).first().click();
  await expect(page).toHaveURL(/lab\.html\?design=2/);
});

test('laboratory runs a measured experiment and exports evidence', async ({ page, request }) => {
  await page.goto('/lab.html?design=2#audio-lab');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await expect(page.locator('.status-pill')).toContainText('PROCESSOR CONNECTED');
  await page.getByRole('button', { name: 'Run signal analysis' }).click();
  const wav = page.getByRole('link', { name: 'Download selected WAV' });
  await expect(wav).toHaveAttribute('href', /\/api\/experiments\/[a-f0-9]{12}\/audio\/raw$/, { timeout: 45000 });
  const wavHref = await wav.getAttribute('href');
  if (await page.locator('.nav-item[href="#analytics"]').isVisible()) {
    await page.locator('.nav-item[href="#analytics"]').click();
  }
  const csv = page.getByRole('link', { name: 'EXPORT CSV' });
  await expect(csv).toHaveAttribute('href', /\/api\/experiments\/[a-f0-9]{12}\/export\.csv$/);
  expect((await request.get(wavHref)).ok()).toBeTruthy();
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
