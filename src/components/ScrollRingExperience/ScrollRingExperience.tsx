'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroOverlay from '@/components/HeroOverlay';
import styles from './ScrollRingExperience.module.scss';

gsap.registerPlugin(ScrollTrigger);

/**
 * Camera + ring pose keyframes, scrubbed by scroll progress [0,1].
 * Apple-AirPods-style: one persistent 3D object, the scroll drives
 * a continuous "camera move" between chapters.
 */
type Pose = {
  p: number;        // progress at which this pose is fully reached
  camZ: number;
  camY: number;
  lookX: number;
  ringX: number;
  ringY: number;
  scale: number;
  rotX: number;
  rotZ: number;
};

const POSES: Pose[] = [
  // Hero — ring right, ¾ view (matches the approved hero)
  { p: 0.00, camZ: 3.6, camY: 0.95, lookX: 0.1, ringX: 1.05, ringY: 0.95, scale: 4.6, rotX: -Math.PI / 4.2, rotZ: -0.30 },
  // Chapter 1 — ring drifts center, camera pushes in, bore opens to camera
  { p: 0.38, camZ: 2.7, camY: 0.95, lookX: 0.0, ringX: -0.45, ringY: 0.95, scale: 4.4, rotX: -Math.PI / 2.6, rotZ: -0.12 },
  // Chapter 2 — macro: close on the band, pushed right so text reads left
  { p: 0.72, camZ: 2.5, camY: 0.95, lookX: -0.35, ringX: 1.0, ringY: 1.1, scale: 4.4, rotX: -Math.PI / 5.0, rotZ: 0.28 },
  // Exit — ring recedes and centers, ready to hand off to the signal scene
  { p: 1.00, camZ: 3.4, camY: 1.05, lookX: 0.0, ringX: 0.0, ringY: 1.15, scale: 3.4, rotX: -Math.PI / 4.2, rotZ: -0.20 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

function poseAt(progress: number): Omit<Pose, 'p'> {
  let i = 0;
  while (i < POSES.length - 2 && progress > POSES[i + 1].p) i++;
  const a = POSES[i];
  const b = POSES[i + 1];
  const t = smooth(gsap.utils.clamp(0, 1, (progress - a.p) / (b.p - a.p)));
  return {
    camZ:  lerp(a.camZ,  b.camZ,  t),
    camY:  lerp(a.camY,  b.camY,  t),
    lookX: lerp(a.lookX, b.lookX, t),
    ringX: lerp(a.ringX, b.ringX, t),
    ringY: lerp(a.ringY, b.ringY, t),
    scale: lerp(a.scale, b.scale, t),
    rotX:  lerp(a.rotX,  b.rotX,  t),
    rotZ:  lerp(a.rotZ,  b.rotZ,  t),
  };
}

// Chapter copy — fades in/out at progress windows
const CHAPTERS = [
  {
    id: 'listen',
    in: 0.22, out: 0.50,
    align: 'right' as const,
    title: <>Ti ascolta.<br /><em>Sempre.</em></>,
    body: 'Tre fotodiodi leggono HRV, temperatura cutanea e SpO₂. Ogni secondo, giorno e notte.',
  },
  {
    id: 'forget',
    in: 0.58, out: 0.86,
    align: 'left' as const,
    title: <>Dieci grammi.<br /><em>Zero pensieri.</em></>,
    body: 'Titanio ceramico anti-graffio. Lo dimentichi al dito — finché non ti serve.',
  },
];

export default function ScrollRingExperience() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLDivElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef(0);

  // ── Three.js scene ────────────────────────────────────────────────
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfdf8f0);
    scene.fog = new THREE.FogExp2(0xfdf8f0, 0.018);

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    // ── Lights (same recipe as hero) ──────────────────────────
    const hemi = new THREE.HemisphereLight(0xfffcef, 0xfff0d0, 1.2);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff6e0, 2.8);
    key.position.set(-2, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 14;
    key.shadow.bias = -0.001;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe8f0ff, 1.1);
    rim.position.set(3, 1, -3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xfff8ee, 0.4);
    fill.position.set(0, -2, 2);
    scene.add(fill);

    // ── Cyclorama ─────────────────────────────────────────────
    const cycProfile: THREE.Vector2[] = [];
    const flatR = 6, bendR = 5, wallH = 14, arcSegs = 24;
    cycProfile.push(new THREE.Vector2(0, 0));
    cycProfile.push(new THREE.Vector2(flatR, 0));
    for (let i = 1; i <= arcSegs; i++) {
      const a = (i / arcSegs) * (Math.PI / 2);
      cycProfile.push(new THREE.Vector2(flatR + bendR * Math.sin(a), bendR * (1 - Math.cos(a))));
    }
    cycProfile.push(new THREE.Vector2(flatR + bendR, bendR + wallH));
    const cycGeo = new THREE.LatheGeometry(cycProfile, 96);
    cycGeo.computeVertexNormals();
    const cycMat = new THREE.MeshStandardMaterial({
      color: 0xfdf8f0,
      roughness: 1,
      metalness: 0,
      emissive: 0xfdf8f0,
      emissiveIntensity: 0.52,
      side: THREE.BackSide,
    });
    const cyc = new THREE.Mesh(cycGeo, cycMat);
    cyc.receiveShadow = true;
    scene.add(cyc);

    // ── Ring ──────────────────────────────────────────────────
    const innerR = 0.162, outerR = 0.205, halfH = 0.040;
    const cornerR = 0.010, comfortBulge = 0.004;
    const arcS = 10, innerS = 16;

    const ringProfile: THREE.Vector2[] = [];
    ringProfile.push(new THREE.Vector2(innerR, halfH));
    ringProfile.push(new THREE.Vector2(outerR - cornerR, halfH));
    for (let i = 1; i <= arcS; i++) {
      const a = Math.PI / 2 - (Math.PI / 2) * (i / arcS);
      ringProfile.push(new THREE.Vector2(
        outerR - cornerR + cornerR * Math.cos(a),
        halfH - cornerR + cornerR * Math.sin(a)
      ));
    }
    for (let i = 1; i <= arcS; i++) {
      const a = -(Math.PI / 2) * (i / arcS);
      ringProfile.push(new THREE.Vector2(
        outerR - cornerR + cornerR * Math.cos(a),
        -halfH + cornerR + cornerR * Math.sin(a)
      ));
    }
    ringProfile.push(new THREE.Vector2(innerR, -halfH));
    for (let i = 1; i <= innerS; i++) {
      const t = i / innerS;
      const y = -halfH + 2 * halfH * t;
      ringProfile.push(new THREE.Vector2(innerR + comfortBulge * Math.sin(Math.PI * t), y));
    }

    const ringGeo = new THREE.LatheGeometry(ringProfile, 256);
    ringGeo.computeVertexNormals();
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.38,
      metalness: 0.92,
      envMapIntensity: 1.1,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.castShadow = true;
    ring.receiveShadow = true;

    const sensorGeo = new THREE.CircleGeometry(0.014, 28);
    const sensorMat = new THREE.MeshStandardMaterial({
      color: 0x10141a,
      roughness: 0.15,
      metalness: 0.4,
      emissive: 0x1a2535,
      emissiveIntensity: 0.5,
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
    scene.add(ringGroup);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment()).texture;
    ringMat.envMap = envTex;
    ringMat.needsUpdate = true;
    pmrem.dispose();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Render loop: pose = f(scroll progress) + idle motion ──
    let frameId: number;
    const timer = new THREE.Timer();
    let spinY = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      timer.update();
      const dt = timer.getDelta();
      const t = timer.getElapsed();

      const pose = poseAt(progressRef.current);

      // Idle spin slows down in macro chapter (so sensors stay watchable)
      const spinSpeed = 0.18 * (1 - 0.6 * smooth(gsap.utils.clamp(0, 1, (progressRef.current - 0.5) / 0.2)));
      spinY += dt * spinSpeed;

      ringGroup.position.set(
        pose.ringX,
        pose.ringY + Math.sin(t * 0.55) * 0.02,
        0
      );
      ringGroup.scale.setScalar(pose.scale);
      ringGroup.rotation.set(pose.rotX, spinY, pose.rotZ);

      camera.position.set(0, pose.camY, pose.camZ);
      camera.lookAt(pose.lookX, pose.camY - 0.05, 0);

      key.intensity = 2.8 + Math.sin(t * 0.28) * 0.18;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // ── ScrollTrigger: drives progressRef + DOM overlays ─────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    chaptersRef.current.forEach((el) => {
      if (el) gsap.set(el, { opacity: 0 });
    });

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        const clamp = gsap.utils.clamp;

        // Hero overlay fades out over the first 12%
        if (overlayRef.current) {
          const out = clamp(0, 1, p / 0.12);
          overlayRef.current.style.opacity = String(1 - out);
          overlayRef.current.style.pointerEvents = out > 0.5 ? 'none' : '';
        }

        // Chapters fade in/out in their windows
        CHAPTERS.forEach((ch, i) => {
          const el = chaptersRef.current[i];
          if (!el) return;
          const win = ch.out - ch.in;
          const fadeIn  = clamp(0, 1, (p - ch.in) / (win * 0.3));
          const fadeOut = clamp(0, 1, (p - (ch.out - win * 0.3)) / (win * 0.3));
          const vis = fadeIn * (1 - fadeOut);
          el.style.opacity = String(vis);
          el.style.transform = `translateY(${(1 - fadeIn) * 24}px)`;
        });
      },
    });

    return () => { st.kill(); };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Halo Ring">
      <div className={styles.panel}>
        <div ref={canvasRef} className={styles.canvas} />

        {/* Hero overlay — visible at the top, fades on scroll */}
        <div ref={overlayRef} className={styles.heroOverlay}>
          <HeroOverlay />
        </div>

        {/* Scroll chapters */}
        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.id}
            ref={(el) => { chaptersRef.current[i] = el; }}
            className={`${styles.chapter} ${styles[`chapter--${ch.align}`]}`}
            style={{ opacity: 0 }}
          >
            <h2 className={styles.chapter__title}>{ch.title}</h2>
            <p className={styles.chapter__body}>{ch.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
