import type { CSSProperties } from 'react'

type Props = { angle?: number; dragging?: boolean }
type RecordStyle = CSSProperties & { '--record-angle': string }

export function RecordArtwork({ angle = 0, dragging = false }: Props) {
  const style: RecordStyle = { '--record-angle': `${angle}deg` }
  return <div className="record-stage" aria-hidden="true">
    <div className={`vinyl${dragging ? ' is-dragging' : ''}`} style={style}>
      <div className="vinyl-grooves" />
      <div className="vinyl-label"><small>SIDE A</small><span>cp.</span><i /></div>
    </div>
  </div>
}
