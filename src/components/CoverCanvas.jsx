import { useEffect, useRef } from 'react'
import { createQuadScene, coverUniforms } from '../lib/gl/quadScene'
import { COVER_FRAGMENT } from '../lib/gl/shaders'
import { reducedMotion } from '../lib/scroll'

/** Live animated cover for a single project (case overlay hero). */
export default function CoverCanvas({ project, className }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const scene = createQuadScene(canvasRef.current, COVER_FRAGMENT, coverUniforms(project))
    if (reducedMotion()) scene.setAnimate(false)
    return () => scene.destroy()
  }, [project])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={`Generative cover artwork for ${project.title}`}
    />
  )
}
