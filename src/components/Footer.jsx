import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToTarget, reducedMotion } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.footer-lead, .footer-mail', {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 80%', once: true },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <footer className="footer container" id="contact" ref={rootRef}>
      <h2 className="visually-hidden">Contact</h2>
      <p className="footer-lead">Complex product, clear next move.</p>
      <p className="footer-mail">Let&rsquo;s build something useful.</p>
      <div className="footer-meta">
        <p>Bogotá, Colombia · Working across Latin America</p>
        <p className="mono">Product design · Frontend · AI</p>
        <button
          type="button"
          className="footer-top"
          onClick={() => scrollToTarget(0)}
          data-cursor="link"
        >
          Back to top
          <svg viewBox="0 0 11 13" fill="none" aria-hidden="true">
            <path d="M5.5 12V1m0 0L1 5.5M5.5 1 10 5.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
      <p className="colophon">
        Set in Bodoni Moda, Schibsted Grotesk &amp; Fragment Mono · Built with React, GSAP
        &amp; Three.js · Press <kbd>⌘K</kbd> for commands · © 2026 Mateo Espinosa
      </p>
    </footer>
  )
}
