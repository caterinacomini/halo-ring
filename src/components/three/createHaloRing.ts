import * as THREE from 'three';

/**
 * Halo Ring — Obsidian Edition. Ported from the reference HTML model:
 *  - band with rounded rim edges (LatheGeometry), matte-black
 *  - bore + inner chamfer
 *  - 3 optical sensors (bezel + glass lens; center lens emissive)
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

  const OR = 1.0, IR = 0.76, BH = 0.445, BV = 0.046, NL = 200;

  // ── Band profile (rounded outer rim top + bottom) ─────────────────
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
  for (let k = 1; k <= 10; k++) {
    pts.push(new THREE.Vector2(IR, -BH / 2 + (BH * k) / 10));
  }

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x0e0f14,
    roughness: 0.64,
    metalness: 0.16,
    side: THREE.DoubleSide,
    envMap,
    envMapIntensity: 0.6,
  });
  const ringMesh = new THREE.Mesh(new THREE.LatheGeometry(pts, NL), ringMat);
  ringMesh.castShadow = true;
  ringMesh.receiveShadow = true;
  rg.add(ringMesh);

  // ── Bore (inner cylinder) ─────────────────────────────────────────
  const boreR = IR - 0.022;
  const borePts: THREE.Vector2[] = [];
  for (let bi = 0; bi <= 12; bi++) borePts.push(new THREE.Vector2(boreR, -BH / 2 + (BH * bi) / 12));
  rg.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(borePts, NL),
      new THREE.MeshStandardMaterial({
        color: 0x1a1e28, roughness: 0.3, metalness: 0.28, side: THREE.DoubleSide, envMap, envMapIntensity: 0.5,
      })
    )
  );

  // ── Inner chamfer ─────────────────────────────────────────────────
  const chR = boreR - 0.008;
  const chPts: THREE.Vector2[] = [];
  for (let ci = 0; ci <= 6; ci++) chPts.push(new THREE.Vector2(chR, -BH * 0.14 + (BH * 0.28 * ci) / 6));
  rg.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(chPts, NL),
      new THREE.MeshStandardMaterial({ color: 0x0f1218, roughness: 0.82, metalness: 0.08, side: THREE.DoubleSide })
    )
  );

  // ── Optical sensors (bezel + glass lens) ──────────────────────────
  const SA = Math.PI, SR = boreR - 0.003;
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x05030a, roughness: 0.02, metalness: 0.5,
    emissive: new THREE.Color(0x110004), emissiveIntensity: 0.1, envMap, envMapIntensity: 0.7,
  });
  const bezMat = new THREE.MeshStandardMaterial({ color: 0x18202c, roughness: 0.56, metalness: 0.38, envMap, envMapIntensity: 0.5 });

  const addSensor = (angle: number, sz: number, center: boolean) => {
    const cx = Math.cos(angle) * SR, cz = Math.sin(angle) * SR;
    const inward = new THREE.Vector3(-cx, 0, -cz).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), inward);
    const bz = new THREE.Mesh(new THREE.BoxGeometry(sz * 2.1, 0.009, sz * 2.1), bezMat);
    bz.position.set(cx, 0, cz); bz.quaternion.copy(q); rg.add(bz);
    const gm = glassMat.clone();
    if (center) { gm.emissiveIntensity = 0.2; gm.emissive = new THREE.Color(0x1c0008); }
    const ln = new THREE.Mesh(new THREE.BoxGeometry(sz * 1.78, 0.012, sz * 1.78), gm);
    ln.position.copy(new THREE.Vector3(cx, 0, cz).addScaledVector(inward, 0.004));
    ln.quaternion.copy(q); rg.add(ln);
  };
  addSensor(SA - 0.17, 0.047, false);
  addSensor(SA, 0.058, true);
  addSensor(SA + 0.17, 0.047, false);

  // ── Gold charge contacts (disc + rim) ─────────────────────────────
  const cMat = new THREE.MeshStandardMaterial({ color: 0x706050, roughness: 0.16, metalness: 0.94, envMap, envMapIntensity: 0.9 });
  const cRimMat = new THREE.MeshStandardMaterial({ color: 0x483828, roughness: 0.2, metalness: 0.9, envMap, envMapIntensity: 0.8 });
  [SA - 0.43, SA + 0.43].forEach((a) => {
    const cx = Math.cos(a) * SR, cz = Math.sin(a) * SR;
    const inward = new THREE.Vector3(-cx, 0, -cz).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), inward);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.011, 16), cMat);
    d.position.set(cx, 0, cz); d.quaternion.copy(q); rg.add(d);
    const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.006, 16), cRimMat);
    r2.position.copy(new THREE.Vector3(cx, 0, cz).addScaledVector(inward, 0.002));
    r2.quaternion.copy(q); rg.add(r2);
  });

  rg.scale.setScalar(MODEL_SCALE);
  return outer;
}
