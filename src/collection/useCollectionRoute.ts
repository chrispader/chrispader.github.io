import { useCallback, useEffect, useRef, useState } from 'react'
import type { CollectionItem, CollectionRoute, Navigate } from './types'
import { pathForRoute } from './routePath'

export { pathForRoute } from './routePath'

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
  const [state, setState] = useState<RouteState>(() => ({ route: parseCollectionLocation(window.location.pathname, window.location.hash, itemIds) }))
  const stateRef = useRef(state)
  const depthRef = useRef(0)

  useEffect(() => {
    const existing = readHistoryEntry(window.history.state)
    const route = parseCollectionLocation(window.location.pathname, window.location.hash, itemIds)
    const url = shouldNormalizeLegacyRoute(window.location.hash, route) ? `${pathForRoute(route)}${window.location.search}` : window.location.href
    if (existing) {
      depthRef.current = existing.depth
      stateRef.current = { route, sourceId: existing.sourceId }
      setState(stateRef.current)
      if (url !== window.location.href) window.history.replaceState(existing, '', url)
      return
    }
    window.history.replaceState({ collectionRoute: true, depth: 0 } satisfies HistoryEntry, '', url)
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      const previous = stateRef.current
      const historyEntry = readHistoryEntry(window.history.state)
      depthRef.current = historyEntry?.depth ?? 0
      const route = parseCollectionLocation(window.location.pathname, window.location.hash, itemIds)
      if (shouldNormalizeLegacyRoute(window.location.hash, route)) {
        window.history.replaceState(historyEntry ?? { collectionRoute: true, depth: 0 } satisfies HistoryEntry, '', `${pathForRoute(route)}${window.location.search}`)
      }
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
      `${pathForRoute(route)}${window.location.search}`,
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
    window.history.replaceState({ collectionRoute: true, depth: 0 } satisfies HistoryEntry, '', `/${window.location.search}`)
    stateRef.current = next
    setState(next)
  }, [])

  return { route: state.route, sourceId: state.sourceId, returnFocusId: state.returnFocusId, navigate, back }
}

export function parseCollectionLocation(pathname: string, hash: string, itemIds: ReadonlySet<string>): CollectionRoute {
  return isLegacyRouteHash(hash) ? parseCollectionHash(hash, itemIds) : parseCollectionPath(pathname, itemIds)
}

export function parseCollectionPath(pathname: string, itemIds: ReadonlySet<string>): CollectionRoute {
  const path = pathname.replace(/^\/+|\/+$/g, '')
  if (path === '' || path === 'collection') return { kind: 'collection' }
  if (path === 'index') return { kind: 'index' }
  if (path === 'contact') return { kind: 'contact' }
  if (path.startsWith('item/')) return parseItemId(path.slice(5), itemIds)
  return { kind: 'index', missingId: path }
}

export function parseCollectionHash(hash: string, itemIds: ReadonlySet<string>): CollectionRoute {
  const path = hash.replace(/^#\/?/, '').replace(/\/+$/, '')
  if (path === '' || path === 'work' || path === 'top' || path === 'collection') return { kind: 'collection' }
  if (path === 'index' || path === 'writing') return { kind: 'index' }
  if (path === 'contact') return { kind: 'contact' }
  if (path === 'about') return itemIds.has('about') ? { kind: 'item', id: 'about' } : { kind: 'index', missingId: 'about' }
  if (path.startsWith('item/')) return parseItemId(path.slice(5), itemIds)
  return { kind: 'index', missingId: path }
}

function parseItemId(encodedId: string, itemIds: ReadonlySet<string>): CollectionRoute {
  let id: string
  try {
    id = decodeURIComponent(encodedId)
  } catch {
    return { kind: 'index', missingId: encodedId }
  }
  return itemIds.has(id) ? { kind: 'item', id } : { kind: 'index', missingId: id }
}

function isLegacyRouteHash(hash: string): boolean {
  return hash.startsWith('#/') || ['#work', '#top', '#about', '#writing'].includes(hash)
}

function shouldNormalizeLegacyRoute(hash: string, route: CollectionRoute): boolean {
  return isLegacyRouteHash(hash) && !(route.kind === 'index' && route.missingId)
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
