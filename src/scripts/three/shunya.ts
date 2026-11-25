/**
 * Line 2B hero scene: the Shunya bridge in BKC. The zero-shaped steel pylon
 * is a closed loop standing across the line on the west bank, with the deck through its opening;
 * stay cables in two planes carry the 80 m span over the Vakola nallah and the 50 m anchor span. A
 * six-car BEML rake runs through the 0, and "2B" is painted on the ground.
 * Same camera family and halftone field as the viaduct and Kasheli scenes. Original geometry, not an
 * official design: spans, heights and the deck width are the published figures; the cable count and
 * the loop's proportions are drawn, not measured.
 */
import * as THREE from 'three';
import { createStage, lightRig, box, flat, textTexture, onThemeChange } from './common';

/**
 * A six-car rake in the livery of the BEML-built trains of Lines 2A, 2B and 7, the same palette as the
 * back page's drawing (tokens.css --rake-*): blue body, a white band at window height with the windows
 * in it, a thin yellow line under the band, a grey roof, and a white sweep up the cab front. No logos.
 * Same size and nose as common.ts buildTrain, so it sits on the deck the same way.
 */
function buildBemlTrain(cars = 6): THREE.Group {
  const group = new THREE.Group();
  const CAR = 21, GAP = 0.6, W = 3.2, H = 3.7;
  const blue = flat('#213f9a');
  const white = flat('#f4f1ea');
  const yellow = flat('#f2c11d');
  const roof = flat('#9c978e');
  const glass = flat('#121a2b');
  const under = flat('#23262d');
  const seam = flat('#1a3380');

  const total = cars * CAR + (cars - 1) * GAP;
  for (let i = 0; i < cars; i++) {
    const x0 = -total / 2 + i * (CAR + GAP);
    const isHead = i === 0 || i === cars - 1;
    const dir = i === 0 ? -1 : 1;
    const s = new THREE.Shape();
    const nose = isHead ? 1.6 : 0;
    if (isHead && dir === -1) {
      s.moveTo(0, 0.9); s.lineTo(CAR, 0.9); s.lineTo(CAR, H); s.lineTo(nose, H); s.lineTo(0, H - 1.3);
    } else if (isHead) {
      s.moveTo(0, 0.9); s.lineTo(CAR, 0.9); s.lineTo(CAR, H - 1.3); s.lineTo(CAR - nose, H); s.lineTo(0, H);
    } else {
      s.moveTo(0, 0.9); s.lineTo(CAR, 0.9); s.lineTo(CAR, H); s.lineTo(0, H);
    }
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 1 });
    geo.translate(0, 0, -W / 2);
    const car = new THREE.Mesh(geo, blue);
    car.position.x = x0;
    car.castShadow = true;
    group.add(car);

    for (const side of [-1, 1]) {
      const z = side * (W / 2 + 0.13);
      const cx = x0 + CAR / 2 + (isHead ? -dir * 0.6 : 0);
      const len = CAR - (isHead ? 2.2 : 0.4);
      // White band with the windows in it, and the yellow line under it.
      group.add(box(len, 1.35, 0.03, white, cx, 2.72, z));
      group.add(box(CAR - 0.4, 0.16, 0.04, yellow, x0 + CAR / 2, 1.96, z));
      for (const dx of [1.6, 5.9, 10.6, 15.3]) group.add(box(2.6, 0.85, 0.05, glass, x0 + dx + 1.3, 2.75, z));
      // Door seams, four a side.
      for (const dx of [3.4, 8.3, 12.7, 17.6]) {
        group.add(box(0.08, 2.4, 0.05, seam, x0 + dx, 2.1, z));
        group.add(box(0.08, 2.4, 0.05, seam, x0 + dx + 1.4, 2.1, z));
      }
    }
    group.add(box(CAR - 1.2, 0.35, W - 0.6, roof, x0 + CAR / 2, H + 0.2, 0));
    group.add(box(CAR - 2, 0.6, W - 0.8, under, x0 + CAR / 2, 0.6, 0));
    if (isHead) {
      // The cab front: a white sweep with the windscreen in it, and a yellow line across the nose.
      const fx = dir === -1 ? x0 + 0.55 : x0 + CAR - 0.55;
      const face = box(0.1, 1.5, W - 0.2, white, fx, H - 0.85, 0);
      face.rotation.z = dir * 0.62;
      group.add(face);
      const ws = box(0.12, 1.0, W - 0.9, glass, fx + dir * 0.03, H - 0.8, 0);
      ws.rotation.z = dir * 0.62;
      group.add(ws);
      group.add(box(0.12, 0.2, W - 0.4, yellow, dir === -1 ? x0 - 0.06 : x0 + CAR + 0.06, 1.96, 0));
    }
  }
  return group;
}

// Published figures (The Metro Rail Guy, 6 Oct 2024; Free Press Journal, 19 Jan 2026): 130 m long, an
// 80 m main span over the Vakola nallah and a 50 m anchor span, a 40 m steel pylon, deck segments
// 12.9 m wide. From Designfakt's renders: a white closed "0" on a dark plinth at the water's edge,
// the deck through it at about a third of its height, cable fans to both spans, a skewed crossing,
// overhead line masts. Leg thickness (3.7 m) is measured from the 24 May 2026 photo. Not published,
// so drawn: cable count and where the cables meet the 0.
const DECK = 14; // underside of the deck above the ground
const DECK_W = 12.9;
const PX = -30; // centre of the pylon, on the west bank of the nallah
const MAIN = 80;
const ANCHOR = 50;
const PYLON_H = 40;
// The "0": a closed loop standing across the line, the deck and both tracks through its opening
// (owner's direction, 2026-11-25, after Designfakt's renders). The opening clears the 12.9 m deck.
const RO = 9.2; // outer half-width of the 0, across the line: a slender band, as in the renders
const RI = 7; // inner half-width: the opening is 14 m, wider than the 12.9 m deck
const LEG = 3.7; // thickness of the loop along the line
const BASE = 2.2; // the loop stands on its plinth

export async function mount(host: HTMLElement, { reduced }: { reduced: boolean }) {
  const fig = host.querySelector('.lead') ?? host;
  const drawing = fig.querySelector('svg');
  const frame = document.createElement('div');
  frame.className = 'lead-3d';
  fig.prepend(frame);
  if (drawing) {
    const fit = () => (frame.style.height = `${drawing.getBoundingClientRect().height}px`);
    fit();
    new ResizeObserver(fit).observe(drawing);
  }
  const stage = createStage(frame, { shadows: true, animate: !reduced });
  const { scene } = stage;
  lightRig(scene, { shadows: true, span: 130 });

  // The line's colours from the page, so the field and the number follow the edition (day or night).
  const colours = () => {
    const css = getComputedStyle(host);
    return {
      field: css.getPropertyValue('--signal').trim() || '#f2c11d',
      ink: css.getPropertyValue('--on-signal').trim() || '#0c1422',
    };
  };
  let col = colours();

  // Field in the line's colour with newsprint halftone dots.
  const dots = document.createElement('canvas');
  dots.width = dots.height = 32;
  const g = dots.getContext('2d')!;
  const paintField = () => {
    g.fillStyle = col.field;
    g.fillRect(0, 0, 32, 32);
    g.fillStyle = 'rgba(12,20,34,0.22)';
    g.beginPath();
    g.arc(16, 16, 3.2, 0, Math.PI * 2);
    g.fill();
  };
  paintField();
  const dotTex = new THREE.CanvasTexture(dots);
  dotTex.wrapS = dotTex.wrapT = THREE.RepeatWrapping;
  dotTex.repeat.set(160, 160);
  dotTex.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ map: dotTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // The nallah: a wide channel with stone banks, crossed at a skew (Designfakt's aerial render), its
  // west bank at the foot of the pylon so the 80 m main span carries the line over the water.
  const SKEW = -0.5; // radians between the channel and a square crossing
  const nallah = new THREE.Group();
  const WIDTH = 46;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH, 900), flat('#22405b'));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.02;
  water.receiveShadow = true;
  nallah.add(water);
  const ripple = flat('#6f8496');
  for (let i = 0; i < 220; i++) {
    const d = 1.2 + ((i * 7) % 5) * 0.7;
    const r = box(0.22, 0.04, d, ripple, -WIDTH / 2 + 2 + ((i * 13.7) % (WIDTH - 4)), 0.05, -300 + ((i * 53.3) % 600));
    r.castShadow = false;
    nallah.add(r);
  }
  const stone = flat('#8a8478');
  const stoneTop = flat('#a39d90');
  for (const side of [-1, 1]) {
    nallah.add(box(3.2, 1.6, 900, stone, side * (WIDTH / 2 + 1.6), 0.8, 0));
    nallah.add(box(1.2, 0.3, 900, stoneTop, side * (WIDTH / 2 + 2.6), 1.75, 0));
  }
  nallah.rotation.y = SKEW;
  nallah.position.set(PX + 15 + WIDTH / 2 / Math.cos(SKEW), 0, 0); // clear of the plinth at the deck
  scene.add(nallah);

  // "2B", painted flat on the near ground.
  const lineNumber = host.dataset.lineNumber ?? '2B';
  const numberMat = new THREE.MeshLambertMaterial({ map: await textTexture(lineNumber, col.ink), transparent: true });
  const number = new THREE.Mesh(new THREE.PlaneGeometry(38, 38), numberMat);
  number.rotation.x = -Math.PI / 2;
  number.position.set(PX - 22, 0.04, 26);
  number.receiveShadow = true;
  scene.add(number);

  const con = flat('#c9c1b4');
  const pylonMat = flat('#ebe7df'); // white steel, as in the renders (the photos show it still in grey primer)
  const plinth = flat('#2b303a');
  const cable = flat('#eae6de');

  // Piers: the far pier of the main span and the end pier of the anchor span, then the ordinary
  // viaduct beyond them every 30 m.
  const pier = (x: number, w = 2.4) => {
    scene.add(box(w, DECK - 1.4, w, con, x, (DECK - 1.4) / 2, 0));
    scene.add(box(w + 2, 1.4, DECK_W - 2, con, x, DECK - 0.7, 0));
  };
  pier(PX + MAIN, 3.2);
  pier(PX - ANCHOR, 3.2);
  for (const x of [PX + MAIN + 30, PX + MAIN + 60, PX + MAIN + 90, PX - ANCHOR - 30, PX - ANCHOR - 60, PX - ANCHOR - 90]) pier(x);

  // Deck: a box girder 12.9 m wide with low parapets, and a median between the tracks.
  scene.add(box(600, 1.2, DECK_W - 4, con, 0, DECK + 0.6, 0));
  scene.add(box(600, 0.9, DECK_W, con, 0, DECK + 1.65, 0));
  scene.add(box(600, 1.0, 0.4, con, 0, DECK + 2.6, -DECK_W / 2 + 0.2));
  scene.add(box(600, 1.0, 0.4, con, 0, DECK + 2.6, DECK_W / 2 - 0.2));
  scene.add(box(600, 0.5, 1.2, con, 0, DECK + 2.35, 0));

  // The 0: a stadium outline with a stadium hole, 40 m tall from its plinth, extruded along the
  // line and turned so it stands across it.
  const yb = BASE + RO, yt = BASE + PYLON_H - RO; // centres of the round bottom and top
  const loop = new THREE.Shape();
  loop.moveTo(RO, yb);
  loop.lineTo(RO, yt);
  loop.absarc(0, yt, RO, 0, Math.PI, false);
  loop.lineTo(-RO, yb);
  loop.absarc(0, yb, RO, Math.PI, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.moveTo(RI, yb);
  hole.absarc(0, yb, RI, 0, -Math.PI, true);
  hole.lineTo(-RI, yt);
  hole.absarc(0, yt, RI, Math.PI, 0, true);
  hole.lineTo(RI, yb);
  loop.holes.push(hole);
  const pg = new THREE.ExtrudeGeometry(loop, { depth: LEG, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 2, curveSegments: 36 });
  pg.translate(0, 0, -LEG / 2);
  const pylon = new THREE.Mesh(pg, pylonMat);
  pylon.rotation.y = Math.PI / 2; // the outline's width now runs across the line
  pylon.position.set(PX, 0, 0);
  pylon.castShadow = true;
  pylon.receiveShadow = true;
  scene.add(pylon);
  // The dark plinth under the round bottom (renders).
  scene.add(box(LEG + 5, BASE, RO * 1.3, plinth, PX, BASE / 2, 0));

  // Stay cables in two planes, from the inner faces of the 0 down to both edges of the deck: a fan
  // of ten into the main span and eight into the anchor span on each side, anchored high on the
  // straight sides (renders show the anchors as a column of dots there).
  const up = new THREE.Vector3(0, 1, 0);
  const addCable = (a: THREE.Vector3, b: THREE.Vector3) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, a.distanceTo(b), 5), cable);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
    m.castShadow = true;
    scene.add(m);
  };
  const top = DECK + 2.6;
  for (const side of [-1, 1]) {
    const zA = side * (RI + 0.3), zD = side * (DECK_W / 2 - 0.4);
    for (let i = 0; i < 10; i++) addCable(new THREE.Vector3(PX + LEG / 2, 24 + i * 1.3, zA), new THREE.Vector3(PX + 8 + i * 6.8, top, zD));
    for (let i = 0; i < 8; i++) addCable(new THREE.Vector3(PX - LEG / 2, 24 + i * 1.6, zA), new THREE.Vector3(PX - 7 - i * 5.2, top, zD));
  }

  // Overhead line masts along both edges of the deck, every 20 m (renders; Line 2B runs on 25 kV AC
  // overhead line), each with a short arm over its track.
  const mast = flat('#5d6168');
  for (let x = -280; x <= 280; x += 20) {
    if (Math.abs(x - PX) < LEG + 3) continue;
    for (const side of [-1, 1]) {
      const z = side * (DECK_W / 2 - 0.6);
      scene.add(box(0.35, 7, 0.35, mast, x, top + 3.5, z));
      scene.add(box(0.2, 0.2, 3.2, mast, x, top + 6.6, z - side * 1.6));
    }
  }

  // The near track, through the 0.
  const train = buildBemlTrain(6);
  train.position.set(0, DECK + 2.1, 3.4);
  scene.add(train);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  cam.position.set(-150, 100, 225); // lower than the other scenes, so the 40 m pylon reads tall
  cam.lookAt(-16, 18, 8);
  stage.setCamera(cam, (w, h) => {
    const view = 80; // taller than the viaduct scene, so the whole zero fits
    const aspect = w / h;
    cam.left = (-view * aspect) / 2;
    cam.right = (view * aspect) / 2;
    cam.top = view / 2;
    cam.bottom = -view / 2;
    cam.updateProjectionMatrix();
  });

  // The train passes through the zero and re-enters from the far end, out of frame.
  const SPEED = 9;
  const RUN = 400;
  let x = -90;
  stage.onFrame((_t, dt) => {
    x += SPEED * dt;
    if (x > RUN / 2) x = -RUN / 2;
    train.position.x = x;
  });
  // Repaint the field and the number when the reader switches edition.
  const stop = onThemeChange(async () => {
    const next = colours();
    if (next.field === col.field && next.ink === col.ink) return;
    col = next;
    paintField();
    dotTex.needsUpdate = true;
    const old = numberMat.map;
    numberMat.map = await textTexture(lineNumber, col.ink);
    numberMat.needsUpdate = true;
    old?.dispose();
    stage.renderOnce();
  });
  const dispose = stage.dispose.bind(stage);
  stage.dispose = () => {
    stop();
    dispose();
  };
  stage.renderOnce();
  host.classList.add('is-live');
  return stage;
}
