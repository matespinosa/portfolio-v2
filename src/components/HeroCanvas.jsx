import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Vector2, Color } from 'three'
import { createQuadScene } from '../lib/gl/quadScene'
import { HERO_FRAGMENT } from '../lib/gl/shaders'
import { reducedMotion } from '../lib/scroll'
import { tokenHex } from '../lib/tokens'

export default function HeroCanvas({ ready }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uLight: { value: new Vector2(0.62, 0.66) },
      uSpeed: { value: 0 },
      uIntro: { value: reducedMotion() ? 1 : 0 },
      uPaper: { value: new Color(tokenHex('--surface')) },
      uInk: { value: new Color(tokenHex('--ink')) },
      uPrimary: { value: new Color(tokenHex('--primary')) },
    }

    const target = new Vector2(0.62, 0.66)
    const previous = new Vector2(0.62, 0.66)

    const scene = createQuadScene(canvasRef.current, HERO_FRAGMENT, uniforms, {
      onFrame: (u) => {
        previous.copy(u.uLight.value)
        u.uLight.value.lerp(target, 0.06)
        // Cursor acceleration drives penumbra width.
        const speed = u.uLight.value.distanceTo(previous) * 60
        u.uSpeed.value += (Math.min(speed, 1) - u.uSpeed.value) * 0.12
      },
    })
    sceneRef.current = scene

    let onMove = null
    if (reducedMotion()) {
      scene.setAnimate(false)
    } else {
      onMove = (e) => {
        target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
      }
      window.addEventListener('pointermove', onMove)
    }

    return () => {
      if (onMove) window.removeEventListener('pointermove', onMove)
      scene.destroy()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!ready || !sceneRef.current || reducedMotion()) return
    gsap.to(sceneRef.current.uniforms.uIntro, { value: 1, duration: 1.8, ease: 'power2.out' })
  }, [ready])

  return <canvas className="hero-canvas" ref={canvasRef} aria-hidden="true" />
}
