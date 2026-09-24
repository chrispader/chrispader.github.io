import { memo, useCallback, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react'
import { collectionItems, featuredIds, links } from './data'
import { CollectionScene } from './collection/CollectionScene'
import { CollectionIndex } from './collection/CollectionIndex'
import { ContactView } from './collection/ContactView'
import { ItemDetail } from './collection/ItemDetail'
import { ViewLayer } from './collection/ViewLayer'
import { ArrowUpRight } from './collection/ArrowUpRight'
import { useCollectionRoute, hashForRoute } from './collection/useCollectionRoute'
import { previewItems } from './collection/previewItems'
import type { CollectionRoute, Navigate } from './collection/types'

const items = import.meta.env.DEV ? previewItems(collectionItems) : collectionItems

export default function App() {
  const { route, navigate, back, returnFocusId } = useCollectionRoute(items)
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
            <a className="site-footer__coordinates" href="https://hoodmaps.com/vienna-neighborhood-map?lat=48.20817&amp;lng=16.37382&amp;zoom=12.00" aria-label="48.2082 degrees north, 16.3738 degrees east. Open map of Vienna">48.2082° N&nbsp; 16.3738° E</a>
            <span>COLLECTION № 01</span>
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
                {item && <ItemDetail key={item.id} item={item} onBack={back} />}
                {route.kind === 'index' && <CollectionIndex items={items} onNavigate={handleNavigate} onBack={() => handleNavigate({ kind: 'collection' })} missingId={route.missingId} query={indexQuery} onQueryChange={setIndexQuery} />}
                {route.kind === 'contact' && <ContactView onBack={() => handleNavigate({ kind: 'collection' })} />}
            </ViewLayer>
          )}
        </AnimatePresence>
        {import.meta.env.DEV && items !== collectionItems && <div className="preview-banner">Collection preview · {items.length} objects</div>}
      </LayoutGroup>
    </MotionConfig>
  )
}

function SiteHeader({ route, onNavigate }: { route: CollectionRoute; onNavigate: Navigate }) {
  const header = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const element = header.current
    if (!element) return

    const updateHeight = () => document.documentElement.style.setProperty('--header-height', `${element.getBoundingClientRect().height}px`)
    const observer = new ResizeObserver(updateHeight)
    updateHeight()
    observer.observe(element)

    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--header-height')
    }
  }, [])

  return (
    <header ref={header} className="site-header">
      <a className="brand" href="#/collection" aria-label="Christoph Pader, back to collection" onClick={(event) => followRoute(event, { kind: 'collection' }, onNavigate)}>
        <span className="brand-mark" aria-hidden="true">cp<span>.</span></span>
        <span className="brand-caption">
          <span className="brand-name">Christoph Pader</span>
          <span className="brand-location">ENGINEER / VIENNA</span>
        </span>
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <a href={hashForRoute({ kind: 'index' })} aria-current={route.kind === 'index' ? 'page' : undefined} onClick={(event) => followRoute(event, { kind: 'index' }, onNavigate)}>The index</a>
        <a href={hashForRoute({ kind: 'contact' })} aria-current={route.kind === 'contact' ? 'page' : undefined} onClick={(event) => followRoute(event, { kind: 'contact' }, onNavigate)}>Say hello <ArrowUpRight className="site-nav__arrow" /></a>
        <a className="site-nav__social" href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.57.11.78-.25.78-.55v-2.05c-3.17.69-3.84-1.35-3.84-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.53-.29-5.19-1.27-5.19-5.68 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.03 0 0 .96-.31 3.16 1.17a10.98 10.98 0 0 1 5.75 0c2.2-1.48 3.16-1.17 3.16-1.17.62 1.57.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.07 0 4.42-2.66 5.39-5.2 5.67.41.36.77 1.05.77 2.12v3.15c0 .3.21.67.79.55A11.5 11.5 0 0 0 12 .5Z"/></svg>
        </a>
        <a className="site-nav__social" href={links.x} target="_blank" rel="noreferrer" aria-label="Twitter">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.491h2.039L6.486 3.24H4.298L17.61 20.644Z"/></svg>
        </a>
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
