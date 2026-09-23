import { GraphArtwork } from './artwork/GraphArtwork'
import { PortraitArtwork } from './artwork/PortraitArtwork'
import { RecordArtwork } from './artwork/RecordArtwork'
import { StackArtwork } from './artwork/StackArtwork'
import { NoteArtwork } from './artwork/NoteArtwork'
import type { Artwork as ArtworkData } from './types'

type Props = { artwork: ArtworkData; interactive?: boolean }

export function Artwork({ artwork, interactive = false }: Props) {
  const label = interactive ? artworkLabel(artwork) : undefined
  const common = interactive ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }

  switch (artwork.kind) {
    case 'graph': return <div className="artwork artwork-graph" {...common}><GraphArtwork samples={artwork.samples} /></div>
    case 'stack': return <div className="artwork artwork-stack" {...common}><StackArtwork label={artwork.label} /></div>
    case 'record': return <div className="artwork artwork-record" {...common}><RecordArtwork /></div>
    case 'portrait': return <div className="artwork artwork-portrait" {...common}><PortraitArtwork {...artwork} /></div>
    case 'note': return <div className={`artwork artwork-note note-${artwork.color}`} {...common}><NoteArtwork text={artwork.text} /></div>
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
    default: {
      const exhaustive: never = artwork
      return exhaustive
    }
  }
}
