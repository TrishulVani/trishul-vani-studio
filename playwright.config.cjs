const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  workers: 3,
  use: { baseURL: 'http://127.0.0.1:8002', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', channel: 'chrome', viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { browserName: 'chromium', channel: 'chrome', viewport: { width: 768, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', channel: 'chrome', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: { command: 'python -m uvicorn app.main:app --host 127.0.0.1 --port 8002', url: 'http://127.0.0.1:8002/api/health', reuseExistingServer: !process.env.CI, timeout: 120000 }
});
