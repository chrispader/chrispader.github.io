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
  const reducedMotion = useReducedMotion()
  const pose = reducedMotion ? { x: 0, y: 0, rotate: 0 } : collectionPose(item.id, index, seed)

  return (
    <article className={`collection-object collection-object--${placement} collection-object--${item.artwork.kind}`} data-item-id={item.id}>
      <a
        id={`object-link-${item.id}`}
        className="collection-object__link"
        href={`#/item/${encodeURIComponent(item.id)}`}
        aria-label={`${item.label}: ${item.title}`}
        onClick={(event) => {
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
            <motion.div className="collection-object__art" data-art-frame layoutId={`object-${item.id}`}>
              <Artwork artwork={item.artwork} />
            </motion.div>
          </motion.div>
        </div>
        <span className="collection-object__caption">
          <span className="collection-object__number">{String(index + 1).padStart(2, '0')} / {item.label}</span>
        </span>
      </a>
    </article>
  )
}
