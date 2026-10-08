import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience, selectedClients } from '../data/projects'
import { reducedMotion } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

export default function Record() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.record-list').forEach((list) => {
        gsap.from(list.children, {
          y: 22,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: list, start: 'top 88%', once: true },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="record container" id="experience" ref={rootRef} aria-label="Clients and experience">
      <div className="record-col">
        <h2>Selected clients</h2>
        <ul className="record-list">
          {selectedClients.map((client) => (
            <li key={client.org}>
              <span className="record-primary">{client.org}</span>
              <span className="record-secondary">{client.detail}</span>
              <span className="record-year mono">{client.context}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="record-col">
        <h2>Experience</h2>
        <ul className="record-list">
          {experience.map((e) => (
            <li key={`${e.org}-${e.span}`}>
              <span className="record-primary">{e.org}</span>
              <span className="record-secondary">{e.role}</span>
              <span className="record-year mono">{e.span}</span>
              <p className="record-summary">{e.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
