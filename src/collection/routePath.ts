import type { CollectionRoute } from './types'

export function pathForRoute(route: CollectionRoute): string {
  switch (route.kind) {
    case 'collection': return '/'
    case 'item': return `/item/${encodeURIComponent(route.id)}/`
    case 'index': return '/index/'
    case 'contact': return '/contact/'
  }
}
