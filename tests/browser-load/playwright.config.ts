import { defineConfig } from '@playwright/test';
import { bases } from './src/config.js';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright', open: 'never' }], ['json', { outputFile: 'reports/playwright-results.json' }]],
  timeout: 90_000,
  use: { browserName: 'chromium', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'off', actionTimeout: 10_000, navigationTimeout: 20_000 },
  projects: [{ name: 'chromium', use: { baseURL: bases.portfolio } }],
});
