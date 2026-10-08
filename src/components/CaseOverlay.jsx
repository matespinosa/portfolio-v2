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
  const lightboxRef = useRef(null)
  const lightboxCloseRef = useRef(null)
  const lightboxTrigger = useRef(null)
  // Stored with the project id so a swap to another case never shows a stale image.
  const [viewer, setViewer] = useState(null)
  const viewerIndex = viewer && current && viewer.id === current.id ? viewer.index : null
  const viewerOpen = viewerIndex !== null
  const viewerIndexRef = useRef(null)
  viewerIndexRef.current = viewerIndex

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
      gsap.from('.case-hero-inner > *, .case-cover, .case-close', {
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

  function openViewer(index, trigger) {
    lightboxTrigger.current = trigger
    setViewer({ id: current.id, index })
  }

  function closeViewer() {
    setViewer(null)
    lightboxTrigger.current?.focus?.()
  }

  function stepViewer(delta) {
    setViewer((state) => {
      if (!state) return state
      const total = projects.find((p) => p.id === state.id)?.gallery.length || 1
      return { ...state, index: (state.index + delta + total) % total }
    })
  }

  // Move focus into the lightbox when it opens.
  useEffect(() => {
    if (viewerOpen) lightboxCloseRef.current?.focus()
  }, [viewerOpen])

  // Keep keyboard navigation inside the open case and restore focus on close.
  useEffect(() => {
    if (!current) return
    const onKey = (e) => {
      const viewing = viewerIndexRef.current !== null
      if (e.key === 'Escape') {
        e.preventDefault()
        if (viewing) closeViewer()
        else onClose()
        return
      }
      if (viewing && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault()
        stepViewer(e.key === 'ArrowRight' ? 1 : -1)
        return
      }
      if (e.key !== 'Tab') return
      const scope = viewing ? lightboxRef.current : rootRef.current
      if (!scope) return
      const controls = [...scope.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]')]
        .filter((element) => !element.disabled && element.getClientRects().length)
      const first = controls[0]
      const last = controls.at(-1)
      if (e.shiftKey && (document.activeElement === first || !scope.contains(document.activeElement))) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !scope.contains(document.activeElement))) {
        e.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, onClose])

  if (!current) return null

  const next = projects[(projects.findIndex((p) => p.id === current.id) + 1) % projects.length]
  // Year only when it is a date; some projects use the client name there.
  const heroYear = current.year.match(/\d{4}(?:\s*[–-]\s*\d{4})?/)?.[0]

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
          <div className="case-hero-grid container">
            <div className="case-hero-inner">
              <span className="case-index">{current.index} — Case study</span>
              <span className="case-client mono">{current.client}</span>
              <h2 className="case-title" id="case-title">
                {current.name || current.title}
              </h2>
              <p className="case-cat">
                {current.category}
                {heroYear && ` · ${heroYear}`}
              </p>
            </div>
            <figure className="case-cover" data-fit={current.heroFit}>
              <img
                className="case-cover-img"
                src={current.heroImage}
                alt={`${current.title} project cover`}
                width="2048"
                height="1536"
              />
            </figure>
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
              <dt>Engagement</dt>
              <dd>{current.duration}</dd>
            </div>
          </dl>
          <div className="case-text">
            <p>{current.intro}</p>
            {current.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
          {current.metrics.length > 0 ? (
            <section className="case-metrics" aria-label={`${current.title} project metrics`}>
              {current.metrics.map((metric) => (
                <div className="case-metric" key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                  <small>{metric.detail}</small>
                </div>
              ))}
            </section>
          ) : (
            <p className="case-metrics-note">{current.metricsNote}</p>
          )}
          <section className="case-gallery" aria-label={`${current.title} project gallery`}>
            {current.gallery.map((image, index) => (
              <figure className="case-gallery-item" key={image.src}>
                <button
                  type="button"
                  onClick={(e) => openViewer(index, e.currentTarget)}
                  aria-label={`View full image: ${image.label}`}
                  data-cursor="view"
                >
                  <img src={image.src} alt={image.alt} loading="lazy" />
                </button>
                <figcaption className="mono">{image.label}</figcaption>
              </figure>
            ))}
          </section>
          <section className="case-outcome-panel">
            <h3>{current.outcomesLabel || 'Selected outcomes'}</h3>
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
      {viewerIndex !== null && (
        <div
          className="case-lightbox"
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.gallery[viewerIndex].label}
          onClick={closeViewer}
        >
          <button
            type="button"
            className="case-lightbox-close"
            ref={lightboxCloseRef}
            onClick={closeViewer}
            data-cursor="link"
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Close
          </button>
          <figure className="case-lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={current.gallery[viewerIndex].src} alt={current.gallery[viewerIndex].alt} />
            <figcaption className="mono">
              {current.gallery[viewerIndex].label} · {viewerIndex + 1}/{current.gallery.length}
            </figcaption>
          </figure>
          {current.gallery.length > 1 && (
            <>
              <button
                type="button"
                className="case-lightbox-nav"
                data-dir="prev"
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); stepViewer(-1) }}
              >
                ←
              </button>
              <button
                type="button"
                className="case-lightbox-nav"
                data-dir="next"
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); stepViewer(1) }}
              >
                →
              </button>
            </>
          )}
        </div>
      )}

    </div>,
    document.body
  )
}
