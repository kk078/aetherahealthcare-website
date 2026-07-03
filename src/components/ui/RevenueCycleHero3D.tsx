'use client';

/**
 * RevenueCycleHero3D
 * ------------------
 * Original three.js hero animation themed to Aethera's revenue-cycle work.
 *
 * Visual metaphor: medical claims (teal packets) flow around a tilted "revenue
 * cycle" ring, passing four stage nodes (Submit → Adjudicate → Post → Paid).
 * As a packet nears the final stage it brightens to mint/white — a clean claim
 * converted to collected revenue. A slow wireframe core is the AI claim-scrubbing
 * engine; a faint data field sits behind everything.
 *
 * Safety / performance:
 *  - Lazy-loaded (page.tsx dynamic import, ssr:false) → out of the first bundle.
 *  - Respects prefers-reduced-motion → static SVG fallback (no WebGL).
 *  - Falls back gracefully if a WebGL context can't be created.
 *  - Renders an initial frame immediately, then animates; pauses only when the
 *    hero scrolls fully offscreen (browsers already throttle RAF on hidden tabs).
 *  - Caps devicePixelRatio at 2; modest particle counts; disposes on unmount.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function StaticFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="w-[85%] max-w-[520px] opacity-90">
        <defs>
          <radialGradient id="rc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#45C4B0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#001529" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rc-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0061A5" />
            <stop offset="55%" stopColor="#0D7377" />
            <stop offset="100%" stopColor="#45C4B0" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#rc-glow)" />
        <g transform="translate(200 200) rotate(-18)">
          <ellipse cx="0" cy="0" rx="150" ry="82" fill="none" stroke="url(#rc-ring)" strokeWidth="2.5" opacity="0.85" />
          <ellipse cx="0" cy="0" rx="110" ry="60" fill="none" stroke="#0061A5" strokeWidth="1" opacity="0.4" />
          {[0, 90, 180, 270].map((a) => {
            const r = (a * Math.PI) / 180;
            return <circle key={a} cx={150 * Math.cos(r)} cy={82 * Math.sin(r)} r="6" fill="#10B981" />;
          })}
          {[30, 70, 130, 200, 250, 320].map((a) => {
            const r = (a * Math.PI) / 180;
            return <circle key={a} cx={150 * Math.cos(r)} cy={82 * Math.sin(r)} r="3.5" fill="#45C4B0" opacity="0.9" />;
          })}
        </g>
      </svg>
    </div>
  );
}

export default function RevenueCycleHero3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setUseFallback(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setUseFallback(true);
      return;
    }

    const W = () => el.clientWidth || 600;
    const H = () => el.clientHeight || 600;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.set(0, 0.2, 11);
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group();
    root.rotation.x = -0.5;
    root.rotation.z = 0.18;
    scene.add(root);

    const RING_R = 4.0;

    // Revenue-cycle ring (tube + soft outer glow ring)
    root.add(new THREE.Mesh(
      new THREE.TorusGeometry(RING_R, 0.06, 16, 220),
      new THREE.MeshBasicMaterial({ color: 0x2f8fd0, transparent: true, opacity: 0.75 })
    ));
    root.add(new THREE.Mesh(
      new THREE.TorusGeometry(RING_R, 0.16, 16, 200),
      new THREE.MeshBasicMaterial({ color: 0x0061a5, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending })
    ));
    root.add(new THREE.Mesh(
      new THREE.TorusGeometry(RING_R * 0.7, 0.025, 12, 180),
      new THREE.MeshBasicMaterial({ color: 0x0d7377, transparent: true, opacity: 0.4 })
    ));

    // Four stage nodes
    const stageColors = [0x2f8fd0, 0x0d7377, 0x45c4b0, 0x10b981];
    const stages: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 24),
        new THREE.MeshBasicMaterial({ color: stageColors[i] })
      );
      node.position.set(Math.cos(ang) * RING_R, Math.sin(ang) * RING_R, 0);
      node.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 18, 18),
        new THREE.MeshBasicMaterial({ color: stageColors[i], transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending })
      ));
      root.add(node);
      stages.push(node);
    }

    // Claim packets orbiting the ring
    const PACKETS = 140;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(PACKETS * 3);
    const pCol = new Float32Array(PACKETS * 3);
    const pAng = new Float32Array(PACKETS);
    const pSpd = new Float32Array(PACKETS);
    const pRad = new Float32Array(PACKETS);
    const pZ = new Float32Array(PACKETS);
    const cTeal = new THREE.Color(0x0d7377);
    const cMint = new THREE.Color(0x45c4b0);
    const cPaid = new THREE.Color(0xe7fbf3);
    const tmp = new THREE.Color();
    for (let i = 0; i < PACKETS; i++) {
      pAng[i] = Math.random() * Math.PI * 2;
      pSpd[i] = 0.16 + Math.random() * 0.2;
      pRad[i] = RING_R + (Math.random() - 0.5) * 0.34;
      pZ[i] = (Math.random() - 0.5) * 0.34;
      const a = pAng[i]; pPos[i * 3] = Math.cos(a) * pRad[i]; pPos[i * 3 + 1] = Math.sin(a) * pRad[i]; pPos[i * 3 + 2] = pZ[i];
      tmp.copy(cTeal).lerp(cMint, a / (Math.PI * 2)); pCol[i * 3] = tmp.r; pCol[i * 3 + 1] = tmp.g; pCol[i * 3 + 2] = tmp.b;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    root.add(new THREE.Points(pGeom, new THREE.PointsMaterial({
      size: 0.17, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending,
    })));

    // Ambient data field
    const FIELD = 560;
    const fGeom = new THREE.BufferGeometry();
    const fPos = new Float32Array(FIELD * 3);
    for (let i = 0; i < FIELD; i++) {
      const r = 5 + Math.random() * 6, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI;
      fPos[i * 3] = Math.cos(a) * Math.cos(b) * r; fPos[i * 3 + 1] = Math.sin(b) * r * 0.6; fPos[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;
    }
    fGeom.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
    const field = new THREE.Points(fGeom, new THREE.PointsMaterial({ color: 0x9fc3e0, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(field);

    // Scrubber core (AI engine)
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 1),
      new THREE.MeshBasicMaterial({ color: 0x45c4b0, wireframe: true, transparent: true, opacity: 0.28 })
    );
    root.add(core);
    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending })
    );
    root.add(coreGlow);

    // Render one static frame immediately (guarantees a visible image even if paused)
    renderer.render(scene, camera);

    // Pointer parallax
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
    };
    el.addEventListener('pointermove', onPointer);

    const onResize = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.render(scene, camera); };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    // Pause only when fully scrolled offscreen; default to running.
    let onScreen = true;
    const io = new IntersectionObserver((entries) => { onScreen = entries[0] ? entries[0].isIntersecting : true; }, { threshold: 0 });
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!onScreen) return;
      const t = clock.elapsedTime;

      root.rotation.y += dt * 0.12;
      field.rotation.y += dt * 0.02;
      core.rotation.x += dt * 0.25;
      core.rotation.y += dt * 0.32;
      coreGlow.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
      for (let i = 0; i < stages.length; i++) stages[i].scale.setScalar(1 + Math.sin(t * 1.6 + i * 1.4) * 0.12);

      for (let i = 0; i < PACKETS; i++) {
        pAng[i] += pSpd[i] * dt; if (pAng[i] > Math.PI * 2) pAng[i] -= Math.PI * 2;
        const a = pAng[i];
        pPos[i * 3] = Math.cos(a) * pRad[i]; pPos[i * 3 + 1] = Math.sin(a) * pRad[i]; pPos[i * 3 + 2] = pZ[i];
        const prog = a / (Math.PI * 2);
        if (prog < 0.66) tmp.copy(cTeal).lerp(cMint, prog / 0.66);
        else tmp.copy(cMint).lerp(cPaid, (prog - 0.66) / 0.34);
        pCol[i * 3] = tmp.r; pCol[i * 3 + 1] = tmp.g; pCol[i * 3 + 2] = tmp.b;
      }
      pGeom.attributes.position.needsUpdate = true;
      pGeom.attributes.color.needsUpdate = true;

      root.rotation.z += (0.18 + target.x - root.rotation.z) * 0.05;
      camera.position.y += (0.2 - target.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointermove', onPointer);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      pGeom.dispose(); fGeom.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  if (useFallback) return <StaticFallback />;
  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
