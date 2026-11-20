import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import './ZentraHero.css';

interface CoverItem {
  url: string;
  title: string;
  artist: string;
}

interface ZentraHeroProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const COUNT = 32;

const THEME = {
  key: 0x9fffc0,
  rim: 0x7fb0ff,
  bg: 0x070707,
  cardBack: 0x181818,
};

// Rich curated fallback covers with reliable high-res music artwork so cards are never blank
const FALLBACK_COVERS: CoverItem[] = [
  { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', title: 'Neon Nights', artist: 'Synthwave Collective' },
  { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', title: 'Live Pulse', artist: 'Electric Symphony' },
  { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', title: 'After Hours', artist: 'The Midnight Echo' },
  { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', title: 'Golden Hour', artist: 'Solaris' },
  { url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80', title: 'Retro Vibes', artist: 'Vinyl Dreams' },
  { url: 'https://images.unsplash.com/photo-1501386761578-eaa54b04b658?w=600&auto=format&fit=crop&q=80', title: 'Festival Anthem', artist: 'Horizon' },
  { url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80', title: 'Deep Space', artist: 'Cosmic Drift' },
  { url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&auto=format&fit=crop&q=80', title: 'Velvet Keys', artist: 'Acoustic Soul' },
  { url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', title: 'Bass Resonance', artist: 'SubFreq' },
  { url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80', title: 'Midnight City', artist: 'Cyberpunk 99' },
  { url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', title: 'Wild Heart', artist: 'Echo Valley' },
  { url: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&auto=format&fit=crop&q=80', title: 'Hyperdrive', artist: 'Starlight' },
  { url: 'https://images.unsplash.com/photo-1468164016595-6108e4c60c8b?w=600&auto=format&fit=crop&q=80', title: 'Drum & Groove', artist: 'Rhythm Engine' },
  { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80', title: 'Club Odyssey', artist: 'DJ Prism' },
  { url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&auto=format&fit=crop&q=80', title: 'Lo-Fi Chill', artist: 'Rainy Days' },
  { url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80', title: 'Guitar Reverie', artist: 'Solitude' },
];

const SEARCH_TERMS = [
  'top hits 2024', 'indie rock', 'synthwave', 'lofi beats', 'classic rock',
  'hip hop', 'jazz standards', 'edm dance', 'acoustic pop', 'r&b soul',
  'k-pop', 'reggaeton', 'ambient electronic', 'folk acoustic', 'metal rock',
  'disco funk'
];

// Helper to create procedural album art canvas texture so cards never appear empty
function createProceduralTexture(title: string, index: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Beautiful modern gradient backgrounds
  const hues = [142, 160, 200, 260, 290, 330, 45, 180];
  const hue = hues[index % hues.length];
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, `hsl(${hue}, 80%, 25%)`);
  grad.addColorStop(0.5, `hsl(${(hue + 40) % 360}, 90%, 15%)`);
  grad.addColorStop(1, '#080808');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Geometric vinyl/sound wave pattern
  ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.18)`;
  ctx.lineWidth = 4;
  for (let r = 50; r < 350; r += 30) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Center emblem
  ctx.fillStyle = `hsl(${hue}, 95%, 45%)`;
  ctx.beginPath();
  ctx.arc(256, 256, 40, 0, Math.PI * 2);
  ctx.fill();

  // Title text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title || 'Zentra', 256, 440);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function ZentraHero({ onSignIn, onSignUp }: ZentraHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(false);
  const [wordmarkVisible, setWordmarkVisible] = useState(false);
  const [linkrowVisible, setLinkrowVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const wrap = containerRef.current;
    let animId: number;
    let isDisposed = false;

    // SCENE SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.5;

    const keyLight = new THREE.DirectionalLight(THEME.key, 2.0);
    keyLight.position.set(-4, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(THEME.rim, 1.0);
    rimLight.position.set(6, 3, -4);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    const getFov = () => (window.innerWidth < window.innerHeight ? 40 : 19.5);
    const camera = new THREE.PerspectiveCamera(getFov(), window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(3.6, 2.15, 7.4);
    camera.lookAt(-1.4, 0.05, -0.6);

    // ALBUM CARD GEOMETRY + MATERIALS
    const geo = new THREE.BoxGeometry(1, 1, 0.05);
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    const backMat = new THREE.MeshStandardMaterial({
      color: THEME.cardBack,
      roughness: 0.75,
      metalness: 0,
    });
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0c,
      roughness: 0.9,
      metalness: 0,
    });

    interface BookState {
      group: THREE.Group;
      mesh: THREE.Mesh;
      baseZ: number;
      y: number;
      vy: number;
      z: number;
      vz: number;
      waveTarget: number;
      risen: boolean;
      riseAt: number;
    }

    const books: BookState[] = [];
    const BASE_Y = -1.12;

    function buildCard(cover: CoverItem, i: number) {
      const group = new THREE.Group();

      const initialTex = createProceduralTexture(cover.title, i);
      const faceMat = new THREE.MeshPhysicalMaterial({
        map: initialTex,
        roughness: 0.38,
        clearcoat: 0.4,
        clearcoatRoughness: 0.4,
      });

      // Attempt to load cover URL and smoothly replace texture
      if (cover.url) {
        loader.load(
          cover.url,
          (tex) => {
            if (isDisposed) return;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            faceMat.map = tex;
            faceMat.needsUpdate = true;
          },
          undefined,
          () => {
            // Keep procedural fallback texture if network error occurs
          }
        );
      }

      // Face order: +x, -x, +y, -y, +z (front, cover), -z (back)
      const mats = [edgeMat, edgeMat, edgeMat, edgeMat, faceMat, backMat];
      const mesh = new THREE.Mesh(geo, mats);
      mesh.userData.track = cover;
      mesh.userData.index = i;
      group.add(mesh);
      return { group, mesh };
    }

    function layout(covers: CoverItem[]) {
      for (let i = 0; i < COUNT; i++) {
        const cover = covers[i % covers.length] || FALLBACK_COVERS[i % FALLBACK_COVERS.length];
        const { group, mesh } = buildCard(cover, i);
        const baseZ = 0.9 + i * -0.2;
        group.position.set(1.55 + i * -0.5, BASE_Y, baseZ);
        group.rotation.y = 0.32;
        scene.add(group);
        books.push({
          group,
          mesh,
          baseZ,
          y: -1.88,
          vy: 0,
          z: 0,
          vz: 0,
          waveTarget: 0,
          risen: false,
          riseAt: 0.25 + (COUNT - i) * 0.035,
        });
      }
    }

    // POINTER WAVE + SPRING PHYSICS
    const pointer = { x: -9999, y: -9999, active: false };
    let lastMove = performance.now();

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      lastMove = performance.now();
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onBlur = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onBlur);

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const onCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(books.map((b) => b.mesh));
      if (hits.length) {
        onSignIn();
      }
    };

    renderer.domElement.addEventListener('click', onCanvasClick);

    const projected = new THREE.Vector3();
    const K = 70;
    const C = 12.5;

    function updateWave(now: number) {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const idle = now - lastMove > 4000;

      let px = pointer.x;
      let py = pointer.y;
      if (coarse || idle || !pointer.active) {
        const u = (Math.sin(now * 0.00045) + 1) / 2;
        const a = books[Math.min(29, books.length - 1)];
        const b = books[Math.min(1, books.length - 1)];
        if (a && b) {
          a.mesh.getWorldPosition(projected);
          projected.project(camera);
          const ax = (projected.x * 0.5 + 0.5) * window.innerWidth;
          const ay = (-projected.y * 0.5 + 0.5) * window.innerHeight;
          b.mesh.getWorldPosition(projected);
          projected.project(camera);
          const bx = (projected.x * 0.5 + 0.5) * window.innerWidth;
          const by = (-projected.y * 0.5 + 0.5) * window.innerHeight;
          px = ax + (bx - ax) * u;
          py = ay + (by - ay) * u;
        }
      }

      const s = Math.max(window.innerWidth, window.innerHeight) * 0.085;
      const waveLive = pointer.active || coarse || idle;
      for (const b of books) {
        b.mesh.getWorldPosition(projected);
        projected.project(camera);
        const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;
        const dx = sx - px;
        const dy = (sy - py) * 0.55;
        const influence = Math.exp(-(dx * dx + dy * dy) / (s * s));
        b.waveTarget = waveLive ? 0.6 * influence : 0;
      }
    }

    function stepSprings(dt: number, t: number) {
      const sub = 4;
      const h = Math.min(dt, 0.05) / sub;
      for (const b of books) {
        if (!b.risen && t > b.riseAt) b.risen = true;
        const target = b.risen ? b.waveTarget : -1.88;

        for (let s = 0; s < sub; s++) {
          b.vy += ((target - b.y) * K - b.vy * C) * h;
          b.y += b.vy * h;
          const targetZ = b.risen ? target * 0.35 : 0;
          b.vz += ((targetZ - b.z) * K - b.vz * C) * h;
          b.z += b.vz * h;
        }
        b.group.position.y = BASE_Y + b.y;
        b.group.position.z = b.baseZ + b.z;
        b.mesh.rotation.x = -b.vy * 0.012;
      }
    }

    let startTime: number | null = null;
    let lastT = performance.now();

    function frame(now: number) {
      if (isDisposed) return;
      if (startTime === null) startTime = now;
      const t = (now - startTime) / 1000;
      const dt = (now - lastT) / 1000;
      lastT = now;

      updateWave(now);
      stepSprings(dt, t);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }

    const onResize = () => {
      camera.fov = getFov();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // FETCH COVERS with fallback
    async function fetchCovers(): Promise<CoverItem[]> {
      const urls: CoverItem[] = [];
      const seen = new Set<string>();

      try {
        for (const term of SEARCH_TERMS) {
          if (urls.length >= COUNT) break;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(
              `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=10`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            const data = await res.json();
            for (const r of data.results || []) {
              if (!r.artworkUrl100) continue;
              const hi = r.artworkUrl100.replace('100x100bb', '600x600bb');
              if (seen.has(hi)) continue;
              seen.add(hi);
              urls.push({
                url: hi,
                title: r.trackName || 'Track',
                artist: r.artistName || 'Artist',
              });
              if (urls.length >= COUNT) break;
            }
          } catch {
            // continue with next search term
          }
        }
      } catch {
        // use fallbacks
      }

      // Fill remainder with FALLBACK_COVERS so no card is ever blank
      let fIndex = 0;
      while (urls.length < COUNT) {
        urls.push(FALLBACK_COVERS[fIndex % FALLBACK_COVERS.length]!);
        fIndex++;
      }
      return urls.slice(0, COUNT);
    }

    (async () => {
      const covers = await fetchCovers();
      if (isDisposed) return;
      layout(covers);
      setLoading(false);

      // Intro animations
      setTimeout(() => setWordmarkVisible(true), 150);
      setTimeout(() => setNavVisible(true), 700);
      setTimeout(() => setLinkrowVisible(true), 850);

      animId = requestAnimationFrame(frame);
    })();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      pmrem.dispose();
      renderer.dispose();
      geo.dispose();
      if (wrap.contains(renderer.domElement)) {
        wrap.removeChild(renderer.domElement);
      }
    };
  }, [onSignIn]);

  return (
    <div className="zentra-hero">
      <div className={`zentra-hero__loading ${!loading ? 'hide' : ''}`}>
        LOADING ZENTRA…
      </div>

      <nav className={`zentra-hero__nav ${navVisible ? 'visible' : ''}`}>
        <div className="zentra-hero__brand">
          <div className="zentra-hero__mark" />
          <div className="zentra-hero__word">zentra</div>
        </div>
        <div className="zentra-hero__nav-center">
          <a href="#browse" onClick={(e) => { e.preventDefault(); onSignIn(); }}>Browse</a>
          <a href="#charts" onClick={(e) => { e.preventDefault(); onSignIn(); }}>Charts</a>
          <a href="#playlists" onClick={(e) => { e.preventDefault(); onSignIn(); }}>Playlists</a>
          <a href="#radio" onClick={(e) => { e.preventDefault(); onSignIn(); }}>Radio</a>
        </div>
        <div className="zentra-hero__nav-right">
          <button className="zentra-hero__signin" onClick={onSignIn}>
            Sign in
          </button>
          <button className="zentra-hero__pill" onClick={onSignUp}>
            Start listening
          </button>
        </div>
      </nav>

      <div className={`zentra-hero__wordmark ${wordmarkVisible ? 'visible' : ''}`}>
        zentra<span className="zentra-hero__accent-dot">.</span>
      </div>

      <div className={`zentra-hero__linkrow ${linkrowVisible ? 'visible' : ''}`}>
        <span>New Releases</span>
        <span>Trending</span>
        <span>Charts</span>
        <span>Playlists</span>
        <span>Podcasts</span>
        <span>Artists</span>
        <span>Radio</span>
        <span>Premium</span>
      </div>

      <div ref={containerRef} className="zentra-hero__canvas-wrap" />
    </div>
  );
}
