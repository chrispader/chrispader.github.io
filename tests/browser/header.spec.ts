import { expect, test } from '@playwright/test'

test('the page title and default cursor are available before the app starts', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page).toHaveTitle('Christoph Pader · Software Engineer based in Vienna')
  await expect(page.locator('html')).toHaveCSS('cursor', /data:image\/svg\+xml/)
  await context.close()
})

test('header keeps full-size identity above navigation on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  const brand = page.locator('.brand')
  const navigation = page.locator('.site-nav')
  const brandWide = await brand.boundingBox()
  const navigationWide = await navigation.boundingBox()
  expect(brandWide).not.toBeNull()
  expect(navigationWide).not.toBeNull()
  expect(Math.abs(brandWide!.y + brandWide!.height / 2 - navigationWide!.y - navigationWide!.height / 2)).toBeLessThan(2)

  const wideLogoSize = await page.locator('.brand-mark').evaluate(element => getComputedStyle(element).fontSize)
  for (const width of [500, 390, 320, 280]) {
    await page.setViewportSize({ width, height: 900 })
    const brandBox = await brand.boundingBox()
    const navigationBox = await navigation.boundingBox()
    const headerBox = await page.locator('.site-header').boundingBox()
    expect(brandBox).not.toBeNull()
    expect(navigationBox).not.toBeNull()
    expect(headerBox).not.toBeNull()
    expect(navigationBox!.y).toBeGreaterThanOrEqual(brandBox!.y + brandBox!.height - 1)
    expect(await page.locator('.brand-mark').evaluate(element => getComputedStyle(element).fontSize)).toBe(wideLogoSize)
    expect(navigationBox!.x + navigationBox!.width).toBeLessThanOrEqual(headerBox!.x + headerBox!.width + 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
})

test('larger text grows the header and keeps detail content below it', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/#/contact')
  await page.addStyleTag({ content: '.brand-mark { font-size: 80px !important; } .brand-name, .site-nav a { font-size: 28px !important; } .brand-location { font-size: 20px !important; }' })

  await expect.poll(() => page.locator('.site-header').evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(108)
  const header = await page.locator('.site-header').boundingBox()
  const navigation = await page.locator('.site-nav').boundingBox()
  const detail = await page.locator('.view-layer').boundingBox()
  expect(header).not.toBeNull()
  expect(navigation).not.toBeNull()
  expect(detail).not.toBeNull()
  expect(navigation!.y + navigation!.height).toBeLessThanOrEqual(header!.y + header!.height + 1)
  await expect.poll(() => page.locator('.view-layer').evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(header!.y + header!.height, 0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})
