import { test, expect } from '@playwright/test'
import { expectCollectionFits } from './geometry'

for (const count of [1, 4, 8, 16, 30]) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`${count} objects fit at ${width}px before and after rearranging`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(`/?previewItems=${count}`)
      await page.waitForTimeout(850)
      await expectCollectionFits(page, count)
      await page.getByRole('button', { name: 'Rearrange objects' }).click()
      await page.waitForTimeout(850)
      await expectCollectionFits(page, count)
    })
  }
}

test('a failed portrait image preserves the collection geometry', async ({ page }) => {
  await page.route('**/images/profilePicture.png', route => route.abort())
  await page.goto('/?previewItems=8')
  await page.waitForTimeout(850)
  await expectCollectionFits(page, 8)
})

test('the mobile landing and desktop landing are reviewable', async ({ page }, testInfo) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'A work in play.' })).toBeVisible()
    await page.waitForTimeout(850)
    await page.screenshot({ path: testInfo.outputPath(`collection-${width}.png`), fullPage: true })
  }
})
