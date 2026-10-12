const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const [name, viewport, isMobile] of [
      ['desktop', { width: 1440, height: 900 }, false],
      ['mobile', { width: 390, height: 844 }, true],
    ]) {
      const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile });
      const page = await context.newPage();
      await page.goto(`${process.env.BASE_URL || 'http://127.0.0.1:8002'}/hardware-mkv.html`);
      await page.locator('#mkv-noise').selectOption('impulse');
      await page.locator('#mkv-run').click();
      await page.waitForFunction(() => /Software run .* complete/.test(document.querySelector('#mkv-run-status')?.textContent || ''), null, { timeout: 90000 });
      await page.locator('[data-track="hybrid"]').click();
      await page.locator('#evidence').screenshot({
        path: path.join(__dirname, `../docs/hardware-mkv/screenshots/mkv-evidence-${name}.png`),
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
