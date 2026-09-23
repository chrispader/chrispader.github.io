import type { CollectionItem } from './types'

// Only called in development; production always uses the authored collection.
export function previewItems(items: readonly CollectionItem[]): readonly CollectionItem[] {
  const countValue = new URLSearchParams(window.location.search).get('previewItems')
  if (countValue === null) return items
  const count = Number(countValue)
  if (!Number.isInteger(count) || count < 0 || count > 100 || items.length === 0) return items
  return Array.from({ length: count }, (_, index) => {
    const template = items[index % items.length]
    if (index < items.length) return template
    return {
      ...template,
      id: `example-${index + 1}`,
      label: index === 7 ? 'An unusually long name for a curious little experiment' : `Experiment ${String(index + 1).padStart(2, '0')}`,
      title: `A little experiment. ${index + 1}`,
      artwork: index % 5 === 0
        ? { kind: 'note', text: 'What happens if…', color: 'violet' }
        : template.artwork,
      detail: { ...template.detail, eyebrow: 'COLLECTION / EXAMPLE' },
    } satisfies CollectionItem
  })
}
