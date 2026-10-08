// A mobile keyboard can resize/pan the visual viewport without changing 100dvh.
export function observeChatViewport(element, view = window) {
  const viewport = view.visualViewport
  let frame = null

  const update = () => {
    frame = null
    // Let people zoom normally; do not resize the interface to counter their zoom.
    if (viewport && viewport.scale > 1.01) return
    const height = viewport?.height || view.innerHeight
    element.style.setProperty('--chat-viewport-height', `${height}px`)
    element.style.setProperty('--chat-viewport-top', `${Math.max(0, viewport?.offsetTop || 0)}px`)
    element.dataset.compact = height < 600 ? 'true' : 'false'
  }
  const scheduleUpdate = () => {
    if (frame === null) frame = view.requestAnimationFrame(update)
  }

  update()
  viewport?.addEventListener('resize', scheduleUpdate)
  viewport?.addEventListener('scroll', scheduleUpdate)
  view.addEventListener('resize', scheduleUpdate)

  return () => {
    if (frame !== null) view.cancelAnimationFrame(frame)
    viewport?.removeEventListener('resize', scheduleUpdate)
    viewport?.removeEventListener('scroll', scheduleUpdate)
    view.removeEventListener('resize', scheduleUpdate)
    element.style.removeProperty('--chat-viewport-height')
    element.style.removeProperty('--chat-viewport-top')
    delete element.dataset.compact
  }
}
