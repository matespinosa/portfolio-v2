import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

const STATEMENT =
  'I design financial products with the clarity of a system and the pragmatism of code.'

export default function About() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-statement .word',
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: '.about-statement',
            start: 'top 78%',
            end: 'bottom 45%',
            scrub: true,
          },
        }
      )
      gsap.from('.about-grid > *', {
        y: 32,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 85%', once: true },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="about container" id="practice" ref={rootRef}>
      <h2 className="visually-hidden">The practice</h2>
      <p className="about-statement" aria-label={STATEMENT}>
        {STATEMENT.split(' ').map((word, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span className="word" key={i} aria-hidden="true">
            {word}
            {i < STATEMENT.split(' ').length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
      <div className="about-grid">
        <div className="about-bio">
          <p>
            I am Mateo Espinosa, a product designer based in Bogotá with more than six years
            across digital products and frontend. I combine a business mindset, analytical
            thinking and hands-on research to make complex decisions clear. My work spans
            merchant platforms at <strong>Rappi</strong> and financial products for
            <strong> Credicorp Capital, Kapital Bank, MiBanco and Banca Mifel</strong>.
            Additional client work through Modyo
            includes Banco Mundo Mujer, Sura and PS Factory.
          </p>
          <p>
            React, Next.js, HTML, CSS and JavaScript let me work closer to implementation. Since
            2025, I have extended that practice with Cursor, Codex and Claude to prototype,
            evaluate and ship ideas faster without giving up design judgment.
          </p>
        </div>
        <dl className="about-caps">
          <div>
            <dt>Product</dt>
            <dd>Financial products, merchant operations, onboarding, transactions and complex B2B flows</dd>
          </div>
          <div>
            <dt>Research</dt>
            <dd>Customer interviews, benchmarks, journey maps, prioritization and usability testing</dd>
          </div>
          <div>
            <dt>Systems</dt>
            <dd>Design tokens, component libraries, documentation and product governance</dd>
          </div>
          <div>
            <dt>Frontend &amp; AI</dt>
            <dd>React, Next.js, HTML, CSS, JavaScript, Cursor, Codex and Claude</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
