const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.MAPPOP_TEST_URL || 'http://127.0.0.1:8787',
    viewport: { width: 1440, height: 1000 },
    headless: true,
    launchOptions: process.env.MAPPOP_BROWSER_PROXY ? { proxy: { server: process.env.MAPPOP_BROWSER_PROXY } } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: process.env.MAPPOP_TEST_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://127.0.0.1:8787',
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  }
})
