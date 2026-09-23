import { describe, expect, it } from 'vitest'
import { hashForRoute, parseCollectionHash } from './useCollectionRoute'

const ids = new Set(['graph', 'about', 'one more'])

describe('collection hashes', () => {
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
    expect(hashForRoute({ kind: 'item', id: 'one more' })).toBe('#/item/one%20more')
  })
})
