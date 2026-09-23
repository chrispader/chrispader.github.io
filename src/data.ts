import type { CollectionItem } from './collection/types'

export const links = {
  email: 'mailto:christoph.pader@outlook.com',
  github: 'https://github.com/chrispader',
  linkedin: 'https://www.linkedin.com/in/chrispader',
  x: 'https://x.com/ChristophPader',
} satisfies Record<string, string>

export const collectionItems: readonly CollectionItem[] = [
  {
    id: 'graph',
    label: 'Make it move',
    title: 'Make it move.',
    teaser: 'A little motion makes all the difference.',
    tags: ['React Native', 'Skia', 'Open source', 'Interaction'],
    artwork: { kind: 'graph', samples: [18, 24, 56, 67, 59, 36, 22, 32, 56, 61, 39, 34, 52, 64, 60, 52, 55, 75, 89] },
    detail: {
      eyebrow: '01 / INTERACTION & OPEN SOURCE',
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
    artwork: { kind: 'stack', label: 'NATIVE / 02' },
    detail: {
      eyebrow: '02 / NATIVE SYSTEMS',
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
    teaser: 'A few things away from the keyboard.',
    tags: ['Music', 'Vienna', 'Life'],
    artwork: { kind: 'record', label: 'SIDE A' },
    detail: {
      eyebrow: '03 / OFF THE CLOCK',
      paragraphs: [
        'There’s more to life than a good commit.',
        'Usually, you’ll find me somewhere in Vienna, listening to music, finding something good to eat, or enjoying a little time away from the screen.',
      ],
      links: [{ label: 'Say hello', href: links.email }],
    },
  },
  {
    id: 'about',
    label: 'A face to the code',
    title: 'Hello, I’m Chris.',
    teaser: 'Engineer, curious person, based in Vienna.',
    tags: ['About', 'Margelo', 'Vienna', 'Christoph Pader'],
    artwork: { kind: 'portrait', src: '/images/profilePicture.png', alt: 'Christoph Pader outdoors wearing sunglasses', caption: 'a face to the code.' },
    detail: {
      eyebrow: '04 / A LITTLE CONTEXT',
      paragraphs: [
        'I’m Christoph Pader, a software engineer based in Vienna.',
        'I build mobile experiences with React Native at Margelo. I like working where thoughtful interfaces meet the systems underneath them, making things feel as good as they work.',
      ],
      links: [{ label: 'Find me on GitHub', href: links.github }],
    },
  },
]

export const featuredIds: readonly string[] = ['record', 'about', 'graph', 'native']
