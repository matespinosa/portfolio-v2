import { useEffect, useRef } from 'react'
import {
  LinearSRGBColorSpace,
  Mesh,
  NoToneMapping,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { ORB_FRAGMENT, QUAD_VERTEX } from '../lib/gl/shaders'
import { tokenHex } from '../lib/tokens'

const STATE_ENERGY = {
  idle: 0.24,
  typing: 0.62,
  listening: 1,
  thinking: 1.18,
}

const MAX_DPR = 1.75

function damp(current, target, amount) {
  return current + (target - current) * amount
}

/** Raw sRGB components of a palette token — the shader consumes sRGB directly. */
function tokenVector(name) {
  const value = Number.parseInt(tokenHex(name).slice(1), 16)
  return new Vector3(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  )
}

export default function PortfolioAiOrb({ state = 'idle' }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(state)
  const controllerRef = useRef(null)

  useEffect(() => {
    stateRef.current = state
    controllerRef.current?.render()
  }, [state])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let renderer
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        premultipliedAlpha: false,
      })
    } catch {
      canvas.dataset.fallback = 'true'
      return undefined
    }

    // The shader emits sRGB already multiplied by the paper colour. Any tone
    // mapping or extra colour-space pass would wash the amber out.
    renderer.outputColorSpace = LinearSRGBColorSpace
    renderer.toneMapping = NoToneMapping
    renderer.setClearColor(0x000000, 0)

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 2)
    camera.position.z = 1

    const geometry = new PlaneGeometry(2, 2)
    const material = new ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: ORB_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: STATE_ENERGY.idle },
        uRes: { value: new Vector2(1, 1) },
        uPointer: { value: new Vector2() },
        uPaper: { value: tokenVector('--surface') },
      },
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
    const volume = new Mesh(geometry, material)
    scene.add(volume)

    const pointer = new Vector2()
    const pointerTarget = new Vector2()
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = media.matches
    let inView = true
    let pageVisible = !document.hidden
    let running = false
    let frame = 0
    let energy = STATE_ENERGY.idle

    const resize = () => {
      const width = canvas.clientWidth || 192
      const height = canvas.clientHeight || width
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)
      material.uniforms.uRes.value.set(width * dpr, height * dpr)
    }

    const draw = (now = performance.now()) => {
      const activeState = stateRef.current
      const targetEnergy = STATE_ENERGY[activeState] ?? STATE_ENERGY.idle
      energy = damp(energy, targetEnergy, reduced ? 1 : 0.045)
      pointer.x = damp(pointer.x, pointerTarget.x, reduced ? 1 : 0.038)
      pointer.y = damp(pointer.y, pointerTarget.y, reduced ? 1 : 0.038)

      material.uniforms.uTime.value = reduced ? 1.4 : now / 1000
      material.uniforms.uEnergy.value = energy
      material.uniforms.uPointer.value.copy(pointer)
      renderer.render(scene, camera)
    }

    const loop = (now) => {
      draw(now)
      frame = window.requestAnimationFrame(loop)
    }

    const sync = () => {
      const shouldRun = inView && pageVisible && !reduced
      if (shouldRun && !running) {
        running = true
        frame = window.requestAnimationFrame(loop)
      } else if (!shouldRun && running) {
        running = false
        window.cancelAnimationFrame(frame)
      }
      if (!shouldRun) draw()
    }

    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect()
      pointerTarget.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        -((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      )
    }
    const onPointerLeave = () => pointerTarget.set(0, 0)
    const onVisibility = () => {
      pageVisible = !document.hidden
      sync()
    }
    const onMotionChange = (event) => {
      reduced = event.matches
      sync()
    }

    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw()
    })
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })

    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onMotionChange)

    resize()
    draw()
    sync()
    controllerRef.current = { render: draw }

    return () => {
      controllerRef.current = null
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onMotionChange)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div className="portfolio-ai-orb" data-state={state} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
