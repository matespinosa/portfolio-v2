import { feature } from 'topojson-client'

/**
 * Natural Earth 110m country boundaries, loaded on demand so the ~105 kB of
 * TopoJSON never touches the initial bundle.
 */
export async function loadCountries() {
  const topo = (await import('world-atlas/countries-110m.json')).default
  return feature(topo, topo.objects.countries).features
}

const polygonsOf = (geometry) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates

/**
 * Makes a ring's longitudes continuous. Rings that straddle the antimeridian
 * (Russia, Fiji) otherwise jump ±360° mid-path and smear across the map.
 */
function unwrapRing(ring) {
  const out = [ring[0].slice()]
  for (let i = 1; i < ring.length; i++) {
    let [lon, lat] = ring[i]
    const prev = out[i - 1][0]
    while (lon - prev > 180) lon -= 360
    while (lon - prev < -180) lon += 360
    out.push([lon, lat])
  }
  return out
}

/**
 * Rasterizes the countries into an equirectangular bitmap so land lookup is
 * O(1) per sample: red channel = land, green channel = a highlighted country.
 * Far cheaper than running point-in-polygon over every dot.
 */
export function buildLandMask(features, highlighted, W = 2048, H = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  const paint = (f, color) => {
    ctx.fillStyle = color
    for (const poly of polygonsOf(f.geometry)) {
      // Draw at three longitudinal offsets so shapes that run off one edge
      // reappear on the other.
      for (const offset of [-360, 0, 360]) {
        ctx.beginPath()
        for (const ring of poly) {
          unwrapRing(ring).forEach(([lon, lat], i) => {
            const x = ((lon + offset + 180) / 360) * W
            const y = ((90 - lat) / 180) * H
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.closePath()
        }
        // even-odd so interior rings read as holes, not fill
        ctx.fill('evenodd')
      }
    }
  }

  features.forEach((f) => paint(f, '#ff0000'))
  features
    .filter((f) => highlighted.has(f.properties.name))
    .forEach((f) => paint(f, '#00ff00'))

  return { data: ctx.getImageData(0, 0, W, H).data, W, H }
}

/** 0 = ocean, 1 = land, 2 = a country the work shipped in. */
export function sampleLandMask(mask, lat, lon) {
  const x = Math.min(mask.W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * mask.W)))
  const y = Math.min(mask.H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * mask.H)))
  const i = (y * mask.W + x) * 4
  if (mask.data[i + 1] > 128) return 2
  if (mask.data[i] > 128) return 1
  return 0
}

/**
 * Coastlines and borders as [lat1, lon1, lat2, lon2] pairs, ready to lift onto
 * the sphere. Segments spanning the antimeridian are dropped rather than drawn
 * the long way around.
 */
export function outlineSegments(features, predicate) {
  const out = []
  for (const f of features) {
    if (predicate && !predicate(f)) continue
    for (const poly of polygonsOf(f.geometry)) {
      for (const ring of poly) {
        for (let i = 0; i < ring.length - 1; i++) {
          const [lon1, lat1] = ring[i]
          const [lon2, lat2] = ring[i + 1]
          if (Math.abs(lon2 - lon1) > 180) continue
          out.push(lat1, lon1, lat2, lon2)
        }
      }
    }
  }
  return out
}
