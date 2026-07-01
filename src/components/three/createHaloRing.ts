import * as THREE from 'three';

/**
 * Halo Ring — Obsidian Edition. Ported from the reference HTML model:
 *  - thin-wall, wide band (flat rectangular cross-section), matte-black
 *  - dark titanium bore (no channel stripe)
 *  - 3 circular optical sensors (bezel + recess + glossy IR lens), the
 *    lenses pulse with a slow biological rhythm (self-contained)
 *  - 2 gold charge contacts (disc + rim)
 *
 * Built at reference scale (outer radius 1.0) then scaled down so the
 * group drops into the existing pose system (outer radius ≈ 0.205).
 */
const MODEL_SCALE = 0.205;

export function createHaloRing(envMap: THREE.Texture): THREE.Group {
  const outer = new THREE.Group();
  const rg = new THREE.Group();
  outer.add(rg);

  const OR = 1.0, IR = 0.845, BH = 0.42, BV = 0.02, NL = 200;

  // ── Band profile (thin wall, wide band, small rounded rims) ───────
  const pts: THREE.Vector2[] = [];
  const NB = 16;
  pts.push(new THREE.Vector2(IR, BH / 2));
  pts.push(new THREE.Vector2(OR - BV, BH / 2));
  for (let i = 1; i <= NB; i++) {
    const a = (Math.PI / 2) * (1 - i / NB);
    pts.push(new THREE.Vector2(OR - BV + BV * Math.cos(a), BH / 2 - BV + BV * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(OR, -(BH / 2 - BV)));
  for (let j = 1; j <= NB; j++) {
    const b = -(Math.PI / 2) * (j / NB);
    pts.push(new THREE.Vector2(OR - BV + BV * Math.cos(b), -(BH / 2 - BV) + BV * Math.sin(b)));
  }
  pts.push(new THREE.Vector2(IR, -BH / 2));
  for (let k = 1; k <= 10; k++) pts.push(new THREE.Vector2(IR, -BH / 2 + (BH * k) / 10));

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x0e0f14, roughness: 0.52, metalness: 0.22, side: THREE.DoubleSide, envMap, envMapIntensity: 0.7,
  });
  const ringMesh = new THREE.Mesh(new THREE.LatheGeometry(pts, NL), ringMat);
  ringMesh.castShadow = true;
  ringMesh.receiveShadow = true;
  rg.add(ringMesh);

  // ── Inner bore — dark titanium ────────────────────────────────────
  const boreR = IR - 0.016;
  const borePts: THREE.Vector2[] = [];
  for (let bi = 0; bi <= 12; bi++) borePts.push(new THREE.Vector2(boreR, -BH / 2 + (BH * bi) / 12));
  rg.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(borePts, NL),
      new THREE.MeshStandardMaterial({ color: 0x181c24, roughness: 0.28, metalness: 0.32, side: THREE.DoubleSide, envMap, envMapIntensity: 0.5 })
    )
  );

  // ── Circular optical sensors (bezel + recess + IR lens) ───────────
  const SA = Math.PI, SR = boreR - 0.002;
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x12161e, roughness: 0.4, metalness: 0.55, envMap, envMapIntensity: 0.55 });
  const recessMat = new THREE.MeshStandardMaterial({ color: 0x080a0e, roughness: 0.9, metalness: 0.05 });
  const lensMaterials: { mat: THREE.MeshStandardMaterial; base: number; center: boolean }[] = [];

  const addSensor = (angle: number, lensR: number, isCenter: boolean) => {
    const cx = Math.cos(angle) * SR, cz = Math.sin(angle) * SR;
    const inward = new THREE.Vector3(-cx, 0, -cz).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), inward);

    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(lensR * 1.52, lensR * 1.52, 0.013, 36), bezelMat);
    bezel.position.set(cx, 0, cz); bezel.quaternion.copy(q); rg.add(bezel);

    const recess = new THREE.Mesh(new THREE.CylinderGeometry(lensR * 1.18, lensR * 1.18, 0.015, 36), recessMat);
    recess.position.copy(new THREE.Vector3(cx, 0, cz).addScaledVector(inward, 0.001)); recess.quaternion.copy(q); rg.add(recess);

    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x020206, roughness: 0.01, metalness: 0.45,
      emissive: new THREE.Color(isCenter ? 0x2a000e : 0x180006),
      emissiveIntensity: isCenter ? 0.2 : 0.12, envMap, envMapIntensity: 0.9,
    });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(lensR, lensR, 0.018, 36), lensMat);
    lens.position.copy(new THREE.Vector3(cx, 0, cz).addScaledVector(inward, 0.003)); lens.quaternion.copy(q); rg.add(lens);
    lensMaterials.push({ mat: lensMat, base: isCenter ? 0.2 : 0.12, center: isCenter });
  };
  addSensor(SA - 0.19, 0.036, false);
  addSensor(SA, 0.05, true);
  addSensor(SA + 0.19, 0.036, false);

  // ── Gold charge contacts (disc + rim) ─────────────────────────────
  const cMat = new THREE.MeshStandardMaterial({ color: 0x726252, roughness: 0.14, metalness: 0.96, envMap, envMapIntensity: 1.0 });
  const cRimMat = new THREE.MeshStandardMaterial({ color: 0x4a3e2e, roughness: 0.18, metalness: 0.92, envMap, envMapIntensity: 0.8 });
  [SA - 0.44, SA + 0.44].forEach((a) => {
    const cx = Math.cos(a) * SR, cz = Math.sin(a) * SR;
    const inward = new THREE.Vector3(-cx, 0, -cz).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), inward);
    const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.012, 24), cMat);
    dot.position.set(cx, 0, cz); dot.quaternion.copy(q); rg.add(dot);
    const rim2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.007, 24), cRimMat);
    rim2.position.copy(new THREE.Vector3(cx, 0, cz).addScaledVector(inward, 0.002)); rim2.quaternion.copy(q); rg.add(rim2);
  });

  // ── Self-contained sensor pulse (runs on the always-rendered band) ─
  const clock = new THREE.Clock();
  ringMesh.onBeforeRender = () => {
    const t = clock.getElapsedTime();
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.05);
    const slow = 0.5 + 0.5 * Math.sin(t * 1.05 - 0.4);
    for (const { mat, base, center } of lensMaterials) {
      mat.emissiveIntensity = base * (0.75 + 0.4 * (center ? pulse : slow));
    }
  };

  rg.scale.setScalar(MODEL_SCALE);
  return outer;
}
