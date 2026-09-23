import type { ReactNode, RefObject } from 'react'
import { motion, useIsPresent, useReducedMotion } from 'motion/react'

type Props = {
  children: ReactNode
  elementRef: RefObject<HTMLDivElement | null>
  onScroll: (scrollTop: number) => void
  onBack: () => void
}

export function ViewLayer({ children, elementRef, onScroll, onBack }: Props) {
  const isPresent = useIsPresent()
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={elementRef}
      className="view-layer"
      inert={!isPresent}
      aria-hidden={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, pointerEvents: 'auto' }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: reducedMotion ? 0 : .2 }}
      onScroll={(event) => onScroll(event.currentTarget.scrollTop)}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        onBack()
      }}
    >
      <main className="view-layer-inner">{children}</main>
    </motion.div>
  )
}
