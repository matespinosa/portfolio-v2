import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { createGlobe } from '../lib/gl/globe'
import { loadCountries } from '../lib/gl/geo'
import { COUNTRIES, CLIENTS, HOME } from '../data/world'
import { reducedMotion } from '../lib/scroll'

// Graphite linework on warm paper. The globe itself stays transparent.
const PALETTE = {
  moss: '#514b44',
  lichen: '#292622',
  amber: '#746d65',
}

const AWAY = COUNTRIES.filter((c) => c.id !== HOME.id)

export default function Globe() {
  const canvasRef = useRef(null)
  const globeRef = useRef(null)
  const labelRefs = useRef(new Map())
  const [hover, setHover] = useState(null)
  const [selected, setSelected] = useState(null)
  const [live, setLive] = useState(false)

  const setLabelRef = useCallback(
    (id) => (el) => {
      if (el) labelRefs.current.set(id, el)
      else labelRefs.current.delete(id)
    },
    []
  )

  // Hold off on the WebGL context and the country data until the section is
  // close to the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' }
    )
    io.observe(canvasRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!live) return
    let cancelled = false

    loadCountries().then((countries) => {
      if (cancelled || !canvasRef.current) return
      const globe = createGlobe(canvasRef.current, {
        home: HOME,
        nodes: AWAY,
        palette: PALETTE,
        onHover: setHover,
        countries,
        labelRefs,
      })
      globeRef.current = globe
      if (reducedMotion()) globe.setAnimate(false)
    })

    return () => {
      cancelled = true
      globeRef.current?.destroy()
      globeRef.current = null
    }
  }, [live])

  // Keep the globe's lit pin in sync with the side list.
  useEffect(() => {
    globeRef.current?.setActive(hover?.id ?? selected?.id ?? null)
  }, [hover, selected, live])

  // Selecting a country from the list spins the globe to face it.
  const focus = (node) => {
    setSelected(node)
    const globe = globeRef.current
    if (!globe) return
    const { from, to, apply } = globe.focus(node)
    if (reducedMotion()) {
      apply(to)
      return
    }
    const state = { v: from }
    gsap.to(state, {
      v: to,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate: () => apply(state.v),
    })
  }

  const active = hover || selected

  return (
    <section className="world container" id="world" aria-labelledby="world-title">
      <header className="section-head">
        <h2 className="section-title" id="world-title">
          Products across <em>Latin America</em>
        </h2>
        <p className="section-sub">Four products, nine markets</p>
      </header>

      <div className="world-stage">
        <div className="world-canvas-wrap">
          <canvas
            className="world-canvas"
            ref={canvasRef}
            aria-hidden="true"
            data-cursor="label"
            data-cursor-label="Drag"
          />
          <div className="world-labels" aria-hidden="true">
            {COUNTRIES.map((c) => (
              <span
                key={c.id}
                ref={setLabelRef(c.id)}
                className={`world-label ${active?.id === c.id ? 'is-active' : ''} ${
                  c.id === HOME.id ? 'is-home' : ''
                }`}
              >
                <b>{c.name}</b>
                <em>{c.clients.map((x) => x.name).join(' · ')}</em>
              </span>
            ))}
          </div>
          <p className="world-hint mono" aria-hidden="true">
            Drag to rotate
          </p>
        </div>

        <div className="world-side">
          <p className="world-lead">
            Product design for {CLIENTS.map((c) => c.name).join(', ')}. The complete world map
            stays visible, Colombia anchors the view, and each point marks a market touched by
            the work.
          </p>

          <ul className="world-clients">
            {CLIENTS.map((c) => (
              <li key={c.id}>
                <span className="client-name">{c.name}</span>
                <span className="client-kind">{c.kind}</span>
                <span className="client-count mono">
                  {c.countries.length} {c.countries.length === 1 ? 'market' : 'markets'}
                </span>
              </li>
            ))}
          </ul>

          <ul className="world-list">
            {COUNTRIES.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`world-city ${c.id === HOME.id ? 'is-home' : ''} ${
                    active?.id === c.id ? 'is-active' : ''
                  }`}
                  onClick={() => focus(c)}
                  onFocus={() => setSelected(c)}
                  onPointerEnter={() => setSelected(c)}
                  data-cursor="link"
                >
                  <span className="world-city-name">
                    {c.name}
                    {c.id === HOME.id && <i className="world-city-tag">base</i>}
                  </span>
                  <span className="world-city-meta">
                    {c.clients.map((x) => x.name).join(' · ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
