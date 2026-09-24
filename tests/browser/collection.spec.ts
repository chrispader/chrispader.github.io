import { test, expect } from '@playwright/test'
import { expectCollectionFits } from './geometry'

test('graph opens, scrubs with the keyboard, and returns focus', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  const opener = page.locator('#object-link-graph')
  await opener.click()
  await expect(page).toHaveURL(/#\/item\/graph$/)
  await expect(page.getByRole('heading', { name: 'Make it move.' })).toBeFocused()
  const slider = page.getByRole('slider')
  await slider.focus()
  await slider.press('Home')
  await expect(slider).toHaveValue('0')
  await slider.press('End')
  await expect(slider).toHaveValue('1000')
  await slider.press('Escape')
  await expect(opener).toBeFocused()
  await expect(page.locator('.view-layer')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('detail graph snakes only while pressed and returns to its curve', async ({ page }) => {
  await page.goto('/#/item/graph')
  const graph = page.locator('.detail-art-graph .graph-artwork-interaction')
  const curve = graph.locator('.graph-curve')
  const resting = await curve.getAttribute('d')
  const bounds = await graph.boundingBox()
  expect(bounds).not.toBeNull()
  const x = bounds!.x + bounds!.width / 2
  const y = bounds!.y + bounds!.height / 2

  await page.mouse.move(x, y)
  await page.waitForTimeout(150)
  await expect(curve).toHaveAttribute('d', resting ?? '')
  await page.mouse.down()
  await page.mouse.move(x + 35, y + 15, { steps: 5 })
  await expect.poll(() => curve.getAttribute('d')).not.toBe(resting)
  await page.mouse.up()
  await expect(curve).toHaveAttribute('d', resting ?? '')
})

test('a continuation object preserves scroll through browser history', async ({ page }) => {
  await page.goto('/?previewItems=30')
  const opener = page.locator('#object-link-example-29')
  await opener.scrollIntoViewIfNeeded()
  const scrollBefore = await page.evaluate(() => window.scrollY)
  await opener.click()
  await expect(page.getByRole('heading', { name: 'A little experiment. 29' })).toBeVisible()
  await page.goBack()
  await expect(opener).toBeFocused()
  expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore)).toBeLessThan(3)
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'A little experiment. 29' })).toBeVisible()
})

test('index search, item links, contact, and direct links work', async ({ page }) => {
  await page.goto('/?previewItems=16#/index')
  await page.getByRole('searchbox').fill('A little experiment. 15')
  await expect(page.locator('.index-row')).toHaveCount(1)
  const link = page.locator('#index-link-example-15')
  await expect(link).toHaveAttribute('href', '#/item/example-15')
  await link.click()
  await expect(page.getByRole('heading', { name: 'A little experiment. 15' })).toBeVisible()
  await page.getByRole('button', { name: /^.*Back/ }).click()
  await expect(page.getByRole('heading', { name: 'The index.' })).toBeVisible()
  await expect(page.locator('#index-link-example-15')).toBeFocused()
  await expect(page.getByRole('searchbox')).toHaveValue('A little experiment. 15')
  await page.getByRole('link', { name: 'Say hello', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Write me a note' })).toHaveAttribute('href', 'mailto:hello@chrispader.com')
  await page.goto('/#/item/about')
  await expect(page.getByRole('heading', { name: 'Hello, I’m Chris.' })).toBeVisible()
  await page.goto('/#/item/missing-object')
  await expect(page.getByRole('status')).toContainText('missing-object')
})

test('index starts with Chris and collection buttons always return home', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/index')
  await expect(page.locator('.index-row').first()).toContainText('Hello, I’m Chris.')
  await expect(page.locator('.index-row').first()).toContainText('01')
  await expect(page.locator('.index-row').nth(1)).toContainText('Made at Margelo.')
  const indexGap = await page.evaluate(() => {
    const header = document.querySelector('.site-header')?.getBoundingClientRect()
    const heading = document.querySelector('.index-view h1')?.getBoundingClientRect()
    return (heading?.top ?? 0) - (header?.bottom ?? 0)
  })
  expect(indexGap).toBeLessThan(170)
  await page.getByRole('link', { name: 'Say hello', exact: true }).click()
  const contactGap = await page.evaluate(() => {
    const header = document.querySelector('.site-header')?.getBoundingClientRect()
    const heading = document.querySelector('.contact-view h1')?.getBoundingClientRect()
    return (heading?.top ?? 0) - (header?.bottom ?? 0)
  })
  expect(contactGap).toBeLessThan(170)
  await page.getByRole('button', { name: 'Back to collection' }).click()
  await expect(page).toHaveURL(/#\/collection$/)
  await expect(page.getByRole('heading', { name: 'A work in play.' })).toBeVisible()
  await page.getByRole('link', { name: 'The index' }).click()
  await page.getByRole('button', { name: 'Back to collection' }).click()
  await expect(page).toHaveURL(/#\/collection$/)
})

test('Margelo and Expensify details show the dates and public work', async ({ page }) => {
  await page.goto('/#/item/margelo')
  await expect(page.getByRole('heading', { name: 'Made at Margelo.' })).toBeVisible()
  await expect(page.locator('.detail-prose')).toContainText('November 2021')
  await page.goto('/#/item/expensify')
  await expect(page.getByRole('heading', { name: 'Work that adds up.' })).toBeVisible()
  await expect(page.locator('.detail-prose')).toContainText('since 2022')
  await expect(page.locator('.detail-prose')).toContainText('post-quantum end-to-end encryption library')
  await expect(page.locator('.detail-highlight')).toHaveCount(7)
  await expect(page.getByRole('link', { name: /Onyx meets Nitro SQLite/ })).toHaveAttribute('href', 'https://github.com/Expensify/react-native-onyx/pull/602')
})

test('all six authored objects share the main collection and Off the clock links Goodreads', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.locator('.collection-opening__slot')).toHaveCount(6)
  await expect(page.locator('.collection-continuation')).toHaveCount(0)
  await expect(page.getByText('More to explore.')).toHaveCount(0)
  const visibleOnDesktop = await page.locator('.collection-opening__slot').evaluateAll(elements => elements.filter(element => {
    const box = element.getBoundingClientRect()
    return box.top >= 0 && box.bottom <= window.innerHeight
  }).length)
  expect(visibleOnDesktop).toBe(6)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.collection-opening__slot')).toHaveCount(6)
  const visibleOnMobile = await page.locator('.collection-opening__slot').evaluateAll(elements => elements.filter(element => {
    const box = element.getBoundingClientRect()
    return box.top >= 0 && box.bottom <= window.innerHeight
  }).length)
  expect(visibleOnMobile).toBeLessThan(visibleOnDesktop)
  await page.goto('/?previewItems=8')
  await expect(page.locator('.collection-continuation [data-item-id]')).toHaveCount(2)
  await expect(page.getByText('More to explore.')).toHaveCount(0)
  await page.goto('/#/item/record')
  await expect(page.locator('.detail-prose')).toContainText('Popular science, novels')
  await expect(page.locator('.detail-prose')).toContainText('tennis')
  await expect(page.locator('.detail-prose')).toContainText('running')
  await expect(page.locator('.detail-prose')).toContainText('gym')
  await expect(page.getByRole('link', { name: 'See what I’m reading' })).toHaveAttribute('href', 'https://goodreads.com/chrispader')
  const helloLink = page.locator('.detail-links').getByRole('link', { name: 'Say hello', exact: true })
  await expect(helloLink).toHaveAttribute('href', '#/contact')
  await helloLink.click()
  await expect(page).toHaveURL(/#\/contact$/)
  await expect(page.getByRole('heading', { name: /Got a good feeling/ })).toBeVisible()
})

test('native detail explains the library work and NitroFetch integration', async ({ page }) => {
  await page.goto('/#/item/native')
  await expect(page.locator('.detail-prose')).toContainText('I work on React Native libraries at Margelo')
  await expect(page.locator('.detail-prose')).toContainText('I integrated NitroFetch into Expensify')
  await expect(page.locator('.detail-prose')).toContainText('I wrote a detailed post')
  await expect(page.getByRole('link', { name: 'Read the NitroFetch story' })).toHaveAttribute('href', 'https://margelo.com/blog/speeding-up-expensifys-networking-with-nitro-fetch')
})

test('GitHub, Twitter, and Bluesky are linked from the header and contact pages', async ({ page }) => {
  for (const width of [280, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const navigation = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(navigation.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/chrispader')
    await expect(navigation.getByRole('link', { name: 'Twitter' })).toHaveAttribute('href', 'https://x.com/ChristophPader')
    await expect(navigation.getByRole('link', { name: 'Bluesky' })).toHaveAttribute('href', 'https://bsky.app/profile/chrispader.com')
    await expect(navigation.getByRole('link', { name: 'Bluesky' })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
  await page.goto('/#/item/about')
  await expect(page.getByRole('link', { name: 'Find me on GitHub' })).toHaveAttribute('href', 'https://github.com/chrispader')
  await expect(page.getByRole('link', { name: 'Find me on Twitter' })).toHaveAttribute('href', 'https://x.com/ChristophPader')
  await page.goto('/#/contact')
  await expect(page.locator('.contact-socials').getByRole('link', { name: 'Bluesky' })).toHaveAttribute('href', 'https://bsky.app/profile/chrispader.com')
})

test('reduced motion keeps all controls usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/item/record')
  await page.getByRole('button', { name: /Spin the record/ }).click()
  await expect(page.locator('.detail-art-wrap .vinyl')).toHaveCSS('--record-angle', '180deg')
  await page.getByRole('button', { name: /Back/ }).click()
  await expect(page.getByRole('heading', { name: 'A work in play.' })).toBeVisible()
  await page.getByRole('button', { name: 'Rearrange objects' }).click()
  await expectCollectionFits(page, 6)
  const curve = page.locator('#object-link-graph .graph-curve')
  const restingCurve = await curve.getAttribute('d')
  await page.locator('#object-link-graph .graph-artwork-interaction').hover()
  await page.waitForTimeout(100)
  await expect(curve).toHaveAttribute('d', restingCurve ?? '')
})

test('the collection reacts to hovering and the pointer position', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/?previewItems=11')

  const graph = page.locator('#object-link-graph .graph-artwork-interaction')
  const curve = graph.locator('.graph-curve')
  const restingCurve = await curve.getAttribute('d')
  await graph.hover()
  await page.waitForTimeout(100)
  const firstWave = await curve.getAttribute('d')
  await page.waitForTimeout(100)
  expect(firstWave).not.toBe(restingCurve)
  expect(await curve.getAttribute('d')).not.toBe(firstWave)
  await page.mouse.move(10, 10)
  const returningCurve = await curve.getAttribute('d')
  expect(returningCurve).not.toBe(restingCurve)
  await page.waitForTimeout(100)
  expect(await curve.getAttribute('d')).not.toBe(returningCurve)
  await expect(curve).toHaveAttribute('d', restingCurve ?? '')

  const stack = page.locator('#object-link-native .stack-top-slab')
  await page.locator('#object-link-native').hover()
  expect(await page.locator('#object-link-native').evaluate((element) => element.matches(':hover'))).toBe(true)
  await page.waitForTimeout(400)
  expect(await stack.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none')

  await page.locator('#object-link-record .vinyl').hover()
  await expect(page.locator('#object-link-record .vinyl')).toHaveCSS('animation-name', 'record-groove')

  const note = page.locator('#object-link-example-11 .paper-note')
  const restingNote = await note.evaluate((element) => getComputedStyle(element).transform)
  await page.locator('#object-link-example-11').hover()
  await page.waitForTimeout(400)
  expect(await note.evaluate((element) => getComputedStyle(element).transform)).not.toBe(restingNote)

  await page.mouse.move(100, 100)
  await page.waitForTimeout(350)
  const leftPosition = await page.locator('#object-link-graph').evaluate((element) => getComputedStyle(element).transform)
  await page.mouse.move(1300, 800)
  await page.waitForTimeout(350)
  expect(await page.locator('#object-link-graph').evaluate((element) => getComputedStyle(element).transform)).not.toBe(leftPosition)
})

test('changing perspective moves every object into a new place', async ({ page }) => {
  await page.goto('/?previewItems=8')
  const heroBefore = await page.locator('.collection-hero').boundingBox()
  const ids = page.locator('[data-item-id]')
  const before = await ids.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-item-id')))
  const graph = page.locator('#object-link-graph [data-art-frame]')
  const startingPosition = await graph.boundingBox()
  await page.getByRole('button', { name: 'Rearrange objects' }).click()
  const after = await ids.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-item-id')))
  expect(after.every((id, index) => id !== before[index])).toBe(true)
  expect(after.slice(0, 4)).toContain('native')
  await page.waitForTimeout(120)
  const movingPosition = await graph.boundingBox()
  await page.waitForTimeout(730)
  expect(await page.locator('.collection-hero').boundingBox()).toEqual(heroBefore)
  const finalPosition = await graph.boundingBox()
  expect(startingPosition).not.toBeNull()
  expect(movingPosition).not.toBeNull()
  expect(finalPosition).not.toBeNull()
  if (startingPosition && movingPosition && finalPosition) {
    expect(Math.abs(finalPosition.x - startingPosition.x) + Math.abs(finalPosition.y - startingPosition.y)).toBeGreaterThan(100)
    expect(Math.abs(finalPosition.x - movingPosition.x) + Math.abs(finalPosition.y - movingPosition.y)).toBeGreaterThan(5)
  }
  await expectCollectionFits(page, 8)
})

test('the center stays fixed through rearrangements and the opening stays centered on wide screens', async ({ page }) => {
  for (const width of [1024, 1920]) {
    await page.setViewportSize({ width, height: 1400 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const hero = page.locator('.collection-hero')
    const startingBox = await hero.boundingBox()
    const openingBox = await page.locator('.collection-opening').boundingBox()
    expect(startingBox).not.toBeNull()
    expect(openingBox).not.toBeNull()
    if (openingBox) expect(Math.abs(openingBox.y + openingBox.height / 2 - 700)).toBeLessThan(50)
    await page.getByRole('button', { name: 'Rearrange objects' }).click()
    expect(await hero.boundingBox()).toEqual(startingBox)
    await page.getByRole('button', { name: 'Reset arrangement' }).click()
    expect(await hero.boundingBox()).toEqual(startingBox)
    await page.waitForTimeout(850)
    await expectCollectionFits(page, 6)
  }
})

test('desktop collection fits the window and interactions do not grow its scroll area', async ({ page }) => {
  for (const viewport of [{ width: 1024, height: 650 }, { width: 1024, height: 768 }, { width: 1200, height: 700 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const bounds = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(bounds.height).toBeLessThanOrEqual(viewport.height)
    expect(bounds.width).toBeLessThanOrEqual(bounds.clientWidth)
    await expect(page.locator('.site-footer')).toBeInViewport()

    await page.locator('#object-link-record .vinyl').hover()
    const duringShuffle = await page.evaluate(async () => {
      document.querySelector<HTMLButtonElement>('.collection-shuffle--desktop')?.click()
      const sizes: { height: number; width: number; clientWidth: number }[] = []
      for (let frame = 0; frame < 50; frame += 1) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        sizes.push({
          height: document.documentElement.scrollHeight,
          width: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        })
      }
      return sizes
    })
    expect(duringShuffle.every(size => size.height <= viewport.height && size.width <= size.clientWidth)).toBe(true)
    await page.waitForTimeout(300)
    await expectCollectionFits(page, 6)
  }

  await page.goto('/#/item/record')
  const scrollArea = page.locator('.view-layer')
  const initialHeight = await scrollArea.evaluate(element => element.scrollHeight)
  await page.getByRole('button', { name: /Spin the record/ }).click()
  await expect.poll(() => scrollArea.evaluate(element => element.scrollHeight)).toBe(initialHeight)
  expect(await scrollArea.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)

  const record = await page.getByRole('button', { name: 'Play the record artwork' }).boundingBox()
  expect(record).not.toBeNull()
  if (!record) return
  await page.mouse.move(record.x + record.width / 2, record.y + record.height / 2)
  await page.mouse.down()
  await page.mouse.move(record.x + record.width / 2 + 50, record.y + record.height / 2 + 30, { steps: 8 })
  expect(await scrollArea.evaluate(element => element.scrollHeight)).toBe(initialHeight)
  expect(await scrollArea.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  await page.mouse.up()
  expect(await scrollArea.evaluate(element => element.scrollHeight)).toBe(initialHeight)
})

test('collection objects open by keyboard without starting a link drag', async ({ page }) => {
  await page.goto('/')
  const object = page.locator('#object-link-expensify')
  await expect(object).toHaveAttribute('type', 'button')
  expect(await object.getAttribute('href')).toBeNull()
  const dragPrevented = await object.evaluate(element => {
    const event = new DragEvent('dragstart', { bubbles: true, cancelable: true })
    element.dispatchEvent(event)
    return event.defaultPrevented
  })
  expect(dragPrevented).toBe(true)

  await object.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/item\/expensify$/)
})

test('detail content starts near the top and interactive controls have distinct cursors', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/item/native')
  const positions = await page.evaluate(() => {
    const header = document.querySelector('.site-header')?.getBoundingClientRect()
    const copy = document.querySelector('.detail-copy')?.getBoundingClientRect()
    const art = document.querySelector('.detail-art-frame')?.getBoundingClientRect()
    return { headerBottom: header?.bottom ?? 0, copyTop: copy?.top ?? 0, artTop: art?.top ?? 0 }
  })
  expect(positions.copyTop - positions.headerBottom).toBeLessThan(180)
  expect(Math.abs(positions.artTop - positions.copyTop)).toBeLessThan(40)
  await expect(page.locator('.detail-back')).toHaveCSS('cursor', /cursors\/back\.svg/)
  await expect(page.locator('.detail-links a').first()).toHaveCSS('cursor', /cursors\/open\.svg/)
  await page.screenshot({ path: testInfo.outputPath('native-detail.png') })

  await page.goto('/')
  await expect(page.locator('body')).toHaveCSS('cursor', /cursors\/default\.svg/)
  await expect(page.locator('#object-link-native')).toHaveCSS('cursor', /cursors\/open\.svg/)
  await expect(page.getByRole('button', { name: 'Rearrange objects' })).toHaveCSS('cursor', /cursors\/action\.svg/)
  await expect(page.locator('#object-link-graph .graph-artwork-interaction')).toHaveCSS('cursor', 'crosshair')
  await page.goto('/#/item/record')
  await expect(page.locator('.detail-art-record .artwork-record')).toHaveCSS('cursor', /cursors\/drag\.svg/)
})

test('the graph follows pointer scrubbing and the record responds to touch activation', async ({ page, browser }) => {
  await page.goto('/#/item/graph')
  const graph = page.locator('.detail-art-wrap .graph-artwork-interaction')
  await graph.scrollIntoViewIfNeeded()
  const bounds = await graph.boundingBox()
  expect(bounds).not.toBeNull()
  if (!bounds) return
  await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height * .5)
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .5, { steps: 8 })
  await page.mouse.up()
  expect(Number(await page.getByRole('slider').inputValue())).toBeGreaterThan(700)

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  const touchPage = await touchContext.newPage()
  await touchPage.goto(new URL('/#/item/record', page.url()).toString())
  await touchPage.getByRole('button', { name: /Spin the record/ }).tap()
  await expect(touchPage.locator('.detail-art-wrap .vinyl')).toHaveCSS('--record-angle', '540deg')
  await expect(touchPage.locator('.detail-art-wrap .artwork-record')).toHaveCSS('touch-action', 'pan-y')
  await touchPage.getByRole('button', { name: /Back/ }).tap()
  await expect(touchPage.getByRole('heading', { name: 'A work in play.' })).toBeVisible()
  await touchContext.close()
})

test('rapid close and resize leave a single accessible view', async ({ page }) => {
  await page.goto('/')
  await page.locator('#object-link-graph').click()
  await page.keyboard.press('Escape')
  await expect(page.locator('#object-link-graph')).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Make it move.' })).toHaveCount(0)
  await page.locator('#object-link-about').click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Hello, I’m Chris.' })).toBeVisible()
  await page.getByRole('button', { name: /Back/ }).click()
  await expect(page.locator('#object-link-about')).toBeFocused()
})

for (const width of [390, 1440]) {
  test(`30 objects remain reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/?previewItems=30')
    await page.waitForTimeout(850)
    await expectCollectionFits(page, 30)
  })
}
