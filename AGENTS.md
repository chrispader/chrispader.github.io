# Website guidance for agents

This is Christoph Pader's personal site: an interactive collection of work and life in Vienna. Follow the approved direction in `planning/kinetic-collection-plan.md`. Preserve the `cp.` mark, warm paper background, serif display type, small labels, vivid artwork, and deliberately asymmetric placement. Keep the first view light on copy and reveal more through interaction, details, and the index. Build small, purposeful motion with CSS, SVG, and Motion; the page should feel like a collection to explore, not a grid of static cards or a full game.

## Source of truth

- `src/data.ts` owns the authored objects, their stories, public links, and `featuredIds`. Keep object IDs unique and stable because `/item/<id>/` is shareable. Put profile URLs in `links` and reuse them across the header, About me, Say hello, and detail views.
- Spell library names as their projects do, including `NitroSQLite` and `NitroFetch`. Use backticks in authored content only for lowercase hyphenated package names such as `react-native-nitro-sqlite`; `InlineCodeText` renders those names in Space Mono. Keep other names and labels in the body font.
- `src/collection/layout.ts` chooses up to six opening objects and places any others in the continuation. Shuffle can rearrange all objects; reset restores the authored order. Keep the center hero fixed while objects move around it.
- `src/collection/Artwork.tsx` dispatches artwork types defined in `src/collection/types.ts`. New art belongs in a focused component under `src/collection/artwork/`, with bounded dimensions and an explicit interaction. Use `ArrowUpRight` or drawn SVG for arrows, never emoji substitutes.
- `src/App.tsx` owns the header, path navigation, focus restoration, and the detail overlay. Preserve direct URLs, old hash bookmarks, browser history, collection scroll position, and a reliable return to the collection. The index must remain searchable as items are added.
- `src/seo.ts` owns route metadata and structured data. `scripts/generate-seo.mjs` builds static HTML for every route and a sitemap from the same authored objects. Keep the static pages and client metadata consistent when adding content.
- Design tokens and cursors live in `src/styles/base.css`; the collection, artwork, site shell, and detail views have separate stylesheets. The initial default cursor lives in `index.html` before the app loads. Static images, icons, cursors, and fonts live in `public/`.

## Interaction and layout

- Keep the opening asymmetric at every size. Scale artwork with the available viewport, leave breathing room around the center, and keep the header brand and navigation on one line until they no longer fit. Keep the name and location visible on narrow screens.
- With six authored objects, a usable desktop window should show the collection and footer without page scroll. Very short windows and collections with more than six objects may scroll. Never allow horizontal page scroll, including during hover, drag, shuffle, spin, and route transitions.
- Animate transforms within bounded artwork and canvas regions. Moving or rotating an object must not enlarge the page's scroll area, cover its own label, or make an adjacent item unreachable. Keep transitions smooth when opening and closing details.
- Keep every opening object and detail artwork interactive. The graph responds to hover on the collection and to deliberate press or drag in its detail view; it settles back smoothly. The record supports click and drag. Preserve touch drag, scroll response, keyboard operation, visible focus, and reduced-motion behavior.
- Collection objects are buttons because native link dragging and URL previews interfere with the artwork interaction. Actual external destinations remain links with clear accessible names. Give icon-only controls labels, and keep text selectable where appropriate.
- Use public, verifiable information for work and project claims. Do not put confidential client or employer details on the site.
- Prefer TypeScript, focused functional components, early returns, and the helpers already in this codebase. Avoid `any` and duplicate layout or navigation logic.

## Check changes

- Run the production build after source changes. It writes the tracked static site to `docs/`; commit the updated output with the source. Do not edit generated files in `docs/` by hand. GitHub Pages publishes `docs/` from `main`.
- Use the existing unit tests for collection layout and routing, and the browser tests under `tests/browser/` for visible behavior. Check desktop, narrow mobile, short desktop windows, larger text, keyboard and touch input, and reduced motion when those areas change.
- The `?previewItems=` fixture exists only in development. Use it to check that eight or thirty objects remain reachable, and run browser cases using that fixture against the development site rather than a production build.
- Keep changes focused. Use conventional commits and the configured GPG signing key. Use Christoph Pader for public attribution.
- Keep `package-lock.json` consistent when dependencies change. Do not add another lockfile.
