type Props = { label: string }

export function StackArtwork({ label }: Props) {
  void label
  return <svg className="stack-scene" viewBox="0 0 280 190" aria-hidden="true" focusable="false">
    <g className="stack-bottom-slab">
      <path d="M38 88 146 34 257 70 149 124Z" />
      <path d="m149 124 108-54v18l-108 54Z" />
      <path d="m38 88 111 36v18L38 106Z" />
    </g>
    <g className="stack-top-slab">
      <path d="M28 55 136 1 247 37 139 91Z" />
      <path d="m139 91 108-54v19l-108 54Z" />
      <path d="m28 55 111 36v19L28 74Z" />
      <g className="stack-engraving">
        <path d="m66 54 70 23" />
        <path d="m77 47 70 23" />
        <path d="m89 40 70 23" />
      </g>
    </g>
  </svg>
}
