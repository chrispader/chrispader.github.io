import { GraphArtwork } from './artwork/GraphArtwork'
import { PortraitArtwork } from './artwork/PortraitArtwork'
import { RecordArtwork } from './artwork/RecordArtwork'
import { StackArtwork } from './artwork/StackArtwork'
import { NoteArtwork } from './artwork/NoteArtwork'
import { ArrowUpRight } from './ArrowUpRight'
import type { Artwork as ArtworkData } from './types'

type Props = { artwork: ArtworkData; interactive?: boolean; active?: boolean }

export function Artwork({ artwork, interactive = false, active = false }: Props) {
  const label = interactive ? artworkLabel(artwork) : undefined
  const common = interactive ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }

  switch (artwork.kind) {
    case 'graph': return <div className="artwork artwork-graph" {...common}><GraphArtwork samples={artwork.samples} active={active} /></div>
    case 'stack': return <div className="artwork artwork-stack" {...common}><StackArtwork label={artwork.label} /></div>
    case 'record': return <div className="artwork artwork-record" {...common}><RecordArtwork /></div>
    case 'portrait': return <div className="artwork artwork-portrait" {...common}><PortraitArtwork {...artwork} /></div>
    case 'note': return <div className={`artwork artwork-note note-${artwork.color}`} {...common}><NoteArtwork text={artwork.text} /></div>
    case 'workmark': return <div className={`artwork artwork-workmark workmark-${artwork.color}`} {...common}><div className="workmark"><span className="workmark__index">CP / WORK</span><strong>{artwork.name}<i>.</i></strong><span className="workmark__orbit"><ArrowUpRight /></span><span className="workmark__date">SINCE {artwork.since}</span></div></div>
    default: {
      const exhaustive: never = artwork
      return exhaustive
    }
  }
}

function artworkLabel(artwork: ArtworkData) {
  switch (artwork.kind) {
    case 'graph': return 'Blue graph artwork'
    case 'stack': return artwork.label
    case 'record': return artwork.label
    case 'portrait': return artwork.alt
    case 'note': return artwork.text
    case 'workmark': return `${artwork.name}, since ${artwork.since}`
    default: {
      const exhaustive: never = artwork
      return exhaustive
    }
  }
}
