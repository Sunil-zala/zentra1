import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './Lightfall.css';

const MAX_COLORS = 8;

type RGB = [number, number, number];

const hexToRGB = (hex: string): RGB => {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [
    Number.parseInt(c.slice(0, 2), 16) / 255,
    Number.parseInt(c.slice(2, 4), 16) / 255,
    Number.parseInt(c.slice(4, 6), 16) / 255,
  ];
};

const prepColors = (input: string[]) => {
  const base = (input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
  const fallback = base[0] ?? '#A6C8FF';
  const arr = Array.from({ length: MAX_COLORS }, (_, index) =>
    hexToRGB(base[Math.min(index, base.length - 1)] ?? fallback),
  );
  const avg = arr.slice(0, base.length).reduce((sum, color) => (
    [sum[0] + color[0], sum[1] + color[1], sum[2] + color[2]]
  ), [0, 0, 0] as RGB).map((value) => value / base.length) as RGB;
  return { arr, count: base.length, avg };
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
precision highp float;
uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform vec3 uColor0; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6; uniform vec3 uColor7;
uniform int uColorCount;
uniform vec3 uBgColor;
uniform vec3 uMouseColor;
uniform float uSpeed;
uniform int uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;
varying vec2 vUv;

vec3 palette(float h) {
  int idx = int(floor(clamp(h, 0.0, 0.999999) * max(float(uColorCount), 1.0)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 p = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 o = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    o = z * normalize(vec4(p, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(o * o));
    z += d;
  }
  return vec2(o.x, atan(o.z, o.y));
}

void mainImage(out vec4 o, vec2 c) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (c + c - r) / r.x;
  float time = 0.1 * iTime * uSpeed + 9.0;
  float rings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 cell = vec2(5e-3, 6.28318530718 / rings);
  vec2 c0 = sceneC(c, r);
  vec2 dx = sceneC(c + vec2(1.0, 0.0), r) - c0;
  vec2 dy = sceneC(c + vec2(0.0, 1.0), r) - c0;
  dx.y -= 6.28318530718 * floor(dx.y / 6.28318530718 + 0.5);
  dy.y -= 6.28318530718 * floor(dy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dx) + abs(dy);
  c = c0;
  vec2 p = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  o = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(p, p) + 6.0), 0.0);
  float mouseGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mouse = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mouse);
    mouseGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    o.rgb += uMouseColor * mouseGlow * 0.25;
  }
  float radius = 5e-4 * uStreakWidth;
  vec2 aa = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);
  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float layer = float(m) + 1.0;
    float random = fract(sin(dot(vec2(layer, floor(c.x / cell.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 point = c - (time + time * random) * vec2(0.0, 1.0);
    point -= floor(point / cell + 0.5) * cell;
    float hue = fract(8663.0 * random);
    float weight = mix(1.5, 1.0 + sin(time + 7.0 * hue + 4.0), uTwinkle) * (1.0 + mouseGlow * 2.0);
    vec2 inner = vec2(length(max(point, vec2(-1.0, 0.0))), length(point) - radius) - radius;
    vec2 shape = vec2(1.0) - smoothstep(-aa, aa, inner);
    o.rgb += dot(shape, vec2(exp(tail * point.y), 3.0)) * palette(hue) * weight;
    c.x += cell.x / 8.0;
  }
  vec3 color = sqrt(tanhv(max(o.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(color, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

interface LightfallProps {
  className?: string;
  dpr?: number;
  paused?: boolean;
  colors?: string[];
  backgroundColor?: string;
  speed?: number;
  streakCount?: number;
  streakWidth?: number;
  streakLength?: number;
  glow?: number;
  density?: number;
  twinkle?: number;
  zoom?: number;
  backgroundGlow?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  mouseDampening?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
}

export default function Lightfall({
  className = '', dpr, paused = false,
  colors = ['#9BFFA0', '#35EAA1', '#B8FFF2'], backgroundColor = '#071A12',
  speed = 0.5, streakCount = 4, streakWidth = 1, streakLength = 1.2,
  glow = 0.9, density = 0.7, twinkle = 0.65, zoom = 3,
  backgroundGlow = 0.45, opacity = 0.8, mouseInteraction = true,
  mouseStrength = 0.45, mouseRadius = 0.8, mouseDampening = 0.15, mixBlendMode,
}: LightfallProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(dpr ?? window.devicePixelRatio ?? 1, 2), alpha: true, antialias: true });
    } catch (error) {
      console.warn('Lightfall: WebGL unavailable, skipping background', error);
      return;
    }
    const gl = renderer.gl;
    if (!gl) return;
    const canvas = gl.canvas;
    container.appendChild(canvas);
    const { arr, count, avg } = prepColors(colors);
    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] }, iTime: { value: 0 },
      uColor0: { value: arr[0] }, uColor1: { value: arr[1] }, uColor2: { value: arr[2] }, uColor3: { value: arr[3] },
      uColor4: { value: arr[4] }, uColor5: { value: arr[5] }, uColor6: { value: arr[6] }, uColor7: { value: arr[7] },
      uColorCount: { value: count }, uBgColor: { value: hexToRGB(backgroundColor) }, uMouseColor: { value: avg },
      uSpeed: { value: speed }, uStreakCount: { value: Math.max(1, Math.min(16, Math.round(streakCount))) },
      uStreakWidth: { value: streakWidth }, uStreakLength: { value: streakLength }, uGlow: { value: glow },
      uDensity: { value: density }, uTwinkle: { value: twinkle }, uZoom: { value: zoom }, uBgGlow: { value: backgroundGlow },
      uOpacity: { value: opacity }, uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: mouseStrength }, uMouseRadius: { value: mouseRadius },
    };
    const program = new Program(gl, { vertex, fragment, uniforms });
    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });
    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1));
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const target = [0, 0];
    let lastTime = 0;
    let frame = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scale = renderer.dpr || 1;
      target[0] = (event.clientX - rect.left) * scale;
      target[1] = (rect.height - (event.clientY - rect.top)) * scale;
    };
    if (mouseInteraction) canvas.addEventListener('pointermove', onPointerMove);
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (paused || reducedMotion) return;
      uniforms.iTime.value = time * 0.001;
      const dt = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;
      const factor = mouseDampening <= 0 ? 1 : Math.min(1, 1 - Math.exp(-dt / Math.max(mouseDampening, 0.0001)));
      const current = uniforms.iMouse.value;
      current[0] = (current[0] ?? 0) + ((target[0] ?? 0) - (current[0] ?? 0)) * factor;
      current[1] = (current[1] ?? 0) + ((target[1] ?? 0) - (current[1] ?? 0)) * factor;
      renderer.render({ scene: mesh });
    };
    try {
      renderer.render({ scene: mesh });
    } catch (error) {
      console.warn('Lightfall: render failed, skipping background', error);
      observer.disconnect();
      canvas.remove();
      return;
    }
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      if (canvas.parentElement === container) container.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [backgroundColor, colors, density, dpr, glow, mouseDampening, mouseInteraction, mouseRadius, mouseStrength, opacity, paused, speed, streakCount, streakLength, streakWidth, twinkle, zoom]);

  return <div ref={containerRef} className={`lightfall-container ${className}`} style={mixBlendMode ? { mixBlendMode } : undefined} aria-hidden="true" />;
}