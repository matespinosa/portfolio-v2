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
import { QUAD_VERTEX, COVER_FRAGMENT } from './shaders'

const cache = new Map()

/**
 * Renders one static frame of each project's cover shader into a JPEG
 * data URL using a single throwaway WebGL context. Used for the inline
 * covers on coarse-pointer / narrow layouts, where running five live
 * contexts would be wasteful.
 */
export function generatePosters(projects, width = 840, height = 630) {
  const missing = projects.filter((p) => !cache.has(p.id))
  if (missing.length === 0) {
    return Object.fromEntries(projects.map((p) => [p.id, cache.get(p.id)]))
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const renderer = new WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true })
  renderer.setSize(width, height, false)

  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const uniforms = {
    uTime: { value: 12.0 },
    uRes: { value: new Vector2(width, height) },
    uSeed: { value: 0 },
    uFreq: { value: 5 },
    uWarp: { value: 1.5 },
    uKick: { value: 0 },
    uDisperse: { value: 0 },
    uColorA: { value: new Color('#000') },
    uColorB: { value: new Color('#000') },
    uColorC: { value: new Color('#fff') },
  }
  const material = new ShaderMaterial({ vertexShader: QUAD_VERTEX, fragmentShader: COVER_FRAGMENT, uniforms })
  scene.add(new Mesh(new PlaneGeometry(2, 2), material))

  for (const p of missing) {
    uniforms.uSeed.value = p.seed
    uniforms.uFreq.value = p.freq
    uniforms.uWarp.value = p.warp
    uniforms.uColorA.value.set(p.colors[0])
    uniforms.uColorB.value.set(p.colors[1])
    uniforms.uColorC.value.set(p.colors[2])
    renderer.render(scene, camera)
    cache.set(p.id, canvas.toDataURL('image/jpeg', 0.88))
  }

  material.dispose()
  renderer.dispose()
  return Object.fromEntries(projects.map((p) => [p.id, cache.get(p.id)]))
}
