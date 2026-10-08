import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import HeroTerminal from './HeroTerminal'
import { scrollToTarget, reducedMotion } from '../lib/scroll'

gsap.registerPlugin(SplitText)

const RADIUS = 190
const PULL = 22

export default function Hero({ ready }) {
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const splitRef = useRef(null)
  const hidden = useRef(false)

  // Split into lines (masked) and chars (animated + magnetised).
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const split = new SplitText(titleRef.current, {
      type: 'lines,chars',
      linesClass: 'hero-line',
      charsClass: 'hero-char',
    })
    splitRef.current = split

    const ctx = gsap.context(() => {
      gsap.set('.hero-char', { yPercent: 118 })
      gsap.set('.hero-sub, .hero-actions, .portfolio-terminal', { autoAlpha: 0, y: 18 })
    }, rootRef)
    hidden.current = true

    return () => {
      ctx.revert()
      split.revert()
      splitRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    if (!ready || !hidden.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'expo.out' } })
      tl.to('.hero-char', { yPercent: 0, duration: 1.15, stagger: { each: 0.016, from: 'start' } })
        .to('.hero-sub', { autoAlpha: 1, y: 0, duration: 0.85 }, '-=0.75')
        .to('.hero-actions', { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.6')
        .to('.portfolio-terminal', { autoAlpha: 1, y: 0, duration: 0.9 }, '-=0.72')
    }, rootRef)
    return () => ctx.revert()
  }, [ready])

  // Magnetic field: each char eases toward the cursor with a distance falloff.
  useLayoutEffect(() => {
    if (reducedMotion() || !splitRef.current) return
    const chars = splitRef.current.chars
    if (!chars?.length) return

    const items = chars.map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0 }))
    let raf = 0
    let settled = true

    const measure = () => {
      const base = titleRef.current.getBoundingClientRect()
      for (const item of items) {
        const r = item.el.getBoundingClientRect()
        item.cx = r.left + r.width / 2 - base.left
        item.cy = r.top + r.height / 2 - base.top
      }
    }
    // Measure after the reveal has laid out.
    const measureId = setTimeout(measure, 400)
    window.addEventListener('resize', measure)

    const onMove = (e) => {
      const base = titleRef.current.getBoundingClientRect()
      const px = e.clientX - base.left
      const py = e.clientY - base.top
      for (const item of items) {
        const dx = px - item.cx
        const dy = py - item.cy
        const dist = Math.hypot(dx, dy)
        if (dist < RADIUS) {
          const force = (1 - dist / RADIUS) ** 2
          item.tx = (dx / (dist || 1)) * PULL * force
          item.ty = (dy / (dist || 1)) * PULL * force
        } else {
          item.tx = 0
          item.ty = 0
        }
      }
      if (settled) {
        settled = false
        raf = requestAnimationFrame(tick)
      }
    }

    function tick() {
      let moving = false
      for (const item of items) {
        item.x += (item.tx - item.x) * 0.14
        item.y += (item.ty - item.y) * 0.14
        if (Math.abs(item.x - item.tx) > 0.05 || Math.abs(item.y - item.ty) > 0.05) moving = true
        item.el.style.transform = `translate(${item.x.toFixed(2)}px, ${item.y.toFixed(2)}px)`
      }
      if (moving) {
        raf = requestAnimationFrame(tick)
      } else {
        settled = true
      }
    }

    window.addEventListener('pointermove', onMove)
    return () => {
      clearTimeout(measureId)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onMove)
    }
  }, [ready])

  return (
    <section className="hero" id="top" ref={rootRef} aria-label="Introduction">
      <div className="hero-signals" aria-hidden="true">
        <i data-signal="one" />
        <i data-signal="two" />
        <i data-signal="three" />
        <i data-signal="four" />
      </div>
      <div className="hero-content container" data-inspect="Hero / artboard">
        <div className="hero-copy">
          <div className="hero-frame" aria-hidden="true">
            <span className="hero-frame-label">hero / overview</span>
            {['tl', 'tr', 'bl', 'br'].map((corner) => (
              <i className="hero-handle" data-corner={corner} key={corner} />
            ))}
          </div>

          <h1 className="hero-name" ref={titleRef}>
            Interfaces built like instruments
          </h1>

          <p className="hero-sub">
            I’m Mateo Espinosa, a product designer turning complex fintech and B2B flows
            into clear, measurable experiences. 6+ years across design and frontend.
            Currently shaping merchant tools at Rappi.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => scrollToTarget('#work')}
              data-cursor="link"
            >
              Selected work
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 11 11 3m0 0H5m6 0v6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => scrollToTarget('#practice')}
              data-cursor="link"
            >
              About Mateo
            </button>
          </div>
        </div>

        <HeroTerminal />
      </div>
    </section>
  )
}
