import { useMemo, useState } from 'react'
import { CollectionObject } from './CollectionObject'
import { splitFeatured } from './layout'
import type { CollectionItem, Navigate } from './types'

type Props = {
  items: readonly CollectionItem[]
  featuredIds: readonly string[]
  onNavigate: Navigate
}

export function CollectionScene({ items, featuredIds, onNavigate }: Props) {
  const [seed, setSeed] = useState(0)
  const { featured, continuation } = useMemo(() => splitFeatured(items, featuredIds), [items, featuredIds])
  const order = new Map(items.map((item, index) => [item.id, index]))

  return (
    <main className="collection-scene" id="main">
      <section className="collection-opening" aria-labelledby="collection-heading">
        <svg className="collection-thread" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
          <path d="M170 155 C100 260 130 285 255 330 S310 450 365 510 S565 740 755 580 S960 460 1080 520" />
        </svg>
        <div className="collection-hero">
          <span className="collection-kicker">A SMALL COLLECTION BY CHRIS</span>
          <h1 id="collection-heading" tabIndex={-1}>A work<br />in play.</h1>
          <p>Pick something up. See where it goes.</p>
          <div className="collection-hero__actions">
            <button className="collection-shuffle" type="button" aria-label="Rearrange objects" onClick={() => setSeed((value) => value + 1)}><span aria-hidden="true">+</span></button>
            <span className="collection-shuffle-hint">a different<br />perspective ↗</span>
            {seed > 0 && <button className="collection-reset" type="button" onClick={() => setSeed(0)}>Reset arrangement</button>}
          </div>
        </div>
        {featured.map((item, index) => (
          <div className={`collection-opening__slot collection-opening__slot--${index + 1}`} key={item.id}>
            <CollectionObject item={item} index={order.get(item.id) ?? index} seed={seed} onNavigate={onNavigate} placement="featured" />
          </div>
        ))}
      </section>
      {continuation.length > 0 && <a className="collection-explore-cue" href="#more-objects" onClick={(event) => { event.preventDefault(); document.getElementById('more-objects')?.scrollIntoView() }}>Explore all {items.length} objects ↓</a>}
      {continuation.length > 0 && (
        <section className="collection-continuation" id="more-objects" aria-labelledby="more-objects-heading">
          <div className="collection-continuation__heading">
            <span className="collection-kicker">The collection continues</span>
            <h2 id="more-objects-heading">More to explore.</h2>
            <span>{String(continuation.length).padStart(2, '0')} more objects</span>
          </div>
          <div className="collection-continuation__grid">
            {continuation.map((item) => (
              <CollectionObject key={item.id} item={item} index={order.get(item.id) ?? 0} seed={seed} onNavigate={onNavigate} placement="continuation" />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
