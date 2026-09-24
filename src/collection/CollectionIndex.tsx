import { useMemo, useState, type MouseEvent } from 'react'
import { Artwork } from './Artwork'
import { ArrowUpRight } from './ArrowUpRight'
import { pathForRoute } from './useCollectionRoute'
import type { CollectionItem, Navigate } from './types'

type Props = { items: readonly CollectionItem[]; onNavigate: Navigate; onBack: () => void; missingId?: string; query?: string; onQueryChange?: (value: string) => void }

export function CollectionIndex({ items, onNavigate, onBack, missingId, query: controlledQuery, onQueryChange }: Props) {
  const [localQuery, setLocalQuery] = useState('')
  const [activeArtworkId, setActiveArtworkId] = useState<string | null>(null)
  const query = controlledQuery ?? localQuery
  const updateQuery = onQueryChange ?? setLocalQuery
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return items
    return items.filter(item => [item.title, item.label, item.teaser, ...item.tags].join(' ').toLocaleLowerCase().includes(needle))
  }, [items, query])

  function followItem(event: MouseEvent<HTMLAnchorElement>, item: CollectionItem) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate({ kind: 'item', id: item.id }, `index-link-${item.id}`)
  }

  return <section className="index-view" aria-labelledby="view-heading">
    <div className="index-topline"><button className="detail-back" type="button" onClick={onBack}>← <span>Back to collection</span></button><span className="detail-number">A SMALL ARCHIVE</span></div>
    {missingId && <p className="index-missing" role="status">“{missingId}” isn’t in the collection. Here’s everything that is.</p>}
    <p className="detail-eyebrow">Collected work & other things</p>
    <h1 id="view-heading" tabIndex={-1}>The index<span>.</span></h1>
    <p className="index-intro">A few things I’ve made, learned from, and kept close.</p>
    {items.length > 8 && <label className="index-search">Find an object<input type="search" value={query} onChange={event => updateQuery(event.currentTarget.value)} placeholder="Title or topic" /></label>}
    <div className="index-list" aria-live="polite">{filteredItems.map((item, index) => <a className="index-row" id={`index-link-${item.id}`} href={pathForRoute({ kind: 'item', id: item.id })} key={item.id} onClick={event => followItem(event, item)} onPointerEnter={() => setActiveArtworkId(item.id)} onPointerLeave={() => setActiveArtworkId(null)} onFocus={() => setActiveArtworkId(item.id)} onBlur={() => setActiveArtworkId(null)}>
      <span className="index-count">{String(index + 1).padStart(2, '0')}</span>
      <span className="index-art"><Artwork artwork={item.artwork} active={activeArtworkId === item.id} /></span>
      <span className="index-row-copy"><span className="index-row-title">{item.title}</span><span className="index-row-teaser">{item.teaser}</span><span className="index-row-tags">{item.tags.join(' · ')}</span></span>
      <span className="index-arrow"><ArrowUpRight /></span>
    </a>)}{filteredItems.length === 0 && <p className="index-empty">Nothing here by that name. Try another word.</p>}</div>
    <p className="index-endnote">{filteredItems.length} {filteredItems.length === 1 ? 'object' : 'objects'}, still in progress.</p>
  </section>
}
