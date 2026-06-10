'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './RingRevealScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    id: 'sensor',
    num: '01',
    title: 'Aura-Gen™ Biosensor',
    body: 'Doppio fotodiodo. HRV, SpO₂ e temperatura cutanea ogni secondo.',
    local: new THREE.Vector3(0, -0.04, 0.18),
  },
  {
    id: 'predict',
    num: '02',
    title: 'Predizione 8 minuti',
    body: 'Riconosce i pattern HRV che precedono un picco di cortisolo e ti avvisa prima.',
    local: new THREE.Vector3(-0.15, 0.02, 0.12),
  },
  {
    id: 'material',
    num: '03',
    title: 'Ceramica opaca',
    body: 'Titanio sinterizzato. Anti-graffio. Impermeabile fino a 100 m.',
    local: new THREE.Vector3(0.18, 0.04, 0),
  },
];

type ScreenPos = { x: number; y: number; visible: boolean };

export default function RingRevealScene() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLDivElement>(null);
  const fogRef      = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const [positions, setPositions] = useState<Record<string, ScreenPos>>({});
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  // ── Three.js setup ────────────────────────────────────────────────
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfdf8f0);

    // Camera — starts far, scroll drives it close
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.6, 6.5); // far — fog hides it at start
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Lights
    const hemi = new THREE.HemisphereLight(0xfffcef, 0xfff5d8, 1.4);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4d8, 2.0);
    sun.position.set(3, 5, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.radius = 12;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    // Ring geometry (same as HeroScene)
    const innerR = 0.162, outerR = 0.205, halfH = 0.040;
    const cornerR = 0.010, comfortBulge = 0.004;
    const arcSegs = 10, innerSegs = 16;

    const ringProfile: THREE.Vector2[] = [];
    ringProfile.push(new THREE.Vector2(innerR, halfH));
    ringProfile.push(new THREE.Vector2(outerR - cornerR, halfH));
    for (let i = 1; i <= arcSegs; i++) {
      const a = Math.PI / 2 - (Math.PI / 2) * (i / arcSegs);
      ringProfile.push(new THREE.Vector2(
        outerR - cornerR + cornerR * Math.cos(a),
        halfH - cornerR + cornerR * Math.sin(a)
      ));
    }
    for (let i = 1; i <= arcSegs; i++) {
      const a = -(Math.PI / 2) * (i / arcSegs);
      ringProfile.push(new THREE.Vector2(
        outerR - cornerR + cornerR * Math.cos(a),
        -halfH + cornerR + cornerR * Math.sin(a)
      ));
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

    // Sensors
    const sensorGeo = new THREE.CircleGeometry(0.014, 28);
    const sensorMat = new THREE.MeshStandardMaterial({
      color: 0x12161c, roughness: 0.18, metalness: 0.35,
      emissive: 0x1c2530, emissiveIntensity: 0.4,
    });
    const ringGroup = new THREE.Group();
    ringGroup.add(ring);
    for (let i = 0; i < 3; i++) {
      const theta = (i / 3) * Math.PI * 2 + Math.PI * 0.85;
      const s = new THREE.Mesh(sensorGeo, sensorMat);
      s.position.set(innerR * Math.cos(theta), 0, innerR * Math.sin(theta));
      s.lookAt(0, 0, 0);
      ringGroup.add(s);
    }

    ringGroup.rotation.x = -Math.PI / 3.8;
    ringGroup.scale.setScalar(3.2);
    scene.add(ringGroup);

    // Hotspot anchors
    const anchors = FEATURES.map((f) => {
      const obj = new THREE.Object3D();
      obj.position.copy(f.local);
      ringGroup.add(obj);
      return { id: f.id, obj };
    });

    // Environment
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment()).texture;
    ringMat.envMap = envTex;
    ringMat.needsUpdate = true;
    pmrem.dispose();

    // Resize
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Render loop
    let frameId: number;
    const timer = new THREE.Timer();
    const projVec = new THREE.Vector3();
    let lastUpdate = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      timer.update();
      const dt = timer.getDelta();
      const t = timer.getElapsed();

      ringGroup.rotation.x = -Math.PI / 3.8 + Math.sin(t * 0.4) * 0.04;
      ringGroup.rotation.y += dt * 0.12;
      ringGroup.position.y = Math.sin(t * 0.6) * 0.015;

      renderer.render(scene, camera);

      if (t - lastUpdate > 0.033) {
        lastUpdate = t;
        const rect = renderer.domElement.getBoundingClientRect();
        const next: Record<string, ScreenPos> = {};
        for (const { id, obj } of anchors) {
          obj.getWorldPosition(projVec);
          const camDir = camera.getWorldDirection(new THREE.Vector3());
          const inFront = projVec.clone().sub(camera.position).dot(camDir) > 0;
          projVec.project(camera);
          next[id] = {
            x: (projVec.x * 0.5 + 0.5) * rect.width,
            y: (-projVec.y * 0.5 + 0.5) * rect.height,
            visible: inFront && projVec.z < 1,
          };
        }
        setPositions(next);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // ── ScrollTrigger ─────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.set(featuresRef.current, { opacity: 0, y: 16 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        const clamp = gsap.utils.clamp;

        // ── Fog: starts almost opaque, clears by 65%
        const fogOut = clamp(0, 1, p / 0.65);
        const eased = fogOut * fogOut * (3 - 2 * fogOut); // smoothstep
        if (fogRef.current) {
          fogRef.current.style.opacity = String(1 - eased);
        }

        // ── Canvas: blur from 18px → 0 (by 60%)
        const blurProg = clamp(0, 1, p / 0.60);
        const blur = (1 - blurProg) * 18;
        if (canvasRef.current) {
          canvasRef.current.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : '';
        }

        // ── Camera zoom: lerp from far (z=6.5) to close (z=2.4)
        if (cameraRef.current) {
          const zoomProg = clamp(0, 1, p / 0.70);
          const ez = zoomProg * zoomProg * (3 - 2 * zoomProg);
          cameraRef.current.position.z = 6.5 - ez * 4.1;
          cameraRef.current.position.y = 0.6 - ez * 0.42;
          cameraRef.current.updateProjectionMatrix();
        }

        // ── Features stagger in: 68%, 78%, 86%
        const thresholds = [0.68, 0.78, 0.86];
        featuresRef.current.forEach((el, i) => {
          if (!el) return;
          const fp = clamp(0, 1, (p - thresholds[i]) / 0.10);
          el.style.opacity = String(fp);
          el.style.transform = `translateY(${(1 - fp) * 16}px)`;
        });
      },
    });

    return () => { st.kill(); };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Materiali e tecnologia">
      <div className={styles.panel}>

        {/* Three.js canvas */}
        <div ref={canvasRef} className={styles.canvas} />

        {/* Fog overlay */}
        <div ref={fogRef} className={styles.fog} aria-hidden="true" />

        {/* Title */}
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>
            Incredibile<br /><em>comfort</em>
          </h2>
          <p className={styles.subtitle}>per 24/7</p>
        </div>

        {/* Feature list */}
        <div className={styles.features}>
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              ref={(el) => { featuresRef.current[i] = el; }}
              className={`${styles.feature} ${activeFeature === f.id ? styles['feature--active'] : ''}`}
              onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.feature__header}>
                <span className={styles.feature__num}>{f.num}</span>
                <h3 className={styles.feature__title}>{f.title}</h3>
              </div>
              {activeFeature === f.id && (
                <p className={styles.feature__body}>{f.body}</p>
              )}
            </div>
          ))}
        </div>

        {/* Hotspot dots on ring */}
        {FEATURES.map((f) => {
          const p = positions[f.id];
          if (!p?.visible) return null;
          return (
            <button
              key={f.id}
              type="button"
              aria-label={f.title}
              className={`${styles.hotspot} ${activeFeature === f.id ? styles['hotspot--active'] : ''}`}
              style={{ left: p.x, top: p.y }}
              onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
            />
          );
        })}

      </div>
    </section>
  );
}
