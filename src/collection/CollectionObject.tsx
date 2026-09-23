import { useRef, type PointerEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Artwork } from './Artwork'
import { collectionPose } from './layout'
import type { CollectionItem, Navigate } from './types'

type Props = {
  item: CollectionItem
  index: number
  seed: number
  onNavigate: Navigate
  placement: 'featured' | 'continuation'
}

export function CollectionObject({ item, index, seed, onNavigate, placement }: Props) {
  const touch = useRef<{ id: number; x: number; y: number; dragged: boolean } | null>(null)
  const suppressClick = useRef(false)
  const reducedMotion = useReducedMotion()
  const pose = reducedMotion ? { x: 0, y: 0, rotate: 0 } : collectionPose(item.id, index, seed)

  function startTouch(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'touch' || reducedMotion) return
    touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false }
    suppressClick.current = false
  }

  function moveTouch(event: PointerEvent<HTMLAnchorElement>) {
    const start = touch.current
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!start.dragged && (Math.abs(dx) < 9 || Math.abs(dx) < Math.abs(dy))) return
    start.dragged = true
    suppressClick.current = true
    event.currentTarget.style.setProperty('--touch-x', `${Math.max(-22, Math.min(22, dx * .28)).toFixed(1)}px`)
    event.currentTarget.style.setProperty('--touch-rotate', `${Math.max(-5, Math.min(5, dx * .065)).toFixed(1)}deg`)
    event.currentTarget.dataset.touchDragging = 'true'
  }

  function endTouch(event: PointerEvent<HTMLAnchorElement>) {
    if (touch.current?.id !== event.pointerId) return
    touch.current = null
    event.currentTarget.style.removeProperty('--touch-x')
    event.currentTarget.style.removeProperty('--touch-rotate')
    delete event.currentTarget.dataset.touchDragging
  }

  return (
    <article className={`collection-object collection-object--${placement} collection-object--${item.artwork.kind}`} data-item-id={item.id} data-drift-layer={(index % 3) + 1}>
      <a
        id={`object-link-${item.id}`}
        className="collection-object__link"
        href={`#/item/${encodeURIComponent(item.id)}`}
        aria-label={`${item.label}: ${item.title}`}
        onPointerDown={startTouch}
        onPointerMove={moveTouch}
        onPointerUp={endTouch}
        onPointerCancel={endTouch}
        onClick={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false
            event.preventDefault()
            return
          }
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
          event.preventDefault()
          onNavigate({ kind: 'item', id: item.id }, `object-link-${item.id}`)
        }}
      >
        <div className="collection-object__envelope">
          <motion.div
            className="collection-object__pose"
            animate={pose}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="collection-object__art" data-art-frame>
              <Artwork artwork={item.artwork} />
            </div>
          </motion.div>
        </div>
        <span className="collection-object__caption">
          <span className="collection-object__number">{String(index + 1).padStart(2, '0')} / {item.label}</span>
        </span>
      </a>
    </article>
  )
}
