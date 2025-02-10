import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  workers: 1,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
/*
  /!* Run your local dev server before starting the tests *!/
  __webServer: {
    command: 'npx nx run @my-org/backoffice:preview',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
  },
*/
  webServer: [
    {
      command: 'npx nx serve server',
      url: 'http://localhost:3001/api/events',
      //reuseExistingServer: !process.env.CI,
      reuseExistingServer: true,
      timeout: 5000,
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx dev sportsbook',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 5000,
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx dev backoffice',
      url: 'http://localhost:4201',
      reuseExistingServer: true,
      timeout: 5000,
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
