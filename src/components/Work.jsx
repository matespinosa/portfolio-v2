import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/projects'
import { reducedMotion } from '../lib/scroll'
import { useMediaQuery } from '../lib/useMediaQuery'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP_QUERY = '(min-width: 901px) and (pointer: fine)'
const TILT = 7

export default function Work({ onOpen }) {
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const rootRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.work-card', {
        y: 42,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.work-grid', start: 'top 85%', once: true },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const tilt = (e, card) => {
    if (!desktop || reducedMotion()) return
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(card, {
      rotateY: px * TILT * 2,
      rotateX: -py * TILT * 2,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const untilt = (card) => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
  }

  return (
    <section className="work container" id="work" ref={rootRef} aria-labelledby="work-title">
      <header className="section-head">
        <h2 className="section-title" id="work-title">
          Selected <em>fieldwork</em>
        </h2>
        <p className="section-sub">Five products, real responsibilities</p>
      </header>

      <ul className="work-grid" data-inspect="Work / grid">
        {projects.map((p) => (
          <li className="work-card" key={p.id}>
            <button
              type="button"
              className="work-card-btn"
              data-project={p.id}
              data-cursor="view"
              onPointerMove={(e) => tilt(e, e.currentTarget)}
              onPointerLeave={(e) => {
                untilt(e.currentTarget)
              }}
              onClick={() => onOpen(p)}
            >
              <span className="work-media">
                <img
                  src="/project-placeholder.png"
                  alt={`Neutral temporary cover for ${p.title}`}
                  loading="lazy"
                  width="840"
                  height="630"
                />
              </span>

              <span className="work-meta">
                <span className="work-title">{p.title}</span>
                <span className="work-cat">{p.category}</span>
                <span className="work-year mono">{p.year}</span>
              </span>

              <span className="work-cta mono" aria-hidden="true">
                Case study
                <svg viewBox="0 0 18 18" fill="none">
                  <path d="M4 14 14 4m0 0H6m8 0v8" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
