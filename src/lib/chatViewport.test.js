import assert from 'node:assert/strict'
import test from 'node:test'
import { observeChatViewport } from './chatViewport.js'

function setup(withViewport = true) {
  const values = new Map()
  const element = {
    style: {
      setProperty: (key, value) => values.set(key, value),
      removeProperty: (key) => values.delete(key),
    },
    dataset: {},
  }
  const view = new EventTarget()
  view.innerHeight = 844
  if (withViewport) view.visualViewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 })
  const frames = new Map()
  let nextFrame = 0
  view.requestAnimationFrame = (callback) => { frames.set(++nextFrame, callback); return nextFrame }
  view.cancelAnimationFrame = (id) => frames.delete(id)
  const flush = () => {
    const callbacks = [...frames.values()]
    frames.clear()
    callbacks.forEach((callback) => callback())
  }
  return { element, values, view, frames, flush }
}

test('fits the chat to the visible keyboard space and follows viewport panning', () => {
  const { element, values, view, flush } = setup()
  const cleanup = observeChatViewport(element, view)
  assert.equal(values.get('--chat-viewport-height'), '844px')
  Object.assign(view.visualViewport, { height: 420, offsetTop: 87 })
  view.visualViewport.dispatchEvent(new Event('resize'))
  view.visualViewport.dispatchEvent(new Event('scroll'))
  flush()
  assert.equal(values.get('--chat-viewport-height'), '420px')
  assert.equal(values.get('--chat-viewport-top'), '87px')
  assert.equal(element.dataset.compact, 'true')
  view.visualViewport.height = 844
  view.visualViewport.offsetTop = 0
  view.visualViewport.dispatchEvent(new Event('resize'))
  flush()
  assert.equal(element.dataset.compact, 'false')
  cleanup()
})

test('leaves deliberate pinch zoom alone', () => {
  const { element, values, view, flush } = setup()
  const cleanup = observeChatViewport(element, view)
  Object.assign(view.visualViewport, { height: 300, offsetTop: 40, scale: 2 })
  view.visualViewport.dispatchEvent(new Event('resize'))
  flush()
  assert.equal(values.get('--chat-viewport-height'), '844px')
  assert.equal(values.get('--chat-viewport-top'), '0px')
  cleanup()
})

test('falls back to window height when VisualViewport is unavailable', () => {
  const { element, values, view, flush } = setup(false)
  const cleanup = observeChatViewport(element, view)
  view.innerHeight = 380
  view.dispatchEvent(new Event('resize'))
  flush()
  assert.equal(values.get('--chat-viewport-height'), '380px')
  cleanup()
})

test('closing cancels pending updates and removes viewport listeners/styles', () => {
  const { element, values, view, frames, flush } = setup()
  const cleanup = observeChatViewport(element, view)
  view.visualViewport.dispatchEvent(new Event('resize'))
  cleanup()
  assert.equal(frames.size, 0)
  view.visualViewport.dispatchEvent(new Event('resize'))
  view.visualViewport.dispatchEvent(new Event('scroll'))
  view.dispatchEvent(new Event('resize'))
  flush()
  assert.equal(values.size, 0)
  assert.equal(element.dataset.compact, undefined)
})
