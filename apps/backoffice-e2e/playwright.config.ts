import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  workers: 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  webServer: [
    {
      command: 'npx nx serve server',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx dev sportsbook',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx dev backoffice',
      url: 'http://localhost:4201',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      cwd: workspaceRoot,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment for mobile browsers support
    /*

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {

      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
