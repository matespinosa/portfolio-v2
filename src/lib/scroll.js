import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function initSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 1.15, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollToTarget(target) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (typeof target === 'number') window.scrollTo(0, target)
    else el?.scrollIntoView()
  }
}

export function lockScroll(locked) {
  if (!lenis) {
    document.documentElement.style.overflow = locked ? 'hidden' : ''
    return
  }
  if (locked) lenis.stop()
  else lenis.start()
}

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const finePointer = () =>
  window.matchMedia('(pointer: fine)').matches
