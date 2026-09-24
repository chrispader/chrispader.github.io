export function InlineCodeText({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith('`') && part.endsWith('`')
      ? <code className="inline-code" key={index}>{part.slice(1, -1)}</code>
      : part,
  )
}
