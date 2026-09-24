import { links } from './data'
import { pathForRoute } from './collection/routePath'
import type { CollectionItem, CollectionRoute } from './collection/types'

const siteUrl = 'https://chrispader.com'
const siteName = 'Christoph Pader'
const socialImage = `${siteUrl}/images/profilePicture.png`

export type SeoData = {
  title: string
  description: string
  url: string
  image: string
  imageAlt: string
  jsonLd: Record<string, unknown>
}

export function seoForRoute(route: CollectionRoute, items: readonly CollectionItem[]): SeoData {
  const item = route.kind === 'item' ? items.find((entry) => entry.id === route.id) : undefined
  const url = `${siteUrl}${pathForRoute(route)}`
  const title = item
    ? `${item.label} · ${siteName}`
    : route.kind === 'index' ? `The index · ${siteName}`
      : route.kind === 'contact' ? `Say hello · ${siteName}`
        : `${siteName} · Software Engineer based in Vienna`
  const description = item
    ? `${item.teaser} ${item.detail.paragraphs[0]}`
    : route.kind === 'index'
      ? 'Explore Christoph Pader’s work in React Native, mobile performance, open source, and the things he enjoys away from code.'
      : route.kind === 'contact'
        ? 'Get in touch with Christoph Pader, a software engineer based in Vienna. Find his email and social profiles.'
        : 'Christoph Pader is a software engineer based in Vienna. Explore his interactive collection of React Native work, mobile apps, and open source projects.'
  const person = {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: siteName,
    url: `${siteUrl}/`,
    image: socialImage,
    jobTitle: 'Software Engineer',
    worksFor: { '@type': 'Organization', name: 'Margelo', url: 'https://margelo.com/' },
    sameAs: [links.github, links.linkedin, links.x, links.bluesky],
  }
  const pageType = item?.id === 'about' ? 'ProfilePage'
    : route.kind === 'index' ? 'CollectionPage'
      : route.kind === 'contact' ? 'ContactPage' : 'WebPage'
  const page = {
    '@type': pageType,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#person` },
    ...(item?.id === 'about' ? { mainEntity: { '@id': `${siteUrl}/#person` } } : {}),
  }
  return {
    title,
    description,
    url,
    image: socialImage,
    imageAlt: 'Christoph Pader outdoors wearing sunglasses',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: siteName, inLanguage: 'en', author: { '@id': `${siteUrl}/#person` } },
        person,
        page,
      ],
    },
  }
}

export function updateDocumentSeo(route: CollectionRoute, items: readonly CollectionItem[]): void {
  const seo = seoForRoute(route, items)
  document.title = seo.title
  setMeta('name', 'description', seo.description)
  setMeta('property', 'og:type', route.kind === 'item' && route.id === 'about' ? 'profile' : 'website')
  setMeta('property', 'og:title', seo.title)
  setMeta('property', 'og:description', seo.description)
  setMeta('property', 'og:url', seo.url)
  setMeta('property', 'og:image', seo.image)
  setMeta('property', 'og:image:alt', seo.imageAlt)
  setMeta('property', 'og:image:type', 'image/png')
  setMeta('property', 'og:image:width', '1436')
  setMeta('property', 'og:image:height', '1436')
  setMeta('name', 'twitter:card', 'summary')
  setMeta('name', 'twitter:title', seo.title)
  setMeta('name', 'twitter:description', seo.description)
  setMeta('name', 'twitter:image', seo.image)
  setMeta('name', 'twitter:image:alt', seo.imageAlt)
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = seo.url
  let structuredData = document.querySelector<HTMLScriptElement>('script#site-structured-data')
  if (!structuredData) {
    structuredData = document.createElement('script')
    structuredData.id = 'site-structured-data'
    structuredData.type = 'application/ld+json'
    document.head.append(structuredData)
  }
  structuredData.textContent = JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')
}

function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.append(meta)
  }
  meta.content = content
}
