'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './HeroScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f2ee);

    // ── Camera ────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.4, 5.5);
    camera.lookAt(0, 0.8, 0);

    // ── Lights ────────────────────────────────────────────────
    // Ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    // Main directional — simulates large side window
    const sunLight = new THREE.DirectionalLight(0xfff8f0, 2.8);
    sunLight.position.set(-5, 6, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -4;
    sunLight.shadow.camera.right = 4;
    sunLight.shadow.camera.top = 4;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Soft fill from opposite side
    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.6);
    fillLight.position.set(4, 3, 2);
    scene.add(fillLight);

    // Overhead spot on ring
    const spotLight = new THREE.SpotLight(0xffffff, 3.5, 8, Math.PI / 9, 0.4, 1.5);
    spotLight.position.set(0, 4.5, 0.5);
    spotLight.target.position.set(0, 0.9, 0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.set(1024, 1024);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // ── Floor ─────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf0ece6,
      roughness: 0.08,
      metalness: 0.0,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Back wall ─────────────────────────────────────────────
    const wallGeo = new THREE.PlaneGeometry(14, 8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf7f4f0,
      roughness: 0.9,
      metalness: 0.0,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 4, -5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Side wall (window side — left)
    const sideWallMat = new THREE.MeshStandardMaterial({
      color: 0xf7f4f0,
      roughness: 0.9,
    });
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), sideWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-6, 4, -1);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Ceiling
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 1 });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 8;
    scene.add(ceil);

    // ── Pedestal ──────────────────────────────────────────────
    // Top slab
    const slabGeo = new THREE.BoxGeometry(0.52, 0.04, 0.52);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0xeae6e0,
      roughness: 0.35,
      metalness: 0.0,
    });
    const slab = new THREE.Mesh(slabGeo, pedMat);
    slab.position.set(0, 0.92, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    scene.add(slab);

    // Column
    const colGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.9, 48);
    const col = new THREE.Mesh(colGeo, pedMat);
    col.position.set(0, 0.45, 0);
    col.castShadow = true;
    col.receiveShadow = true;
    scene.add(col);

    // Base
    const baseGeo = new THREE.BoxGeometry(0.56, 0.04, 0.56);
    const base = new THREE.Mesh(baseGeo, pedMat);
    base.position.set(0, 0.02, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);

    // ── Halo Ring ─────────────────────────────────────────────
    // Outer geometry: torus (ring)
    const ringGeo = new THREE.TorusGeometry(0.21, 0.048, 96, 256);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0c,
      roughness: 0.06,
      metalness: 0.9,
      envMapIntensity: 1.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 1.06, 0);
    // Stand the ring upright (flat) on the pedestal
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = true;
    scene.add(ring);

    // Subtle inner band detail
    const innerGeo = new THREE.TorusGeometry(0.21, 0.038, 64, 256);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x14121a,
      roughness: 0.22,
      metalness: 0.7,
    });
    const innerRing = new THREE.Mesh(innerGeo, innerMat);
    innerRing.position.copy(ring.position);
    innerRing.rotation.copy(ring.rotation);
    scene.add(innerRing);

    // ENV map (simple hemisphere for reflections)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment(0.5);
    const envTexture = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // ── Shadow catcher plane (subtle ring shadow on slab) ─────
    // (handled by receiveShadow on slab)

    // ── Float animation ───────────────────────────────────────
    const ringGroup = new THREE.Group();
    ringGroup.add(ring);
    ringGroup.add(innerRing);
    scene.add(ringGroup);
    ring.position.set(0, 0, 0);
    innerRing.position.set(0, 0, 0);
    ringGroup.position.set(0, 1.06, 0);

    // ── Resize handler ────────────────────────────────────────
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── GSAP scroll camera ────────────────────────────────────
    // Camera starts further back and moves in on scroll
    const camData = { z: 5.5, y: 1.4, rotX: 0 };
    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=100%',
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;
        camera.position.z = 5.5 - p * 1.8;
        camera.position.y = 1.4 - p * 0.2;
        camera.lookAt(0, 0.9, 0);
      },
    });

    // ── Render loop ───────────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Float the ring gently
      ringGroup.position.y = 1.06 + Math.sin(t * 0.7) * 0.018;
      // Slow rotation
      ringGroup.rotation.y = t * 0.18;

      // Animate sunlight very subtly (breathing effect)
      sunLight.intensity = 2.8 + Math.sin(t * 0.3) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={styles.canvas} />;
}
