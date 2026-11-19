import { test as base, type BrowserContext } from '@playwright/test'

export { expect, type Locator } from '@playwright/test'

// Playwright waits for an element to stop moving before acting on it, so tests pause the endless idle float.
export async function pauseIdleFloat(context: BrowserContext) {
  await context.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style')
      style.textContent = '.collection-object { animation: none !important; }'
      document.head.append(style)
    })
  })
}

export const test = base.extend<{ idleFloat: boolean }>({
  idleFloat: [false, { option: true }],
  context: async ({ context, idleFloat }, use) => {
    if (!idleFloat) await pauseIdleFloat(context)
    await use(context)
  },
})
