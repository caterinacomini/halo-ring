import * as THREE from 'three';

/**
 * Halo Ring 3D model — built to match the product renders:
 *  - glossy black outer shell, slightly domed, crisp lip at the rims
 *  - mirror-chrome inner liner (epoxy over PCB look)
 *  - electronics under the liner: gold pads, dark ICs, red + green LEDs,
 *    one chrome charge button
 *
 * Outer diameter ≈ 0.43 world units, band height ≈ 0.105.
 */
export function createHaloRing(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();

  const Rliner = 0.162;  // bore radius (chrome liner)
  const Rout   = 0.205;  // nominal outer radius
  const halfH  = 0.052;  // band half-height — wide band like the renders
  const dome   = 0.009;  // outer wall convexity
  const edge   = 0.006;  // rim edge rounding
  const arcN   = 6;

  // ── Outer shell profile ───────────────────────────────────────────
  const shellIn = Rliner + 0.0015; // hidden just behind the liner
  const pts: THREE.Vector2[] = [];

  // 1) top face: inner → outer
  pts.push(new THREE.Vector2(shellIn, halfH));

  // 2) top edge arc — center (Rout-edge, halfH-edge), 90° → 0°
  for (let i = 0; i <= arcN; i++) {
    const a = (i / arcN) * (Math.PI / 2);
    pts.push(new THREE.Vector2(
      Rout - edge + edge * Math.sin(a),
      halfH - edge + edge * Math.cos(a)
    ));
  }

  // 3) domed outer wall: y from +(halfH-edge) to -(halfH-edge)
  const yEdge = halfH - edge;
  const bulgeAtEdge = dome * Math.cos((yEdge / halfH) * (Math.PI / 2));
  const wallSegs = 28;
  for (let i = 1; i < wallSegs; i++) {
    const y = yEdge * (1 - 2 * (i / wallSegs));
    const bulge = dome * Math.cos((y / halfH) * (Math.PI / 2));
    pts.push(new THREE.Vector2(Rout + bulge - bulgeAtEdge, y));
  }

  // 4) bottom edge arc — center (Rout-edge, -(halfH-edge)), 0° → 90°
  for (let i = 0; i <= arcN; i++) {
    const a = (i / arcN) * (Math.PI / 2);
    pts.push(new THREE.Vector2(
      Rout - edge + edge * Math.cos(a),
      -(halfH - edge) - edge * Math.sin(a)
    ));
  }

  // 5) bottom face → inner wall back up
  pts.push(new THREE.Vector2(shellIn, -halfH));
  pts.push(new THREE.Vector2(shellIn, halfH));

  const shellGeo = new THREE.LatheGeometry(pts, 256);
  shellGeo.computeVertexNormals();
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x050507,
    roughness: 0.42,
    metalness: 0.30,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
    envMap,
    envMapIntensity: 0.5,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.castShadow = true;
  shell.receiveShadow = true;
  group.add(shell);

  // ── Chrome liner (mirror inner surface) ───────────────────────────
  const linerH = halfH * 0.80; // black lip stays visible at both rims
  const linerPts = [
    new THREE.Vector2(Rliner, linerH),
    new THREE.Vector2(Rliner - 0.002, linerH * 0.35),
    new THREE.Vector2(Rliner - 0.0026, 0),
    new THREE.Vector2(Rliner - 0.002, -linerH * 0.35),
    new THREE.Vector2(Rliner, -linerH),
  ];
  const linerGeo = new THREE.LatheGeometry(linerPts, 256);
  linerGeo.computeVertexNormals();
  const linerMat = new THREE.MeshStandardMaterial({
    color: 0x84888f,
    roughness: 0.12,
    metalness: 1.0,
    envMap,
    envMapIntensity: 0.65,
    side: THREE.DoubleSide,
  });
  const liner = new THREE.Mesh(linerGeo, linerMat);
  group.add(liner);

  // ── Electronics under the liner ───────────────────────────────────
  const eR = Rliner - 0.0035; // just proud of the liner, facing the bore axis

  const place = (mesh: THREE.Mesh, theta: number, y: number) => {
    mesh.position.set(eR * Math.cos(theta), y, eR * Math.sin(theta));
    mesh.lookAt(0, y, 0);
    group.add(mesh);
  };

  // Gold sensor pads — two loose clusters
  const padGeo = new THREE.CircleGeometry(0.0065, 20);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0xd8c48e,
    roughness: 0.32,
    metalness: 0.85,
    envMap,
    envMapIntensity: 0.8,
  });
  const padSpots: [number, number][] = [
    [0.30, 0.012], [0.46, -0.008], [0.58, 0.016], [0.70, -0.014], [0.86, 0.004],
    [2.45, 0.010], [2.60, -0.012], [2.78, 0.014], [2.92, -0.004],
  ];
  for (const [th, y] of padSpots) place(new THREE.Mesh(padGeo, padMat), th, y);

  // Dark ICs — small rectangular plates
  const icGeo = new THREE.PlaneGeometry(0.016, 0.009);
  const icMat = new THREE.MeshStandardMaterial({
    color: 0x15181d,
    roughness: 0.4,
    metalness: 0.3,
    envMap,
    envMapIntensity: 0.5,
  });
  const icSpots: [number, number][] = [
    [1.25, 0.002], [1.65, -0.010], [3.55, 0.008], [4.10, -0.002], [5.30, 0.010],
  ];
  for (const [th, y] of icSpots) place(new THREE.Mesh(icGeo, icMat), th, y);

  // LEDs — red and green, always-bright
  const ledGeo = new THREE.PlaneGeometry(0.006, 0.009);
  const ledRed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0xff2418 }));
  place(ledRed, 1.95, 0.001);
  const ledGreen = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x2ee04e }));
  place(ledGreen, 3.95, 0.003);

  // Charge button — chrome disc with gold center
  const btnMat = new THREE.MeshStandardMaterial({
    color: 0xb8bcc2,
    roughness: 0.12,
    metalness: 1.0,
    envMap,
    envMapIntensity: 1.6,
  });
  place(new THREE.Mesh(new THREE.CircleGeometry(0.016, 28), btnMat), 5.85, 0);
  const btnDot = new THREE.Mesh(new THREE.CircleGeometry(0.005, 20), padMat);
  const btnR = eR - 0.0008;
  btnDot.position.set(btnR * Math.cos(5.85), 0, btnR * Math.sin(5.85));
  btnDot.lookAt(0, 0, 0);
  group.add(btnDot);

  return group;
}
