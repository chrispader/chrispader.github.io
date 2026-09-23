import type { CollectionItem } from './types'

export type CollectionPose = Readonly<{ x: number; y: number; rotate: number }>
const FEATURED_LIMIT = 6

export function validateCollection(items: readonly CollectionItem[], featuredIds: readonly string[]): void {
  const ids = new Set<string>()
  for (const item of items) {
    if (!item.id || ids.has(item.id)) throw new Error(`Duplicate or empty collection ID: ${item.id}`)
    ids.add(item.id)
  }

  const featured = new Set<string>()
  for (const id of featuredIds) {
    if (featured.has(id)) throw new Error(`Duplicate featured ID: ${id}`)
    if (!ids.has(id)) throw new Error(`Unknown featured ID: ${id}`)
    featured.add(id)
  }
}

export function splitFeatured(items: readonly CollectionItem[], featuredIds: readonly string[]) {
  validateCollection(items, featuredIds.filter((id) => items.some((item) => item.id === id)))
  const byId = new Map(items.map((item) => [item.id, item]))
  const featured = featuredIds.map((id) => byId.get(id)).filter(isItem).slice(0, FEATURED_LIMIT)
  const selected = new Set(featured.map((item) => item.id))

  for (const item of items) {
    if (featured.length === FEATURED_LIMIT) break
    if (selected.has(item.id)) continue
    featured.push(item)
    selected.add(item.id)
  }

  return { featured, continuation: items.filter((item) => !selected.has(item.id)) }
}

export function arrangeCollection(items: readonly CollectionItem[], featuredIds: readonly string[], seed: number) {
  const { featured, continuation } = splitFeatured(items, featuredIds)
  if (seed === 0 || items.length < 2) return { featured, continuation }

  const ordered = [...featured, ...continuation]
  const offset = ((seed - 1) % (ordered.length - 1)) + 1
  const rearranged = [...ordered.slice(offset), ...ordered.slice(0, offset)]
  return { featured: rearranged.slice(0, FEATURED_LIMIT), continuation: rearranged.slice(FEATURED_LIMIT) }
}

export function collectionPose(id: string, index: number, seed: number): CollectionPose {
  const baseline = [
    { x: -12, y: -10, rotate: -9 },
    { x: 12, y: 9, rotate: 8 },
    { x: -10, y: 12, rotate: 10 },
    { x: 11, y: -9, rotate: -8 },
  ][index % 4]
  if (seed === 0) return baseline
  const random = seededRandom(`${id}:${seed}`)
  return {
    x: Math.round((random() * 2 - 1) * 13),
    y: Math.round((random() * 2 - 1) * 13),
    rotate: Math.round((baseline.rotate + (random() * 2 - 1) * 4) * 10) / 10,
  }
}

function isItem(item: CollectionItem | undefined): item is CollectionItem {
  return item !== undefined
}

function seededRandom(value: string): () => number {
  let state = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    state ^= value.charCodeAt(index)
    state = Math.imul(state, 16777619)
  }
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 4294967296
  }
}
