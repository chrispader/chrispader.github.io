import { useCallback, useEffect, useRef, useState } from 'react'
import type { CollectionItem, CollectionRoute, Navigate } from './types'

type RouteState = {
  route: CollectionRoute
  sourceId?: string
  returnFocusId?: string
}

type HistoryEntry = {
  collectionRoute: true
  depth: number
  sourceId?: string
}

export function useCollectionRoute(items: readonly CollectionItem[]) {
  const itemIds = new Set(items.map((item) => item.id))
  const [state, setState] = useState<RouteState>(() => ({ route: parseCollectionHash(window.location.hash, itemIds) }))
  const stateRef = useRef(state)
  const depthRef = useRef(0)

  useEffect(() => {
    const existing = readHistoryEntry(window.history.state)
    if (existing) {
      depthRef.current = existing.depth
      stateRef.current = { route: parseCollectionHash(window.location.hash, itemIds), sourceId: existing.sourceId }
      setState(stateRef.current)
      return
    }
    window.history.replaceState({ collectionRoute: true, depth: 0 } satisfies HistoryEntry, '', window.location.href)
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      const previous = stateRef.current
      const historyEntry = readHistoryEntry(window.history.state)
      depthRef.current = historyEntry?.depth ?? 0
      const route = parseCollectionHash(window.location.hash, itemIds)
      if (sameRoute(previous.route, route) && previous.sourceId === historyEntry?.sourceId) return
      const next: RouteState = {
        route,
        sourceId: historyEntry?.sourceId,
        returnFocusId: previous.route.kind === 'item' && route.kind !== 'item' ? previous.sourceId : undefined,
      }
      stateRef.current = next
      setState(next)
    }

    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)
    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [items])

  const navigate = useCallback<Navigate>((target, sourceId) => {
    const route = normalizeRoute(target, new Set(items.map((item) => item.id)))
    const previous = stateRef.current
    const next: RouteState = {
      route,
      sourceId: route.kind === 'item' ? sourceId : undefined,
      returnFocusId: previous.route.kind === 'item' && route.kind !== 'item' ? previous.sourceId : undefined,
    }
    depthRef.current += 1
    window.history.pushState(
      { collectionRoute: true, depth: depthRef.current, sourceId: next.sourceId } satisfies HistoryEntry,
      '',
      hashForRoute(route),
    )
    stateRef.current = next
    setState(next)
  }, [items])

  const back = useCallback(() => {
    if (depthRef.current > 0) {
      window.history.back()
      return
    }
    const previous = stateRef.current
    const next: RouteState = { route: { kind: 'collection' }, returnFocusId: previous.sourceId }
    window.history.replaceState({ collectionRoute: true, depth: 0 } satisfies HistoryEntry, '', '#/collection')
    stateRef.current = next
    setState(next)
  }, [])

  return { route: state.route, sourceId: state.sourceId, returnFocusId: state.returnFocusId, navigate, back }
}

export function parseCollectionHash(hash: string, itemIds: ReadonlySet<string>): CollectionRoute {
  const path = hash.replace(/^#\/?/, '').replace(/\/+$/, '')
  if (path === '' || path === 'work' || path === 'top' || path === 'collection') return { kind: 'collection' }
  if (path === 'index' || path === 'writing') return { kind: 'index' }
  if (path === 'contact') return { kind: 'contact' }
  if (path === 'about') return itemIds.has('about') ? { kind: 'item', id: 'about' } : { kind: 'index', missingId: 'about' }
  if (path.startsWith('item/')) {
    let id: string
    try {
      id = decodeURIComponent(path.slice(5))
    } catch {
      return { kind: 'index', missingId: path.slice(5) }
    }
    return itemIds.has(id) ? { kind: 'item', id } : { kind: 'index', missingId: id }
  }
  return { kind: 'index', missingId: path }
}

export function hashForRoute(route: CollectionRoute): string {
  switch (route.kind) {
    case 'collection': return '#/collection'
    case 'item': return `#/item/${encodeURIComponent(route.id)}`
    case 'index': return '#/index'
    case 'contact': return '#/contact'
  }
}

function normalizeRoute(route: CollectionRoute, itemIds: ReadonlySet<string>): CollectionRoute {
  if (route.kind === 'item' && !itemIds.has(route.id)) return { kind: 'index', missingId: route.id }
  return route
}

function sameRoute(left: CollectionRoute, right: CollectionRoute): boolean {
  if (left.kind !== right.kind) return false
  if (left.kind === 'item' && right.kind === 'item') return left.id === right.id
  if (left.kind === 'index' && right.kind === 'index') return left.missingId === right.missingId
  return true
}

function readHistoryEntry(value: unknown): HistoryEntry | undefined {
  if (typeof value !== 'object' || value === null || !('collectionRoute' in value) || value.collectionRoute !== true) return undefined
  if (!('depth' in value) || typeof value.depth !== 'number') return undefined
  if ('sourceId' in value && typeof value.sourceId !== 'string' && value.sourceId !== undefined) return undefined
  return {
    collectionRoute: true,
    depth: value.depth,
    sourceId: 'sourceId' in value && typeof value.sourceId === 'string' ? value.sourceId : undefined,
  }
}
