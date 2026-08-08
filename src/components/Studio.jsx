import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { TOKENS, formatToken } from '../lib/tokens'
import { reducedMotion } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

const STACK = ['React', 'Next.js', 'HTML', 'CSS', 'JavaScript', 'Cursor', 'Codex', 'Claude']

/** Ruler ticks along a panel edge, like a canvas tool. */
function Ruler({ orientation }) {
  const ticks = Array.from({ length: orientation === 'top' ? 24 : 14 })
  return (
    <div className={`ruler ruler-${orientation}`} aria-hidden="true">
      {ticks.map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <i key={i} className={i % 4 === 0 ? 'tick is-major' : 'tick'}>
          {i % 4 === 0 && <span>{i * 8}</span>}
        </i>
      ))}
    </div>
  )
}

function TokenTable({ format }) {
  return (
    <ul className="tokens">
      {TOKENS.slice(0, 5).map((t) => (
        <li className="token" key={t.name}>
          <span className="token-chip" style={{ background: `var(${t.name})` }} />
          <code className="token-name">{t.name}</code>
          <code className="token-value">{formatToken(t, format)}</code>
        </li>
      ))}
    </ul>
  )
}

function EasingCurve() {
  const ref = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to('.curve-dot', {
        motionPath: { path: '.curve-path', align: '.curve-path', alignOrigin: [0.5, 0.5] },
        duration: 1.6,
        ease: 'none',
        repeat: -1,
        repeatDelay: 0.5,
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div className="curve" ref={ref}>
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true">
        <path d="M4 76h112M4 76V4" stroke="var(--line-strong)" strokeWidth="1" />
        <path
          className="curve-path"
          d="M4 76C30.4 76 41.2 4 116 4"
          stroke="var(--primary)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle className="curve-dot" r="3.5" fill="var(--primary)" />
      </svg>
      <code className="curve-label">cubic-bezier(0.22, 1, 0.36, 1)</code>
    </div>
  )
}

function SpecMock() {
  return (
    <div className="spec" aria-hidden="true">
      <div className="spec-target">
        <span className="spec-btn">Publish</span>
        <span className="spec-rule spec-rule-x">
          <span className="spec-num">20</span>
        </span>
        <span className="spec-rule spec-rule-y">
          <span className="spec-num">12</span>
        </span>
      </div>
      <p className="spec-caption">Every state, every edge, drawn before it&rsquo;s built.</p>
    </div>
  )
}

const PANELS = [
  {
    id: 'systems',
    file: 'design-system.tokens',
    title: 'Design systems',
    copy: 'Tokens, components and documentation that connect product decisions to implementation and give teams a reliable way to scale.',
    className: 'panel-lead',
  },
  {
    id: 'product',
    file: 'flows.spec',
    title: 'Product design',
    copy: 'Financial products, merchant operations and the high-consequence states complex platforms cannot afford to skip.',
  },
  {
    id: 'motion',
    file: 'motion.curve',
    title: 'Motion',
    copy: 'Interaction and prototyping used to clarify state, hierarchy and product behavior.',
  },
  {
    id: 'frontend',
    file: 'runtime.glsl',
    title: 'Creative frontend',
    copy: 'React and Next.js bring design closer to the browser. Cursor, Codex and Claude extend that loop from idea to working prototype.',
    className: 'panel-wide',
  },
]

export default function Studio({ format }) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.panel', {
        y: 34,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.bento', start: 'top 82%', once: true },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="studio container" id="studio" ref={rootRef} aria-labelledby="studio-title">
      <header className="section-head">
        <h2 className="section-title" id="studio-title">
          The studio, <em>as a product</em>
        </h2>
        <p className="section-sub">Four disciplines, one operating system</p>
      </header>

      <div className="bento" data-inspect="Studio / bento">
        {PANELS.map((panel) => (
          <article className={`panel ${panel.className || ''}`} key={panel.id}>
            <header className="panel-tab">
              <span className="panel-dot" aria-hidden="true" />
              <code>{panel.file}</code>
            </header>

            <Ruler orientation="top" />

            <div className="panel-inner">
              <div className="panel-head">
                <h3>{panel.title}</h3>
                <p>{panel.copy}</p>
              </div>

              {panel.id === 'systems' && (
                <>
                  <TokenTable format={format} />
                  <p className="panel-foot">
                    Live values, read from this page&rsquo;s own <code>:root</code>
                  </p>
                </>
              )}
              {panel.id === 'product' && <SpecMock />}
              {panel.id === 'motion' && <EasingCurve />}
              {panel.id === 'frontend' && (
                <ul className="stack">
                  {STACK.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
