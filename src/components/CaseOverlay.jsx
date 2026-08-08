import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { projects } from '../data/projects'
import { lockScroll, reducedMotion } from '../lib/scroll'

export default function CaseOverlay({ project, onNavigate, onClose }) {
  const [current, setCurrent] = useState(null)
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const closeRef = useRef(null)
  const lastFocused = useRef(null)
  const closing = useRef(false)

  // Open / swap / close driven by the `project` prop.
  useLayoutEffect(() => {
    if (project && !current) {
      lastFocused.current = document.activeElement
      setCurrent(project)
    } else if (project && current && project.id !== current.id) {
      const swap = () => {
        setCurrent(project)
        scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
      }
      if (reducedMotion()) {
        swap()
      } else {
        gsap.to(scrollRef.current, {
          autoAlpha: 0,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            swap()
            gsap.to(scrollRef.current, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
          },
        })
      }
    } else if (!project && current && !closing.current) {
      closing.current = true
      const finish = () => {
        closing.current = false
        setCurrent(null)
        lockScroll(false)
        lastFocused.current?.focus?.()
      }
      if (reducedMotion() || !rootRef.current) {
        finish()
      } else {
        gsap.to(rootRef.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.6,
          ease: 'expo.inOut',
          onComplete: finish,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  // Entrance + scroll lock + focus once mounted.
  useLayoutEffect(() => {
    if (!current || !rootRef.current) return
    if (closing.current) return
    lockScroll(true)
    closeRef.current?.focus()
    if (rootRef.current.dataset.opened) return
    rootRef.current.dataset.opened = 'true'
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rootRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' }
      )
      gsap.from('.case-hero-inner > *, .case-close', {
        y: 24,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        delay: 0.55,
        ease: 'power3.out',
      })
    }, rootRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  // Escape to close.
  useEffect(() => {
    if (!current) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, onClose])

  if (!current) return null

  const next = projects[(projects.findIndex((p) => p.id === current.id) + 1) % projects.length]

  return createPortal(
    <div
      className="case-overlay"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
    >
      <button
        type="button"
        className="case-close"
        ref={closeRef}
        onClick={onClose}
        data-cursor="link"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Close
      </button>
      <div className="case-scroll" ref={scrollRef} data-lenis-prevent>
        <header className="case-hero">
          <img
            className="case-cover-img"
            src={current.heroImage}
            alt={`${current.title} project cover`}
            width="2048"
            height="1536"
          />
          <div className="case-hero-inner container">
            <h2 className="case-title" id="case-title">
              {current.title}
            </h2>
            <p className="case-cat">
              {current.category} · {current.year}
            </p>
          </div>
        </header>
        <div className="case-body container">
          <dl className="case-meta">
            <div>
              <dt>Role</dt>
              <dd>{current.role}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{current.scope}</dd>
            </div>
            <div>
              <dt>Team</dt>
              <dd>{current.team}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{current.duration}</dd>
            </div>
          </dl>
          <div className="case-text">
            <p>{current.intro}</p>
            {current.sections.map((section) => (
              <section className="case-section" key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
                {section.bullets?.length ? (
                  <ul className="case-list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
          <section className="case-metrics" aria-label={`${current.title} project metrics`}>
            {current.metrics.map((metric) => (
              <div className="case-metric" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.detail}</small>
              </div>
            ))}
          </section>
          <section className="case-gallery" aria-label={`${current.title} project gallery`}>
            {current.gallery.map((image) => (
              <figure className="case-gallery-item" key={image.src}>
                <img src={image.src} alt={image.alt} loading="lazy" />
                <figcaption className="mono">{image.label}</figcaption>
              </figure>
            ))}
          </section>
          <section className="case-outcome-panel">
            <h3>Selected outcomes</h3>
            <ul className="case-outcomes">
              {current.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </section>
          <button
            type="button"
            className="case-next"
            onClick={() => onNavigate(next)}
            data-cursor="link"
          >
            <span className="case-next-label">Next project</span>
            <span className="case-next-title">{next.title}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
