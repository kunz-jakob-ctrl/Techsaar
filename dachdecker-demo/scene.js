/*
  3D-Dachbau-Hero — FIRST Bedachungen (Demo)
  Low-Poly-Giebelhaus, Aufbau-Sequenz: Pfetten → Sparren → Lattung → Ziegel → First.
  Zwei Modi: automatisch (Uhr) oder ?ablauf=scroll (Scrollfortschritt scrubbt die Timeline).
  Timeline ist STATELESS (rein aus t berechnet) — nötig fürs Rückwärts-Scrubben.
  InstancedMesh für Ziegel, DPR-Cap, reduced-motion & no-WebGL fallen aufs Poster/Endbild zurück.
*/
import * as THREE from './vendor/three.module.min.js';

const stage = document.getElementById('stage');
const phasenEl = Array.from(document.querySelectorAll('.phase'));
const abschlussEl = document.getElementById('abschluss');
const hintEl = document.getElementById('scrollHint');
const track = document.querySelector('.scroll-track');

const params = new URLSearchParams(location.search);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finishNow = reduceMotion || params.has('finish');
// Scroll ist der Standard-Ablauf (Jakobs Entscheidung 2026-07-20); ?ablauf=auto als Referenz
const SCROLL = params.get('ablauf') !== 'auto' && !finishNow;

document.body.classList.toggle('modus-scroll', SCROLL);
if (SCROLL && track) track.style.height = '420vh';

/* ── Maße ─────────────────────────────────────────────── */
const PITCH = THREE.MathUtils.degToRad(35);
const SIN = Math.sin(PITCH), COS = Math.cos(PITCH);
const L = 7, W = 5, WALL_H = 2.6;
const RIDGE_Y = WALL_H + (W / 2) * Math.tan(PITCH);  // 4.35
const OVER_Z = 0.45;                                  // Traufüberstand
const EAVE_Z = W / 2 + OVER_Z;                        // 2.95
const EAVE_Y = WALL_H - OVER_Z * Math.tan(PITCH);     // 2.285
const SLOPE_LEN = EAVE_Z / COS;                       // 3.60

// Punkt auf der Dachfläche: s = 0 (Traufe) … SLOPE_LEN (First); side = +1 | -1
function slopePoint(s, side, out) {
  out.set(0, EAVE_Y + SIN * s, side * (EAVE_Z - COS * s));
  return out;
}
function roofNormal(side, out) { out.set(0, COS, side * SIN); return out; }

/* ── Renderer (mit Fallback aufs Poster) ─────────────── */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  console.warn('WebGL nicht verfügbar — Poster bleibt stehen.', e);
}
if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoft ist ab r185 deprecated (fiel ohnehin hierauf zurück)
  // Schatten hängen nur von Licht+Objekten ab, nicht von der Kamera: Depth-Pass nur
  // neu rendern, wenn sich der Baufortschritt (und damit Objekte/Drehung) ändert.
  renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);

  /* ── Licht: Morgenlicht über der Baustelle ── */
  const sun = new THREE.DirectionalLight(0xffe9cf, 3.0);
  sun.position.set(5, 9, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  // Frustum eng ums Haus legen (Szenenradius ~5,5): jeder Texel deckt ~7 mm statt ~18 mm ab.
  // Zusammen mit normalBias killt das die Schatten-Streifen (Acne) auf Putz und Ziegeln.
  sun.shadow.camera.left = -7; sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7;
  sun.shadow.camera.near = 5; sun.shadow.camera.far = 22;
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.05;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0x3a4a5e, 0x8a6a4c, 1.0));

  /* ── Materialien ── */
  const mat = {
    plaster: new THREE.MeshStandardMaterial({ color: 0xe9dfd0, roughness: 0.95 }),
    plinth:  new THREE.MeshStandardMaterial({ color: 0x262f3a, roughness: 0.9 }),
    wood:    new THREE.MeshStandardMaterial({ color: 0xb98354, roughness: 0.85 }),
    batten:  new THREE.MeshStandardMaterial({ color: 0xa97a4e, roughness: 0.85 }),
    tile:    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
    ridge:   new THREE.MeshStandardMaterial({ color: 0xb84a26, roughness: 0.85 }),
    door:    new THREE.MeshStandardMaterial({ color: 0x2a333f, roughness: 0.7 }),
    glass:   new THREE.MeshStandardMaterial({ color: 0x202b36, roughness: 0.4, emissive: 0xffb45c, emissiveIntensity: 0 }),
    brick:   new THREE.MeshStandardMaterial({ color: 0xa05540, roughness: 0.9 }),
    zinc:    new THREE.MeshStandardMaterial({ color: 0x93a0ad, roughness: 0.5, metalness: 0.35, side: THREE.DoubleSide }),
    trim:    new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.9 }),
    shutter: new THREE.MeshStandardMaterial({ color: 0x46586b, roughness: 0.8 }),
    stone:   new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 0.95 }),
  };

  /* ── Statischer Rumpf: Sockel, Wände, Tür, Fenster ── */
  const house = new THREE.Group();
  scene.add(house);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(L + 0.3, 0.35, W + 0.3), mat.plinth);
  plinth.position.y = 0.175;
  plinth.receiveShadow = true;
  house.add(plinth);

  const profile = new THREE.Shape();
  profile.moveTo(-W / 2, 0);
  profile.lineTo(W / 2, 0);
  profile.lineTo(W / 2, WALL_H);
  profile.lineTo(0, RIDGE_Y);
  profile.lineTo(-W / 2, WALL_H);
  profile.closePath();
  const walls = new THREE.Mesh(new THREE.ExtrudeGeometry(profile, { depth: L, bevelEnabled: false }), mat.plaster);
  walls.rotation.y = Math.PI / 2;
  walls.position.x = -L / 2;
  walls.castShadow = true; walls.receiveShadow = true;
  house.add(walls);

  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.0), mat.door);
  door.position.set(1.9, 1.35, W / 2 + 0.02);
  house.add(door);
  const win1 = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.05), mat.glass);
  win1.position.set(-1.5, 1.7, W / 2 + 0.02);
  const win2 = win1.clone(); win2.position.x = 0.35;
  const winGable = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), mat.glass);
  winGable.rotation.y = Math.PI / 2;
  winGable.position.set(L / 2 + 0.02, 3.0, 0);
  house.add(win1, win2, winGable);

  /* ── Detail: Fensterrahmen, Bänke, Sprossen, Läden, Türrahmen, Stufe ── */
  function windowTrim(w, h, withShutters) {
    const g = new THREE.Group();
    const d = 0.06;
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 2 * d, d, d), mat.trim);
    top.position.y = h / 2 + d / 2;
    const bottom = top.clone(); bottom.position.y = -h / 2 - d / 2;
    const left = new THREE.Mesh(new THREE.BoxGeometry(d, h, d), mat.trim);
    left.position.x = -w / 2 - d / 2;
    const right = left.clone(); right.position.x = w / 2 + d / 2;
    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 0.05, 0.16), mat.stone);
    sill.position.set(0, -h / 2 - d - 0.02, 0.05);
    const sprossV = new THREE.Mesh(new THREE.BoxGeometry(0.028, h, 0.02), mat.trim);
    sprossV.position.z = 0.012;
    const sprossH = new THREE.Mesh(new THREE.BoxGeometry(w, 0.028, 0.02), mat.trim);
    sprossH.position.z = 0.012;
    g.add(top, bottom, left, right, sill, sprossV, sprossH);
    if (withShutters) {
      const sh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.48, h + 0.06, 0.04), mat.shutter);
      sh.position.set(-(w / 2 + d + w * 0.24 + 0.02), 0, 0.005);
      const sh2 = sh.clone(); sh2.position.x = -sh.position.x;
      g.add(sh, sh2);
    }
    // bewusst KEIN castShadow: ~20 Mini-Teile im Schatten-Pass kosten iGPU-Zeit ohne sichtbaren Nutzen
    return g;
  }
  const trim1 = windowTrim(1.15, 1.05, true);
  trim1.position.set(-1.5, 1.7, W / 2 + 0.02);
  const trim2 = windowTrim(1.15, 1.05, true);
  trim2.position.set(0.35, 1.7, W / 2 + 0.02);
  const trimGable = windowTrim(0.85, 0.85, false);
  trimGable.rotation.y = Math.PI / 2;
  trimGable.position.set(L / 2 + 0.02, 3.0, 0);
  house.add(trim1, trim2, trimGable);

  const doorTop = new THREE.Mesh(new THREE.BoxGeometry(1.07, 0.06, 0.06), mat.trim);
  doorTop.position.set(1.9, 2.38, W / 2 + 0.02);
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.06, 0.06), mat.trim);
  doorL.position.set(1.9 - 0.505, 1.36, W / 2 + 0.02);
  const doorR = doorL.clone(); doorR.position.x = 1.9 + 0.505;
  // Oberkante 0.30 (Sockel = 0.35) und vor den Sockel gesetzt → keine koplanaren Flächen (kein Z-Fighting)
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.3, 0.5), mat.stone);
  step.position.set(1.9, 0.15, W / 2 + 0.27);
  step.castShadow = true;
  house.add(doorTop, doorL, doorR, step);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 48), new THREE.ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ── Timeline-Gerüst (stateless: alles wird pro Frame aus t berechnet) ── */
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const easeOutBack = (x) => { const c1 = 1.35, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  const items = [];   // animierte Einzel-Meshes
  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  const Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion();
  const M = new THREE.Matrix4(), S1 = new THREE.Vector3(1, 1, 1);
  const XAXIS = new THREE.Vector3(1, 0, 0);

  function addItem(mesh, t0, dur, fromOffset, ease = easeOutBack, rotAmt = 0) {
    mesh.castShadow = true;
    mesh.visible = false;
    house.add(mesh);
    items.push({
      mesh, t0, dur, ease, rotAmt,
      final: mesh.position.clone(),
      baseRotX: mesh.rotation.x,
      from: fromOffset.clone(),
    });
    return mesh;
  }

  /* ── Dachstuhl: Pfetten + Sparren ──
     Länge 6.9 < Hauslänge 7.0 → Balkenenden sitzen 0.05 hinter der Giebelwand (kein Durchstecken,
     keine koplanaren Enden). Drops mit easeOutCubic statt easeOutBack: KEIN Überschwinger, der die
     Balken am Ende unter ihre Endlage und durchs Dach stanzt. */
  const BEAM_L = L - 0.1;
  const DROP = new THREE.Vector3(0, 1.7, 0);
  for (const side of [1, -1]) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(BEAM_L, 0.13, 0.16), mat.wood);
    plate.position.set(0, WALL_H + 0.065, side * (W / 2 - 0.08));
    addItem(plate, 0.40 + (side < 0 ? 0.1 : 0), 0.5, DROP, easeOutCubic);

    slopePoint(1.0, side, V); roofNormal(side, V2);
    const mid = new THREE.Mesh(new THREE.BoxGeometry(BEAM_L, 0.14, 0.12), mat.wood);
    mid.position.set(0, V.y - V2.y * 0.1, V.z - V2.z * 0.1);
    addItem(mid, 0.62 + (side < 0 ? 0.1 : 0), 0.5, DROP, easeOutCubic);
  }
  const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(BEAM_L, 0.18, 0.14), mat.wood);
  ridgeBeam.position.set(0, RIDGE_Y - 0.14, 0);
  addItem(ridgeBeam, 0.9, 0.55, DROP, easeOutCubic);

  const rafterGeo = new THREE.BoxGeometry(0.09, 0.17, SLOPE_LEN + 0.1);
  const N_RAFTER = 10;
  for (let i = 0; i < N_RAFTER; i++) {
    const x = -3.3 + i * (6.6 / (N_RAFTER - 1));
    for (const side of [1, -1]) {
      const r = new THREE.Mesh(rafterGeo, mat.wood);
      slopePoint(SLOPE_LEN / 2, side, V); roofNormal(side, V2);
      r.position.set(x, V.y + V2.y * 0.085, V.z + V2.z * 0.085);
      r.rotation.x = side * PITCH;
      roofNormal(side, V2).multiplyScalar(1.4);
      addItem(r, 1.05 + i * 0.14 + (side < 0 ? 0.06 : 0), 0.5, V2, easeOutCubic, side * 0.3);
    }
  }

  /* ── Lattung ── */
  const battenGeo = new THREE.BoxGeometry(BEAM_L, 0.05, 0.06); // < Hauslänge → keine koplanaren Enden an der Giebelwand
  const N_BATTEN = 9;
  for (let j = 0; j < N_BATTEN; j++) {
    const s = 0.25 + j * 0.4;
    for (const side of [1, -1]) {
      const b = new THREE.Mesh(battenGeo, mat.batten);
      slopePoint(s, side, V); roofNormal(side, V2);
      b.position.set(0, V.y + V2.y * 0.2, V.z + V2.z * 0.2);
      b.rotation.x = side * PITCH;
      addItem(b, 2.55 + j * 0.09 + (side < 0 ? 0.045 : 0), 0.4, new THREE.Vector3(-2.4, 0.35, 0), easeOutCubic);
    }
  }

  /* ── Detail: Dachrinnen (nach der Lattung) + Fallrohr (Abschluss) ── */
  const gutterGeo = new THREE.CylinderGeometry(0.09, 0.09, 7.2, 8, 1, true, Math.PI, Math.PI);
  gutterGeo.rotateZ(Math.PI / 2);
  for (const side of [1, -1]) {
    const g = new THREE.Mesh(gutterGeo, mat.zinc);
    g.position.set(0, 2.21, side * 3.02);
    addItem(g, 3.05 + (side < 0 ? 0.1 : 0), 0.45, new THREE.Vector3(0, 1.4, 0));
  }
  // Fallrohr: kurzer Schrägknick unter der Rinne zurück zur Wand, dann senkrecht
  const pipeGrp = new THREE.Group();
  const pipeBend = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.54, 8), mat.zinc);
  pipeBend.rotation.x = 1.0;
  pipeBend.position.set(0, 1.975 - 1.05, 2.795 - 2.57);
  const pipeDown = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 8), mat.zinc);
  pipeDown.position.set(0, 0, 0);
  pipeGrp.add(pipeBend, pipeDown);
  pipeGrp.position.set(3.25, 1.05, 2.57);
  pipeGrp.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  addItem(pipeGrp, 5.95, 0.45, new THREE.Vector3(0, 1.1, 0), easeOutCubic);

  /* ── Eindeckung: gewölbte Ziegel als InstancedMesh ── */
  const N_COLS = 17, N_ROWS = 10;
  const tShape = new THREE.Shape();
  tShape.moveTo(-0.205, 0);
  tShape.quadraticCurveTo(0, 0.05, 0.205, 0);
  tShape.lineTo(0.205, -0.045);
  tShape.quadraticCurveTo(0, 0.005, -0.205, -0.045);
  tShape.closePath();
  const tileGeo = new THREE.ExtrudeGeometry(tShape, { depth: 0.36, bevelEnabled: false, curveSegments: 3 });
  tileGeo.translate(0, 0, -0.18);
  const tiles = new THREE.InstancedMesh(tileGeo, mat.tile, N_COLS * N_ROWS * 2);
  tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  tiles.castShadow = true;
  house.add(tiles);

  // Lücke fürs Dachfenster (Vorderseite, Reihen 3-4, Spalten 4-5)
  const isSkylightGap = (side, r, c) => side === 1 && (r === 3 || r === 4) && (c === 4 || c === 5);

  const tileData = [];
  const cTile = new THREE.Color(), cA = new THREE.Color(0xc94e28), cB = new THREE.Color(0xe26a3e);
  let ti = 0;
  for (const side of [1, -1]) {
    for (let r = 0; r < N_ROWS; r++) {
      for (let c = 0; c < N_COLS; c++) {
        if (isSkylightGap(side, r, c)) continue;
        const s = 0.28 + r * 0.345;
        const x = -3.36 + c * 0.42;
        slopePoint(s, side, V); roofNormal(side, V2);
        const off = 0.15 + r * 0.006;
        const final = new THREE.Vector3(x, V.y + V2.y * off, V.z + V2.z * off);
        const quat = new THREE.Quaternion().setFromAxisAngle(XAXIS, side * PITCH);
        const from = roofNormal(side, new THREE.Vector3()).multiplyScalar(1.6);
        tileData.push({
          final, quat, from, side,
          t0: 3.4 + r * 0.185 + c * 0.008 + (side < 0 ? 0.05 : 0),
          dur: 0.32,
        });
        cTile.copy(cA).lerp(cB, Math.random());
        cTile.offsetHSL(0, 0, (Math.random() - 0.5) * 0.05);
        tiles.setColorAt(ti, cTile);
        M.compose(final, quat, V2.set(0.0001, 0.0001, 0.0001));
        tiles.setMatrixAt(ti, M);
        ti++;
      }
    }
  }
  tiles.count = ti;
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;

  /* ── Detail: Dachfenster in der Ziegel-Lücke ── */
  const skylight = new THREE.Group();
  const skFrame = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.09, 0.8), mat.zinc);
  const skGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.6), mat.glass);
  skGlass.rotation.x = -Math.PI / 2;
  skGlass.position.y = 0.05;
  skFrame.castShadow = true;
  skylight.add(skFrame, skGlass);
  slopePoint(1.49, 1, V); roofNormal(1, V2);
  skylight.position.set(-1.47, V.y + V2.y * 0.2, V.z + V2.z * 0.2);
  skylight.rotation.x = PITCH;
  addItem(skylight, 4.55, 0.45, roofNormal(1, new THREE.Vector3()).multiplyScalar(1.4));

  /* ── Detail: Ortgang-Windbretter (schließen die Giebelkanten) ── */
  const ortGeo = new THREE.BoxGeometry(0.05, 0.2, SLOPE_LEN);
  let oi = 0;
  for (const gx of [1, -1]) {
    for (const side of [1, -1]) {
      const o = new THREE.Mesh(ortGeo, mat.wood);
      slopePoint(SLOPE_LEN / 2, side, V); roofNormal(side, V2);
      o.position.set(gx * 3.55, V.y + V2.y * 0.12, V.z + V2.z * 0.12);
      o.rotation.x = side * PITCH;
      addItem(o, 5.05 + oi * 0.08, 0.4, new THREE.Vector3(gx * 0.7, 0.25, 0), easeOutCubic);
      oi++;
    }
  }

  /* ── Firstziegel ── */
  const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 7, 1, false, 0, Math.PI);
  capGeo.rotateZ(Math.PI / 2);
  const N_CAPS = 16;
  const caps = new THREE.InstancedMesh(capGeo, mat.ridge, N_CAPS);
  caps.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  caps.castShadow = true;
  house.add(caps);
  const capData = [];
  for (let k = 0; k < N_CAPS; k++) {
    const final = new THREE.Vector3(-3.45 + k * (6.9 / 15), RIDGE_Y + 0.06, 0);
    capData.push({ final, quat: new THREE.Quaternion(), from: new THREE.Vector3(0, 1.2, 0), t0: 5.3 + k * 0.035, dur: 0.3 });
    M.compose(final, Q, V2.set(0.0001, 0.0001, 0.0001));
    caps.setMatrixAt(k, M);
  }

  /* ── Kamin (Abschluss) ── */
  const chimney = new THREE.Group();
  const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.15, 0.55), mat.brick);
  const cCap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.7), mat.zinc);
  cBody.castShadow = true; cCap.castShadow = true;
  cCap.position.y = 0.6;
  chimney.add(cBody, cCap);
  {
    // Dachhöhe bei z = -0.8 (Nordseite): s = (EAVE_Z - 0.8) / COS
    const s = (EAVE_Z - 0.8) / COS;
    chimney.position.set(1.7, EAVE_Y + SIN * s + 0.45, -0.8);
  }
  addItem(chimney, 5.9, 0.5, new THREE.Vector3(0, 2.0, 0));

  /* ── Timeline-Ende / Phasen ── */
  const T_END = 6.6;
  const T_SCRUB = 7.0;   // Scroll-Modus scrubbt bis hier (Finale voll erreichbar)
  const PHASE_BOUNDS = [0.4, 2.7, 3.4, 5.3, 6.15];
  const phaseState = [null, null, null, null];

  function updatePhases(t) {
    for (let i = 0; i < 4; i++) {
      const state = t >= PHASE_BOUNDS[i + 1] ? 'fertig' : (t >= PHASE_BOUNDS[i] ? 'aktiv' : '');
      if (state !== phaseState[i]) {
        phaseState[i] = state;
        phasenEl[i].classList.toggle('aktiv', state === 'aktiv');
        phasenEl[i].classList.toggle('fertig', state === 'fertig');
      }
    }
    abschlussEl.classList.toggle('sichtbar', t >= 6.2);
  }

  /* ── Einzel-Meshes (stateless aus t) ── */
  function updateItems(t) {
    for (const it of items) {
      if (t < it.t0) { it.mesh.visible = false; continue; }
      it.mesh.visible = true;
      const p = Math.min((t - it.t0) / it.dur, 1);
      if (p >= 1) {
        it.mesh.position.copy(it.final);
        it.mesh.rotation.x = it.baseRotX;
        continue;
      }
      const e = it.ease(p);
      it.mesh.position.set(
        it.final.x + it.from.x * (1 - e),
        it.final.y + it.from.y * (1 - e),
        it.final.z + it.from.z * (1 - e)
      );
      it.mesh.rotation.x = it.baseRotX + (it.rotAmt ? it.rotAmt * (1 - e) : 0);
    }
  }

  /* ── Instanzen (Ziegel + Firstziegel, stateless aus t) ── */
  function updateInstances(mesh, data, t) {
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (t < d.t0) {
        M.compose(d.final, d.quat, V2.set(0.0001, 0.0001, 0.0001));
        mesh.setMatrixAt(i, M);
        continue;
      }
      const p = Math.min((t - d.t0) / d.dur, 1);
      if (p >= 1) {
        M.compose(d.final, d.quat, S1);
        mesh.setMatrixAt(i, M);
        continue;
      }
      const e = easeOutCubic(p);
      V.set(
        d.final.x + d.from.x * (1 - e),
        d.final.y + d.from.y * (1 - e),
        d.final.z + d.from.z * (1 - e)
      );
      if (d.side) {
        Q2.setFromAxisAngle(XAXIS, d.side * 0.3 * (1 - e));
        Q.copy(d.quat).multiply(Q2);
      } else {
        Q.copy(d.quat);
      }
      M.compose(V, Q, S1);
      mesh.setMatrixAt(i, M);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  /* ── Abschluss-Beat: Fenster glühen, Licht wärmt auf (stateless) ── */
  const sunWarm = new THREE.Color(0xffd9ad);
  const sunBase = new THREE.Color(0xffe9cf);
  function updateFinale(t) {
    const p = THREE.MathUtils.clamp((t - 6.0) / 0.8, 0, 1);
    const e = easeOutCubic(p);
    mat.glass.emissiveIntensity = e * 1.2;
    sun.color.copy(sunBase).lerp(sunWarm, e);
    sun.intensity = 3.0 + e * 0.35;
  }

  function evaluate(t) {
    updateItems(t);
    updateInstances(tiles, tileData, t);
    updateInstances(caps, capData, t);
    updateFinale(t);
    updatePhases(t);
    if (hintEl) hintEl.classList.toggle('aus', t > 0.45);
    if (t >= T_END) window.__buildDone = true;
  }

  /* ── Kamera: Fit + Offset + Idle-Drift + Parallaxe (+ Scroll-Choreografie) ── */
  const target = new THREE.Vector3(0, 2.15, 0);
  const AZ0 = 0.66, EL0 = 0.31;
  let az = AZ0, el = EL0, dist = 14;
  let mouseX = 0, mouseY = 0, parX = 0, parY = 0;
  let isDesktop = true;

  function applyFraming() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    isDesktop = aspect >= 0.95;
    camera.fov = isDesktop ? 36 : 52;
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect;
    const margin = isDesktop ? 0.6 : 1.0;
    dist = THREE.MathUtils.clamp(5.6 / (tanH * margin), 10.5, 30);
    if (isDesktop) {
      // Haus rechts der Mitte — Text links hat Platz
      camera.setViewOffset(w, h, -w * 0.12, -h * 0.02, w, h);
    } else {
      // Haus in der unteren Bildhälfte, Text oben
      camera.setViewOffset(w, h, 0, -h * 0.22, w, h);
    }
    camera.updateProjectionMatrix();
  }

  function placeCamera(nowSec, t) {
    const idle = reduceMotion ? 0 : Math.sin(nowSec * 0.18) * 0.025;
    let azT = AZ0 + idle + parX * 0.05;
    const elT = EL0 + parY * 0.03;
    let dEff = dist;
    if (SCROLL) {
      const p = THREE.MathUtils.clamp(t / T_SCRUB, 0, 1);
      dEff = dist * (1.05 - 0.05 * easeOutCubic(p)); // Mini-Dolly heran
      // Volle 360°-Drehung über den Aufbau — endet exakt in der Ausgangsansicht
      house.rotation.y = p * Math.PI * 2;
    }
    az += (azT - az) * 0.06;
    el += (elT - el) * 0.06;
    camera.position.set(
      target.x + dEff * Math.sin(az) * Math.cos(el),
      target.y + dEff * Math.sin(el),
      target.z + dEff * Math.cos(az) * Math.cos(el)
    );
    camera.lookAt(target);
  }

  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    window.addEventListener('pointermove', (ev) => {
      mouseX = (ev.clientX / window.innerWidth) * 2 - 1;
      mouseY = (ev.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ── Zeitführung (Auto-Modus: Tab-Wechsel pausiert die Uhr) ── */
  let startTime = 0, pausedTotal = 0, hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = performance.now();
    else if (hiddenAt) { pausedTotal += performance.now() - hiddenAt; hiddenAt = 0; }
  });

  /* ── FPS-Messung für die Verifikation ── */
  let frames = 0, fpsWindowStart = 0;
  window.__fps = 0;
  window.__buildDone = false;
  window.__t = 0;

  let displayT = 0;
  let firstFrame = true;
  let lastNow = 0;
  let lastEvalT = -1;

  function frame(now) {
    if (document.hidden) { requestAnimationFrame(frame); return; }
    if (!startTime) { startTime = now; fpsWindowStart = now; }
    const dt = Math.min(lastNow ? (now - lastNow) / 1000 : 0.016, 0.1);
    lastNow = now;

    let t;
    if (finishNow) {
      t = T_END + 1;
    } else if (SCROLL) {
      const max = Math.max(1, (track ? track.offsetHeight : 0) - window.innerHeight);
      const p = THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
      // zeitbasiertes Smoothing — gleiches Gefühl bei jeder Framerate
      displayT += (p * T_SCRUB - displayT) * (1 - Math.exp(-dt * 9));
      t = displayT;
    } else {
      t = (now - startTime - pausedTotal) / 1000;
    }
    window.__t = t;

    if (Math.abs(t - lastEvalT) > 0.0005) {
      evaluate(t);
      renderer.shadowMap.needsUpdate = true;
      lastEvalT = t;
    }
    placeCamera(now / 1000, t);
    renderer.render(scene, camera);

    if (firstFrame) { firstFrame = false; stage.classList.add('ready'); }

    frames++;
    if (now - fpsWindowStart >= 1000) {
      window.__fps = Math.round(frames * 1000 / (now - fpsWindowStart));
      frames = 0; fpsWindowStart = now;
    }

    parX += (mouseX - parX) * 0.05;
    parY += (mouseY - parY) * 0.05;

    if (reduceMotion) return; // Endbild steht — keine Dauerschleife
    requestAnimationFrame(frame);
  }

  applyFraming();
  window.addEventListener('resize', () => {
    applyFraming();
    if (reduceMotion) {
      evaluate(T_END + 1);
      renderer.shadowMap.needsUpdate = true;
      placeCamera(0, T_END + 1);
      renderer.render(scene, camera);
    }
  });

  requestAnimationFrame(frame);
}
