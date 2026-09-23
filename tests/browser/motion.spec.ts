import { test, expect, type Locator } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

test('first detail openings and returns keep artwork in place', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  for (const id of ['record', 'graph']) {
    const opener = page.locator(`#object-link-${id}`)
    await opener.scrollIntoViewIfNeeded()
    await page.waitForTimeout(350)
    const source = opener.locator('[data-art-frame]')
    const sourceBefore = await documentBox(source)

    await opener.tap()
    await expect(page).toHaveURL(new RegExp(`#\\/item\\/${id}$`))
    const detail = page.locator('.detail-art-frame')
    const detailStart = await documentBox(detail)
    await page.waitForTimeout(80)
    expectNear(await documentBox(detail), detailStart)
    await page.waitForTimeout(180)
    expectNear(await documentBox(detail), detailStart)

    await page.getByRole('button', { name: /Back/ }).tap()
    await expect(page.locator('.view-layer')).toHaveCount(0)
    expectNear(await documentBox(source), sourceBefore, 10)
  }
})

test('mobile arrangement is staggered and reset stays on the viewport edge', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const tops = await page.locator('.collection-opening__slot').evaluateAll((slots) => slots.map((slot) => slot.getBoundingClientRect().top))
  expect(Math.abs(tops[0] - tops[1])).toBeGreaterThan(25)
  expect(Math.abs(tops[2] - tops[3])).toBeGreaterThan(20)
  expect(Math.abs(tops[4] - tops[5])).toBeGreaterThan(25)
  await page.screenshot({ path: testInfo.outputPath('staggered-mobile.png'), fullPage: true })

  const originalOrder = await page.locator('[data-item-id]').evaluateAll((items) => items.map((item) => item.getAttribute('data-item-id')))
  await page.getByRole('button', { name: 'Rearrange objects' }).tap()
  const shuffledOrder = await page.locator('[data-item-id]').evaluateAll((items) => items.map((item) => item.getAttribute('data-item-id')))
  expect(shuffledOrder).not.toEqual(originalOrder)
  const reset = page.getByRole('button', { name: 'Reset arrangement' })
  await expect(reset).toHaveCSS('position', 'fixed')
  const before = await reset.boundingBox()
  expect(before).not.toBeNull()
  expect(before!.x + before!.width).toBeGreaterThan(380)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  const after = await reset.boundingBox()
  expect(after).not.toBeNull()
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(2)
  await page.screenshot({ path: testInfo.outputPath('mobile-reset-tab.png') })
  await reset.tap()
  await expect(reset).toHaveCount(0)
  await expect.poll(() => page.locator('[data-item-id]').evaluateAll((items) => items.map((item) => item.getAttribute('data-item-id')))).toEqual(originalOrder)
})

test('work cards and header use drawn arrows', async ({ page }) => {
  await page.goto('/')
  for (const id of ['margelo', 'expensify']) {
    const arrow = page.locator(`#object-link-${id} .workmark__orbit`)
    await expect(arrow.locator('svg')).toHaveCount(1)
    expect(await arrow.textContent()).toBe('')
  }
  await expect(page.locator('.site-nav__arrow')).toHaveCount(1)
})

async function documentBox(locator: Locator) {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect()
    return { x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height }
  })
}

function expectNear(actual: Awaited<ReturnType<typeof documentBox>>, expected: Awaited<ReturnType<typeof documentBox>>, tolerance = 2) {
  for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(actual[key] - expected[key]), key).toBeLessThan(tolerance)
}
