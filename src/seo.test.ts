import { describe, expect, it } from 'vitest'
import { collectionItems } from './data'
import { seoForRoute } from './seo'

describe('search pages', () => {
  it('gives every authored page a unique canonical URL and description', () => {
    const routes = [
      { kind: 'collection' } as const,
      { kind: 'index' } as const,
      { kind: 'contact' } as const,
      ...collectionItems.map(({ id }) => ({ kind: 'item' as const, id })),
    ]
    const pages = routes.map((route) => seoForRoute(route, collectionItems))

    expect(new Set(pages.map(({ url }) => url)).size).toBe(routes.length)
    expect(new Set(pages.map(({ description }) => description)).size).toBe(routes.length)
    expect(pages.every(({ url }) => !url.includes('#'))).toBe(true)
    expect(pages.every(({ title, description, image }) => title && description && image.startsWith('https://'))).toBe(true)
  })

  it('describes the About page as a profile of Christoph Pader', () => {
    const page = seoForRoute({ kind: 'item', id: 'about' }, collectionItems)
    const graph = page.jsonLd['@graph'] as Record<string, unknown>[]

    expect(graph).toContainEqual(expect.objectContaining({ '@type': 'ProfilePage' }))
    expect(graph).toContainEqual(expect.objectContaining({ '@type': 'Person', name: 'Christoph Pader' }))
  })
})
