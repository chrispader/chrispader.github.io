import { describe, expect, it } from 'vitest'
import { arrangeCollection, collectionPose, splitFeatured, validateCollection } from './layout'
import type { CollectionItem } from './types'

const item = (index: number): CollectionItem => ({
  id: `item-${index}`,
  label: `Object ${index}`,
  title: `Title ${index}`,
  teaser: 'A short description',
  tags: [],
  artwork: { kind: 'note', text: `Note ${index}`, color: 'lime' },
  detail: { eyebrow: 'Object', paragraphs: ['Details'], links: [] },
})

describe('collection layout', () => {
  it.each([1, 4, 8, 16, 30])('shows each of %i items exactly once', (count) => {
    const items = Array.from({ length: count }, (_, index) => item(index))
    const { featured, continuation } = splitFeatured(items, ['item-0'])
    expect(featured).toHaveLength(Math.min(count, 4))
    expect([...featured, ...continuation].map((entry) => entry.id).sort()).toEqual(items.map((entry) => entry.id).sort())
  })

  it('keeps featured IDs in requested order and fills empty slots from content order', () => {
    const items = Array.from({ length: 8 }, (_, index) => item(index))
    const { featured, continuation } = splitFeatured(items, ['item-5', 'item-2'])
    expect(featured.map((entry) => entry.id)).toEqual(['item-5', 'item-2', 'item-0', 'item-1'])
    expect(continuation.map((entry) => entry.id)).toEqual(['item-3', 'item-4', 'item-6', 'item-7'])
  })

  it('fills missing featured references for a smaller collection fixture', () => {
    const items = [item(0)]
    expect(splitFeatured(items, ['item-3', 'item-0', 'item-2']).featured.map((entry) => entry.id)).toEqual(['item-0'])
  })

  it('rejects duplicate content IDs and invalid featured references', () => {
    expect(() => validateCollection([item(0), item(0)], [])).toThrow('Duplicate')
    expect(() => validateCollection([item(0)], ['missing'])).toThrow('Unknown')
    expect(() => validateCollection([item(0)], ['item-0', 'item-0'])).toThrow('Duplicate featured')
  })

  it('moves every object to a new position, including across the featured boundary', () => {
    const items = Array.from({ length: 8 }, (_, index) => item(index))
    const initial = arrangeCollection(items, ['item-0', 'item-1', 'item-2', 'item-3'], 0)
    const rearranged = arrangeCollection(items, ['item-0', 'item-1', 'item-2', 'item-3'], 1)
    const before = [...initial.featured, ...initial.continuation].map((entry) => entry.id)
    const after = [...rearranged.featured, ...rearranged.continuation].map((entry) => entry.id)
    expect(after).toHaveLength(before.length)
    expect(after.every((id, index) => id !== before[index])).toBe(true)
    expect(rearranged.featured.map((entry) => entry.id)).toContain('item-4')
    expect(after.sort()).toEqual(before.sort())
  })

  it('generates repeatable poses inside the reserved movement range', () => {
    for (const seed of [0, 1, 2, 100]) {
      const pose = collectionPose('item-3', 3, seed)
      expect(pose).toEqual(collectionPose('item-3', 3, seed))
      expect(Math.abs(pose.x)).toBeLessThanOrEqual(13)
      expect(Math.abs(pose.y)).toBeLessThanOrEqual(13)
      expect(Math.abs(pose.rotate)).toBeLessThanOrEqual(12)
    }
    expect(collectionPose('item-3', 3, 0).x).not.toBe(0)
    expect(collectionPose('item-3', 3, 0)).not.toEqual(collectionPose('item-3', 3, 1))
  })
})
