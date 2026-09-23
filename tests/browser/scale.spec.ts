import { test, expect } from '@playwright/test'
import { expectCollectionFits } from './geometry'

for (const count of [1, 4, 6, 8, 16, 30]) {
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

for (const width of [1024, 1440]) {
  for (const height of [600, 700, 850]) {
    test(`${width}×${height}px windows keep the featured objects close and offset`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height })
      await page.goto('/?previewItems=30')
      await page.waitForTimeout(850)
      const opening = page.locator('.collection-opening')
      const hero = page.locator('.collection-hero')
      const slots = await page.locator('.collection-opening__slot').evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top))
      expect((await opening.boundingBox())?.height).toBeLessThan(700)
      expect(Math.abs(slots[0] - slots[1])).toBeGreaterThan(40)
      expect(Math.abs(slots[2] - slots[3])).toBeGreaterThan(40)
      if (width === 1440 && height === 700) await page.screenshot({ path: testInfo.outputPath('short-collection.png') })
      await expectCollectionFits(page, 30)
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0) })
      const heroBefore = await hero.evaluate((element) => {
        const box = element.getBoundingClientRect()
        return { x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height }
      })
      await page.getByRole('button', { name: 'Rearrange objects' }).click()
      expect(await hero.evaluate((element) => {
        const box = element.getBoundingClientRect()
        return { x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height }
      })).toEqual(heroBefore)
      await page.waitForTimeout(850)
      await expectCollectionFits(page, 30)
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
