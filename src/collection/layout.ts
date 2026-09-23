import type { CollectionItem } from './types'

export type CollectionPose = Readonly<{ x: number; y: number; rotate: number }>

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
  const featured = featuredIds.map((id) => byId.get(id)).filter(isItem).slice(0, 4)
  const selected = new Set(featured.map((item) => item.id))

  for (const item of items) {
    if (featured.length === 4) break
    if (selected.has(item.id)) continue
    featured.push(item)
    selected.add(item.id)
  }

  return { featured, continuation: items.filter((item) => !selected.has(item.id)) }
}

export function collectionPose(id: string, index: number, seed: number): CollectionPose {
  const baseline = [-7, 5, 6, -5][index % 4]
  if (seed === 0) return { x: 0, y: 0, rotate: baseline }
  const random = seededRandom(`${id}:${seed}`)
  return {
    x: Math.round((random() * 2 - 1) * 8),
    y: Math.round((random() * 2 - 1) * 8),
    rotate: Math.round((baseline + (random() * 2 - 1) * 5) * 10) / 10,
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
