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
    await expect(page).toHaveURL(new RegExp(`/item/${id}/$`))
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

test('mobile arrangement is staggered while shuffle follows the header', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const tops = await page.locator('.collection-opening__slot').evaluateAll((slots) => slots.map((slot) => slot.getBoundingClientRect().top))
  expect(Math.abs(tops[0] - tops[1])).toBeGreaterThan(25)
  expect(Math.abs(tops[2] - tops[3])).toBeGreaterThan(20)
  expect(Math.abs(tops[4] - tops[5])).toBeGreaterThan(25)
  await page.screenshot({ path: testInfo.outputPath('staggered-mobile.png'), fullPage: true })

  const originalOrder = await page.locator('[data-item-id]').evaluateAll((items) => items.map((item) => item.getAttribute('data-item-id')))
  const shuffle = page.getByRole('button', { name: 'Rearrange objects' })
  const header = page.locator('.site-header')
  const initialShuffle = await shuffle.boundingBox()
  const headerBox = await header.boundingBox()
  expect(initialShuffle).not.toBeNull()
  expect(headerBox).not.toBeNull()
  expect(initialShuffle!.y).toBeGreaterThan(headerBox!.height)

  await shuffle.tap()
  const shuffledOrder = await page.locator('[data-item-id]').evaluateAll((items) => items.map((item) => item.getAttribute('data-item-id')))
  expect(shuffledOrder).not.toEqual(originalOrder)
  const reset = page.getByRole('button', { name: 'Reset arrangement' })
  await expect(reset).not.toHaveCSS('position', 'fixed')
  const resetBefore = await reset.boundingBox()
  await page.screenshot({ path: testInfo.outputPath('mobile-reset-inline.png') })

  await page.evaluate(() => window.scrollTo(0, 350))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(250)
  const stickyShuffle = await shuffle.boundingBox()
  const scrolledHeader = await header.boundingBox()
  const resetAfter = await reset.boundingBox()
  expect(stickyShuffle).not.toBeNull()
  expect(scrolledHeader).not.toBeNull()
  expect(resetAfter).not.toBeNull()
  expect(Math.abs(stickyShuffle!.y - (scrolledHeader!.y + scrolledHeader!.height - stickyShuffle!.height / 2))).toBeLessThan(3)
  expect(scrolledHeader!.y).toBeLessThan(-20)
  const navigation = await page.locator('.site-nav').boundingBox()
  expect(navigation).not.toBeNull()
  expect(stickyShuffle!.x).toBeGreaterThanOrEqual(navigation!.x + navigation!.width - 58)
  expect(resetAfter!.y).toBeLessThan(resetBefore!.y - 250)
  await page.screenshot({ path: testInfo.outputPath('mobile-sticky-shuffle.png') })

  await page.evaluate(() => window.scrollTo(0, 0))
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
  const shuffleArrow = page.locator('.collection-shuffle--desktop .collection-shuffle__arrow')
  await expect(shuffleArrow.locator('svg')).toHaveCount(1)
  expect(await shuffleArrow.textContent()).toBe('')
})

test('shuffling keeps the mobile page width and objects stable through the animation', async ({ page }) => {
  for (const count of [6, 30]) {
    await page.goto(`/?previewItems=${count}`)
    await page.evaluate(() => document.fonts.ready)
    const result = await page.evaluate(async () => {
      const shuffle = document.querySelector<HTMLButtonElement>('.collection-shuffle-dock .collection-shuffle')
      if (!shuffle) throw new Error('Missing mobile shuffle button')
      const widths: number[] = []
      const counts: number[] = []
      const opacity: number[] = []
      for (let turn = 0; turn < 3; turn += 1) {
        shuffle.click()
        await new Promise<void>((resolve) => {
          const end = performance.now() + 800
          function sample() {
            widths.push(document.documentElement.scrollWidth)
            counts.push(document.querySelectorAll('[data-item-id]').length)
            opacity.push(Number(getComputedStyle(document.querySelector('.collection-layer')!).opacity))
            if (performance.now() < end) requestAnimationFrame(sample)
            else resolve()
          }
          requestAnimationFrame(sample)
        })
      }
      return { viewport: document.documentElement.clientWidth, maxWidth: Math.max(...widths), minCount: Math.min(...counts), minOpacity: Math.min(...opacity) }
    })
    expect(result.maxWidth).toBeLessThanOrEqual(result.viewport + 1)
    expect(result.minCount).toBe(count)
    expect(result.minOpacity).toBe(1)
  }
})

test('every detail artwork reacts to a tap', async ({ page }) => {
  for (const [id, label, target] of [
    ['about', 'Tilt the portrait', '.postcard'],
    ['native', 'Lift the layers', '.stack-top-slab'],
    ['margelo', 'Turn the work badge', '.workmark'],
    ['expensify', 'Turn the work badge', '.workmark'],
    ['example-11', 'Turn the note', '.paper-note'],
  ] as const) {
    await page.goto(`/?previewItems=16#/item/${id}`)
    const art = page.getByRole('button', { name: label })
    const before = await art.locator(target).evaluate((element) => getComputedStyle(element).transform)
    await art.tap()
    await expect(art).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => art.locator(target).evaluate((element) => getComputedStyle(element).transform)).not.toBe(before)
    await art.tap()
    await expect(art).toHaveAttribute('aria-pressed', 'false')
  }

  await page.goto('/#/item/record')
  await page.getByRole('button', { name: 'Play the record artwork' }).tap()
  await expect(page.locator('.detail-art-wrap .vinyl')).toHaveCSS('--record-angle', '540deg')

  await page.goto('/#/item/graph')
  const graph = page.locator('.detail-art-wrap .graph-artwork-interaction')
  const size = await graph.boundingBox()
  expect(size).not.toBeNull()
  await graph.tap({ position: { x: size!.width * .2, y: size!.height * .5 } })
  expect(Number(await page.getByRole('slider').inputValue())).toBeLessThan(250)
})

test('the stack engraving follows the upper slab in the detail view', async ({ page }) => {
  await page.goto('/#/item/native')
  const art = page.getByRole('button', { name: 'Lift the layers' })
  await art.click()
  await expect(art).toHaveAttribute('aria-pressed', 'true')

  await expect.poll(() => art.evaluate((button) => {
    const slab = button.querySelector('.stack-top-slab > path')
    const engraving = button.querySelector('.stack-engraving > path')
    if (!(slab instanceof SVGPathElement) || !(engraving instanceof SVGPathElement)) return false
    const slabMatrix = slab.getScreenCTM()
    const engravingMatrix = engraving.getScreenCTM()
    if (!slabMatrix || !engravingMatrix) return false
    const matrixKeys = ['a', 'b', 'c', 'd', 'e', 'f'] as const
    return matrixKeys.every((key) =>
      Math.abs(slabMatrix[key] - engravingMatrix[key]) < .01,
    ) && getComputedStyle(engraving).stroke !== 'none'
  })).toBe(true)
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
