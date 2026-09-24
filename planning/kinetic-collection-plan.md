# Kinetic collection implementation plan

Build the approved kinetic collection as a responsive, interactive portfolio for Christoph Pader. Keep the cp. logo, warm paper background, large serif headline, and four opening objects. Let the collection grow down the page as more objects are added, with details revealed when a visitor chooses an object.

This document plans the implementation. GPT-6 Sol reviewed the current architecture and layout; GPT-6 Luna reviewed content, artwork, and interaction requirements.

## Design baseline

Use the approved [desktop prototype](https://www.figma.com/proto/fRCkLEiFeAB9rirvAWHFcn?node-id=2-27&starting-point-node-id=2%3A27&scaling=scale-down&content-scaling=fixed) and [mobile prototype](https://www.figma.com/proto/fRCkLEiFeAB9rirvAWHFcn?node-id=11-20&starting-point-node-id=11%3A20&scaling=scale-down&content-scaling=fixed) for composition, colors, typography, and reveal states.

The opening shows "A work / in play.", a short invitation to explore, four objects, The index, and Say hello. Longer project descriptions and the biography appear in detail views. Preserve the loose arrangement, rotated artwork, small captions, and generous empty space.

| Object | Reveal | Interaction |
| --- | --- | --- |
| Blue graph | Make it move. React Native Graph contribution and source link | Scrub an illustrative curve continuously |
| Orange stack | Closer to the metal. Nitro SQLite and the Nitro Fetch networking article | Layers lift on hover or focus; selecting opens the detail |
| Vinyl record | A different tempo. Music, food, and life outside code | Spin by activation or dragging in the detail |
| Portrait postcard | Hello, I'm Chris. Short biography and GitHub | Lift the postcard and expand the portrait |

Use Instrument Serif for display text, Inter for body text and the logo, and Space Mono for small labels. Keep paper `#F5F2E9`, ink `#22241F`, lime `#D7FD6A`, blue `#3B56EF`, orange `#FA734B`, and violet `#B5A3E8`. Check the final small-text colors against the paper background before treating the prototype's muted color as a production token.

## Stack and repository changes

Keep the existing React 19, TypeScript, Vite, and static GitHub Pages setup. Use CSS Grid for layout and DOM/SVG artwork. Add Motion as the animation dependency. Its shared layout transitions suit the object-to-detail reveal, and its drag controls support constrained movement. [Motion layout documentation](https://motion.dev/docs/react-layout-animations), [drag documentation](https://motion.dev/docs/react-drag).

The current app concentrates the old layout in [App.tsx](../src/App.tsx). [data.ts](../src/data.ts) already contains the project and social links. Reuse that content source and the existing portrait. Replace the phone presentation, fixed stage sizing, and item-count-dependent selectors with collection components. Preserve existing uncommitted work outside this implementation's scope.

Keep styles in the existing styles directory, with new files for collection layout and artwork. Load the required font weights with reserved fallback dimensions. Update the favicon to the approved cp. mark and update the page metadata to match the new site.

## How the collection grows

### Opening composition

The opening uses a responsive grid with a reserved title area and up to four featured object slots. These slots carry the art direction from Figma. They are layout areas, so artwork dimensions and text can influence page height.

Keep one short list of featured item IDs. Adding an ordinary item does not change the opening arrangement. Replacing a featured ID changes the object shown in that slot. If there are fewer than four valid featured items, use the next available items in content order and collapse unused slots.

Each slot reserves space for the artwork's full rotated bounds, caption, focus outline, and small interaction movement. Derive safe translation limits from the available space. The artwork fits within those limits, while the caption remains readable and the focus outline remains visible. Labels can wrap. Layout rules must also handle a missing image or a longer-than-expected title.

### Continuation

Every remaining item appears once in a responsive grid below the opening, using the same floating objects and captions. Vary alignment, scale within safe limits, and rotation to keep the collection visually loose. The grid itself stays invisible.

When additional items exist, show a small "Explore all N objects" cue that scrolls to the continuation. The index always includes the complete collection. Add a compact title/tag search to the index when it contains more than eight items.

| Collection size | Expected behavior |
| --- | --- |
| 1 to 4 | Opening composition adapts to available objects; unused slots collapse |
| 8 | Four opening objects and four continuation objects |
| 16 or 30 | Additional rows extend the document; every object stays reachable through scrolling and the index |
| More than 30 | The same layout and content contract apply; measure performance before adding more rendering machinery |

On mobile, place the hero before the objects. Use two staggered columns where artwork and captions fit, including the approved 390px composition; collapse to one column when width or text size requires it. The page height follows its content. Normal touch scrolling must work over the collection.

### Rearrangement

The plus control changes the poses of objects within their reserved slots. Use a deterministic seed keyed by stable item ID, so each press produces a new valid arrangement and reset restores the original. Keep featured selection and content order stable.

Calculate poses on rearrange, item changes, and container resize. Do not recalculate them on every pointer move. Use measured container dimensions only where CSS cannot establish the constraint. Reserve an envelope for the maximum permitted rotation and scale, then bound translation within it. Use non-overshooting easing for rearrangement and clamp pickup movement throughout its spring return. Safe bounds must hold between poses as well as at their endpoints.

Optional pointer movement on opening objects is a small pickup-and-release gesture that springs back into the slot. It changes no content order. The rearrange button provides the same playful affordance for keyboard and touch users.

## Content and component contracts

Extend the existing content file with a single ordered `collectionItems` array. Derive the index, numbering, item lookup, and continuation from this array.

| Field | Purpose |
| --- | --- |
| `id` | Stable slug for links, React keys, focus restoration, and animation identity |
| `label`, `title`, `teaser` | Caption, detail heading, and short index description |
| `tags` | Optional index search terms |
| `artwork` | Discriminated union with a `kind` and the properties required by that artwork |
| `detail` | Typed paragraphs, images, and labeled links, plus an optional interaction |

Initial artwork kinds are graph, stack, record, portrait, and a reusable paper note for future entries. Give each renderer a known aspect ratio and size range. Image-based artwork includes dimensions and alt text. Graph samples, portrait image data, and record interaction settings belong to their corresponding union members.

An ordinary new item needs one content entry and can reuse any existing artwork kind. A new visual concept needs one renderer and its typed registry entry. Both use the existing placement, opening, index, and detail behavior. Item records never contain viewport coordinates or breakpoint-specific styles.

Use TypeScript exhaustiveness for artwork rendering, and validate unique IDs and featured references during development and tests. Keep authored data separate from transient gesture values. Reuse the current project URLs and describe contributions accurately. The graph is an illustrative interaction, so its values must not imply measured project performance. The record uses the approved interests and spin behavior without inventing tracks or audio.

The intended component boundaries are:

| Module | Responsibility |
| --- | --- |
| App | Persistent header, route selection, and scene transitions |
| CollectionScene | Hero, featured slots, continuation, and rearrange control |
| CollectionObject | Accessible activation, bounded pose, and artwork frame |
| Artwork renderers | Graph, stack, record, portrait, and paper note visuals |
| ItemDetail | Shared reveal layout and typed detail content |
| CollectionIndex / ContactView | Direct navigation, search, and contact links |
| Collection route hook | URL state, history, return location, and focus restoration |
| Pose helpers | Seeded poses and safe movement limits |

## Navigation and motion

Use a small route union derived from the URL: collection, item, index, or contact. Static pages for paths such as `/item/graph/`, `/index/`, and `/contact/` allow direct links on GitHub Pages. An unknown item ID opens the index with a short explanation. Map legacy hash links such as `#work` to their closest new destination.

Opening an item records its source view, scroll position, and activating control. Closing returns there. A directly loaded detail has a Collection return destination. Browser Back and Forward follow the same state transitions. The logo always returns to the collection.

Keep the header persistent and show detail content as a full main view with normal scrolling. Move focus to the new view's heading and restore it to the opener on return. During transition, make outgoing content inert. Retain the collection's arrangement and state while a detail is open. If its opener has disappeared, return focus to the collection heading.

Give the artwork frame a shared animation ID based on the item ID. Animate that frame into its detail position, then reveal the body text separately so paragraphs do not stretch. Keep a source placeholder until measurements and the transition finish. Handle scroll offsets explicitly. When arriving from an index link or a direct URL, use a short entrance because no visible artwork source exists.

Before a reverse morph, render the collection with its saved arrangement, restore its scroll position, and measure the source object. Hold the outgoing detail in a transition layer while preparing that destination, so the scroll restoration does not move the visible detail. Then animate back and restore focus. Back and Forward use the same preparation sequence, and a newer navigation cancels stale transition work. If the source object no longer exists, use a short fade to the collection. This lifecycle is part of the first implementation milestone.

Start with the prototype's approximate timings: 600 to 700ms for a reveal, up to 850ms for rearrangement, and a short 120 to 180ms hover response. Tune these in the browser. Navigation remains interruptible during rapid open, close, Back, or resize actions.

Use Motion values for pointer coordinates and decorative rotation so each movement does not rerender the collection. [Motion values documentation](https://motion.dev/docs/react-motion-value).

## Interaction and accessibility requirements

Objects have accessible names and visible focus states. Use native links for navigation and native buttons for actions. Keep detail links separate from object activation to avoid nested interactive controls. Navigation labels and touch targets remain available without hover.

Graph scrubbing belongs inside the detail view. Use a labeled range control with the same current sample as the visual handle. Support tap, pointer drag, arrows, Home, and End. Capture the pointer during a drag and clean up on cancellation. Treat the chart as demo data in its caption.

Record activation produces a finite spin; fine-pointer dragging controls its angle. Provide a labeled Spin button for keyboard and touch users. Vertical touch scrolling remains available over the record artwork. Stop the interaction on detail exit. Keep graph and record gestures local, so they cannot trigger navigation or stop scrolling elsewhere.

Suppress activation after an actual pickup gesture. Decorative pickup on the collection uses fine pointers only. Touch users retain ordinary scrolling and tap-to-open. Use at least 44px touch targets for the small controls.

Respect reduced motion in both CSS and gesture code. Replace travel, tilt, springs, and spin with immediate state changes or a short fade. Keep every detail and graph value accessible. Motion's reduced-motion hook tracks the visitor's setting. [Reduced-motion documentation](https://motion.dev/docs/react-use-reduced-motion).

## Implementation sequence and ownership

### 1. Agree on the contracts

The lead defines the item types, renderer interface, route state, and style tokens with Sol and Luna before parallel edits begin. Reuse the current social URLs and source content. Establish a four-item fixture and a larger development-only fixture with varied artwork, long labels, and long detail copy.

### 2. Build one complete interaction

GPT-6 Sol builds the responsive scene, continuation layout, route controller, and shared artwork transition. GPT-6 Luna builds the approved logo, typography, graph artwork, and graph detail against the agreed props.

Integrate the graph first. Verify opening it from the top of the page, from below the fold, from the index, and from a direct link. Verify scrubbing and returning to the correct object and scroll position on desktop and mobile. This is the first working milestone.

### 3. Complete the collection in parallel

GPT-6 Sol owns scene geometry, safe poses, rearrange behavior, transition interruption, and navigation tests. GPT-6 Luna owns the remaining artwork renderers, detail content, index, contact view, and renderer-specific interactions.

Keep their file ownership separate. The lead owns App integration, shared types, global styles, font loading, dependencies, and package configuration. Changes to a shared contract go through the lead before either agent edits callers.

Suggested new files belong under `src/collection/`, with artwork under `src/collection/artwork/`. Keep content in the existing data file. Put collection and artwork CSS alongside the current styles. Split by these responsibilities as components grow.

### 4. Prove growth and refine the design

Exercise the larger fixtures before polishing the final animation curves. Sol fixes layout and navigation failures; Luna fixes artwork bounds, text wrapping, and interaction affordances. The lead compares the real four-item build with both approved Figma prototypes, including the reveal states.

### 5. Finish the preview and handoff

Run the focused checks below against a production build. Inspect animation behavior and record the final bundle size. Update the README with how to add an item, choose featured objects, and add an artwork type. Deliver the working local preview and a concise change summary. Publishing remains a separate action.

## Verification and acceptance

Add focused pose/data tests with [Vitest](https://vitest.dev/guide/) and browser coverage with [Playwright](https://playwright.dev/docs/intro). Browser tests establish the actual geometry and navigation behavior; helper tests check ID validation, reproducible poses, and constraint calculations.

Run layout fixtures containing 1, 4, 8, 16, and 30 items at 320, 390, 768, 1024, and 1440px widths. Include several rearrangement seeds, a long caption, a missing image, and long detail content. Check that all expected items render exactly once, the last item is reachable, and there is no horizontal overflow. Assert that artwork and captions fit their slots and do not cover the hero, navigation, neighboring items, or rearrange control.

Check the main navigation and gesture flow in Chromium, WebKit, and Firefox. Use touch and reduced-motion emulation where appropriate; Playwright supports these settings. [Emulation documentation](https://playwright.dev/docs/emulation). Inspect actual touch scrolling on a mobile device when one is available and record any remaining device coverage gap.

The release checks must cover:

- Open, interact, close, and restore focus and scroll, including a continuation object below the fold.
- Direct item links, unknown IDs, index search, contact, logo return, Back, and Forward.
- Rapid open/close, rearrange, pointer cancellation, and resizing during a transition.
- Keyboard-only use, visible focus, 200% text/zoom checks, and reduced motion.
- An added content entry appearing in the scene and index without layout or route edits.

Keep image dimensions reserved and load continuation images as needed. Mount expensive interactive details only when selected. Pause decorative work when an object is offscreen or the document is hidden. A pointer movement in one object must not trigger a React render of every collection item.

Completion means the four-item site matches the approved visual direction, the full interaction loop works, and the expanded fixtures remain readable and reachable. The first implementation milestone is a working graph reveal in the scalable collection layout.
