import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { build } from 'vite'

const output = resolve('docs')
const result = await build({ configFile: false, build: { ssr: 'scripts/seo-entry.ts', write: false, minify: false } })
const bundle = Array.isArray(result) ? result[0] : result
const source = bundle.output.find((file) => file.type === 'chunk')?.code
if (!source) throw new Error('Could not build the SEO content module.')
const { collectionItems, links, seoForRoute } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

const template = await readFile(resolve(output, 'index.html'), 'utf8')
if (!template.includes('<!-- seo:start -->') || !template.includes('<div id="root"></div>')) {
  throw new Error('The built HTML is missing its SEO insertion points.')
}
const routes = [
  { kind: 'collection' },
  { kind: 'index' },
  { kind: 'contact' },
  ...collectionItems.map(({ id }) => ({ kind: 'item', id })),
]

for (const route of routes) {
  const seo = seoForRoute(route, collectionItems)
  const html = template
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, renderHead(seo, route))
    .replace('<div id="root"></div>', `<div id="root">${renderPage(route, collectionItems, links)}</div>`)
  const path = new URL(seo.url).pathname
  const target = resolve(output, path.slice(1), 'index.html')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${escapeHtml(seoForRoute(route, collectionItems).url)}</loc></url>`).join('\n')}\n</urlset>\n`
await writeFile(resolve(output, 'sitemap.xml'), sitemap)

function renderHead(seo, route) {
  const meta = (name, value) => `<meta name="${name}" content="${escapeHtml(value)}" />`
  const property = (name, value) => `<meta property="${name}" content="${escapeHtml(value)}" />`
  return [
    meta('description', seo.description),
    property('og:type', route.kind === 'item' && route.id === 'about' ? 'profile' : 'website'),
    property('og:site_name', 'Christoph Pader'),
    property('og:locale', 'en_US'),
    property('og:title', seo.title),
    property('og:description', seo.description),
    property('og:url', seo.url),
    property('og:image', seo.image),
    property('og:image:alt', seo.imageAlt),
    property('og:image:type', 'image/png'),
    property('og:image:width', '1436'),
    property('og:image:height', '1436'),
    meta('twitter:card', 'summary'),
    meta('twitter:title', seo.title),
    meta('twitter:description', seo.description),
    meta('twitter:image', seo.image),
    meta('twitter:image:alt', seo.imageAlt),
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    `<link rel="canonical" href="${escapeHtml(seo.url)}" />`,
    `<title>${escapeHtml(seo.title)}</title>`,
    `<script id="site-structured-data" type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

function renderPage(route, items, links) {
  const nav = '<nav aria-label="Main navigation"><a href="/">Collection</a><a href="/index/">The index</a><a href="/contact/">Say hello</a></nav>'
  const header = `<header><a href="/"><strong>cp.</strong> Christoph Pader · Engineer / Vienna</a>${nav}</header>`
  const body = route.kind === 'collection' ? renderCollection(items)
    : route.kind === 'index' ? renderIndex(items)
      : route.kind === 'contact' ? renderContact(links)
        : renderItem(items, route.id)
  return `<div class="seo-shell">${header}<main>${body}</main><footer><a href="${escapeHtml(links.github)}">GitHub</a><a href="${escapeHtml(links.linkedin)}">LinkedIn</a><a href="${escapeHtml(links.bluesky)}">Bluesky</a></footer></div>`
}

function renderCollection(items) {
  const entries = items.map((item, index) => {
    const number = String(index + 1).padStart(2, '0')
    return `<li><a href="/item/${encodeURIComponent(item.id)}/">${number} / ${escapeHtml(item.label)} — ${escapeHtml(item.teaser)}</a></li>`
  }).join('')
  return `<p>A small collection by Chris</p><h1>A work in play.</h1><p>Pick something up. See where it goes.</p><ul>${entries}</ul>`
}

function renderIndex(items) {
  const entries = items.map((item) => `<li><h2><a href="/item/${encodeURIComponent(item.id)}/">${escapeHtml(item.title)}</a></h2><p>${escapeHtml(item.teaser)}</p></li>`).join('')
  return `<h1>The index.</h1><p>A few things I’ve made, learned from, and kept close.</p><ul>${entries}</ul>`
}

function renderContact(links) {
  return `<h1>Got a good feeling?</h1><p>If you have a question, an idea, or a song you think I should hear, I’m all ears.</p><p><a href="${escapeHtml(links.email)}">Write me a note</a></p><p><a href="${escapeHtml(links.github)}">GitHub</a> · <a href="${escapeHtml(links.linkedin)}">LinkedIn</a> · <a href="${escapeHtml(links.bluesky)}">Bluesky</a></p>`
}

function renderItem(items, id) {
  const item = items.find((entry) => entry.id === id)
  if (!item) throw new Error(`Unknown collection item: ${id}`)
  const paragraphs = item.detail.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph.replaceAll('`', ''))}</p>`).join('')
  const links = item.detail.links.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label.replaceAll('`', ''))}</a></li>`).join('')
  const highlights = item.detail.highlights?.length
    ? `<h2>Selected public work</h2><ul>${item.detail.highlights.map((highlight) => `<li><a href="${escapeHtml(highlight.href)}">${escapeHtml(highlight.title)}</a> — ${escapeHtml(highlight.description)}</li>`).join('')}</ul>`
    : ''
  return `<p>${escapeHtml(item.detail.eyebrow)}</p><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.teaser)}</p>${paragraphs}<ul>${links}</ul>${highlights}`
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}
