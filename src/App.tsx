import { memo, useCallback, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react'
import { collectionItems, featuredIds } from './data'
import { CollectionScene } from './collection/CollectionScene'
import { CollectionIndex } from './collection/CollectionIndex'
import { ContactView } from './collection/ContactView'
import { ItemDetail } from './collection/ItemDetail'
import { ViewLayer } from './collection/ViewLayer'
import { useCollectionRoute, hashForRoute } from './collection/useCollectionRoute'
import { previewItems } from './collection/previewItems'
import type { CollectionRoute, Navigate } from './collection/types'

const items = import.meta.env.DEV ? previewItems(collectionItems) : collectionItems

export default function App() {
  const { route, navigate, back, sourceId, returnFocusId } = useCollectionRoute(items)
  const layer = useRef<HTMLDivElement>(null)
  const viewScroll = useRef(new Map<string, number>())
  const [indexQuery, setIndexQuery] = useState('')
  const isOpen = route.kind !== 'collection'
  const routeKey = route.kind === 'item' ? `item-${route.id}` : route.kind
  const item = route.kind === 'item' ? items.find((entry) => entry.id === route.id) : undefined

  useLayoutEffect(() => {
    document.body.dataset.viewOpen = String(isOpen)
    if (layer.current) layer.current.scrollTop = viewScroll.current.get(routeKey) ?? 0
    const frame = requestAnimationFrame(() => {
      const restored = returnFocusId ? document.getElementById(returnFocusId) : null
      const target = restored && !restored.closest('[inert]')
        ? restored
        : document.getElementById(isOpen ? 'view-heading' : 'collection-heading')
      target?.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
      delete document.body.dataset.viewOpen
    }
  }, [isOpen, routeKey, returnFocusId])

  const handleNavigate = useCallback<Navigate>((destination, opener) => {
    const destinationKey = destination.kind === 'item' ? `item-${destination.id}` : destination.kind
    viewScroll.current.delete(destinationKey)
    if (destination.kind === 'index') setIndexQuery('')
    navigate(destination, opener)
  }, [navigate])

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>
      <LayoutGroup id="collection">
        <a className="skip-link" href={isOpen ? '#view-heading' : '#collection-heading'} onClick={(event) => {
          event.preventDefault()
          document.getElementById(isOpen ? 'view-heading' : 'collection-heading')?.focus()
        }}>Skip to content</a>
        <SiteHeader route={route} onNavigate={handleNavigate} />
        <div className="collection-layer" data-obscured={isOpen} inert={isOpen} aria-hidden={isOpen}>
          <StableCollectionScene items={items} featuredIds={featuredIds} onNavigate={handleNavigate} />
          <footer className="site-footer">
            <span>48.2082° N&nbsp; 16.3738° E</span>
            <span>COLLECTION № 01&nbsp; /&nbsp; VIENNA</span>
          </footer>
        </div>
        <AnimatePresence initial={false}>
          {isOpen && (
            <ViewLayer
              key="detail-layer"
              elementRef={layer}
              onScroll={(scrollTop) => viewScroll.current.set(routeKey, scrollTop)}
              onBack={back}
            >
                {item && <ItemDetail key={item.id} item={item} onBack={back} shared={Boolean(sourceId?.startsWith('object-link-'))} />}
                {route.kind === 'index' && <CollectionIndex items={items} onNavigate={handleNavigate} onBack={back} missingId={route.missingId} query={indexQuery} onQueryChange={setIndexQuery} />}
                {route.kind === 'contact' && <ContactView onBack={back} />}
            </ViewLayer>
          )}
        </AnimatePresence>
        {import.meta.env.DEV && items !== collectionItems && <div className="preview-banner">Collection preview · {items.length} objects</div>}
      </LayoutGroup>
    </MotionConfig>
  )
}

function SiteHeader({ route, onNavigate }: { route: CollectionRoute; onNavigate: Navigate }) {
  return (
    <header className="site-header">
      <a className="brand" href="#/collection" aria-label="Christoph Pader, back to collection" onClick={(event) => followRoute(event, { kind: 'collection' }, onNavigate)}>
        <span className="brand-mark" aria-hidden="true">cp<span>.</span></span>
        <span className="brand-caption">
          <span className="brand-name">Christoph Pader</span>
          <span className="brand-location">ENGINEER / VIENNA</span>
        </span>
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <a href={hashForRoute({ kind: 'index' })} aria-current={route.kind === 'index' ? 'page' : undefined} onClick={(event) => followRoute(event, { kind: 'index' }, onNavigate)}>The index</a>
        <a href={hashForRoute({ kind: 'contact' })} aria-current={route.kind === 'contact' ? 'page' : undefined} onClick={(event) => followRoute(event, { kind: 'contact' }, onNavigate)}>Say hello <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}

function followRoute(event: MouseEvent<HTMLAnchorElement>, destination: CollectionRoute, navigate: Navigate) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(destination)
}

const StableCollectionScene = memo(CollectionScene)
