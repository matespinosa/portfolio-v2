/**
 * The palette lives here as OKLCH triplets so the Token Switcher can re-emit
 * the exact same colors in three notations at runtime. Conversion is the real
 * OKLab pipeline (OKLab → LMS → linear sRGB → sRGB), not an approximation.
 */

export const TOKENS = [
  { name: '--surface', label: 'surface', l: 0.909, c: 0.019, h: 79 },
  { name: '--surface-raised', label: 'raised', l: 0.952, c: 0.013, h: 82 },
  { name: '--surface-sunken', label: 'sunken', l: 0.869, c: 0.024, h: 76 },
  { name: '--ink', label: 'ink', l: 0.235, c: 0.019, h: 62 },
  { name: '--muted', label: 'muted', l: 0.505, c: 0.021, h: 68 },
  { name: '--primary', label: 'primary', l: 0.29, c: 0.018, h: 62 },
  { name: '--signal', label: 'signal', l: 0.44, c: 0.02, h: 62 },
]

export const FORMATS = ['oklch', 'hex', 'rgb']

/** OKLCH → sRGB [0-255]. Clamped to gamut by channel. */
export function oklchToRgb(L, C, H) {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]

  return lin.map((v) => {
    const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
  })
}

const pad = (n) => n.toString(16).padStart(2, '0')

export function formatToken(token, format) {
  if (format === 'oklch') {
    return `oklch(${token.l} ${token.c} ${token.h})`
  }
  const [r, g, b] = oklchToRgb(token.l, token.c, token.h)
  if (format === 'hex') return `#${pad(r)}${pad(g)}${pad(b)}`
  return `rgb(${r} ${g} ${b})`
}

/** Rewrites every token on :root in the requested notation. */
export function applyFormat(format) {
  const root = document.documentElement
  for (const token of TOKENS) {
    root.style.setProperty(token.name, formatToken(token, format))
  }
  root.dataset.colorFormat = format
}

/** The rgb() string for a token, for canvas/WebGL consumers. */
export function tokenRgb(name) {
  const token = TOKENS.find((t) => t.name === name)
  if (!token) return '#000'
  const [r, g, b] = oklchToRgb(token.l, token.c, token.h)
  return `rgb(${r}, ${g}, ${b})`
}

export function tokenHex(name) {
  const token = TOKENS.find((t) => t.name === name)
  if (!token) return '#000000'
  return formatToken(token, 'hex')
}
