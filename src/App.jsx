import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import PortfolioChat from './components/PortfolioChat'
import Studio from './components/Studio'
import Work from './components/Work'
import Globe from './components/Globe'
import About from './components/About'
import Record from './components/Record'
import Footer from './components/Footer'
import CaseOverlay from './components/CaseOverlay'
import Hud from './components/Hud'
import CommandPalette from './components/CommandPalette'
import DrawCanvas from './components/DrawCanvas'
import Inspector from './components/Inspector'
import Grain from './components/Grain'
import { initSmoothScroll, reducedMotion, scrollToTarget } from './lib/scroll'
import { FORMATS, applyFormat } from './lib/tokens'

const SECTIONS = [
  { id: '#top', label: 'Hero' },
  { id: '#chat', label: 'Guide' },
  { id: '#studio', label: 'The studio' },
  { id: '#work', label: 'Selected work' },
  { id: '#world', label: 'Markets' },
  { id: '#practice', label: 'Practice' },
  { id: '#contact', label: 'Contact' },
]

export default function App() {
  const [ready, setReady] = useState(false)
  const [activeCase, setActiveCase] = useState(null)
  const [tools, setTools] = useState({ draw: false, grid: false, inspect: false })
  const [format, setFormat] = useState('oklch')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const drawApi = useRef(null)

  useEffect(() => {
    applyFormat('oklch')
    if (!reducedMotion()) initSmoothScroll()
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  const toggle = useCallback((id) => {
    setTools((t) => ({ ...t, [id]: !t[id] }))
  }, [])

  // Tool state drives body classes so CSS can react (cursor, guides).
  useEffect(() => {
    document.body.classList.toggle('is-drawing', tools.draw)
    document.body.classList.toggle('is-gridded', tools.grid)
    document.body.classList.toggle('is-inspecting', tools.inspect)
  }, [tools])

  const cycleFormat = useCallback(() => {
    setFormat((current) => {
      const next = FORMATS[(FORMATS.indexOf(current) + 1) % FORMATS.length]
      applyFormat(next)
      return next
    })
  }, [])

  const commands = useMemo(
    () => [
      ...SECTIONS.map((s) => ({
        id: `go${s.id}`,
        group: 'go to',
        label: s.label,
        run: () => scrollToTarget(s.id === '#top' ? 0 : s.id),
      })),
      { id: 'draw', group: 'tool', label: 'Toggle draw mode', hint: 'D', run: () => toggle('draw') },
      { id: 'grid', group: 'tool', label: 'Toggle layout grid', hint: 'G', run: () => toggle('grid') },
      {
        id: 'inspect',
        group: 'tool',
        label: 'Toggle element inspector',
        hint: 'I',
        run: () => toggle('inspect'),
      },
      { id: 'clear', group: 'tool', label: 'Clear annotations', run: () => drawApi.current?.clear() },
      {
        id: 'format',
        group: 'tokens',
        label: 'Cycle colour notation (oklch → hex → rgb)',
        run: cycleFormat,
      },
      { id: 'profile', group: 'profile', label: 'Read Mateo’s background', run: () => scrollToTarget('#practice') },
    ],
    [toggle, cycleFormat]
  )

  // Keyboard layer. Single-letter shortcuts stay out of the way while typing.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.target.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      const key = e.key.toLowerCase()
      if (key === 'd') toggle('draw')
      else if (key === 'g') toggle('grid')
      else if (key === 'i') toggle('inspect')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <Preloader onDone={() => setReady(true)} />
      <Nav ready={ready} onCommand={() => setPaletteOpen(true)} />

      <main>
        <Hero ready={ready} />
        <PortfolioChat onOpenProject={setActiveCase} />
        <Studio format={format} />
        <Work onOpen={setActiveCase} />
        <Globe />
        <About />
        <Record />
      </main>
      <Footer />

      <CaseOverlay
        project={activeCase}
        onNavigate={setActiveCase}
        onClose={() => setActiveCase(null)}
      />

      <DrawCanvas active={tools.draw} apiRef={drawApi} />
      <Inspector active={tools.inspect} />
      {tools.grid && <div className="grid-overlay" aria-hidden="true" />}

      <Hud tools={tools} onToggle={toggle} format={format} onFormat={setFormat} />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />

      <Cursor drawing={tools.draw} />
      <Grain />
    </>
  )
}
