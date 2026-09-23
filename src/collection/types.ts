export type Artwork =
  | { kind: 'graph'; samples: readonly number[] }
  | { kind: 'stack'; label: string }
  | { kind: 'record'; label: string }
  | { kind: 'portrait'; src: string; alt: string; caption: string }
  | { kind: 'note'; text: string; color: 'lime' | 'violet' | 'orange' }
  | { kind: 'workmark'; name: string; since: string; color: 'lime' | 'blue' }

export type CollectionItem = {
  id: string
  label: string
  title: string
  teaser: string
  tags: readonly string[]
  artwork: Artwork
  detail: {
    eyebrow: string
    paragraphs: readonly string[]
    links: readonly { label: string; href: string }[]
    highlights?: readonly { title: string; description: string; meta: string; href: string }[]
  }
}

export type CollectionRoute =
  | { kind: 'collection' }
  | { kind: 'item'; id: string }
  | { kind: 'index'; missingId?: string }
  | { kind: 'contact' }

export type Navigate = (route: CollectionRoute, sourceId?: string) => void
