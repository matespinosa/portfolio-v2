import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import { reducedMotion, scrollToTarget } from '../lib/scroll'

const INITIAL_LINES = [
  { kind: 'command', text: '$ whoami' },
  { kind: 'response', text: 'Mateo Espinosa · Product Designer + frontend practice' },
  { kind: 'muted', text: '6+ years turning financial and operational complexity into clear products.' },
]

const NAVIGATION = {
  work: { target: '#work', message: 'Opening selected case studies.' },
  studio: { target: '#studio', message: 'Opening the product design practice.' },
  world: { target: '#world', message: 'Opening markets and teams.' },
  practice: { target: '#practice', message: 'Opening Mateo’s background.' },
  chat: { target: '#chat', message: 'Opening the local portfolio guide.' },
}

const IDLE_DEMOS = [
  { command: 'chat', response: 'Ask the portfolio about Mateo’s work and experience.' },
  { command: 'work', response: 'Navigate to selected financial and merchant products.' },
  { command: 'ask fintech experience', response: 'Prepare a question for the local portfolio guide.' },
  { command: 'open rappi', response: 'Open the Rappi Merchants case study.' },
]

export default function HeroTerminal() {
  const [history, setHistory] = useState(INITIAL_LINES)
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [idleIndex, setIdleIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (focused || value || reducedMotion()) return undefined
    const timer = window.setInterval(() => {
      setIdleIndex((current) => (current + 1) % IDLE_DEMOS.length)
    }, 4600)
    return () => window.clearInterval(timer)
  }, [focused, value])

  const runCommand = (raw) => {
    const command = raw.trim().toLowerCase()
    if (!command) return

    if (command === 'clear') {
      setHistory([])
      setValue('')
      return
    }

    const base = [...history.slice(-7), { kind: 'command', text: '$ ' + command }]
    const destination = NAVIGATION[command]

    if (destination) {
      setHistory([...base, { kind: 'response', text: destination.message }])
      window.setTimeout(() => {
        scrollToTarget(destination.target)
        if (command === 'chat') window.dispatchEvent(new CustomEvent('portfolio:focus-chat'))
      }, 120)
    } else if (command === 'help') {
      setHistory([
        ...base,
        { kind: 'response', text: 'chat · ask [question] · work · studio · world · practice · open [project] · clear' },
      ])
    } else if (command.startsWith('ask ')) {
      const question = raw.trim().slice(4).trim()
      setHistory([...base, { kind: 'response', text: 'Question ready in the local portfolio guide.' }])
      window.setTimeout(() => {
        scrollToTarget('#chat')
        window.dispatchEvent(
          new CustomEvent('portfolio:focus-chat', { detail: { question } }),
        )
      }, 120)
    } else if (command === 'contact') {
      setHistory([...base, { kind: 'response', text: 'Opening the contact section.' }])
      window.setTimeout(() => scrollToTarget('#contact'), 120)
    } else if (command.startsWith('open ')) {
      const requested = command.slice(5).trim()
      const project = projects.find(
        (item) => item.id === requested || item.title.toLowerCase() === requested,
      )

      if (project) {
        setHistory([...base, { kind: 'response', text: 'Opening ' + project.title + '.' }])
        window.setTimeout(() => {
          document.querySelector('[data-project="' + project.id + '"]')?.click()
        }, 120)
      } else {
        setHistory([
          ...base,
          { kind: 'error', text: 'Project not found. Try: ' + projects.map((item) => item.id).join(', ') },
        ])
      }
    } else {
      setHistory([...base, { kind: 'error', text: 'Unknown command. Type help.' }])
    }

    setValue('')
  }

  const demo = IDLE_DEMOS[idleIndex]

  return (
    <section
      className="portfolio-terminal"
      aria-label="Interactive portfolio terminal"
      onClick={() => inputRef.current?.focus()}
    >
      <header className="portfolio-terminal__bar">
        <span>mateo@portfolio:~</span>
        <span className="portfolio-terminal__status">
          <i aria-hidden="true" /> interactive
        </span>
      </header>

      <div className="portfolio-terminal__output" aria-live="polite">
        {history.map((line, index) => (
          <p className={'is-' + line.kind} key={line.text + index}>
            {line.text}
          </p>
        ))}

        {!focused && !value && (
          <div className="portfolio-terminal__demo" aria-hidden="true" key={idleIndex}>
            <p>
              <span>$</span> <code>{demo.command}</code>
            </p>
            <small>{demo.response}</small>
          </div>
        )}
      </div>

      <form
        className="portfolio-terminal__input"
        onSubmit={(event) => {
          event.preventDefault()
          runCommand(value)
        }}
      >
        <label className="visually-hidden" htmlFor="portfolio-command">
          Portfolio command
        </label>
        <span aria-hidden="true">$</span>
        <input
          id="portfolio-command"
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="type a command"
          autoComplete="off"
          spellCheck="false"
        />
        <button type="submit">Run</button>
      </form>
    </section>
  )
}
