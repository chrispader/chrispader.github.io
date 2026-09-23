import type { CollectionItem } from './collection/types'

export const links = {
  email: 'mailto:hello@chrispader.com',
  github: 'https://github.com/chrispader',
  linkedin: 'https://www.linkedin.com/in/chrispader',
  x: 'https://x.com/ChristophPader',
  goodreads: 'https://goodreads.com/chrispader',
} satisfies Record<string, string>

export const collectionItems: readonly CollectionItem[] = [
  {
    id: 'about',
    label: 'A face to the code',
    title: 'Hello, I’m Chris.',
    teaser: 'Engineer, curious person, based in Vienna.',
    tags: ['About', 'Margelo', 'Vienna', 'Christoph Pader'],
    artwork: { kind: 'portrait', src: '/images/profilePicture.png', alt: 'Christoph Pader outdoors wearing sunglasses', caption: 'a face to the code.' },
    detail: {
      eyebrow: '01 / A LITTLE CONTEXT',
      paragraphs: [
        'I’m Christoph Pader, a software engineer based in Vienna.',
        'Since November 2021, I’ve been building mobile experiences at Margelo. I like working where thoughtful interfaces meet the systems underneath them, making things feel as good as they work.',
      ],
      links: [
        { label: 'Find me on GitHub', href: links.github },
        { label: 'Find me on Twitter', href: links.x },
      ],
    },
  },
  {
    id: 'margelo',
    label: 'At Margelo',
    title: 'Made at Margelo.',
    teaser: 'Building better mobile apps since November 2021.',
    tags: ['Margelo', 'Since 2021', 'React Native', 'Open source'],
    artwork: { kind: 'workmark', name: 'margelo', since: 'NOV 2021', color: 'lime' },
    detail: {
      eyebrow: '02 / AT MARGELO',
      paragraphs: [
        'I’ve worked at Margelo since November 2021, turning ambitious mobile ideas into experiences people can actually feel.',
        'My work stretches from expressive React Native interfaces to the native foundations underneath them. I’ve contributed to open source tools such as React Native Graph and Nitro SQLite, and to app performance work for Expensify.',
        'The part I enjoy most is moving between those layers: making an interaction more human, then digging into the engine until it feels effortless.',
      ],
      links: [
        { label: 'Visit Margelo', href: 'https://margelo.com/' },
        { label: 'Explore React Native Graph', href: 'https://github.com/margelo/react-native-graph' },
        { label: 'Read the Nitro Fetch story', href: 'https://margelo.com/blog/speeding-up-expensifys-networking-with-nitro-fetch' },
      ],
    },
  },
  {
    id: 'expensify',
    label: 'Building Expensify',
    title: 'Work that adds up.',
    teaser: 'Product features and performance, one detail at a time.',
    tags: ['Expensify', 'Since 2022', 'React Native', 'Onyx', 'Performance'],
    artwork: { kind: 'workmark', name: 'Expensify', since: '2022', color: 'blue' },
    detail: {
      eyebrow: '03 / EXPENSIFY',
      paragraphs: [
        'Through Margelo, I’ve contributed to Expensify’s React Native app since 2022. The public work spans everyday product features, the way state is stored, and how quickly the app gets moving.',
        'I’ve helped bring theme switching to life, improve company card assignment, move App and Onyx to Nitro SQLite, and start network requests earlier with Nitro Fetch. I’ve also worked on a post-quantum end-to-end encryption library.',
      ],
      links: [
        { label: 'Explore my public Expensify PRs', href: 'https://github.com/Expensify/App/pulls?q=is%3Apr+author%3Achrispader' },
        { label: 'Read the Nitro Fetch story', href: 'https://margelo.com/blog/speeding-up-expensifys-networking-with-nitro-fetch' },
      ],
      highlights: [
        { meta: '2023 / PRODUCT', title: 'Shareable QR codes', description: 'Added a quick way to share a profile by QR code.', href: 'https://github.com/Expensify/App/pull/18636' },
        { meta: '2023 / ONYX', title: 'Native Onyx merges', description: 'Used SQLite JSON_PATCH to merge changes in native storage.', href: 'https://github.com/Expensify/react-native-onyx/pull/238' },
        { meta: '2023 / PRODUCT', title: 'Theme switching', description: 'Helped bring the theme preference into the app and finish its migration.', href: 'https://github.com/Expensify/App/pull/21669' },
        { meta: '2025 / ONYX', title: 'Onyx meets Nitro SQLite', description: 'Moved Onyx to react-native-nitro-sqlite, followed by the matching App migration.', href: 'https://github.com/Expensify/react-native-onyx/pull/602' },
        { meta: '2025 / PRODUCT', title: 'Company card assignments', description: 'Made assigning cards easier with a searchable table and a shorter inline flow.', href: 'https://github.com/Expensify/App/pull/78069' },
        { meta: '2026 / ONYX', title: 'Storage at scale', description: 'Split large SQLite queries so Onyx can handle databases with many keys.', href: 'https://github.com/Expensify/react-native-onyx/pull/804' },
        { meta: '2026 / PERFORMANCE', title: 'A faster start with Nitro Fetch', description: 'Replaced native fetch and began key startup requests before the JavaScript runtime was ready.', href: 'https://github.com/Expensify/App/pull/97069' },
      ],
    },
  },
  {
    id: 'graph',
    label: 'Make it move',
    title: 'Make it move.',
    teaser: 'A little motion makes all the difference.',
    tags: ['React Native', 'Skia', 'Open source', 'Interaction'],
    artwork: { kind: 'graph', samples: [18, 24, 56, 67, 59, 36, 22, 32, 56, 61, 39, 34, 52, 64, 60, 52, 55, 75, 89] },
    detail: {
      eyebrow: '04 / INTERACTION & OPEN SOURCE',
      paragraphs: [
        'The best interfaces feel like they’re keeping up with you.',
        'At Margelo, I contribute to React Native tools like react-native-graph: expressive, high-performance charts drawn with Skia and made for touch.',
      ],
      links: [{ label: 'Explore React Native Graph', href: 'https://github.com/margelo/react-native-graph' }],
    },
  },
  {
    id: 'native',
    label: 'Native things',
    title: 'Closer to the metal.',
    teaser: 'Under the interface, down to the details.',
    tags: ['React Native', 'Nitro', 'SQLite', 'Performance', 'Writing'],
    artwork: { kind: 'stack', label: 'NATIVE / 05' },
    detail: {
      eyebrow: '05 / NATIVE SYSTEMS',
      paragraphs: [
        'A good experience starts a few layers below the screen.',
        'My work at Margelo includes native systems and performance in React Native. Nitro SQLite brings fast local storage through Nitro Modules. Our work with Nitro Fetch explores a faster networking path for Expensify.',
      ],
      links: [
        { label: 'Explore Nitro SQLite', href: 'https://github.com/margelo/react-native-nitro-sqlite' },
        { label: 'Read the Nitro Fetch story', href: 'https://margelo.com/blog/speeding-up-expensifys-networking-with-nitro-fetch' },
      ],
    },
  },
  {
    id: 'record',
    label: 'Off the clock',
    title: 'A different tempo.',
    teaser: 'Books, a racket, and a little room to run.',
    tags: ['Reading', 'Tennis', 'Running', 'Vienna'],
    artwork: { kind: 'record', label: 'SIDE A' },
    detail: {
      eyebrow: '06 / OFF THE CLOCK',
      paragraphs: [
        'Away from the keyboard, I love to read. Popular science, novels, and just about anything that catches my eye end up on the pile.',
        'I play tennis, go running, and spend time at the gym. Music and a good meal around Vienna usually find their way into the week too.',
      ],
      links: [
        { label: 'See what I’m reading', href: links.goodreads },
        { label: 'Say hello', href: links.email },
      ],
    },
  },
]

export const featuredIds: readonly string[] = ['about', 'margelo', 'expensify', 'graph']
