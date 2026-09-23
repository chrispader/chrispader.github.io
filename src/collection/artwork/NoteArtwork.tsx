type Props = { text: string }

export function NoteArtwork({ text }: Props) {
  return <div className="paper-note"><span className="note-star">✳</span><p>{text}</p><span className="note-sign">CP.</span></div>
}
