import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useReducedMotion } from 'motion/react'
import { Artwork } from './Artwork'
import { GraphArtwork, sampleGraphCurve } from './artwork/GraphArtwork'
import { RecordArtwork } from './artwork/RecordArtwork'
import { ArrowUpRight } from './ArrowUpRight'
import { InlineCodeText } from './InlineCodeText'
import type { CollectionItem } from './types'

type Props = { item: CollectionItem; onBack: () => void }

export function ItemDetail({ item, onBack }: Props) {
  const [progress, setProgress] = useState(1)
  const [spin, setSpin] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [artActive, setArtActive] = useState(false)
  const dragStart = useRef<{ pointerId: number; x: number; angle: number; element: HTMLButtonElement } | null>(null)
  const reducedMotion = useReducedMotion()
  const graphSamples = item.artwork.kind === 'graph' ? item.artwork.samples : []
  const graphValue = sampleGraphCurve(graphSamples, progress).value

  useEffect(() => () => {
    const drag = dragStart.current
    if (drag?.element.hasPointerCapture(drag.pointerId)) drag.element.releasePointerCapture(drag.pointerId)
  }, [])

  function beginRecordDrag(event: PointerEvent<HTMLButtonElement>) {
    if (reducedMotion || event.button !== 0) return
    dragStart.current = { pointerId: event.pointerId, x: event.clientX, angle: spin, element: event.currentTarget }
    event.currentTarget.setPointerCapture(event.pointerId)
    if (event.pointerType !== 'touch') event.preventDefault()
    setDragging(true)
  }
  function moveRecord(event: PointerEvent<HTMLButtonElement>) {
    if (!dragStart.current || dragStart.current.pointerId !== event.pointerId || reducedMotion) return
    setSpin(dragStart.current.angle + event.clientX - dragStart.current.x)
  }
  function endRecord(event: PointerEvent<HTMLButtonElement>, complete = false) {
    if (dragStart.current?.pointerId !== event.pointerId) return
    if (complete && Math.abs(event.clientX - dragStart.current.x) < 6) setSpin(value => value + 540)
    dragStart.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return <article className="detail-view" aria-labelledby="view-heading">
    <div className="detail-topline"><button className="detail-back" type="button" onClick={onBack}>← <span>Back</span></button><span className="detail-number">OBJECT {item.id.toUpperCase()}</span></div>
    <div className="detail-layout">
      <div className={`detail-art-wrap detail-art-${item.artwork.kind}`}>
        <div className="detail-art-frame">
          {item.artwork.kind === 'graph'
            ? <div className="artwork artwork-graph"><GraphArtwork samples={graphSamples} progress={progress} onProgressChange={setProgress} /></div>
            : item.artwork.kind === 'record'
              ? <button className={`artwork artwork-record${dragging ? ' is-dragging' : ''}`} type="button" aria-label="Play the record artwork" onPointerDown={beginRecordDrag} onPointerMove={moveRecord} onPointerUp={event => endRecord(event, true)} onPointerCancel={endRecord} onLostPointerCapture={endRecord} onClick={event => { if (event.detail === 0 || reducedMotion) setSpin(value => value + (reducedMotion ? 180 : 540)) }}><RecordArtwork angle={spin} dragging={dragging} /></button>
              : <button className="detail-art-button" type="button" aria-label={artworkActionLabel(item.artwork.kind)} aria-pressed={artActive} data-active={artActive} onClick={() => setArtActive(value => !value)}><Artwork artwork={item.artwork} /></button>}
        </div>
        {item.artwork.kind === 'graph' && <div className="graph-scrubber"><label htmlFor="graph-progress">Explore the curve</label><input id="graph-progress" type="range" min="0" max="1000" value={Math.round(progress * 1000)} onChange={event => setProgress(Number(event.currentTarget.value) / 1000)} aria-label="Scrub the illustrative graph" aria-valuetext={`Sample ${Math.round(progress * 100)} percent; graph value ${Math.round(graphValue)} out of 100`} aria-describedby="graph-reading"/><output id="graph-reading">{graphValue.toFixed(1)}<span> / 100</span></output></div>}
        {item.artwork.kind === 'record' && <button type="button" className="spin-button" onClick={() => setSpin(value => value + (reducedMotion ? 180 : 540))}>↻ <span>Spin the record</span></button>}
        {item.artwork.kind === 'graph' && <p className="art-note">An illustrative sample, pulled into motion.</p>}
      </div>
      <div className="detail-copy">
        <p className="detail-eyebrow">{item.detail.eyebrow}</p>
        <h1 id="view-heading" tabIndex={-1}>{item.title}</h1>
        <p className="detail-teaser">{item.teaser}</p>
        <div className="detail-prose">{item.detail.paragraphs.map((paragraph, index) => <p key={`${item.id}-paragraph-${index}`}><InlineCodeText text={paragraph} /></p>)}</div>
        {item.detail.links.length > 0 && <nav className="detail-links" aria-label="Related links">{item.detail.links.map(link => <a key={link.href} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}><span><InlineCodeText text={link.label} /></span><ArrowUpRight /></a>)}</nav>}
        {item.tags.length > 0 && <ul className="detail-tags" aria-label="Topics">{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
      </div>
    </div>
    {item.detail.highlights && <section className="detail-highlights" aria-labelledby="detail-highlights-heading">
      <div className="detail-highlights__heading"><p className="detail-eyebrow">SELECTED PUBLIC WORK</p><h2 id="detail-highlights-heading">A few things I’ve shipped<span>.</span></h2><p>Selected pull requests from the public Expensify repositories.</p></div>
      <div className="detail-highlights__list">{item.detail.highlights.map((highlight, index) => <a key={highlight.href} href={highlight.href} target="_blank" rel="noreferrer" className="detail-highlight"><span className="detail-highlight__number">{String(index + 1).padStart(2, '0')}</span><span className="detail-highlight__copy"><small>{highlight.meta}</small><strong><InlineCodeText text={highlight.title} /></strong><span><InlineCodeText text={highlight.description} /></span></span><span className="detail-highlight__arrow"><ArrowUpRight /></span></a>)}</div>
    </section>}
  </article>
}

function artworkActionLabel(kind: CollectionItem['artwork']['kind']) {
  switch (kind) {
    case 'stack': return 'Lift the layers'
    case 'portrait': return 'Tilt the portrait'
    case 'note': return 'Turn the note'
    case 'workmark': return 'Turn the work badge'
    case 'graph': return 'Explore the graph'
    case 'record': return 'Spin the record'
  }
}
