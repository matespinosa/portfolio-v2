import { useEffect, useState } from 'react'

/**
 * DevTools-style element inspection over the sections that opt in with
 * `data-inspect`. Reports the label plus the measured box, the way an
 * element overlay does.
 */
export default function Inspector({ active }) {
  const [target, setTarget] = useState(null)

  useEffect(() => {
    if (!active) {
      setTarget(null)
      return
    }

    const read = (el) => {
      const rect = el.getBoundingClientRect()
      setTarget({
        label: el.dataset.inspect,
        tag: el.tagName.toLowerCase(),
        x: rect.x,
        y: rect.y,
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      })
    }

    const onMove = (e) => {
      const el = e.target.closest?.('[data-inspect]')
      if (el) read(el)
      else setTarget(null)
    }

    const onScroll = () => setTarget(null)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [active])

  if (!active || !target) return null

  const flip = target.y < 34

  return (
    <div className="inspector" aria-hidden="true">
      <div
        className="inspector-box"
        style={{
          transform: `translate(${target.x}px, ${target.y}px)`,
          width: `${target.w}px`,
          height: `${target.h}px`,
        }}
      >
        <span className={`inspector-tag ${flip ? 'is-below' : ''}`}>
          <b>{target.label}</b>
          <span className="mono">
            {target.tag} · {target.w}×{target.h}
          </span>
        </span>
      </div>
    </div>
  )
}
