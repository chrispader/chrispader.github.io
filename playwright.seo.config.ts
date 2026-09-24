import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/seo',
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5175', viewport: { width: 1440, height: 1000 } },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --outDir docs --host 127.0.0.1 --port 5175',
    url: 'http://127.0.0.1:5175',
    reuseExistingServer: false,
  },
})
