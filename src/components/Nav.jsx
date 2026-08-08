import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToTarget, reducedMotion } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { label: 'Guide', href: '#chat', optional: true },
  { label: 'Studio', href: '#studio', optional: true },
  { label: 'Work', href: '#work' },
  { label: 'World', href: '#world', optional: true },
  { label: 'Contact', href: '#contact' },
]

function useBogotaClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Bogota',
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function Nav({ ready, onCommand }) {
  const ref = useRef(null)
  const time = useBogotaClock()

  useEffect(() => {
    if (!ready || reducedMotion()) return
    gsap.fromTo(
      ref.current,
      { y: -16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
    )
  }, [ready])

  // Retreat on scroll-down, return on scroll-up, so the transparent bar
  // never collides with content passing beneath it.
  useEffect(() => {
    if (reducedMotion()) return
    const el = ref.current
    let hidden = false
    const st = ScrollTrigger.create({
      start: 'top top',
      onUpdate: (self) => {
        const shouldHide = self.direction === 1 && self.scroll() > 140
        if (shouldHide !== hidden) {
          hidden = shouldHide
          gsap.to(el, {
            yPercent: shouldHide ? -130 : 0,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
      },
    })
    return () => st.kill()
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    scrollToTarget(href)
  }

  return (
    <header className="nav" ref={ref}>
      <a
        className="nav-wordmark"
        href="#top"
        onClick={(e) => go(e, 0)}
        data-cursor="link"
        aria-label="Mateo Espinosa - back to top"
      >
        Mateo Espinosa
      </a>
      <nav className="nav-right" aria-label="Site">
        {LINKS.map((l) => (
          <a
            key={l.href}
            className="nav-link"
            href={l.href}
            onClick={(e) => go(e, l.href)}
            data-cursor="link"
            data-optional={l.optional ? '' : undefined}
          >
            {l.label}
          </a>
        ))}
        <span className="nav-clock mono" aria-label="Local time in Bogotá">
          BOG {time}
        </span>
        <button type="button" className="nav-command" onClick={onCommand} data-cursor="link">
          <span className="mono">Search</span>
          <kbd>⌘K</kbd>
        </button>
      </nav>
    </header>
  )
}
