type Props = { className?: string }

export function ArrowUpRight({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  )
}
