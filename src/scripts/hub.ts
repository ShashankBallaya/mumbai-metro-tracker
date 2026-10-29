/**
 * The hub's motion, in one place, plus the lazy network map.
 *   - Each chapter pins its stage; its photo opens through a mask that grows from its own cover tile to
 *     the full screen and settles in scale (depth from the picture, never blur), the line's
 *     number and name land, the facts rise in, the route draws itself.
 *   - The network map loads when its section nears the viewport.
 * With prefers-reduced-motion nothing animates: every chapter is already a complete still frame.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links scroll smoothly through Lenis.
  document.querySelectorAll<HTMLAnchorElement>('.hubw a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href')!);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { duration: 1.4 });
    }),
  );

  // Cover: tiles settle in, from slightly larger.
  gsap.from('.cover__tile', { scale: 1.06, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 });
  gsap.from('.cover__mark > *', { y: 24, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.15 });

  document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter) => {
    const layer = (n: string) => chapter.querySelector<HTMLElement>(`[data-layer="${n}"]`);
    const facts = chapter.querySelectorAll<HTMLElement>('[data-fact]');
    const title = chapter.querySelector<HTMLElement>('[data-title]');
    const routes = chapter.querySelectorAll<SVGPathElement>('[data-route]');

    gsap.set(routes, { strokeDasharray: 1, strokeDashoffset: 1 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: chapter, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
    });
    // The mask opens from the reader's own cover tile: the inset is that tile's box in the first
    // screen, so the tile seen on the cover is the frame that grows into the chapter.
    const tile = document.querySelector<HTMLElement>(`[data-tile="${chapter.id}"]`);
    const startInset = () => {
      if (!tile) return 'inset(22% 26% 22% 26% round 14px)';
      const r = tile.getBoundingClientRect();
      const y = r.top + window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const clamp = (v: number) => Math.min(48, Math.max(0, v));
      const top = clamp((y / vh) * 100);
      const bottom = clamp(((vh - Math.min(vh, y + r.height)) / vh) * 100);
      return `inset(${top}% ${clamp(((vw - r.right) / vw) * 100)}% ${bottom}% ${clamp((r.left / vw) * 100)}% round 14px)`;
    };
    // The mask clips the whole stage, picture and copy together, so nothing of a chapter shows outside its frame.
    const stage = chapter.querySelector<HTMLElement>('[data-stage]')!;
    tl.fromTo(stage, { clipPath: startInset }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1, ease: 'power2.inOut', immediateRender: true }, 0);
    // The photo settles inside the opening mask: depth from the picture's slow scale, never blur.
    const photo = layer('mid');
    if (photo) tl.fromTo(photo, { scale: 1.18 }, { scale: 1.0, duration: 2.0 }, 0);
    // The copy lands as the frame finishes opening, then the chapter holds still to be read. Explicit
    // from and to values, so a refresh (resize, rotation) can never leave copy stuck half in.
    const rise = (targets: Element | NodeListOf<Element> | null, from: gsap.TweenVars, at: number, extra: gsap.TweenVars = {}) => {
      if (!targets || ('length' in targets && !targets.length)) return;
      tl.fromTo(targets, { opacity: 0, ...from }, { opacity: 1, yPercent: 0, y: 0, duration: 0.4, ease: 'expo.out', ...extra }, at);
    };
    rise(title, { y: 48 }, 0.55);
    // One tween each (not a stagger): a staggered fromTo only sets its first target's start state up front.
    facts.forEach((el, i) => rise(el, { y: 26 }, 0.8 + i * 0.1));
    tl.fromTo(routes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7 }, 0.95);
    tl.to({}, { duration: 1.0 });
  });
}

// ---------- the network map, loaded when near ----------
const mapEl = document.querySelector<HTMLElement>('[data-network-map]');
if (mapEl) {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      import('./network-map').then((m) => m.mount(mapEl));
    },
    { rootMargin: '600px 0px' },
  );
  io.observe(mapEl);
}

// ---------- chapter footage: load near, play only while on screen ----------
// Each chapter's <video> starts with no source (preload none, poster only), so a reader on mobile data
// who never reaches a chapter never downloads its clip. Reduced motion and Data Saver keep the poster.
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
const videos = document.querySelectorAll<HTMLVideoElement>('video[data-footage]');
if (!reduce && !saveData && videos.length) {
  const small = matchMedia('(max-width: 47.99rem)').matches;
  const load = (v: HTMLVideoElement) => {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    const base = `/hub/footage/${v.dataset.footage}`;
    const sources = [[`${base}-${small ? 960 : 1600}.mp4`, 'video/mp4']];
    for (const [src, type] of sources) {
      const el = document.createElement('source');
      el.src = src;
      el.type = type;
      v.appendChild(el);
    }
    v.load();
  };
  const near = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && load(e.target as HTMLVideoElement)),
    { rootMargin: '100% 0px' },
  );
  const onScreen = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }),
    { threshold: 0.15 },
  );
  videos.forEach((v) => {
    near.observe(v);
    onScreen.observe(v);
  });
}
