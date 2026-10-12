/**
 * Line 5 hero scene: the Kasheli creek bridge. Piers on pile caps rise from the water to a box-girder
 * deck about 15 m up, in spans of 42.23 m with a joint between each of a span's 15 segments
 * (reported figures, project.json kasheli_creek_bridge). A six-car train glides across, and the
 * line's number is painted on the near bank. Same camera and field as the viaduct scene, so the two
 * read as one series. Original geometry, not an official design.
 */
import * as THREE from 'three';
import { createStage, lightRig, box, flat, buildTrain, textTexture } from './common';

const SPAN = 42.23;
const SEG = SPAN / 15;
const DECK = 15; // underside of the deck above the water

export async function mount(host: HTMLElement, { reduced }: { reduced: boolean }) {
  // The canvas sits exactly over the drawing's box, so swapping them never moves the page.
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
  lightRig(scene, { shadows: true, span: 110 });

  // Orange field with newsprint halftone dots: the land on either side of the creek.
  const dots = document.createElement('canvas');
  dots.width = dots.height = 32;
  const g = dots.getContext('2d')!;
  g.fillStyle = '#f26b1d';
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = 'rgba(12,20,34,0.22)';
  g.beginPath();
  g.arc(16, 16, 3.2, 0, Math.PI * 2);
  g.fill();
  const dotTex = new THREE.CanvasTexture(dots);
  dotTex.wrapS = dotTex.wrapT = THREE.RepeatWrapping;
  dotTex.repeat.set(160, 160);
  dotTex.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ map: dotTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // The creek: dark water under the bridge, from the far side to the near bank, with pale ripples.
  const water = new THREE.Mesh(new THREE.PlaneGeometry(800, 56), flat('#22405b'));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.02, -12);
  water.receiveShadow = true;
  scene.add(water);
  // Ripples of uneven length on a fixed scatter, so they never read as lane marks.
  const ripple = flat('#6f8496');
  for (let i = 0; i < 260; i++) {
    const w = 1.2 + ((i * 7) % 5) * 0.7;
    const r = box(w, 0.04, 0.22, ripple, -300 + ((i * 53.7) % 600), 0.05, -38 + ((i * 17.3) % 52));
    r.castShadow = false;
    scene.add(r);
  }
  // The near bank's edge.
  scene.add(box(800, 0.8, 2, flat('#6b5a45'), 0, 0.4, 17));

  // The giant line number, painted flat on the near bank.
  const tex = await textTexture(host.dataset.lineNumber ?? '5', '#0c1422');
  const number = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ map: tex, transparent: true }));
  number.rotation.x = -Math.PI / 2;
  number.position.set(-8, 0.04, 40);
  number.receiveShadow = true;
  scene.add(number);

  // Piers on pile caps, pier caps, and the box girder with a narrower box under a wider slab.
  const con = flat('#c9c1b4');
  const joint = flat('#8a8276');
  for (let x = -6 * SPAN; x <= 6 * SPAN; x += SPAN) {
    scene.add(box(6.4, 1.2, 7, con, x, 0.6, 0));
    scene.add(box(2.4, DECK - 1.6, 3, con, x, (DECK - 1.6) / 2, 0));
    scene.add(box(4, 1.6, 7.4, con, x, DECK - 0.8, 0));
  }
  scene.add(box(600, 1.5, 5.4, con, 0, DECK + 0.75, 0));
  scene.add(box(600, 0.9, 7.8, con, 0, DECK + 1.95, 0));
  // Segment joints on the near face, 15 to a span.
  for (let x = -6 * SPAN; x <= 6 * SPAN; x += SEG) {
    const j = box(0.12, 1.5, 0.05, joint, x + 1.2, DECK + 0.75, 2.73);
    j.castShadow = false;
    scene.add(j);
  }
  // Low parapets along both edges.
  scene.add(box(600, 1, 0.4, con, 0, DECK + 2.9, -3.7));
  scene.add(box(600, 1, 0.4, con, 0, DECK + 2.9, 3.7));

  // Line 5's trains have six cars.
  const train = buildTrain(6);
  train.position.set(0, DECK + 2.4, 1.6);
  scene.add(train);

  // Isometric-style orthographic camera: the line runs bottom-left to top-right.
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  cam.position.set(-150, 150, 225);
  cam.lookAt(0, 9, 10);
  stage.setCamera(cam, (w, h) => {
    const view = 74; // world units visible vertically
    const aspect = w / h;
    cam.left = (-view * aspect) / 2;
    cam.right = (view * aspect) / 2;
    cam.top = view / 2;
    cam.bottom = -view / 2;
    cam.updateProjectionMatrix();
  });

  // The train glides across and re-enters from the far end, out of frame.
  const SPEED = 9; // m/s, a calm glide rather than a real service speed
  const RUN = 400;
  let x = -60;
  stage.onFrame((_t, dt) => {
    x += SPEED * dt;
    if (x > RUN / 2) x = -RUN / 2;
    train.position.x = x;
  });
  stage.renderOnce();
  host.classList.add('is-live');
  return stage;
}
