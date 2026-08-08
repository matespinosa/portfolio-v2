import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** Subsequence match, so "sw" finds "selected work". */
function matches(query, text) {
  if (!query) return true
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let i = 0
  for (const char of t) {
    if (char === q[i]) i += 1
    if (i === q.length) return true
  }
  return false
}

export default function CommandPalette({ open, onClose, commands }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const results = useMemo(
    () => commands.filter((c) => matches(query, `${c.group} ${c.label}`)),
    [commands, query]
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setIndex(0)
    // Focus after paint so the dialog is in the tree.
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    setIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const command = results[index]
        if (command) {
          onClose()
          command.run()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, index, onClose])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [index])

  if (!open) return null

  return createPortal(
    <div className="palette-scrim" onPointerDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="palette-input">
          <span className="palette-prompt mono" aria-hidden="true">
            ›
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section, toggle a tool…"
            aria-label="Search commands"
            spellCheck="false"
          />
          <kbd>esc</kbd>
        </div>

        <ul className="palette-list" ref={listRef}>
          {results.map((command, i) => (
            <li key={command.id}>
              <button
                type="button"
                data-active={i === index}
                onPointerEnter={() => setIndex(i)}
                onClick={() => {
                  onClose()
                  command.run()
                }}
              >
                <span className="palette-group mono">{command.group}</span>
                <span className="palette-label">{command.label}</span>
                {command.hint && <kbd>{command.hint}</kbd>}
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="palette-empty">No command matches “{query}”</li>}
        </ul>
      </div>
    </div>,
    document.body
  )
}
