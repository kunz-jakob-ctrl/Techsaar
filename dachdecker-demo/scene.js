/*
  3D-Dachbau-Hero — FIRST Bedachungen (Demo)
  Low-Poly-Giebelhaus, Aufbau-Sequenz: Pfetten → Sparren → Lattung → Ziegel → First.
  Zeitbasierte Timeline (übersteht Tab-Wechsel), InstancedMesh für Ziegel,
  DPR-Cap, reduced-motion & no-WebGL fallen auf das Poster/Endbild zurück.
*/
import * as THREE from './vendor/three.module.min.js';

const stage = document.getElementById('stage');
const phasenEl = Array.from(document.querySelectorAll('.phase'));
const abschlussEl = document.getElementById('abschluss');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finishNow = reduceMotion || new URLSearchParams(location.search).has('finish');

/* ── Maße ─────────────────────────────────────────────── */
const PITCH = THREE.MathUtils.degToRad(35);
const SIN = Math.sin(PITCH), COS = Math.cos(PITCH), TAN = Math.tan(PITCH);
const L = 7, W = 5, WALL_H = 2.6;
const RIDGE_Y = WALL_H + (W / 2) * TAN;          // 4.35
const OVER_Z = 0.45;                              // Traufüberstand
const EAVE_Z = W / 2 + OVER_Z;                    // 2.95
const EAVE_Y = WALL_H - OVER_Z * TAN;             // 2.285
const SLOPE_LEN = EAVE_Z / COS;                   // 3.60

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
  sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0005;
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
    zinc:    new THREE.MeshStandardMaterial({ color: 0x93a0ad, roughness: 0.5, metalness: 0.35 }),
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
  door.position.set(1.9, 1.0 + 0.35, W / 2 + 0.02);
  house.add(door);
  const win1 = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.05), mat.glass);
  win1.position.set(-1.5, 1.7, W / 2 + 0.02);
  const win2 = win1.clone(); win2.position.x = 0.35;
  const winGable = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), mat.glass);
  winGable.rotation.y = Math.PI / 2;
  winGable.position.set(L / 2 + 0.02, 3.0, 0);
  house.add(win1, win2, winGable);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 48), new THREE.ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ── Timeline-Gerüst ──────────────────────────────── */
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
      done: false,
    });
    return mesh;
  }

  /* ── Dachstuhl: Pfetten + Sparren ── */
  const DROP = new THREE.Vector3(0, 2.2, 0);
  for (const side of [1, -1]) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(L + 0.2, 0.13, 0.16), mat.wood);
    plate.position.set(0, WALL_H + 0.065, side * (W / 2 - 0.08));
    addItem(plate, 0.40 + (side < 0 ? 0.1 : 0), 0.5, DROP);

    slopePoint(1.0, side, V); roofNormal(side, V2);
    const mid = new THREE.Mesh(new THREE.BoxGeometry(L + 0.4, 0.14, 0.12), mat.wood);
    mid.position.set(0, V.y - V2.y * 0.1, V.z - V2.z * 0.1);
    addItem(mid, 0.62 + (side < 0 ? 0.1 : 0), 0.5, DROP);
  }
  const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(L + 0.4, 0.18, 0.14), mat.wood);
  ridgeBeam.position.set(0, RIDGE_Y - 0.14, 0);
  addItem(ridgeBeam, 0.9, 0.55, DROP);

  const rafterGeo = new THREE.BoxGeometry(0.09, 0.17, SLOPE_LEN + 0.1);
  const N_RAFTER = 10;
  for (let i = 0; i < N_RAFTER; i++) {
    const x = -3.3 + i * (6.6 / (N_RAFTER - 1));
    for (const side of [1, -1]) {
      const r = new THREE.Mesh(rafterGeo, mat.wood);
      slopePoint(SLOPE_LEN / 2, side, V); roofNormal(side, V2);
      r.position.set(x, V.y + V2.y * 0.085, V.z + V2.z * 0.085);
      r.rotation.x = side * PITCH;
      roofNormal(side, V2).multiplyScalar(2.2);
      addItem(r, 1.05 + i * 0.14 + (side < 0 ? 0.06 : 0), 0.5, V2, easeOutBack, side * 0.35);
    }
  }

  /* ── Lattung ── */
  const battenGeo = new THREE.BoxGeometry(L, 0.05, 0.06);
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

  /* ── Eindeckung: Ziegel als InstancedMesh ── */
  const N_COLS = 17, N_ROWS = 10;
  const tileGeo = new THREE.BoxGeometry(0.41, 0.045, 0.36);
  const tiles = new THREE.InstancedMesh(tileGeo, mat.tile, N_COLS * N_ROWS * 2);
  tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  tiles.castShadow = true;
  house.add(tiles);

  const tileData = [];
  const cTile = new THREE.Color(), cA = new THREE.Color(0xc94e28), cB = new THREE.Color(0xe26a3e);
  let ti = 0;
  for (const side of [1, -1]) {
    for (let r = 0; r < N_ROWS; r++) {
      for (let c = 0; c < N_COLS; c++) {
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
        // Start unsichtbar (Skalierung 0)
        M.compose(final, quat, V2.set(0.0001, 0.0001, 0.0001));
        tiles.setMatrixAt(ti, M);
        ti++;
      }
    }
  }
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;

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
  slopePoint((EAVE_Z - 0.8 / 1) / 1, 1, V); // Platzhalter, exakt unten:
  // Dachhöhe bei z = -0.8 (Nordseite): s = (EAVE_Z - 0.8) / COS
  {
    const s = (EAVE_Z - 0.8) / COS;
    const y = EAVE_Y + SIN * s;
    chimney.position.set(1.7, y + 0.45, -0.8);
  }
  addItem(chimney, 5.9, 0.5, new THREE.Vector3(0, 2.0, 0));

  /* ── Timeline-Ende / Phasen ── */
  const T_END = 6.6;
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
    if (t >= 6.2 && !abschlussEl.classList.contains('sichtbar')) abschlussEl.classList.add('sichtbar');
  }

  /* ── Einzel-Meshes animieren ── */
  function updateItems(t) {
    for (const it of items) {
      if (it.done) continue;
      if (t < it.t0) continue;
      const p = Math.min((t - it.t0) / it.dur, 1);
      const e = it.ease(p);
      it.mesh.visible = true;
      it.mesh.position.set(
        it.final.x + it.from.x * (1 - e),
        it.final.y + it.from.y * (1 - e),
        it.final.z + it.from.z * (1 - e)
      );
      if (it.rotAmt) it.mesh.rotation.x = it.baseRotX + it.rotAmt * (1 - e);
      if (p >= 1) {
        it.mesh.position.copy(it.final);
        it.mesh.rotation.x = it.baseRotX;
        it.done = true;
      }
    }
  }

  /* ── Instanzen animieren (Ziegel + Firstziegel) ── */
  function updateInstances(mesh, data, t) {
    let touched = false;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (d.settled) continue;
      if (t < d.t0) continue;
      const p = Math.min((t - d.t0) / d.dur, 1);
      const e = easeOutCubic(p);
      V.set(
        d.final.x + d.from.x * (1 - e),
        d.final.y + d.from.y * (1 - e),
        d.final.z + d.from.z * (1 - e)
      );
      if (d.side && p < 1) {
        Q2.setFromAxisAngle(XAXIS, d.side * 0.3 * (1 - e));
        Q.copy(d.quat).multiply(Q2);
      } else {
        Q.copy(d.quat);
      }
      M.compose(p < 1 ? V : d.final, Q, S1);
      mesh.setMatrixAt(i, M);
      touched = true;
      if (p >= 1) d.settled = true;
    }
    if (touched) mesh.instanceMatrix.needsUpdate = true;
  }

  /* ── Abschluss-Beat: Fenster glühen, Licht wärmt auf ── */
  const sunWarm = new THREE.Color(0xffd9ad);
  const sunBase = new THREE.Color(0xffe9cf);
  function updateFinale(t) {
    const p = THREE.MathUtils.clamp((t - 6.0) / 0.8, 0, 1);
    const e = easeOutCubic(p);
    mat.glass.emissiveIntensity = e * 1.2;
    sun.color.copy(sunBase).lerp(sunWarm, e);
    sun.intensity = 3.0 + e * 0.35;
  }

  /* ── Kamera: Fit + Offset + Idle-Drift + Parallaxe ── */
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

  function placeCamera(t) {
    const idle = reduceMotion ? 0 : Math.sin(t * 0.18) * 0.025;
    const targetAz = AZ0 + idle + parX * 0.05;
    const targetEl = EL0 + parY * 0.03;
    az += (targetAz - az) * 0.06;
    el += (targetEl - el) * 0.06;
    camera.position.set(
      target.x + dist * Math.sin(az) * Math.cos(el),
      target.y + dist * Math.sin(el),
      target.z + dist * Math.cos(az) * Math.cos(el)
    );
    camera.lookAt(target);
  }

  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    window.addEventListener('pointermove', (ev) => {
      mouseX = (ev.clientX / window.innerWidth) * 2 - 1;
      mouseY = (ev.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ── Zeitführung (Tab-Wechsel pausiert die Uhr) ── */
  let startTime = 0, pausedTotal = 0, hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = performance.now();
    else if (hiddenAt) { pausedTotal += performance.now() - hiddenAt; hiddenAt = 0; }
  });

  /* ── FPS-Messung für die Verifikation ── */
  let frames = 0, fpsWindowStart = 0;
  window.__fps = 0;
  window.__buildDone = false;

  let buildFinished = false;
  function finishAll() {
    updateItems(T_END + 1);
    updateInstances(tiles, tileData, T_END + 1);
    updateInstances(caps, capData, T_END + 1);
    updateFinale(T_END + 1);
    updatePhases(T_END + 1);
    buildFinished = true;
    window.__buildDone = true;
  }

  let firstFrame = true;
  function frame(now) {
    if (document.hidden) { requestAnimationFrame(frame); return; }
    if (!startTime) { startTime = now; fpsWindowStart = now; }
    const t = (now - startTime - pausedTotal) / 1000;

    if (!buildFinished) {
      updateItems(t);
      updateInstances(tiles, tileData, t);
      updateInstances(caps, capData, t);
      updateFinale(t);
      updatePhases(t);
      if (t >= T_END + 1) { buildFinished = true; window.__buildDone = true; }
    }

    placeCamera(t);
    renderer.render(scene, camera);

    if (firstFrame) { firstFrame = false; stage.classList.add('ready'); }

    frames++;
    if (now - fpsWindowStart >= 1000) {
      window.__fps = Math.round(frames * 1000 / (now - fpsWindowStart));
      frames = 0; fpsWindowStart = now;
    }

    parX += (mouseX - parX) * 0.05;
    parY += (mouseY - parY) * 0.05;

    if (reduceMotion && buildFinished) return; // Endbild steht — keine Dauerschleife
    requestAnimationFrame(frame);
  }

  applyFraming();
  window.addEventListener('resize', () => {
    applyFraming();
    if (reduceMotion && buildFinished) { placeCamera(0); renderer.render(scene, camera); }
  });

  if (finishNow) finishAll();
  requestAnimationFrame(frame);
}
