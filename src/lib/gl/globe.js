import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  BufferGeometry,
  BufferAttribute,
  Float32BufferAttribute,
  LineSegments,
  LineLoop,
  LineBasicMaterial,
  EllipseCurve,
  Points,
  ShaderMaterial,
  Raycaster,
  Vector2,
  Vector3,
  Color,
  AdditiveBlending,
} from 'three'
import { outlineSegments } from './geo'

const R = 1
const DEG = Math.PI / 180
const MAX_DPR = 1.75
const PIN_BASE = R * 1.005
const PIN_TIP = R * 1.075
const BASE_DETAIL = 0.46

/** Real lat/lon → point on the sphere. */
export function latLonToVec3(lat, lon, radius = R) {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/** Y rotation that brings a given longitude to face the camera. */
const facingRotation = (lon) => Math.PI / 2 - (lon + 180) * DEG

/** Wrap an angle delta into [-π, π] so easing takes the short way round. */
const shortestAngle = (a) =>
  ((((a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI

function slerp(a, b, t) {
  const angle = a.angleTo(b)
  if (angle < 1e-5) return a.clone()
  const s = Math.sin(angle)
  return a
    .clone()
    .multiplyScalar(Math.sin((1 - t) * angle) / s)
    .add(b.clone().multiplyScalar(Math.sin(t * angle) / s))
}

function graticule() {
  const pts = []
  const SEG = 96
  for (let i = 1; i < 12; i++) {
    const lat = -90 + (180 / 12) * i
    for (let s = 0; s < SEG; s++) {
      pts.push(latLonToVec3(lat, (s / SEG) * 360 - 180))
      pts.push(latLonToVec3(lat, ((s + 1) / SEG) * 360 - 180))
    }
  }
  for (let i = 0; i < 24; i++) {
    const lon = -180 + (360 / 24) * i
    for (let s = 0; s < SEG / 2; s++) {
      pts.push(latLonToVec3(-90 + (s / (SEG / 2)) * 180, lon))
      pts.push(latLonToVec3(-90 + ((s + 1) / (SEG / 2)) * 180, lon))
    }
  }
  const g = new BufferGeometry()
  const arr = new Float32Array(pts.length * 3)
  pts.forEach((p, i) => {
    arr[i * 3] = p.x
    arr[i * 3 + 1] = p.y
    arr[i * 3 + 2] = p.z
  })
  g.setAttribute('position', new BufferAttribute(arr, 3))
  return g
}

/** Coastlines and borders lifted onto the sphere. */
function outlineGeometry(features, radius) {
  const flat = outlineSegments(features)
  const positions = new Float32Array((flat.length / 4) * 6)
  for (let i = 0, o = 0; i < flat.length; i += 4) {
    const a = latLonToVec3(flat[i], flat[i + 1], radius)
    const b = latLonToVec3(flat[i + 2], flat[i + 3], radius)
    positions[o++] = a.x
    positions[o++] = a.y
    positions[o++] = a.z
    positions[o++] = b.x
    positions[o++] = b.y
    positions[o++] = b.z
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(positions, 3))
  return g
}

/** Vertical stems standing on each country, so pins read as objects. */
function pinsGeometry(all, home) {
  const positions = []
  const ts = []
  const homes = []
  all.forEach((n) => {
    const base = latLonToVec3(n.lat, n.lon, PIN_BASE)
    const tip = latLonToVec3(n.lat, n.lon, PIN_TIP)
    const STEPS = 6
    for (let s = 0; s < STEPS; s++) {
      const a = base.clone().lerp(tip, s / STEPS)
      const b = base.clone().lerp(tip, (s + 1) / STEPS)
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      ts.push(s / STEPS, (s + 1) / STEPS)
      homes.push(n.id === home.id ? 1 : 0, n.id === home.id ? 1 : 0)
    }
  })
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(positions, 3))
  g.setAttribute('aT', new Float32BufferAttribute(ts, 1))
  g.setAttribute('aHome', new Float32BufferAttribute(homes, 1))
  return g
}

function arcsGeometry(home, nodes, segments = 80) {
  const positions = []
  const ts = []
  const offsets = []
  const a = latLonToVec3(home.lat, home.lon)

  nodes.forEach((node, index) => {
    const b = latLonToVec3(node.lat, node.lon)
    const spread = a.angleTo(b) / Math.PI
    const lift = 0.05 + spread * 0.26
    const offset = index / nodes.length

    const pts = []
    for (let s = 0; s <= segments; s++) {
      const t = s / segments
      const p = slerp(a, b, t).normalize()
      p.multiplyScalar(R + Math.sin(Math.PI * t) * lift)
      pts.push(p)
    }
    for (let s = 0; s < segments; s++) {
      const p0 = pts[s]
      const p1 = pts[s + 1]
      positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z)
      ts.push(s / segments, (s + 1) / segments)
      offsets.push(offset, offset)
    }
  })

  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(positions, 3))
  g.setAttribute('aT', new Float32BufferAttribute(ts, 1))
  g.setAttribute('aOffset', new Float32BufferAttribute(offsets, 1))
  return g
}

/**
 * Interactive globe: Natural Earth coastlines, a land dot field, and a pin
 * standing on every country the work shipped in, each with an HTML label the
 * render loop keeps anchored.
 */
export function createGlobe(
  canvas,
  { home, nodes, onHover, palette, countries, labelRefs }
) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setClearAlpha(0)
  const scene = new Scene()
  const camera = new PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 0, 4.6)

  const world = new Group()
  // Rest on Latin America: rotation.x centers that latitude, y that longitude.
  const REST_X = -0.13
  let restY = facingRotation(-72)
  let autoHold = 0
  world.rotation.set(REST_X, restY, 0)
  scene.add(world)

  const cMoss = new Color(palette.moss)
  const cLichen = new Color(palette.lichen)
  const cAmber = new Color(palette.amber)

  // Shared line shading: only front-facing map geometry is drawn.
  const lineVertex = `
    varying float vFacing;
    void main() {
      vec3 n = normalize(normalMatrix * position);
      vFacing = clamp(dot(n, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const lineFragment = `
    uniform vec3 uColor;
    uniform float uAlpha;
    varying float vFacing;
    void main() {
      float facing = smoothstep(0.02, 0.2, vFacing);
      if (facing < 0.01) discard;
      gl_FragColor = vec4(uColor, uAlpha * facing);
      #include <colorspace_fragment>
    }
  `
  const lineMaterial = (color, alpha) =>
    new ShaderMaterial({
      uniforms: { uColor: { value: color }, uAlpha: { value: alpha } },
      transparent: true,
      depthWrite: false,
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
    })

  const silhouetteGeometry = new BufferGeometry().setFromPoints(
    new EllipseCurve(0, 0, R, R, 0, Math.PI * 2).getPoints(180),
  )
  const silhouetteMaterial = new LineBasicMaterial({
    color: cMoss,
    transparent: true,
    opacity: 0.72,
  })
  scene.add(new LineLoop(silhouetteGeometry, silhouetteMaterial))

  world.add(new LineSegments(graticule(), lineMaterial(cMoss, 0.11)))
  const countryMaterial = lineMaterial(cMoss, 0.52)
  world.add(new LineSegments(outlineGeometry(countries, R * 1.004), countryMaterial))
  const homeFeatures = countries.filter((feature) => feature.properties?.name === home.match)
  world.add(new LineSegments(outlineGeometry(homeFeatures, R * 1.008), lineMaterial(cLichen, 0.96)))

  // --- arcs out of home ---
  const arcs = new LineSegments(
    arcsGeometry(home, nodes),
    new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: cAmber },
        uAnimate: { value: 1 },
        uDetail: { value: BASE_DETAIL },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexShader: `
        attribute float aT;
        attribute float aOffset;
        varying float vT;
        varying float vOffset;
        void main() {
          vT = aT;
          vOffset = aOffset;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uAnimate;
        uniform float uDetail;
        varying float vT;
        varying float vOffset;
        void main() {
          float head = fract(uTime * 0.13 + vOffset);
          float d = head - vT;
          d += step(d, -0.5);
          float comet = smoothstep(0.24, 0.0, d) * step(0.0, d) * uAnimate;
          float ends = smoothstep(0.0, 0.05, vT) * (1.0 - smoothstep(0.95, 1.0, vT));
          float a = (0.26 + comet * 0.9) * ends * uDetail;
          gl_FragColor = vec4(uColor + comet * 0.4, a);
          #include <colorspace_fragment>
        }
      `,
    })
  )
  world.add(arcs)

  // --- pins: stem + head, one per country ---
  const all = [home, ...nodes]

  const stems = new LineSegments(
      pinsGeometry(all, home),
      new ShaderMaterial({
        uniforms: { uColor: { value: cLichen }, uDetail: { value: BASE_DETAIL } },
        transparent: true,
        depthWrite: false,
        vertexShader: `
          attribute float aT;
          attribute float aHome;
          varying float vT;
          varying float vHome;
          varying float vFacing;
          void main() {
            vT = aT;
            vHome = aHome;
            vec3 n = normalize(normalMatrix * position);
            vFacing = clamp(dot(n, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uDetail;
          varying float vT;
          varying float vHome;
          varying float vFacing;
          void main() {
            // fade the stem from the surface up to the head
            float visible = mix(uDetail, 1.0, vHome);
            float a = mix(0.15, 0.95, vT) * (0.25 + 0.75 * vFacing) * visible;
            gl_FragColor = vec4(uColor, a);
            #include <colorspace_fragment>
          }
        `,
      })
    )
  world.add(stems)

  const markerGeo = new BufferGeometry()
  const mPos = new Float32Array(all.length * 3)
  const mHome = new Float32Array(all.length)
  const mIndex = new Float32Array(all.length)
  const mWeight = new Float32Array(all.length)
  const maxClients = Math.max(...all.map((n) => n.clients?.length || 1))
  all.forEach((n, i) => {
    const v = latLonToVec3(n.lat, n.lon, PIN_TIP)
    mPos[i * 3] = v.x
    mPos[i * 3 + 1] = v.y
    mPos[i * 3 + 2] = v.z
    mHome[i] = n.id === home.id ? 1 : 0
    mIndex[i] = i
    // Head size carries how much work happened there.
    mWeight[i] = (n.clients?.length || 1) / maxClients
  })
  markerGeo.setAttribute('position', new BufferAttribute(mPos, 3))
  markerGeo.setAttribute('aHome', new BufferAttribute(mHome, 1))
  markerGeo.setAttribute('aIndex', new BufferAttribute(mIndex, 1))
  markerGeo.setAttribute('aWeight', new BufferAttribute(mWeight, 1))

  const markers = new Points(
    markerGeo,
    new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLichen: { value: cLichen },
        uAmber: { value: cAmber },
        uPixelRatio: { value: 1 },
        uActive: { value: -1 },
        uAnimate: { value: 1 },
        uDetail: { value: BASE_DETAIL },
      },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute float aHome;
        attribute float aIndex;
        attribute float aWeight;
        uniform float uPixelRatio;
        uniform float uActive;
        uniform float uDetail;
        varying float vHome;
        varying float vActive;
        void main() {
          vHome = aHome;
          vActive = step(abs(aIndex - uActive), 0.5);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float base = mix(16.0, 26.0, aWeight) + vActive * 8.0;
          gl_PointSize = base * uPixelRatio * (2.2 / -mv.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uLichen;
        uniform vec3 uAmber;
        uniform float uTime;
        uniform float uAnimate;
        uniform float uDetail;
        varying float vHome;
        varying float vActive;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          vec3 col = mix(uLichen, uAmber, vHome);
          float core = 1.0 - smoothstep(0.22, 0.34, d);
          // halo pulses outward from the head
          float t = fract(uTime * 0.45 + vHome * 0.5);
          float rippleR = mix(0.4, 1.0, t);
          float ripple = (smoothstep(rippleR - 0.09, rippleR, d) - smoothstep(rippleR, rippleR + 0.09, d))
                       * (1.0 - t) * uAnimate;
          float ring = smoothstep(0.46, 0.52, d) - smoothstep(0.58, 0.66, d);
          float visible = max(vHome, max(vActive, uDetail));
          float a = (core + ring * (0.55 + 0.45 * vActive) + ripple * 0.75) * visible;
          if (a < 0.01) discard;
          gl_FragColor = vec4(col + vActive * 0.2, clamp(a, 0.0, 1.0));
          #include <colorspace_fragment>
        }
      `,
    })
  )
  world.add(markers)

  // ---------------- interaction ----------------
  const raycaster = new Raycaster()
  raycaster.params.Points.threshold = 0.06
  const pointer = new Vector2(-10, -10)
  let hovered = -1
  // Selection driven from the side list; keeps a pin lit even when the
  // pointer is nowhere near the canvas.
  let forcedId = null
  let exploring = false
  let detail = BASE_DETAIL
  let detailTarget = BASE_DETAIL

  const updateDetailTarget = () => {
    detailTarget = exploring || (forcedId && forcedId !== home.id) ? 1 : BASE_DETAIL
  }

  const applyActiveUniform = () => {
    markers.material.uniforms.uActive.value =
      hovered !== -1 ? hovered : all.findIndex((n) => n.id === forcedId)
  }

  let dragging = false
  let lastX = 0
  let lastY = 0
  let velX = 0
  let velY = 0
  let idle = 0
  let animate = true
  let visible = true
  let running = false
  let raf = 0
  const startTime = performance.now()

  function onPointerDown(e) {
    exploring = true
    updateDetailTarget()
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    canvas.setPointerCapture?.(e.pointerId)
    sync()
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    if (!dragging) {
      if (!animate) render()
      return
    }
    velX = (e.clientX - lastX) * 0.005
    velY = (e.clientY - lastY) * 0.005
    lastX = e.clientX
    lastY = e.clientY
    idle = 0
  }

  function onPointerUp(e) {
    if (!dragging) return
    dragging = false
    canvas.releasePointerCapture?.(e.pointerId)
    sync()
    if (!animate) render()
  }

  function onPointerLeave() {
    pointer.set(-10, -10)
    dragging = false
    exploring = false
    updateDetailTarget()
    sync()
    if (!animate) {
      detail = detailTarget
      render()
    }
  }

  function onPointerEnter() {
    exploring = true
    updateDetailTarget()
    if (!animate) {
      detail = detailTarget
      render()
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerenter', onPointerEnter)
  canvas.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerLeave)

  const markerWorld = (index) =>
    markers.localToWorld(
      new Vector3().fromBufferAttribute(markerGeo.getAttribute('position'), index)
    )

  function project(v3, rect) {
    const p = v3.clone().project(camera)
    return {
      x: ((p.x + 1) / 2) * rect.width,
      y: ((-p.y + 1) / 2) * rect.height,
      z: p.z,
    }
  }

  function pick() {
    if (pointer.x < -5) {
      if (hovered !== -1) {
        hovered = -1
        applyActiveUniform()
        onHover?.(null)
      }
      return
    }
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObject(markers)
    const hit = hits.find((h) => {
      const w = markerWorld(h.index)
      return w.clone().sub(camera.position).dot(w) < 0
    })
    const index = hit ? hit.index : -1
    if (index !== hovered) {
      hovered = index
      applyActiveUniform()
      onHover?.(index === -1 ? null : all[index])
    }
  }

  // Label placement: nearest first, skipping any that would collide.
  const labelSize = new Map()
  function updateLabels() {
    const map = labelRefs?.current
    if (!map || map.size === 0) return
    const rect = canvas.getBoundingClientRect()
    if (!rect.width) return

    const entries = all.map((n, i) => {
      const w = markerWorld(i)
      return {
        node: n,
        facing: w.clone().sub(camera.position).dot(w) < 0,
        ...project(w, rect),
      }
    })
    entries.sort((a, b) => a.z - b.z)

    const placed = []
    for (const e of entries) {
      const el = map.get(e.node.id)
      if (!el) continue
      const isActive =
        (hovered !== -1 && all[hovered].id === e.node.id) || e.node.id === forcedId

      const isHome = e.node.id === home.id
      if (!e.facing || (!isHome && !exploring && !isActive)) {
        el.style.opacity = '0'
        continue
      }

      // The active label expands to list clients, so never trust its cache.
      let size = labelSize.get(e.node.id)
      if (isActive || !size || !size.w) {
        size = { w: el.offsetWidth, h: el.offsetHeight }
        labelSize.set(e.node.id, size)
      }

      // Try right, then left, then above, then below before giving up —
      // South America packs pins tightly and a single side loses labels.
      const spots = [
        { x: e.x + 12, y: e.y - size.h / 2 },
        { x: e.x - 12 - size.w, y: e.y - size.h / 2 },
        { x: e.x - size.w / 2, y: e.y - size.h - 12 },
        { x: e.x - size.w / 2, y: e.y + 12 },
      ]
      const overlaps = (a, b) =>
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

      let box = null
      for (const spot of spots) {
        const candidate = { ...spot, w: size.w, h: size.h }
        if (candidate.x < 0 || candidate.x + candidate.w > rect.width) continue
        if (!placed.some((p) => overlaps(candidate, p))) {
          box = candidate
          break
        }
      }
      if (!box) {
        if (!isActive) {
          el.style.opacity = '0'
          continue
        }
        box = { ...spots[0], w: size.w, h: size.h }
      }

      placed.push(box)
      el.style.transform = `translate(${box.x}px, ${box.y}px)`
      el.style.opacity = '1'
    }
  }

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    markers.material.uniforms.uPixelRatio.value = dpr
    labelSize.clear()
  }

  function render() {
    const t = (performance.now() - startTime) / 1000
    detail += (detailTarget - detail) * (animate ? 0.09 : 1)
    countryMaterial.uniforms.uAlpha.value = 0.29 + detail * 0.5
    arcs.material.uniforms.uDetail.value = detail
    markers.material.uniforms.uDetail.value = detail
    stems.material.uniforms.uDetail.value = detail
    arcs.material.uniforms.uTime.value = t
    markers.material.uniforms.uTime.value = t

    if (autoHold > 0) autoHold--

    if (!dragging) {
      velX *= 0.94
      velY *= 0.94
      idle = Math.min(idle + 1, 200)
      // Hold still while a pin is hovered, or the label chases the cursor away.
      if (animate && hovered === -1 && autoHold === 0) {
        const settle = Math.min(Math.max((idle - 45) / 120, 0), 1) * 0.035
        const targetY = restY + Math.sin(t * 0.11) * 0.14
        world.rotation.y += shortestAngle(targetY - world.rotation.y) * settle
        world.rotation.x += (REST_X - world.rotation.x) * settle
      }
    }
    world.rotation.y += velX
    world.rotation.x = Math.max(-0.85, Math.min(0.85, world.rotation.x + velY))

    pick()
    renderer.render(scene, camera)
    updateLabels()
  }

  function loop() {
    raf = requestAnimationFrame(loop)
    render()
  }

  function sync() {
    const should = visible && (animate || dragging)
    if (should && !running) {
      running = true
      raf = requestAnimationFrame(loop)
    } else if (!should && running) {
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
  sync()

  return {
    /** Light a pin from outside the canvas (side-list hover / selection). */
    setActive(id) {
      forcedId = id
      updateDetailTarget()
      applyActiveUniform()
      if (!animate) {
        detail = detailTarget
        render()
      }
    },
    focus(node) {
      const current = world.rotation.y
      const to = current + shortestAngle(facingRotation(node.lon) - current)
      restY = to
      autoHold = 150
      return { from: current, to, apply: (v) => (world.rotation.y = v) }
    },
    setAnimate(value) {
      animate = value
      arcs.material.uniforms.uAnimate.value = value ? 1 : 0
      markers.material.uniforms.uAnimate.value = value ? 1 : 0
      sync()
      if (!value) render()
    },
    destroy() {
      cancelAnimationFrame(raf)
      running = false
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerenter', onPointerEnter)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      scene.traverse((o) => {
        o.geometry?.dispose()
        o.material?.dispose()
      })
      renderer.dispose()
    },
  }
}
