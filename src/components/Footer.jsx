import { useLanguage } from '../lib/useLanguage'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToTarget, reducedMotion } from '../lib/scroll'
import { profile } from '../data/profile'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const { t } = useLanguage()
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
      <h2 className="visually-hidden">{t("Contact")}</h2>
      <p className="footer-lead">{t("Complex product, clear next move.")}</p>
      <a className="footer-mail" href={`mailto:${profile.contact.email}`} data-cursor="link">
        {profile.contact.email}
      </a>
      <div className="footer-links">
        <a href={profile.contact.linkedin} target="_blank" rel="noreferrer" data-cursor="link">
          LinkedIn ↗
        </a>
        <a href="#experience" onClick={(event) => { event.preventDefault(); scrollToTarget('#experience') }} data-cursor="link"> {t("Experience ↗")} </a>
      </div>
      <div className="footer-meta">
        <p>{t("Bogotá, Colombia · Working across Latin America")}</p>
        <p className="mono">{t("Product design · Frontend · AI")}</p>
        <button
          type="button"
          className="footer-top"
          onClick={() => scrollToTarget(0)}
          data-cursor="link"
        > {t("Back to top")} <svg viewBox="0 0 11 13" fill="none" aria-hidden="true">
            <path d="M5.5 12V1m0 0L1 5.5M5.5 1 10 5.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
      <p className="colophon"> {t("Set in Bodoni Moda, Schibsted Grotesk & Fragment Mono · Built with React, GSAP & Three.js · Press")} <kbd>{t("⌘K")}</kbd> {t("for commands · © 2026 Mateo Espinosa")} </p>
    </footer>
  )
}
