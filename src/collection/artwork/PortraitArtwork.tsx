type Props = { src: string; alt: string; caption: string }

export function PortraitArtwork({ src, alt, caption }: Props) {
  return <div className="postcard">
    <div className="postcard-photo"><img src={src} alt={alt} width={640} height={800} loading="lazy" decoding="async" /></div>
    <div className="postcard-caption"><span>{caption}</span></div>
    <div className="postcard-tape" aria-hidden="true" />
  </div>
}
