# Christoph Pader's website

An interactive collection of work, open source, and life in Vienna. The site uses React, TypeScript, Vite, Motion, and CSS/SVG artwork. It builds as a static site for GitHub Pages.

The opening contains up to four featured objects. More objects continue down the page and appear in the searchable index. Selecting an object reveals its story. The graph can be scrubbed, the record can be spun, and the plus button rearranges the collection.

## Editing the collection

The content and social links live in `src/data.ts`. Add an entry to `collectionItems` with a unique, stable ID. Existing artwork types are `graph`, `stack`, `record`, `portrait`, and `note`.

For example, a new note can use this shape:

```ts
{
  id: 'small-experiment',
  label: 'A small experiment',
  title: 'What happens if…',
  teaser: 'An idea worth playing with.',
  tags: ['Experiment'],
  artwork: {
    kind: 'note',
    text: 'What happens if…',
    color: 'lime',
  },
  detail: {
    eyebrow: 'EXPERIMENT',
    paragraphs: ['Write the story behind the experiment here.'],
    links: [],
  },
}
```

The new item automatically appears in the continuation and the index. Change `featuredIds` to choose the opening objects, in upper-left, upper-right, lower-left, and lower-right order. The layout fills missing featured positions from the remaining content.

Keep IDs stable when editing titles so shared item URLs continue to work. Each item supports a link such as `#/item/small-experiment`. Labels can wrap, but short labels make the opening easier to scan.

To introduce a new artwork type, extend the artwork union in `src/collection/types.ts`, add a renderer under `src/collection/artwork/`, and add its case to `Artwork.tsx`. The layout handles its placement. Give the new artwork a bounded aspect ratio and check it on mobile.

## Development and checks

The development preview supports `?previewItems=1`, `4`, `8`, `16`, or `30` to exercise different collection sizes. These generated examples are available only during development. Production always uses the authored content.

The project scripts cover development, production builds, unit tests, and browser tests. Browser tests require the browser dependencies installed by the `test:browsers` script. They check collection geometry, rearrangement, graph controls, navigation history, focus restoration, direct links, index search, and reduced motion.

The browser suite uses Chromium for the full size matrix and WebKit and Firefox for the main interaction and responsive flows. A build writes the static site to `docs`. GitHub Pages publishes that folder from the `main` branch. Commit the updated build output with source changes to publish them.

## Design and interaction

The approved direction and implementation rationale are in `planning/kinetic-collection-plan.md`. Color and font tokens live in `src/styles/base.css`; collection, artwork, and detail layouts have separate stylesheets alongside it.

Fonts are bundled locally. The original portrait is in `public/images/profilePicture.png`. The graph values are illustrative data. The record interaction has no audio.

The site respects reduced motion, supports keyboard navigation, and retains normal touch scrolling. Detail views keep the collection's scroll position so closing an object returns to where it was opened.

## GitHub profile banner

The animated banner is `public/profile-banner.gif`. It shows the logo, portrait, graph, and record with subtle motion. The profile README makes the whole image a link to the website.

The `chrispader/chrispader` profile README embeds it with:

```md
[![Christoph Pader on GitHub. Explore my repositories and work below.](https://chrispader.com/profile-banner.gif?v=3)](https://chrispader.com/)
```
