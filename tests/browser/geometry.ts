import { expect, type Page } from '@playwright/test'

export async function expectCollectionFits(page: Page, count: number) {
  await expect(page.locator('[data-item-id]')).toHaveCount(count)
  await page.evaluate(() => document.fonts.ready)
  const problems = await page.evaluate(() => {
    const issues: string[] = []
    const slots = [...document.querySelectorAll<HTMLElement>('[data-item-id]')]
    const hero = document.querySelector('.collection-hero')?.getBoundingClientRect()
    const intersects = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 2) issues.push('Horizontal document overflow')
    for (const [index, slot] of slots.entries()) {
      const rect = slot.getBoundingClientRect()
      const art = slot.querySelector('[data-art-frame]')?.getBoundingClientRect()
      const caption = slot.querySelector('.collection-object__caption')?.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) issues.push(`${slot.dataset.itemId}: zero size`)
      if (hero && intersects(rect, hero)) issues.push(`${slot.dataset.itemId}: covers hero`)
      if (art && (art.left < rect.left - 2 || art.right > rect.right + 2 || art.top < rect.top - 2 || art.bottom > rect.bottom + 2)) issues.push(`${slot.dataset.itemId}: artwork outside slot`)
      if (art && caption && intersects(art, caption)) issues.push(`${slot.dataset.itemId}: artwork covers caption`)
      for (const other of slots.slice(index + 1)) {
        if (intersects(rect, other.getBoundingClientRect())) issues.push(`${slot.dataset.itemId}: overlaps ${other.dataset.itemId}`)
      }
    }
    return issues
  })
  expect(problems).toEqual([])
  if (count > 0) {
    const last = page.locator('[data-item-id]').last()
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeInViewport()
  }
}
