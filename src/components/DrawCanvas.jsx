import { useEffect, useImperativeHandle, useRef } from 'react'
import { tokenRgb } from '../lib/tokens'

const MAX_WIDTH = 26
const MIN_WIDTH = 1.6

/**
 * Annotation layer. The stroke is velocity-reactive — a fast pass runs thin
 * like a real nib, a slow one pools — and the whole canvas composites with
 * `multiply`, so the ink actually darkens the type and panels beneath it
 * instead of floating over them.
 */
export default function DrawCanvas({ active, apiRef }) {
  const canvasRef = useRef(null)
  const state = useRef({ drawing: false, last: null, width: MAX_WIDTH * 0.5 })

  useImperativeHandle(apiRef, () => ({
    clear() {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    },
  }))

  // Size the backing store to the device pixel ratio, preserving what's drawn.
  useEffect(() => {
    const canvas = canvasRef.current
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(window.innerWidth * dpr)
      const h = Math.round(window.innerHeight * dpr)
      if (canvas.width === w && canvas.height === h) return

      const previous = document.createElement('canvas')
      previous.width = canvas.width
      previous.height = canvas.height
      if (canvas.width) previous.getContext('2d').drawImage(canvas, 0, 0)

      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (previous.width) {
        ctx.drawImage(previous, 0, 0, previous.width / dpr, previous.height / dpr)
      }
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    if (!active) {
      state.current.drawing = false
      state.current.last = null
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const ink = tokenRgb('--primary')

    const point = (e) => ({ x: e.clientX, y: e.clientY, t: performance.now() })

    const onDown = (e) => {
      if (e.button !== 0) return
      state.current.drawing = true
      state.current.last = point(e)
      canvas.setPointerCapture?.(e.pointerId)
    }

    const onMove = (e) => {
      const s = state.current
      if (!s.drawing || !s.last) return

      const now = point(e)
      const dx = now.x - s.last.x
      const dy = now.y - s.last.y
      const dist = Math.hypot(dx, dy)
      const dt = Math.max(now.t - s.last.t, 1)
      const speed = dist / dt

      // Fast strokes thin out; the width eases so the line never steps.
      const target = Math.max(MIN_WIDTH, MAX_WIDTH / (1 + speed * 2.4))
      s.width += (target - s.width) * 0.35

      // Wet edge first: a wider, fainter pass that reads as ink spread.
      ctx.strokeStyle = ink
      ctx.globalAlpha = 0.1
      ctx.lineWidth = s.width * 2.1
      ctx.beginPath()
      ctx.moveTo(s.last.x, s.last.y)
      ctx.lineTo(now.x, now.y)
      ctx.stroke()

      ctx.globalAlpha = 0.85
      ctx.lineWidth = s.width
      ctx.beginPath()
      ctx.moveTo(s.last.x, s.last.y)
      ctx.lineTo(now.x, now.y)
      ctx.stroke()

      s.last = now
    }

    const onUp = (e) => {
      state.current.drawing = false
      state.current.last = null
      state.current.width = MAX_WIDTH * 0.5
      canvas.releasePointerCapture?.(e.pointerId)
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [active])

  return <canvas className={`draw-layer ${active ? 'is-active' : ''}`} ref={canvasRef} aria-hidden="true" />
}
