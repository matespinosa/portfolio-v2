import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { finePointer, reducedMotion } from '../lib/scroll'

/**
 * Custom cursor: lichen dot + trailing ring. Fine pointers only;
 * reduced-motion users keep the native cursor untouched.
 * Elements opt in via data-cursor="link" | "view" and data-cursor-label.
 */
export default function Cursor({ drawing = false }) {
  const [enabled, setEnabled] = useState(false)
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current
    const ring = ringRef.current
    document.body.classList.add('has-custom-cursor', 'cursor-hidden')

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })

    let shown = false
    const onMove = (e) => {
      if (!shown) {
        shown = true
        document.body.classList.remove('cursor-hidden')
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY })
      }
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e) => {
      const target = e.target.closest('[data-cursor]')
      if (target) {
        const mode = target.dataset.cursor
        document.body.dataset.cursorMode = mode
        if (labelRef.current) {
          labelRef.current.textContent =
            target.dataset.cursorLabel || (mode === 'view' ? 'View' : '')
        }
      } else {
        delete document.body.dataset.cursorMode
      }
    }

    const onLeave = () => {
      shown = false
      document.body.classList.add('cursor-hidden')
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      document.body.classList.remove('has-custom-cursor', 'cursor-hidden')
      delete document.body.dataset.cursorMode
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div className={`cursor-ring ${drawing ? 'is-brush' : ''}`} ref={ringRef} aria-hidden="true">
        <span className="cursor-label" ref={labelRef} />
      </div>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  )
}
