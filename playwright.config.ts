import { defineConfig } from '@playwright/test';

export default defineConfig({

  timeout: 30000,

  retries: 1,

  workers: 2,

  reporter: [
    ['html'],
    ['list']
  ],

  use: {

    headless: true,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'retain-on-failure'

  },

});