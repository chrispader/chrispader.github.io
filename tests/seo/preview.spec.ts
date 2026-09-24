import { test, expect } from '@playwright/test'

test('built detail pages expose content before JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/item/native/')
  await expect(page).toHaveTitle('Native things · Christoph Pader')
  await expect(page.getByRole('heading', { name: 'Closer to the metal.' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByText('I work on React Native libraries at Margelo', { exact: false })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://chrispader.com/item/native/')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /profilePicture.png$/)
  await context.close()
})

test('sitemap and robots file expose the generated pages', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBe(true)
  const xml = await sitemap.text()
  expect((xml.match(/<url>/g) ?? [])).toHaveLength(9)
  expect(xml).toContain('<loc>https://chrispader.com/item/expensify/</loc>')

  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBe(true)
  expect(await robots.text()).toContain('Sitemap: https://chrispader.com/sitemap.xml')
})

test('built pages hydrate and navigate with accurate metadata', async ({ page }) => {
  await page.goto('/item/margelo/')
  await expect(page.getByRole('heading', { name: 'Made at Margelo.' })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://chrispader.com/item/margelo/')
  await page.getByRole('link', { name: 'The index' }).click()
  await expect(page).toHaveURL(/\/index\/$/)
  await expect(page).toHaveTitle('The index · Christoph Pader')
  await page.locator('#index-link-about').click()
  await expect(page).toHaveURL(/\/item\/about\/$/)
  expect(await page.locator('script#site-structured-data').textContent()).toContain('ProfilePage')
  await page.goto('/#/item/graph')
  await expect(page).toHaveURL(/\/item\/graph\/$/)
  await expect(page.getByRole('heading', { name: 'Make it move.' })).toBeVisible()
})
