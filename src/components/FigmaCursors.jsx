import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/scroll'

// The disciplines, drawn as collaborators on a shared canvas.
// Homes sit clear of the headline and copy block; paths keep them there.
// Saturated fills so the chips read against warm paper.
const COLLABORATORS = [
  { id: 'systems', label: 'Systems', color: '#3b4fd8', ink: '#f4f1e8', home: [64, 19], path: [[72, 13], [60, 29], [69, 34], [63, 17]] },
  { id: 'motion', label: 'Motion', color: '#c2622b', ink: '#fdf6ee', home: [85, 41], path: [[77, 33], [91, 51], [80, 57], [88, 37]] },
  { id: 'shaders', label: 'Shaders', color: '#1c7a6a', ink: '#f0faf6', home: [74, 74], path: [[66, 68], [83, 80], [70, 84], [79, 71]] },
  { id: 'research', label: 'Research', color: '#6b46a8', ink: '#f6f1fb', home: [31, 86], path: [[23, 81], [41, 89], [27, 91], [35, 83]] },
]

export default function FigmaCursors() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      COLLABORATORS.forEach((c, i) => {
        const el = rootRef.current.querySelector(`[data-cursor-id="${c.id}"]`)
        if (!el) return
        const tl = gsap.timeline({ repeat: -1, delay: i * 0.4 })
        // Waypoints are deltas in vw/vh-ish percent space, converted to px
        // at play time so the drift scales with the hero box.
        c.path.forEach((point) => {
          tl.to(el, {
            xPercent: 0,
            x: () => ((point[0] - c.home[0]) / 100) * rootRef.current.offsetWidth,
            y: () => ((point[1] - c.home[1]) / 100) * rootRef.current.offsetHeight,
            duration: gsap.utils.random(2.6, 4.4),
            ease: 'power2.inOut',
          }).to({}, { duration: gsap.utils.random(0.3, 1.1) })
        })
      })

      gsap.from('.fcursor', {
        autoAlpha: 0,
        scale: 0.6,
        duration: 0.7,
        stagger: 0.12,
        delay: 1.1,
        ease: 'back.out(1.6)',
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="fcursors" ref={rootRef} aria-hidden="true">
      {COLLABORATORS.map((c) => (
        <span
          key={c.id}
          className="fcursor"
          data-cursor-id={c.id}
          style={{ left: `${c.home[0]}%`, top: `${c.home[1]}%`, '--c': c.color, '--ci': c.ink }}
        >
          <svg className="fcursor-arrow" viewBox="0 0 16 18" fill="none">
            <path
              d="M1 1.4v13.2a.6.6 0 0 0 1.02.43l3.2-3.1a.6.6 0 0 1 .42-.17h4.5a.6.6 0 0 0 .42-1.03L2.02.97A.6.6 0 0 0 1 1.4Z"
              fill="var(--c)"
              stroke="var(--ci)"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </svg>
          <span className="fcursor-chip">{c.label}</span>
        </span>
      ))}
    </div>
  )
}
