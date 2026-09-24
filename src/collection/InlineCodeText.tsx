export function InlineCodeText({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (!part.startsWith('`') || !part.endsWith('`')) return part

    const name = part.slice(1, -1)
    return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(name)
      ? <code className="inline-code" key={index}>{name}</code>
      : name
  })
}
