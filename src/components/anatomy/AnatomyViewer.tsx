'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import manifest from '@/data/anatomyModelManifest.json';
import type { AtlasLayer, RegionId } from '@/data/anatomyEducation';
import type { CutPlane, LayerOpacity, ModelLayer } from '@/data/anatomyStudy';

export type StudyView = { opacity: LayerOpacity; hidden: ModelLayer[]; context: boolean; plane: CutPlane; slice: number; labels: boolean };

type Props = { region: RegionId; layer: AtlasLayer; selected: string; settings: StudyView; onSelect: (id: string) => void };
type Controls = { update: (p: Props) => void; view: (back: boolean) => void; zoom: (factor: number) => void; rotate: (angle: number) => void; motion: (active: boolean) => void };
const structures = new Map(manifest.structures.map(s => [s.id, s]));
function color(name: string, layer: string) {
  if (layer === 'skeleton') return '#e6dfca';
  if (layer === 'nervous') return '#eeb4cc';
  if (layer === 'surface') return '#b3c8cc';
  if (/lung/i.test(name)) return '#80afcc';
  if (/heart|aorta/i.test(name)) return '#da6270';
  if (/liver|kidney/i.test(name)) return '#bc7466';
  if (/intestin/i.test(name)) return '#d2a27b';
  return '#ddbf7c';
}

export default function AnatomyViewer(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<Controls | null>(null);
  const current = useRef(props);
  const [status, setStatus] = useState('Loading anatomical models…');
  const [failed, setFailed] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [orientation, setOrientation] = useState('Anterior view');
  const selectedName = structures.get(props.selected)?.name;
  useEffect(() => { current.current = props; api.current?.update(props); }, [props]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let frame = 0;
    let visible = true;
    let renderer: THREE.WebGLRenderer;
    const fail = () => { if (!disposed) { setFailed(true); setStatus('3D view unavailable. Use the structure list and lessons below, or retry.'); } };
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { fail(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setClearColor(0x0b2545, 1);
    renderer.domElement.setAttribute('aria-label', 'Interactive anatomical model. Use the named structure list and camera buttons for keyboard access.');
    renderer.domElement.setAttribute('role', 'img');
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6b8cab, 2.6));
    const light = new THREE.DirectionalLight(0xffffff, 2.5); light.position.set(2, 3, 4); scene.add(light);
    const fill = new THREE.DirectionalLight(0x88e1d1, 1.2); fill.position.set(-2, 1, -3); scene.add(fill);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.005, 30);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
    controls.minDistance = 0.08; controls.maxDistance = 8; controls.autoRotateSpeed = 0.6;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const meshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshLambertMaterial>[] = [];
    const decoder = new DRACOLoader().setDecoderPath('/models/anatomy/draco/').setWorkerLimit(2);
    const loader = new GLTFLoader().setDRACOLoader(decoder);
    const box = new THREE.Box3();
    let focusKey = '';
    let userChoseMotion = false;
    let lastOrientation = '';
    const cutPlane = new THREE.Plane();
    let dirty = true;
    const render = () => { dirty = true; };
    const fit = (back = false) => {
      box.makeEmpty();
      for (const mesh of meshes) {
        const s = structures.get(mesh.userData.structureId);
        if (!s || !mesh.visible || (current.current.selected && !current.current.settings.context && s.id !== current.current.selected)) continue;
        box.expandByObject(mesh);
      }
      if (box.isEmpty()) return;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const distance = Math.max(size.y, size.x / camera.aspect, size.z) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.2;
      controls.target.copy(center);
      camera.position.copy(center).add(new THREE.Vector3(0, 0, (back ? -1 : 1) * Math.max(distance, .15)));
      controls.update(); render();
    };
    const update = (p: Props) => {
      for (const mesh of meshes) {
        const s = structures.get(mesh.userData.structureId)!;
        mesh.visible = (p.region === 'whole' || s.region === p.region) && (p.layer === 'all' ? s.layer !== 'surface' : s.layer === p.layer);
        if (p.selected) mesh.visible = s.id === p.selected || (p.settings.context && mesh.visible);
        if (p.settings.hidden.includes(s.layer as ModelLayer)) mesh.visible = false;
        const opacity = p.settings.opacity[s.layer as ModelLayer] * (p.selected && s.id !== p.selected ? .16 : 1);
        const transparent = opacity < 1;
        if (mesh.material.transparent !== transparent) { mesh.material.transparent = transparent; mesh.material.needsUpdate = true; }
        mesh.material.opacity = opacity;
        mesh.material.depthWrite = !transparent;
        mesh.material.color.set(p.selected === s.id ? '#88e1d1' : color(s.name, s.layer));
      }
      if (p.settings.plane === 'off') renderer.clippingPlanes = [];
      else {
        const clippingBounds = new THREE.Box3();
        meshes.filter(mesh => mesh.visible).forEach(mesh => clippingBounds.expandByObject(mesh));
        const axis = p.settings.plane === 'sagittal' ? 'x' : p.settings.plane === 'coronal' ? 'z' : 'y';
        if (!clippingBounds.isEmpty()) {
          const value = THREE.MathUtils.lerp(clippingBounds.min[axis], clippingBounds.max[axis], p.settings.slice / 100);
          cutPlane.normal.set(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
          cutPlane.constant = -value;
          renderer.clippingPlanes = [cutPlane];
        } else renderer.clippingPlanes = [];
      }
      const key = `${p.region}/${p.layer}/${p.selected}/${p.settings.context}`;
      if (key !== focusKey) { focusKey = key; fit(); }
      render();
    };
    api.current = {
      update, view: fit,
      zoom: factor => { camera.position.sub(controls.target).multiplyScalar(factor).clampLength(.08, 8).add(controls.target); controls.update(); render(); },
      rotate: angle => { const offset = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle); camera.position.copy(controls.target).add(offset); controls.update(); render(); },
      motion: active => { userChoseMotion = true; controls.autoRotate = active; render(); },
    };
    const stop = () => { userChoseMotion = true; controls.autoRotate = false; setRotating(false); render(); };
    controls.addEventListener('start', stop); controls.addEventListener('change', render);
    reduced.addEventListener('change', stop);
    const resize = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); fit(); render();
    }); resize.observe(element);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; render(); }); observer.observe(element);
    const raycaster = new THREE.Raycaster();
    let down = { x: 0, y: 0 };
    const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; };
    const pointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      const hit = raycaster.intersectObjects(meshes.filter(mesh => mesh.visible), false).find(hit => renderer.clippingPlanes.every(plane => plane.distanceToPoint(hit.point) >= 0));
      if (hit) current.current.onSelect(hit.object.userData.structureId);
    };
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    const lost = (event: Event) => { event.preventDefault(); stop(); fail(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const timer = new THREE.Timer();
    let lastFrame = 0;
    const tick = (now = 0) => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden || now - lastFrame < 1000 / 24) return;
      lastFrame = now; timer.update();
      controls.update(Math.min(timer.getDelta(), .05));
      const direction = camera.position.clone().sub(controls.target).normalize();
      const view = direction.z > .95 ? 'Anterior view' : direction.z < -.95 ? 'Posterior view' : direction.x > .95 ? 'Patient’s left side' : direction.x < -.95 ? 'Patient’s right side' : 'Oblique view';
      if (view !== lastOrientation) { lastOrientation = view; setOrientation(view); }
      if (dirty || controls.autoRotate) { renderer.render(scene, camera); dirty = false; }
    }; tick();
    const disposeMesh = (mesh: THREE.Mesh) => { mesh.geometry.dispose(); const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]; materials.forEach(m => m.dispose()); };
    void Promise.all(Object.values(manifest.files).map(async file => {
      const gltf = await loader.loadAsync(file.path);
      if (disposed) { gltf.scene.traverse(object => { if (object instanceof THREE.Mesh) disposeMesh(object); }); return; }
      gltf.scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        let node: THREE.Object3D | null = object;
        while (node && !structures.has(node.name)) node = node.parent;
        if (!node) return;
        const structure = structures.get(node.name)!;
        const old = Array.isArray(object.material) ? object.material : [object.material]; old.forEach(m => m.dispose());
        object.material = new THREE.MeshLambertMaterial({ color: color(structure.name, structure.layer), side: THREE.DoubleSide });
        object.userData.structureId = structure.id;
        meshes.push(object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshLambertMaterial>);
      });
      scene.add(gltf.scene); focusKey = ''; update(current.current);
    })).then(() => {
      if (disposed) return;
      setStatus(`${manifest.structures.length} anatomical structures loaded`);
      if (!reduced.matches && !userChoseMotion) { controls.autoRotate = true; setRotating(true); }
      render();
    }).catch(fail);
    return () => {
      disposed = true; cancelAnimationFrame(frame); api.current = null; observer.disconnect(); resize.disconnect();
      reduced.removeEventListener('change', stop); controls.dispose(); decoder.dispose(); timer.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('webglcontextlost', lost);
      meshes.forEach(disposeMesh); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, [attempt]);
  const button = 'rounded-lg border border-white/30 px-3 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#88e1d1] disabled:opacity-40';
  return <div className="overflow-hidden rounded-2xl bg-[#0B2545] text-white">
    <div className="flex items-center justify-between gap-3 px-5 pt-5 text-xs text-slate-200"><span>BodyParts3D · adult male reference</span><span>True 3D</span></div>
    <div className="relative"><div ref={host} data-testid="anatomy-canvas" className="h-[470px] w-full sm:h-[560px]" />
      {props.settings.labels && <div className="pointer-events-none absolute top-3 left-4 right-4 flex flex-wrap justify-between gap-2 text-xs"><span className="rounded-md bg-[#001529]/90 px-3 py-2" data-testid="atlas-orientation">{orientation}</span>{selectedName && <span className="max-w-full rounded-md bg-[#001529]/90 px-3 py-2 text-[#88e1d1]" data-testid="atlas-selection-label">{selectedName}{props.settings.context ? ' · in context' : ' · isolated'}</span>}</div>}
    </div>
    <div className="space-y-3 px-5 pb-5">
      <p role="status" className="text-sm text-[#88e1d1]">{status}</p>
      {failed ? <button className={button} onClick={() => { setFailed(false); setStatus('Loading anatomical models…'); setAttempt(n => n + 1); }}>Retry 3D view</button> : <div className="flex flex-wrap gap-2" aria-label="Camera controls">
        <button className={button} aria-pressed={rotating} onClick={() => { api.current?.motion(!rotating); setRotating(!rotating); }}>{rotating ? 'Pause rotation' : 'Start rotation'}</button>
        <button className={button} onClick={() => api.current?.view(false)}>Front / reset</button>
        <button className={button} onClick={() => api.current?.view(true)}>Back view</button>
        <button className={button} aria-label="Zoom in" onClick={() => api.current?.zoom(.8)}>Zoom +</button>
        <button className={button} aria-label="Zoom out" onClick={() => api.current?.zoom(1.25)}>Zoom −</button>
        <button className={button} onClick={() => api.current?.rotate(Math.PI / 8)}>Turn left</button>
        <button className={button} onClick={() => api.current?.rotate(-Math.PI / 8)}>Turn right</button>
      </div>}
      {props.settings.plane !== 'off' && <p className="rounded-lg border border-white/20 p-3 text-xs leading-relaxed text-slate-200" role="note">{props.settings.plane} surface cutaway · {props.settings.slice}%. This clips the existing mesh; it is not CT/MRI, histology or a validated internal dissection. Hollow or incomplete surfaces may become visible.</p>}
      <p className="text-xs leading-relaxed text-slate-300">Drag to orbit. Scroll or pinch to zoom. Select a visible structure or use the named list. Rotation changes the view, not the patient’s left and right. Colors distinguish structures; they are not tissue coloration.</p>
    </div>
  </div>;
}
