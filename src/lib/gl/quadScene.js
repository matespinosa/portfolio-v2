import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Vector2,
  Color,
} from 'three'
import { QUAD_VERTEX } from './shaders'

const MAX_DPR = 1.75

/**
 * Fullscreen-quad shader scene bound to a canvas. Sizing, a rAF loop that only
 * runs while the canvas is on screen, optional frame-rate capping, and clean
 * disposal.
 */
export function createQuadScene(canvas, fragmentShader, uniforms, options = {}) {
  const { fps = 0, dprCap = MAX_DPR, onFrame } = options

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: options.alpha ?? false,
    powerPreference: 'high-performance',
  })
  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geometry = new PlaneGeometry(2, 2)
  const material = new ShaderMaterial({
    vertexShader: QUAD_VERTEX,
    fragmentShader,
    uniforms,
  })
  scene.add(new Mesh(geometry, material))

  let raf = 0
  let running = false
  let visible = true
  let animate = true
  let lastDraw = 0
  const start = performance.now()
  const interval = fps > 0 ? 1000 / fps : 0

  function resize() {
    const w = canvas.clientWidth || canvas.width
    const h = canvas.clientHeight || canvas.height
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    renderer.setSize(Math.round(w * dpr), Math.round(h * dpr), false)
    uniforms.uRes.value.set(w * dpr, h * dpr)
  }

  function render() {
    const now = performance.now()
    uniforms.uTime.value = (now - start) / 1000
    onFrame?.(uniforms, now)
    renderer.render(scene, camera)
  }

  function loop(now) {
    raf = requestAnimationFrame(loop)
    if (interval && now - lastDraw < interval) return
    lastDraw = now
    render()
  }

  function sync() {
    const shouldRun = animate && visible
    if (shouldRun && !running) {
      running = true
      raf = requestAnimationFrame(loop)
    } else if (!shouldRun && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
  io.observe(canvas)

  const onResize = () => {
    resize()
    render()
  }
  window.addEventListener('resize', onResize)

  resize()
  render()

  return {
    uniforms,
    render,
    resize,
    /** Static mode: render single frames on demand (reduced motion). */
    setAnimate(value) {
      animate = value
      sync()
      if (!value) render()
    },
    destroy() {
      cancelAnimationFrame(raf)
      running = false
      io.disconnect()
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}

/** Uniform set for a project's cover shader. */
export function coverUniforms(project) {
  return {
    uTime: { value: 0 },
    uRes: { value: new Vector2(1, 1) },
    uSeed: { value: project.seed },
    uFreq: { value: project.freq },
    uWarp: { value: project.warp },
    uKick: { value: 0 },
    uDisperse: { value: 0 },
    uColorA: { value: new Color(project.colors[0]) },
    uColorB: { value: new Color(project.colors[1]) },
    uColorC: { value: new Color(project.colors[2]) },
  }
}
