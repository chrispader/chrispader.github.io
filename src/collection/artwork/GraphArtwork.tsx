import { useEffect, useRef, type PointerEvent } from 'react'
import { useReducedMotion } from 'motion/react'

type GraphPoint = { x: number; y: number; value: number }
type Props = { samples: readonly number[]; progress?: number; onProgressChange?: (progress: number) => void }

const GRAPH_VIEWBOX_START = -8
const GRAPH_VIEWBOX_SIZE = 116

export function GraphArtwork({ samples, progress = 1, onProgressChange }: Props) {
  const pointerId = useRef<number | null>(null)
  const waveFrame = useRef(0)
  const waveX = useRef(50)
  const waveY = useRef(50)
  const waveStrength = useRef(0)
  const lastFrame = useRef(0)
  const hovering = useRef(false)
  const curvePath = useRef<SVGPathElement>(null)
  const shadowPath = useRef<SVGPathElement>(null)
  const marker = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()
  const points = getPoints(samples)
  const curve = makeCurve(points)
  const handle = sampleGraphCurve(samples, progress)

  useEffect(() => {
    if (reducedMotion) resetWave()
    return () => {
      cancelAnimationFrame(waveFrame.current)
      waveFrame.current = 0
    }
  }, [reducedMotion])

  function trackWave(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || (onProgressChange && pointerId.current !== event.pointerId)) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    waveX.current = clamp((event.clientX - bounds.left) / bounds.width) * 100
    waveY.current = clamp((event.clientY - bounds.top) / bounds.height) * 100
    hovering.current = true
    if (!waveFrame.current) waveFrame.current = requestAnimationFrame(animateWave)
  }

  function animateWave(time: number) {
    waveFrame.current = 0
    const elapsed = Math.min(64, time - (lastFrame.current || time - 16))
    lastFrame.current = time
    const response = 1 - Math.exp(-elapsed / (hovering.current ? 85 : 170))
    waveStrength.current += ((hovering.current ? 1 : 0) - waveStrength.current) * response
    if (!hovering.current && waveStrength.current < .015) {
      resetWave()
      return
    }

    const wave = makeSnakeCurve(samples, waveX.current, waveY.current, time, waveStrength.current)
    curvePath.current?.setAttribute('d', wave.path)
    shadowPath.current?.setAttribute('d', wave.path)
    if (marker.current) {
      const markerX = handle.x + (waveX.current - handle.x) * waveStrength.current
      const markerY = handle.y + (wave.y - handle.y) * waveStrength.current
      marker.current.style.left = `${((markerX + 8) / GRAPH_VIEWBOX_SIZE) * 100}%`
      marker.current.style.top = `${((markerY + 8) / GRAPH_VIEWBOX_SIZE) * 100}%`
    }
    waveFrame.current = requestAnimationFrame(animateWave)
  }

  function stopWave() {
    hovering.current = false
    if (reducedMotion || waveStrength.current === 0) {
      resetWave()
      return
    }
    if (!waveFrame.current) waveFrame.current = requestAnimationFrame(animateWave)
  }

  function resetWave() {
    hovering.current = false
    cancelAnimationFrame(waveFrame.current)
    waveFrame.current = 0
    waveStrength.current = 0
    lastFrame.current = 0
    curvePath.current?.setAttribute('d', curve)
    shadowPath.current?.setAttribute('d', curve)
    if (marker.current) {
      marker.current.style.left = `${((handle.x + 8) / GRAPH_VIEWBOX_SIZE) * 100}%`
      marker.current.style.top = `${((handle.y + 8) / GRAPH_VIEWBOX_SIZE) * 100}%`
    }
  }

  function scrub(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width === 0) return
    const fraction = (event.clientX - bounds.left) / bounds.width
    const graphX = (fraction * GRAPH_VIEWBOX_SIZE + GRAPH_VIEWBOX_START) / 100
    onProgressChange?.(clamp(graphX))
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== event.pointerId) return
    pointerId.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return <div className="graph-artwork-interaction"
    onPointerEnter={trackWave}
    onPointerDown={event => {
      if (!onProgressChange) {
        trackWave(event)
        return
      }
      if (event.button !== 0) return
      pointerId.current = event.pointerId
      event.currentTarget.setPointerCapture(event.pointerId)
      if (event.pointerType !== 'touch') event.preventDefault()
      scrub(event)
      trackWave(event)
    }}
    onPointerMove={event => { if (pointerId.current === event.pointerId) scrub(event); trackWave(event) }}
    onPointerLeave={() => { if (pointerId.current === null) stopWave() }}
    onPointerUp={event => { finishPointer(event); if (onProgressChange) stopWave() }}
    onPointerCancel={event => { finishPointer(event); stopWave() }}
    onLostPointerCapture={event => { if (pointerId.current === event.pointerId) { pointerId.current = null; stopWave() } }}>
    <svg viewBox="-8 -8 116 116" preserveAspectRatio="none" className="graph-drawing" aria-hidden="true">
      <path className="graph-grid" d="M0 20H100M0 40H100M0 60H100M0 80H100M20 0V100M40 0V100M60 0V100M80 0V100" />
      <path ref={shadowPath} className="graph-curve-shadow" d={curve} pathLength="100" />
      <path ref={curvePath} className="graph-curve" d={curve} pathLength="100" />
    </svg>
    <span ref={marker} className="graph-handle-marker" aria-hidden="true" style={{ left: `${((handle.x + 8) / GRAPH_VIEWBOX_SIZE) * 100}%`, top: `${((handle.y + 8) / GRAPH_VIEWBOX_SIZE) * 100}%` }} />
  </div>
}

function makeSnakeCurve(samples: readonly number[], hoverX: number, hoverY: number, time: number, strength: number) {
  const points = Array.from({ length: 51 }, (_, index) => {
    const x = index * 2
    const baseline = sampleGraphCurve(samples, x / 100).y
    const distance = (x - hoverX) / 28
    const influence = Math.exp(-distance * distance)
    const ripple = Math.sin(x * .21 - time * .008) * 10 * influence * strength
    const pull = (hoverY - baseline) * .16 * influence * strength
    return { x, y: Math.max(6, Math.min(94, baseline + ripple + pull)) }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y.toFixed(2)}`).join(' ')
  const markerIndex = Math.round(hoverX / 2)
  return { path, y: points[markerIndex].y }
}

export function sampleGraphCurve(samples: readonly number[], progress: number): GraphPoint {
  const points = getPoints(samples)
  if (points.length === 1) return points[0]
  const position = clamp(progress) * (points.length - 1)
  const segment = Math.min(points.length - 2, Math.floor(position))
  const t = position >= points.length - 1 ? 1 : position - segment
  const p0 = points[Math.max(0, segment - 1)]
  const p1 = points[segment]
  const p2 = points[segment + 1]
  const p3 = points[Math.min(points.length - 1, segment + 2)]
  const [control1, control2] = getControls(p0, p1, p2, p3)
  const x = cubic(p1.x, control1.x, control2.x, p2.x, t)
  const y = cubic(p1.y, control1.y, control2.y, p2.y, t)
  return { x, y, value: (90 - y) / 0.78 }
}

function getPoints(samples: readonly number[]): GraphPoint[] {
  const values = samples.length ? samples : [0]
  return values.map((value, index) => ({
    x: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
    y: 90 - (clamp(value / 100) * 78),
    value: clamp(value / 100) * 100,
  }))
}

function makeCurve(points: readonly GraphPoint[]) {
  if (points.length === 1) return `M${points[0].x},${points[0].y}`
  let path = `M${points[0].x},${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[Math.min(points.length - 1, index + 2)]
    const [control1, control2] = getControls(p0, p1, p2, p3)
    path += ` C${control1.x},${control1.y} ${control2.x},${control2.y} ${p2.x},${p2.y}`
  }
  return path
}

function getControls(p0: GraphPoint, p1: GraphPoint, p2: GraphPoint, p3: GraphPoint): [GraphPoint, GraphPoint] {
  const minimumY = Math.min(p1.y, p2.y)
  const maximumY = Math.max(p1.y, p2.y)
  return [
    { x: p1.x + (p2.x - p0.x) / 6, y: Math.max(minimumY, Math.min(maximumY, p1.y + (p2.y - p0.y) / 6)), value: 0 },
    { x: p2.x - (p3.x - p1.x) / 6, y: Math.max(minimumY, Math.min(maximumY, p2.y - (p3.y - p1.y) / 6)), value: 0 },
  ]
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number) {
  const inverse = 1 - t
  return inverse ** 3 * p0 + 3 * inverse ** 2 * t * p1 + 3 * inverse * t ** 2 * p2 + t ** 3 * p3
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}
