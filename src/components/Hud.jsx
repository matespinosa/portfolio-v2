import { useEffect, useRef, useState } from 'react'
import { TOKENS, FORMATS, formatToken, applyFormat } from '../lib/tokens'

const SHOWN_TOKENS = ['--primary', '--surface']

/**
 * Corner instrument panel: live frame telemetry, the notation switcher that
 * rewrites the real custom properties on :root, and the tool toggles.
 */
export default function Hud({ tools, onToggle, format, onFormat }) {
  const [fps, setFps] = useState(60)
  const [latency, setLatency] = useState(0)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [open, setOpen] = useState(false)
  const frames = useRef({ count: 0, last: performance.now(), acc: 0 })

  // Frame telemetry, sampled once a second so the readout doesn't thrash.
  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = now - prev
      prev = now
      const f = frames.current
      f.count += 1
      f.acc += dt
      if (now - f.last >= 1000) {
        setFps(Math.round((f.count * 1000) / (now - f.last)))
        setLatency(Number((f.acc / f.count).toFixed(1)))
        f.count = 0
        f.acc = 0
        f.last = now
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const read = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  const cycleFormat = () => {
    const next = FORMATS[(FORMATS.indexOf(format) + 1) % FORMATS.length]
    applyFormat(next)
    onFormat(next)
  }

  return (
    <aside className={`hud ${open ? '' : 'is-collapsed'}`} aria-label="Instrument panel">
      <header className="hud-bar">
        <span className="hud-dot" data-state={fps >= 50 ? 'ok' : 'warn'} aria-hidden="true" />
        <h2 className="hud-title">runtime</h2>
        <button
          type="button"
          className="hud-collapse"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? '-' : '+'}
        </button>
      </header>

      <div className="hud-body" hidden={!open}>
        <dl className="hud-metrics">
          <div>
            <dt>fps</dt>
            <dd>{fps}</dd>
          </div>
          <div>
            <dt>frame</dt>
            <dd>{latency.toFixed(1)}ms</dd>
          </div>
          <div>
            <dt>viewport</dt>
            <dd>
              {viewport.w}×{viewport.h}
            </dd>
          </div>
        </dl>

        <div className="hud-section">
          <button type="button" className="hud-swatchbar" onClick={cycleFormat}>
            <span className="hud-label">color space</span>
            <span className="hud-format">{format}</span>
          </button>
          <ul className="hud-tokens">
            {TOKENS.filter((t) => SHOWN_TOKENS.includes(t.name)).map((t) => (
              <li key={t.name}>
                <span className="hud-chip" style={{ background: `var(${t.name})` }} />
                <code>{t.name}</code>
                <code className="hud-value">{formatToken(t, format)}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="hud-section hud-tools">
          {[
            { id: 'draw', label: 'Draw', hint: 'D' },
            { id: 'grid', label: 'Grid', hint: 'G' },
            { id: 'inspect', label: 'Inspect', hint: 'I' },
          ].map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`hud-tool ${tools[tool.id] ? 'is-on' : ''}`}
              onClick={() => onToggle(tool.id)}
              aria-pressed={tools[tool.id]}
            >
              {tool.label}
              <kbd>{tool.hint}</kbd>
            </button>
          ))}
        </div>

        <p className="hud-foot">
          <kbd>⌘</kbd>
          <kbd>K</kbd> commands
        </p>
      </div>
    </aside>
  )
}
