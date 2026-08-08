import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/scroll'

export default function Preloader({ onDone }) {
  const rootRef = useRef(null)
  const countRef = useRef(null)
  const started = useRef(false)
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    if (started.current) return
    started.current = true

    if (reducedMotion()) {
      onDone()
      setGone(true)
      return
    }

    const counter = { value: 0 }
    const tl = gsap.timeline()
    tl.to(counter, {
      value: 100,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0')
        }
      },
    })
    tl.to(rootRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: 'expo.inOut',
      onStart: onDone,
      onComplete: () => setGone(true),
    })
    // One-shot choreography: intentionally not killed on cleanup, so the
    // StrictMode dev double-mount can't cancel it (the ref guard prevents
    // a second timeline).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <span className="preloader-tag">Mateo Espinosa · Product Designer · 2026</span>
      <span className="preloader-count" ref={countRef}>
        000
      </span>
    </div>
  )
}
