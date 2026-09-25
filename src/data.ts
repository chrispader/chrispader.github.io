import type { CollectionItem } from './collection/types'

export const links = {
  email: 'mailto:hello@chrispader.com',
  github: 'https://github.com/chrispader',
  linkedin: 'https://www.linkedin.com/in/chrispader',
  x: 'https://x.com/ChristophPader',
  bluesky: 'https://bsky.app/profile/chrispader.com',
  goodreads: 'https://goodreads.com/chrispader',
  appleMusic: 'https://music.apple.com/profile/chrispader',
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
        'I was already spending a lot of time on computers before I started coding at around 14. I played video games, made mods, and tried out just about any bit of tech I could get my hands on.',
        'Somehow I became the family and friends’ tech support. Sometimes I spend ages looking for a problem, then find out the printer was just off. Very impressive stuff.',
        'These days I work at Margelo on mobile apps and React Native libraries.',
      ],
      links: [
        { label: 'Find me on GitHub', href: links.github },
        { label: 'Find me on Twitter', href: links.x },
        { label: 'Find me on Bluesky', href: links.bluesky },
        { label: 'Find me on LinkedIn', href: links.linkedin },
      ],
    },
  },
  {
    id: 'margelo',
    label: 'At Margelo',
    title: 'Made at Margelo.',
    teaser: 'Mobile apps and React Native, since 2021.',
    tags: ['Margelo', 'Since 2021', 'React Native', 'Open source'],
    artwork: { kind: 'workmark', name: 'margelo', since: 'NOV 2021', color: 'lime' },
    detail: {
      eyebrow: '02 / AT MARGELO',
      paragraphs: [
        'I’ve worked extensively on mobile apps and React Native at Margelo since 2021.',
        'I work in TypeScript, C++, Swift, and Kotlin. AI is a big part of my day-to-day work, and I keep up with new models and developments. I still enjoy writing and debugging code myself.',
        'I maintain React Native Graph and NitroSQLite, and I also work on apps, including Expensify.',
      ],
      links: [
        { label: 'Visit Margelo', href: 'https://margelo.com/' },
        { label: 'Explore `react-native-graph`', href: 'https://github.com/margelo/react-native-graph' },
        { label: 'Read the NitroFetch story', href: 'https://margelo.com/blog/speeding-up-expensifys-networking-with-nitro-fetch' },
      ],
    },
  },
  {
    id: 'expensify',
    label: 'Building Expensify',
    title: 'Work that adds up.',
    teaser: 'App features, storage, and startup speed.',
    tags: ['Expensify', 'Since 2022', 'React Native', 'Onyx', 'Performance'],
    artwork: { kind: 'workmark', name: 'Expensify', since: '2022', color: 'blue' },
    detail: {
      eyebrow: '03 / EXPENSIFY',
      paragraphs: [
        'I’ve worked on Expensify’s React Native app through Margelo since 2022. I’ve built product features like theme switching and company card assignment, and worked on storage and startup performance.',
        'I helped move App and Onyx to NitroSQLite. I also integrated NitroFetch so a critical request could start before JavaScript loaded while keeping Expensify’s usual authentication and request behavior. In that rollout, average request durations were 15–30% shorter, and the startup request finished more than 200 ms earlier.',
        'I’ve also worked on a post-quantum end-to-end encryption library. The public PRs below cover some of my Expensify work, and I wrote about the NitroFetch migration on Margelo’s blog.',
      ],
      links: [
        { label: 'Explore my public Expensify PRs', href: 'https://github.com/Expensify/App/pulls?q=is%3Apr+author%3Achrispader' },
        { label: 'Read the NitroFetch story', href: 'https://margelo.com/blog/speeding-up-expensifys-networking-with-nitro-fetch' },
      ],
      highlights: [
        { meta: '2023 / PRODUCT', title: 'Shareable QR codes', description: 'Added a quick way to share a profile by QR code.', href: 'https://github.com/Expensify/App/pull/18636' },
        { meta: '2023 / ONYX', title: 'Native Onyx merges', description: 'Used SQLite JSON_PATCH to merge changes in native storage.', href: 'https://github.com/Expensify/react-native-onyx/pull/238' },
        { meta: '2023 / PRODUCT', title: 'Theme switching', description: 'Helped bring the theme preference into the app and finish its migration.', href: 'https://github.com/Expensify/App/pull/21669' },
        { meta: '2025 / ONYX', title: 'Onyx meets NitroSQLite', description: 'Moved Onyx to NitroSQLite, followed by the matching App migration.', href: 'https://github.com/Expensify/react-native-onyx/pull/602' },
        { meta: '2025 / PRODUCT', title: 'Company card assignments', description: 'Made assigning cards easier with a searchable table and a shorter inline flow.', href: 'https://github.com/Expensify/App/pull/78069' },
        { meta: '2026 / ONYX', title: 'Storage at scale', description: 'Split large SQLite queries so Onyx can handle databases with many keys.', href: 'https://github.com/Expensify/react-native-onyx/pull/804' },
        { meta: '2026 / PERFORMANCE', title: 'A faster start with NitroFetch', description: 'Replaced native fetch and began key startup requests before the JavaScript runtime was ready.', href: 'https://github.com/Expensify/App/pull/97069' },
      ],
    },
  },
  {
    id: 'graph',
    label: 'Make it move',
    title: 'Make it move.',
    teaser: 'I care about the details of an interface.',
    tags: ['Design', 'UI/UX', 'React Native', 'Skia', 'Interaction'],
    artwork: { kind: 'graph', samples: [18, 24, 56, 67, 59, 36, 22, 32, 56, 61, 39, 34, 52, 64, 60, 52, 55, 75, 89] },
    detail: {
      eyebrow: '04 / INTERACTION & OPEN SOURCE',
      paragraphs: [
        'I love making software feel good to use. I notice when the spacing is off, a gesture feels awkward, or a screen makes you stop and think too hard.',
        'I have a good eye for design, and I like sitting with designers and product people to work out the details. Then I can build those details myself.',
        'I’ve added features and fixes to `react-native-graph` and now maintain it. The charts use Skia. I pay attention to how the line follows your finger and whether you can read the data while moving it.',
      ],
      links: [{ label: 'Explore `react-native-graph`', href: 'https://github.com/margelo/react-native-graph' }],
    },
  },
  {
    id: 'native',
    label: 'Native things',
    title: 'Closer to the metal.',
    teaser: 'The React Native libraries I work on.',
    tags: ['React Native', 'Expo', 'Nitro', 'SQLite', 'Performance', 'Writing'],
    artwork: { kind: 'stack', label: 'NATIVE / 05' },
    detail: {
      eyebrow: '05 / NATIVE SYSTEMS',
      paragraphs: [
        'I work on React Native libraries at Margelo, including NitroSQLite and NitroFetch.',
        'I’m the main maintainer of NitroSQLite these days. I rewrote it as a Nitro Module, added a lot of features, and still fix bugs as they come in.',
        'I also work on NitroFetch and integrated it into Expensify. I wrote about that work on Margelo’s blog.',
        'I also built `expo-native-variants`. It generates development, preview, and production app variants in one Expo prebuild. I can pick the one I need in Xcode or Android Studio without keeping generated native folders in Git.',
      ],
      links: [
        { label: 'Explore `react-native-nitro-sqlite`', href: 'https://github.com/margelo/react-native-nitro-sqlite' },
        { label: 'Read the NitroFetch story', href: 'https://margelo.com/blog/speeding-up-expensifys-networking-with-nitro-fetch' },
        { label: 'Explore `expo-native-variants`', href: 'https://github.com/chrispader/expo-native-variants' },
      ],
    },
  },
  {
    id: 'record',
    label: 'Off the clock',
    title: 'A different tempo.',
    teaser: 'Books, music, tennis, and side projects.',
    tags: ['Reading', 'Guitar', 'Piano', 'Tennis', 'Running', 'Coding'],
    artwork: { kind: 'record', label: 'SIDE A' },
    detail: {
      eyebrow: '06 / OFF THE CLOCK',
      paragraphs: [
        'I like reading popular science, novels, and whatever else sounds interesting. My Goodreads list is pretty random.',
        'I play guitar, and I’m learning classical piano. I also listen to a lot of music, some of which ends up on my Apple Music profile.',
        'I play tennis, go running, and spend time at the gym. I code for fun too. I like trying new technologies and doing coding challenges just to see if I can solve them.',
      ],
      links: [
        { label: 'See what I’m reading', href: links.goodreads },
        { label: 'Find me on Apple Music', href: links.appleMusic },
        { label: 'Say hello', href: '/contact/' },
      ],
    },
  },
]

export const featuredIds: readonly string[] = ['about', 'margelo', 'expensify', 'graph']
