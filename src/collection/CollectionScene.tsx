import { useEffect, useMemo, useRef, useState } from 'react'
import { CollectionObject } from './CollectionObject'
import { arrangeCollection } from './layout'
import type { CollectionItem, Navigate } from './types'

type Props = {
  items: readonly CollectionItem[]
  featuredIds: readonly string[]
  onNavigate: Navigate
}

export function CollectionScene({ items, featuredIds, onNavigate }: Props) {
  const [seed, setSeed] = useState(0)
  const scene = useRef<HTMLElement>(null)
  const { featured, continuation } = useMemo(() => arrangeCollection(items, featuredIds, seed), [items, featuredIds, seed])
  const order = useMemo(() => new Map(items.map((item, index) => [item.id, index])), [items])

  useEffect(() => {
    const motionAllowed = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    let x = 0
    let y = 0

    function update() {
      frame = 0
      const style = scene.current?.style
      if (!style) return
      for (const [layer, distance] of [6, 10, 14].entries()) {
        style.setProperty(`--drift-x-${layer + 1}`, `${(x * distance).toFixed(2)}px`)
        style.setProperty(`--drift-y-${layer + 1}`, `${(y * distance * .75).toFixed(2)}px`)
      }
    }

    function schedule(nextX: number, nextY: number) {
      x = nextX
      y = nextY
      if (!frame) frame = requestAnimationFrame(update)
    }

    function move(event: PointerEvent) {
      if (!motionAllowed.matches || event.pointerType === 'touch') return
      schedule((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }

    function reset() { schedule(0, 0) }
    function leave(event: PointerEvent) { if (!event.relatedTarget) reset() }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerout', leave)
    window.addEventListener('blur', reset)
    motionAllowed.addEventListener('change', reset)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerout', leave)
      window.removeEventListener('blur', reset)
      motionAllowed.removeEventListener('change', reset)
    }
  }, [])

  useEffect(() => {
    const touchMotion = window.matchMedia('(pointer: coarse) and (prefers-reduced-motion: no-preference)')
    let frame = 0

    function update() {
      frame = 0
      const objects = scene.current?.querySelectorAll<HTMLElement>('.collection-object')
      if (!objects) return
      const middle = window.innerHeight / 2
      for (const object of objects) {
        const rect = object.getBoundingClientRect()
        const distance = (rect.top + rect.height / 2 - middle) / middle
        const offset = touchMotion.matches ? Math.max(-13, Math.min(13, distance * -13)) : 0
        object.style.setProperty('--scroll-y', `${offset.toFixed(1)}px`)
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    touchMotion.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      touchMotion.removeEventListener('change', schedule)
    }
  }, [seed, items])

  return (
    <main className="collection-scene" id="main" ref={scene}>
      <section className="collection-gallery" aria-labelledby="collection-heading">
        <div className="collection-opening" data-object-count={featured.length}>
          <svg className="collection-thread" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
            <path d="M170 155 C100 260 130 285 255 330 S310 450 365 510 S565 740 755 580 S960 460 1080 520" />
          </svg>
          <div className="collection-hero">
            <span className="collection-kicker">A SMALL COLLECTION BY CHRIS</span>
            <h1 id="collection-heading" tabIndex={-1}>A work<br />in play.</h1>
            <p>Pick something up. See where it goes.</p>
            <div className="collection-hero__actions">
              <button className="collection-shuffle" type="button" aria-label="Rearrange objects" onClick={() => setSeed((value) => value + 1)}>
                <span className="collection-shuffle__icon" aria-hidden="true" style={{ transform: `rotate(${seed * 90}deg)` }}>+</span>
                <span className="collection-shuffle__copy"><small>GIVE IT A SHAKE</small><strong>Change perspective</strong></span>
                <span className="collection-shuffle__arrow" aria-hidden="true">↗</span>
              </button>
              {seed > 0 && <button className="collection-reset" type="button" aria-label="Reset arrangement" onClick={() => setSeed(0)}>Reset</button>}
            </div>
          </div>
          {featured.map((item, index) => (
            <div className={`collection-opening__slot collection-opening__slot--${index + 1}`} key={item.id}>
              <CollectionObject item={item} index={order.get(item.id) ?? index} seed={seed} onNavigate={onNavigate} placement="featured" />
            </div>
          ))}
        </div>
        {continuation.length > 0 && (
          <div className="collection-continuation" role="group" aria-label="Additional collection objects">
            {continuation.map((item) => (
              <CollectionObject key={item.id} item={item} index={order.get(item.id) ?? 0} seed={seed} onNavigate={onNavigate} placement="continuation" />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
