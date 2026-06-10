'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import styles from './HeroScene.module.scss';

export default function HeroScene() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfdf8f0);
    scene.fog = new THREE.FogExp2(0xfdf8f0, 0.018);

    // ── Camera — centered, slightly above, ring fills ~60% of frame
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.95, 3.6);
    camera.lookAt(0.1, 0.9, 0);

    // ── Lights ────────────────────────────────────────────────
    // Soft ambient
    const hemi = new THREE.HemisphereLight(0xfffcef, 0xfff0d0, 1.2);
    scene.add(hemi);

    // Key light — warm, from top-left
    const key = new THREE.DirectionalLight(0xfff6e0, 2.8);
    key.position.set(-2, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 14;
    key.shadow.bias = -0.001;
    scene.add(key);

    // Rim light — cool, from behind-right, creates edge separation
    const rim = new THREE.DirectionalLight(0xe8f0ff, 1.1);
    rim.position.set(3, 1, -3);
    scene.add(rim);

    // Fill — very soft from below
    const fill = new THREE.DirectionalLight(0xfff8ee, 0.4);
    fill.position.set(0, -2, 2);
    scene.add(fill);

    // ── Cyclorama (seamless floor→wall) ───────────────────────
    const cycProfile: THREE.Vector2[] = [];
    const flatR = 6, bendR = 5, wallH = 14;
    const arcSegs = 24;
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
      emissiveIntensity: 0.38,
      side: THREE.BackSide,
    });
    const cyc = new THREE.Mesh(cycGeo, cycMat);
    cyc.receiveShadow = true;
    scene.add(cyc);

    // ── Ring geometry ─────────────────────────────────────────
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

    // ── Sensors ───────────────────────────────────────────────
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

    // Oura-style pose: ring stands in three-quarter view — you look
    // into the bore from above-front, band sweeping down to the right.
    ringGroup.rotation.x = -Math.PI / 4.2;  // ~-43°: ¾ view into the bore
    ringGroup.rotation.z = -0.30;           // lean right
    ringGroup.scale.setScalar(4.6);
    ringGroup.position.set(1.05, 0.95, 0);  // floats above floor, right side
    scene.add(ringGroup);

    // ── Environment map ───────────────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment()).texture;
    ringMat.envMap = envTex;
    ringMat.needsUpdate = true;
    pmrem.dispose();

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

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      timer.update();
      const dt = timer.getDelta();
      const t = timer.getElapsed();

      // Slow, graceful Y rotation
      ringGroup.rotation.y += dt * 0.18;

      // Subtle float
      ringGroup.position.y = 0.95 + Math.sin(t * 0.55) * 0.022;

      // Breathing light
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

  return (
    <div className={styles.wrapper}>
      <div ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
