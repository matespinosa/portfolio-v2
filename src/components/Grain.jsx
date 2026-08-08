import { useEffect, useRef } from 'react'
import { Vector2 } from 'three'
import { createQuadScene } from '../lib/gl/quadScene'
import { GRAIN_FRAGMENT } from '../lib/gl/shaders'
import { reducedMotion } from '../lib/scroll'

/**
 * Page-wide film grain. Capped at 24fps (film cadence, and cheap) and at
 * 1× DPR — grain wants to be per-screen-pixel, not per-device-pixel.
 */
export default function Grain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const scene = createQuadScene(
      canvasRef.current,
      GRAIN_FRAGMENT,
      {
        uTime: { value: 0 },
        uRes: { value: new Vector2(1, 1) },
        uIntensity: { value: 0.5 },
      },
      { fps: 24, dprCap: 1 }
    )
    if (reducedMotion()) scene.setAnimate(false)
    return () => scene.destroy()
  }, [])

  return <canvas className="grain" ref={canvasRef} aria-hidden="true" />
}
