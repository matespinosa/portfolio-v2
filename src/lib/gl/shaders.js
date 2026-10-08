// Shared GLSL chunks + materials.

export const NOISE_GLSL = /* glsl */ `
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p = p * 2.02 + vec2(13.7, 7.1);
      a *= 0.5;
    }
    return v;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
`

export const QUAD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/**
 * Warm fluid orb for the AI chat: one soft sphere whose interior is a slowly
 * domain-warped mix of rose, orange and amber, with a pale halo and a faint
 * static grain so it sits on the paper like the rest of the page.
 *
 * State drives the motion: `uEnergy` speeds the flow, `uListen` makes the
 * sphere breathe, `uType` adds a quick tremor and `uThink` swirls the fluid.
 * Output is premultiplied sRGB; keep tone mapping and the colorspace chunk
 * off or the palette washes out.
 */
export const ORB_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uEnergy;
  uniform float uListen;
  uniform float uThink;
  uniform float uType;
  uniform vec2 uRes;
  uniform vec2 uPointer;
  uniform vec3 uPaper;

  varying vec2 vUv;

  ${NOISE_GLSL}

  const vec3 ROSE = vec3(0.898, 0.282, 0.310);
  const vec3 ORANGE = vec3(0.941, 0.478, 0.235);
  const vec3 AMBER = vec3(0.965, 0.710, 0.271);
  const vec3 HALO = vec3(0.973, 0.851, 0.800);

  mat2 rotate2(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  vec3 fluid(vec2 q, float t) {
    q = rotate2(t * 0.16 + uThink * t * 0.45) * q;
    vec2 w = vec2(
      snoise(q * 0.45 + vec2(t, 0.0)),
      snoise(q * 0.45 + vec2(-t * 0.8, t * 0.3) + 3.1)
    );
    float n = snoise(q * 0.5 + 0.9 * w + vec2(0.0, t * 0.4)) * 0.3;
    // Large soft zones: rose low-left, orange through the middle, amber high-right.
    float field = clamp(0.36 + n + q.x * 0.26 + q.y * 0.36, 0.0, 1.0);
    vec3 c = mix(ROSE, ORANGE, smoothstep(0.0, 0.55, field));
    c = mix(c, AMBER, smoothstep(0.45, 1.0, field));
    return c;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float aspect = uRes.x / max(uRes.y, 1.0);
    if (aspect > 1.0) p.x *= aspect;
    else p.y /= aspect;

    float t = uTime * (0.30 + uEnergy * 0.8);
    float radius = 0.64 * (
      1.0
      + (0.012 + uListen * 0.05) * sin(uTime * (1.6 + uListen * 6.0))
      + uType * 0.016 * sin(uTime * 11.0)
    );
    float r = length(p);

    vec2 q = p / radius - uPointer * 0.16;
    vec3 col = fluid(q, t);

    // Pale highlight in the upper right, like light caught in the fluid.
    float light = 1.0 - smoothstep(0.0, 0.8, length(q - vec2(0.3, 0.4)));
    col = mix(col, vec3(1.0, 0.95, 0.83), light * 0.36);

    float core = 1.0 - smoothstep(radius * 0.62, radius * 1.04, r);
    float halo = 1.0 - smoothstep(radius * 0.9, radius * 1.45, r);
    vec3 haloColor = mix(uPaper, HALO, 0.75);

    col = mix(haloColor, col, core);

    // Static grain: part of the sphere, not an animated overlay.
    float grain = hash(floor(gl_FragCoord.xy * 0.7)) - 0.5;
    col += grain * 0.04 * core;

    float alpha = clamp(max(core, halo * 0.78), 0.0, 1.0);
    gl_FragColor = vec4(col * alpha, alpha);
  }
`

/**
 * Film grain over the whole page. Two layers: static paper fiber (so the
 * surface reads as stock, not as a screen) and animated fine grain. Output
 * sits around mid-grey and is composited with `overlay`, so it lifts and
 * darkens by a few percent instead of veiling the page.
 */
export const GRAIN_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uIntensity;
  varying vec2 vUv;

  ${NOISE_GLSL}

  void main() {
    vec2 px = vUv * uRes;

    // Animated fine grain, resampled in blocks so it reads as film, not TV static.
    float t = floor(uTime * 24.0);
    float fine = hash(floor(px * 0.85) + t * 37.0) - 0.5;

    // Static fibre: very low frequency, never moves.
    float fibre = fbm(vUv * vec2(uRes.x / max(uRes.y, 1.0), 1.0) * 2.4) * 0.5;

    float g = 0.5 + (fine * 0.85 + fibre * 0.15) * uIntensity;
    gl_FragColor = vec4(vec3(g), 1.0);
    #include <colorspace_fragment>
  }
`

/**
 * Hero field: a sheet of warm paper with a few instrument-like solids on it,
 * lit by a lamp that trails the cursor. Shadows are marched in 2D — cheap,
 * and genuinely soft. Cursor acceleration widens the penumbra, so quick moves
 * smear the light the way a real lamp swung by hand would.
 */
export const HERO_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uLight;
  uniform float uSpeed;
  uniform float uIntro;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uPrimary;
  varying vec2 vUv;

  ${NOISE_GLSL}

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + r;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }

  float map(vec2 p) {
    float drift = sin(uTime * 0.18) * 0.012;
    float d = sdRoundBox(p - vec2(-0.62, 0.16 + drift), vec2(0.34, 0.028), 0.028);
    d = min(d, sdCircle(p - vec2(0.52, -0.24 - drift), 0.115));
    d = min(d, sdRoundBox(p - vec2(0.30, 0.30), vec2(0.018, 0.19), 0.018));
    d = min(d, sdCircle(p - vec2(-0.20, -0.40 + drift), 0.055));
    d = min(d, sdRoundBox(p - vec2(0.70, 0.22), vec2(0.10, 0.10), 0.10));
    return d;
  }

  // Classic 2D soft-shadow march: track the tightest miss along the ray.
  float marchShadow(vec2 ro, vec2 rd, float maxT, float k) {
    float res = 1.0;
    float t = 0.03;
    for (int i = 0; i < 40; i++) {
      float h = map(ro + rd * t);
      if (h < 0.0015) return 0.0;
      res = min(res, k * h / t);
      t += clamp(h, 0.012, 0.18);
      if (t > maxT) break;
    }
    return clamp(res, 0.0, 1.0);
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.0;
    vec2 lp = (uLight - 0.5) * vec2(aspect, 1.0) * 2.0;

    vec3 col = uPaper;

    vec2 toLight = lp - p;
    float distL = length(toLight);
    vec2 rd = toLight / max(distL, 1e-4);

    // Fast cursor = wider penumbra.
    float sharpness = mix(14.0, 3.5, clamp(uSpeed, 0.0, 1.0));
    float sh = marchShadow(p, rd, distL, sharpness);

    float falloff = 1.0 / (1.0 + distL * distL * 0.55);
    float lit = sh * falloff;

    // Shadows tint toward ink, never to pure grey.
    col = mix(col, mix(uInk, uPaper, 0.72), (1.0 - lit) * 0.42);
    // Gentle warm lift where the lamp sits.
    col += (uPaper - col) * lit * 0.25;
    col += uPrimary * lit * 0.035;

    // The solids themselves, a touch darker than the sheet.
    float d = map(p);
    float solid = smoothstep(0.004, -0.004, d);
    vec3 body = mix(uPaper, uInk, 0.10 + 0.06 * (1.0 - lit));
    col = mix(col, body, solid);

    // A hairline of primary along each edge catches the lamp.
    float edge = smoothstep(0.012, 0.0, abs(d)) * lit;
    col = mix(col, uPrimary, edge * 0.28);

    float vig = smoothstep(1.6, 0.35, length(vUv - 0.5) * 1.7);
    col *= mix(0.965, 1.0, vig);

    col = mix(uPaper, col, uIntro);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

/**
 * Project covers: posterized topographic terraces. Sampling the height field
 * at three offsets drives chromatic dispersion — the channels separate on
 * hover and settle back as `uDisperse` returns to zero.
 */
export const COVER_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uSeed;
  uniform float uFreq;
  uniform float uWarp;
  uniform float uKick;
  uniform float uDisperse;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;

  ${NOISE_GLSL}

  float height(vec2 p, float t) {
    vec2 focal = vec2(sin(uSeed * 1.7), cos(uSeed * 2.3)) * 0.22;
    float d = length(p - focal);
    float n = fbm(p * 1.4 + uSeed + t);
    float n2 = fbm(p * 3.1 + uSeed * 2.0 - t * 0.7);
    return clamp(1.0 - d * 1.5 + n * (0.14 + uWarp * 0.04 + uKick * 0.4) + n2 * 0.04, 0.0, 1.0);
  }

  vec3 shade(float h) {
    float levels = uFreq;
    float terrace = floor(h * levels) / max(levels - 1.0, 1.0);
    float blendH = mix(terrace, h, 0.3);
    float f = fract(h * levels);
    float contour = 1.0 - smoothstep(0.015, 0.08, min(f, 1.0 - f));
    contour *= smoothstep(0.005, 0.06, h);

    vec3 col = mix(uColorA, uColorB, blendH * 0.9);
    col = mix(col, uColorC, contour * (0.3 + 0.6 * terrace));
    col = mix(col, uColorC, smoothstep(0.93, 1.0, h) * 0.55);
    return col;
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.05;

    // Split the sampling point per channel; the gap is the dispersion.
    vec2 dir = normalize(p + vec2(0.0001));
    float amt = uDisperse * 0.055;

    vec3 col;
    col.r = shade(height(p + dir * amt, t)).r;
    col.g = shade(height(p, t)).g;
    col.b = shade(height(p - dir * amt, t)).b;

    float n = fbm(p * 1.4 + uSeed + t);
    col *= 0.92 + 0.16 * n;

    float vig = smoothstep(1.5, 0.45, length(vUv - 0.5) * 1.8);
    col *= mix(0.78, 1.0, vig);

    col += hash(vUv * uRes + uSeed) * 0.05 - 0.025;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`
