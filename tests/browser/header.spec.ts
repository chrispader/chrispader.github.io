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
    const socialTops = await page.locator('.site-nav__social').evaluateAll(links => links.map(link => link.getBoundingClientRect().top))
    expect(Math.max(...socialTops) - Math.min(...socialTops)).toBeLessThan(1)
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

  await page.locator('.view-layer').evaluate(element => { element.scrollTop = 200 })
  await expect.poll(() => page.locator('.view-layer').evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(detail!.y - 20)
  const collapsedHeader = await page.locator('.site-header').boundingBox()
  const collapsedNavigation = await page.locator('.site-nav').boundingBox()
  const expandedDetail = await page.locator('.view-layer').boundingBox()
  expect(collapsedNavigation!.y).toBeGreaterThanOrEqual(30)
  expect(Math.abs(expandedDetail!.y - (collapsedHeader!.y + collapsedHeader!.height))).toBeLessThan(2)
})

test('mobile header sheds top spacing while keeping its identity visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  const header = page.locator('.site-header')
  const navigation = page.locator('.site-nav')
  const initialHeader = await header.boundingBox()
  const initialNavigation = await navigation.boundingBox()
  expect(initialHeader).not.toBeNull()
  expect(initialNavigation).not.toBeNull()

  await page.evaluate(() => window.scrollTo(0, 220))
  await expect.poll(() => header.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(-20)
  const scrolledHeader = await header.boundingBox()
  const scrolledNavigation = await navigation.boundingBox()
  const scrolledBrand = await page.locator('.brand').boundingBox()
  expect(scrolledNavigation!.y).toBeLessThan(initialNavigation!.y - 20)
  expect(scrolledBrand!.y).toBeGreaterThanOrEqual(3)
  expect(scrolledHeader!.y + scrolledHeader!.height).toBeLessThan(initialHeader!.height - 20)
  await expect(page.locator('.brand')).toHaveCSS('opacity', '1')

  await page.locator('.brand').evaluate(element => element.focus({ preventScroll: true }))
  await expect.poll(() => header.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(-20)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100)

  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => header.evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(0, 0)

  await page.goto('/item/graph/')
  const layer = page.locator('.view-layer')
  const initialLayerTop = await layer.evaluate(element => element.getBoundingClientRect().top)
  await layer.evaluate(element => { element.scrollTop = 220 })
  await expect.poll(() => layer.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(initialLayerTop - 20)
  const detailHeader = await header.boundingBox()
  const detailLayer = await layer.boundingBox()
  expect(Math.abs(detailLayer!.y - (detailHeader!.y + detailHeader!.height))).toBeLessThan(2)
  await layer.evaluate(element => { element.scrollTop = 0 })
  await expect.poll(() => layer.evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(initialLayerTop, 0)
})

test('mobile header keeps the logo below a larger safe area', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--header-safe-top', '59px')
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, 220)
  })

  await expect.poll(() => page.locator('.site-header').evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(-7)
  const brand = await page.locator('.brand').boundingBox()
  expect(brand!.y).toBeGreaterThanOrEqual(58)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
