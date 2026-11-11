/**
 * Hero scene: an isometric, flat-shaded stretch of viaduct on an orange halftone field, a train gliding
 * along it, and the line's number painted giant on the ground (the Tren Urbano reference). The number
 * comes from the host's data-line-number (FrontPage); Line 12's "12" when it has none.
 * With a line number, the field, the number and the train's band take that line's colour from the page
 * (--signal and --on-signal), and follow the edition theme. Line 12 keeps its fixed orange.
 * Orthographic camera, so it reads like the drawing it replaces. Original geometry, not an official design.
 */
import * as THREE from 'three';
import { createStage, lightRig, box, flat, buildTrain, textTexture, onThemeChange } from './common';

export async function mount(host: HTMLElement, { reduced }: { reduced: boolean }) {
  // The canvas gets its own box above the figure caption; the drawing is hidden once live.
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

  // The line's colours: Line 12's fixed orange, or the page's accent for another line.
  const lineNumber = host.dataset.lineNumber;
  const colours = () => {
    if (!lineNumber) return { field: '#f26b1d', ink: '#0c1422' };
    const css = getComputedStyle(host);
    return {
      field: css.getPropertyValue('--signal').trim() || '#f26b1d',
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

  // Road under the viaduct, with lane marks.
  const road = new THREE.Mesh(new THREE.PlaneGeometry(800, 22), flat('#1a2233'));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  road.receiveShadow = true;
  scene.add(road);
  const mark = flat('#efe9de');
  for (let x = -300; x < 300; x += 14) {
    for (const z of [-5.5, 5.5]) {
      const m = box(7, 0.05, 0.5, mark, x, 0.05, z);
      m.castShadow = false;
      scene.add(m);
    }
  }

  // The giant line number, painted flat on the field in front of the road.
  const tex = await textTexture(lineNumber ?? '12', col.ink);
  const numberMat = new THREE.MeshLambertMaterial({ map: tex, transparent: true });
  const number = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), numberMat);
  number.rotation.x = -Math.PI / 2;
  number.position.set(-8, 0.04, 36);
  number.receiveShadow = true;
  scene.add(number);

  // Piers, pier caps and the U-girder deck.
  const con = flat('#c9c1b4');
  for (let x = -300; x <= 300; x += 28) {
    scene.add(box(2.4, 12.4, 2.4, con, x, 6.2, 0));
    scene.add(box(4.8, 1.4, 9.4, con, x, 13.1, 0));
  }
  scene.add(box(600, 2, 9, con, 0, 14.8, 0));
  scene.add(box(600, 1.3, 0.6, con, 0, 16.4, -4.2));
  scene.add(box(600, 1.3, 0.6, con, 0, 16.4, 4.2));

  // The train.
  const train = buildTrain(3, lineNumber ? col.field : undefined);
  train.position.set(0, 15.8, 1.8);
  scene.add(train);

  // Isometric-style orthographic camera: the line runs bottom-left to top-right.
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  cam.position.set(-150, 150, 225);
  cam.lookAt(0, 8, 10);
  stage.setCamera(cam, (w, h) => {
    const view = 70; // world units visible vertically
    const aspect = w / h;
    cam.left = (-view * aspect) / 2;
    cam.right = (view * aspect) / 2;
    cam.top = view / 2;
    cam.bottom = -view / 2;
    cam.updateProjectionMatrix();
  });

  // The train glides across and re-enters from the far end, out of frame.
  const SPEED = 9; // m/s, a calm glide rather than a real service speed
  const SPAN = 260;
  let x = -40;
  stage.onFrame((_t, dt) => {
    x += SPEED * dt;
    if (x > SPAN / 2) x = -SPAN / 2;
    train.position.x = x;
  });
  // Another line's colours follow the edition theme (its accent differs on night paper).
  if (lineNumber) {
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
      train.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshLambertMaterial | undefined;
        if (m?.userData.band) m.color.set(col.field);
      });
      stage.renderOnce();
    });
    const dispose = stage.dispose.bind(stage);
    stage.dispose = () => {
      stop();
      dispose();
    };
  }
  stage.renderOnce();
  host.classList.add('is-live');
  return stage;
}
