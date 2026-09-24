import { describe, expect, it } from 'vitest'
import { parseCollectionHash, parseCollectionLocation, parseCollectionPath, pathForRoute } from './useCollectionRoute'

const ids = new Set(['graph', 'about', 'one more'])

describe('collection routes', () => {
  it('parses direct item, index, and contact links', () => {
    expect(parseCollectionHash('#/item/graph', ids)).toEqual({ kind: 'item', id: 'graph' })
    expect(parseCollectionHash('#/item/one%20more', ids)).toEqual({ kind: 'item', id: 'one more' })
    expect(parseCollectionHash('#/index', ids)).toEqual({ kind: 'index' })
    expect(parseCollectionHash('#/contact', ids)).toEqual({ kind: 'contact' })
  })

  it('maps old section links and unknown items to valid destinations', () => {
    expect(parseCollectionHash('#work', ids)).toEqual({ kind: 'collection' })
    expect(parseCollectionHash('#about', ids)).toEqual({ kind: 'item', id: 'about' })
    expect(parseCollectionHash('#about', new Set(['graph']))).toEqual({ kind: 'index', missingId: 'about' })
    expect(parseCollectionHash('#writing', ids)).toEqual({ kind: 'index' })
    expect(parseCollectionHash('#/item/missing', ids)).toEqual({ kind: 'index', missingId: 'missing' })
  })

  it('encodes item IDs for shareable links', () => {
    expect(pathForRoute({ kind: 'item', id: 'one more' })).toBe('/item/one%20more/')
    expect(parseCollectionPath('/item/one%20more/', ids)).toEqual({ kind: 'item', id: 'one more' })
    expect(parseCollectionPath('/index/', ids)).toEqual({ kind: 'index' })
    expect(parseCollectionPath('/contact/', ids)).toEqual({ kind: 'contact' })
  })

  it('keeps old hash bookmarks working while preferring real paths', () => {
    expect(parseCollectionLocation('/', '#/item/graph', ids)).toEqual({ kind: 'item', id: 'graph' })
    expect(parseCollectionLocation('/item/graph/', '', ids)).toEqual({ kind: 'item', id: 'graph' })
  })
})
