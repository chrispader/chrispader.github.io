import { links } from '../data'
import { ArrowUpRight } from './ArrowUpRight'

type Props = { onBack: () => void }

export function ContactView({ onBack }: Props) {
  return <section className="contact-view" aria-labelledby="view-heading">
    <div className="index-topline"><button className="detail-back" type="button" onClick={onBack}>← <span>Back to collection</span></button><span className="detail-number">SAY HELLO</span></div>
    <p className="detail-eyebrow">For the interesting things</p>
    <h1 id="view-heading" tabIndex={-1}>Got a good<br/><em>feeling?</em></h1>
    <p className="contact-intro">If you have a question, an idea, or a song you think I should hear, I’m all ears.</p>
    <a className="contact-email-link" href={links.email}>Write me a note <ArrowUpRight /></a>
    <div className="contact-socials"><span>AROUND THE WEB</span><a href={links.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight /></a><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight /></a><a href={links.bluesky} target="_blank" rel="noreferrer">Bluesky <ArrowUpRight /></a></div>
    <span className="contact-stamp" aria-hidden="true">CP<span>.</span></span>
  </section>
}
