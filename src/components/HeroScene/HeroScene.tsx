'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// THREE.Timer replaces the deprecated THREE.Clock in r184+
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import classnames from 'classnames';
import styles from './HeroScene.module.scss';

type Hotspot = {
  id: string;
  label: string;
  title: string;
  body: string;
  // Local position (in ring-group space, before tilt/scale)
  local: THREE.Vector3;
};

const HOTSPOTS: Hotspot[] = [
  {
    id: 'sensor',
    label: 'Sensore',
    title: 'Aura-Gen™ Biosensor',
    body: 'Campiona HRV, SpO₂ e temperatura cutanea ogni secondo. Architettura a doppio fotodiodo.',
    local: new THREE.Vector3(0, -0.04, 0.18),
  },
  {
    id: 'material',
    label: 'Materiale',
    title: 'Ceramica opaca',
    body: 'Titanio sinterizzato con finitura ceramica anti-graffio. Impermeabile fino a 100 m.',
    local: new THREE.Vector3(0.18, 0.04, 0),
  },
  {
    id: 'predict',
    label: 'Predizione',
    title: 'Anticipo 8 minuti',
    body: 'Il modello on-device riconosce i pattern HRV che precedono un picco di cortisolo e ti avvisa.',
    local: new THREE.Vector3(-0.15, 0.02, 0.12),
  },
];

type ScreenPos = { x: number; y: number; visible: boolean };

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, ScreenPos>>({});
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────
    // "Infinite alabaster room" — single warm cream tone, no clear horizon.
    // Fog matches background so far edges dissolve into luminous infinity.
    const scene = new THREE.Scene();
    const ivory = new THREE.Color(0xfff8e6);
    scene.background = ivory;
    scene.fog = new THREE.FogExp2(0xfff8e6, 0.025);

    // ── Camera ────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    // Lower the camera so the floor-to-wall horizon is visible
    camera.position.set(0.6, 1.1, 4.0);

    // ── Lights — soft, filtered, curtain-diffused ─────────────
    // Hemisphere: warm cream from above, slightly darker below.
    // Mimics indirect daylight bouncing in a paper-walled room.
    const hemi = new THREE.HemisphereLight(0xfffcef, 0xfff5d8, 1.6);
    scene.add(hemi);

    // Soft directional "sun" — gentle, large shadow radius (filtered through curtain)
    const sunLight = new THREE.DirectionalLight(0xfff4d8, 1.6);
    sunLight.position.set(3, 6, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -3;
    sunLight.shadow.camera.right = 3;
    sunLight.shadow.camera.top = 3;
    sunLight.shadow.camera.bottom = -3;
    sunLight.shadow.bias = -0.001;
    sunLight.shadow.radius = 10; // very soft shadow edges
    scene.add(sunLight);

    // ── Cyclorama (circular bowl: floor curves up 360° into wall) ─
    // Revolving a 2D radial profile around the Y axis gives a seamless
    // backdrop from every camera azimuth — no visible edges.
    const cycProfile: THREE.Vector2[] = [];
    const flatRadius = 6;   // flat floor radius around the ring
    const bendRadius = 5;   // curve radius from floor up into wall
    const wallHeight = 14;  // straight wall height after the curve
    const arcSegments = 24;

    // 1) Flat floor: from center outward
    cycProfile.push(new THREE.Vector2(0, 0));
    cycProfile.push(new THREE.Vector2(flatRadius, 0));
    // 2) Quarter arc rising up (concave from inside)
    for (let i = 1; i <= arcSegments; i++) {
      const a = (i / arcSegments) * (Math.PI / 2);
      const x = flatRadius + bendRadius * Math.sin(a);
      const y = bendRadius * (1 - Math.cos(a));
      cycProfile.push(new THREE.Vector2(x, y));
    }
    // 3) Vertical wall going up
    cycProfile.push(new THREE.Vector2(flatRadius + bendRadius, bendRadius + wallHeight));

    const cycGeo = new THREE.LatheGeometry(cycProfile, 96);
    cycGeo.computeVertexNormals();

    const cycMat = new THREE.MeshStandardMaterial({
      color: 0xfff8e6,
      roughness: 1,
      metalness: 0,
      emissive: 0xfff8e6,
      emissiveIntensity: 0.45,
      side: THREE.BackSide, // we're inside the bowl looking out
    });
    const cyc = new THREE.Mesh(cycGeo, cycMat);
    cyc.position.set(0, 0, 0);
    cyc.receiveShadow = true;
    scene.add(cyc);

    // ── Halo Ring (smart-ring band, Oura-Stealth style) ───────
    const innerR = 0.162;
    const outerR = 0.205;
    const halfH = 0.040;
    const cornerR = 0.010;
    const comfortBulge = 0.004;
    const arcSegs = 10;
    const innerSegs = 16;

    const ringProfile: THREE.Vector2[] = [];
    ringProfile.push(new THREE.Vector2(innerR, halfH));
    ringProfile.push(new THREE.Vector2(outerR - cornerR, halfH));
    for (let i = 1; i <= arcSegs; i++) {
      const a = Math.PI / 2 - (Math.PI / 2) * (i / arcSegs);
      ringProfile.push(
        new THREE.Vector2(
          outerR - cornerR + cornerR * Math.cos(a),
          halfH - cornerR + cornerR * Math.sin(a)
        )
      );
    }
    for (let i = 1; i <= arcSegs; i++) {
      const a = -(Math.PI / 2) * (i / arcSegs);
      ringProfile.push(
        new THREE.Vector2(
          outerR - cornerR + cornerR * Math.cos(a),
          -halfH + cornerR + cornerR * Math.sin(a)
        )
      );
    }
    ringProfile.push(new THREE.Vector2(innerR, -halfH));
    for (let i = 1; i <= innerSegs; i++) {
      const t = i / innerSegs;
      const y = -halfH + 2 * halfH * t;
      const bulge = comfortBulge * Math.sin(Math.PI * t);
      ringProfile.push(new THREE.Vector2(innerR + bulge, y));
    }

    const ringGeo = new THREE.LatheGeometry(ringProfile, 256);
    ringGeo.computeVertexNormals();

    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1f,
      roughness: 0.42,
      metalness: 0.9,
      envMapIntensity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.castShadow = true;
    ring.receiveShadow = true;

    const ringGroup = new THREE.Group();
    ringGroup.add(ring);

    // ── Micro-sensors on inner face ──────────────────────────
    const sensorGeo = new THREE.CircleGeometry(0.014, 28);
    const sensorMat = new THREE.MeshStandardMaterial({
      color: 0x12161c,
      roughness: 0.18,
      metalness: 0.35,
      emissive: 0x1c2530,
      emissiveIntensity: 0.4,
    });
    const sensorCount = 3;
    for (let i = 0; i < sensorCount; i++) {
      const theta = (i / sensorCount) * Math.PI * 2 + Math.PI * 0.85;
      const s = new THREE.Mesh(sensorGeo, sensorMat);
      // Sit just inside the inner surface, facing toward the central axis
      s.position.set(innerR * Math.cos(theta), 0, innerR * Math.sin(theta));
      s.lookAt(0, 0, 0);
      ringGroup.add(s);
    }

    ringGroup.position.set(0, 0.7, 0);
    ringGroup.rotation.x = -Math.PI / 3.5;
    ringGroup.scale.setScalar(2.4);
    scene.add(ringGroup);

    // Hotspot anchor objects (invisible) — projected each frame
    const hotspotAnchors: { id: string; obj: THREE.Object3D }[] = HOTSPOTS.map((h) => {
      const obj = new THREE.Object3D();
      obj.position.copy(h.local);
      ringGroup.add(obj);
      return { id: h.id, obj };
    });

    // Environment map for reflections — applied only to the ring so
    // walls/floor read their actual painted color (museum cream).
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envTex = pmremGenerator.fromScene(envScene).texture;
    ringMat.envMap = envTex;
    ringMat.needsUpdate = true;
    pmremGenerator.dispose();

    // ── OrbitControls: drag orbits the camera around the ring ─
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.7, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false; // avoid hijacking page scroll
    controls.minDistance = 2.5;
    controls.maxDistance = 6;
    // Lock vertical orbit — user can only drag horizontally (left/right)
    controls.minPolarAngle = Math.PI * 0.48;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.rotateSpeed = 0.9;

    // Pause the ring's auto-tumble while the user is dragging the camera
    let isDragging = false;
    controls.addEventListener('start', () => { isDragging = true; });
    controls.addEventListener('end',   () => { isDragging = false; });

    // ── Raycaster for hover ───────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovering = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Render loop ───────────────────────────────────────────
    let frameId: number;
    const timer = new THREE.Timer();
    const projVec = new THREE.Vector3();
    let lastUpdate = 0;
    const baseTiltX = -Math.PI / 3.5;
    let spinX = 0;
    const spinSpeed = 0.35; // rad/sec

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      timer.update();
      const dt = timer.getDelta();
      const t = timer.getElapsed();

      // Hover detection (pauses auto-tumble)
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(ring, false).length > 0;
      if (hit !== hovering) hovering = hit;

      // Auto X-axis tumble pauses on hover or while the user drags the camera
      if (!hovering && !isDragging) spinX += spinSpeed * dt;
      ringGroup.rotation.x = baseTiltX + spinX;

      controls.update();

      // Subtle floating
      ringGroup.position.y = 0.7 + Math.sin(t * 0.7) * 0.018;
      sunLight.intensity = 2.8 + Math.sin(t * 0.3) * 0.15;

      renderer.render(scene, camera);

      // Project hotspot anchors to screen (throttle to ~30fps)
      if (t - lastUpdate > 0.033) {
        lastUpdate = t;
        const rect = renderer.domElement.getBoundingClientRect();
        const next: Record<string, ScreenPos> = {};
        for (const { id, obj } of hotspotAnchors) {
          obj.getWorldPosition(projVec);
          // Visibility: in front of camera + roughly facing camera
          const camToPoint = projVec.clone().sub(camera.position);
          const inFront = camToPoint.dot(camera.getWorldDirection(new THREE.Vector3())) > 0;
          projVec.project(camera);
          const x = (projVec.x * 0.5 + 0.5) * rect.width;
          const y = (-projVec.y * 0.5 + 0.5) * rect.height;
          next[id] = {
            x,
            y,
            visible: inFront && projVec.z < 1,
          };
        }
        setPositions(next);
      }
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeSpot = HOTSPOTS.find((h) => h.id === active);
  const activePos = active ? positions[active] : null;

  return (
    <div ref={mountRef} className={styles.wrapper}>
      <div ref={canvasRef} className={styles.canvas} />

      {HOTSPOTS.map((h) => {
        const p = positions[h.id];
        if (!p || !p.visible) return null;
        return (
          <button
            key={h.id}
            type="button"
            aria-label={h.title}
            className={classnames(styles.hotspot, {
              [styles['hotspot--active']]: active === h.id,
            })}
            style={{ left: p.x, top: p.y }}
            onClick={() => setActive(active === h.id ? null : h.id)}
          />
        );
      })}

      {activeSpot && activePos && activePos.visible && (
        <div
          className={styles.tooltip}
          style={{ left: activePos.x, top: activePos.y }}
        >
          <button
            type="button"
            className={styles.tooltip__close}
            onClick={() => setActive(null)}
            aria-label="Chiudi"
          >
            ×
          </button>
          <div className={styles.tooltip__label}>{activeSpot.label}</div>
          <div className={styles.tooltip__title}>{activeSpot.title}</div>
          <div className={styles.tooltip__body}>{activeSpot.body}</div>
        </div>
      )}
    </div>
  );
}
