/**
 * The hub's motion, in one place, plus the lazy network map.
 * Touch screens keep native scroll (no Lenis) and a short scrub catch-up, so a chapter moves with the thumb.
 *   - Each chapter pins its stage; its photo opens through a mask that grows from its own cover tile to
 *     the full screen and settles in scale (depth from the picture, never blur), the line's
 *     number and name land, the facts rise in, the route draws itself.
 *   - As a chapter leaves, its frame shrinks back into a card, so the next card can open.
 *   - A link to a chapter lands where that chapter is fully open, not on its closed frame.
 *   - The network map loads when its section nears the viewport.
 * The cover's intro is CSS (hub.css), so it starts with the first paint.
 * With prefers-reduced-motion nothing animates: every chapter is already a complete still frame.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Touch screens keep the browser's own scroll: it is already smooth, runs off the main thread, and
// has the momentum the reader's thumb expects. Lenis there only adds work on every scroll event.
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);
  // The address bar showing or hiding resizes the viewport; that is no reason to re-measure every chapter.
  ScrollTrigger.config({ ignoreMobileResize: true });
  const lenis = touch ? null : new Lenis({ lerp: 0.11 });
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToY = (y: number, instant: boolean) => {
    if (lenis) lenis.scrollTo(y, instant ? { immediate: true } : { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: instant ? 'instant' : 'smooth' });
  };
  // With a wheel, Lenis already smooths the scroll, so a 0.6s catch-up reads as weight. Under a thumb
  // that much reads as lag, but none at all puts the whole timeline inside every scroll event. 0.2s
  // moves with the finger and dropped the fewest frames (measured, 4x CPU throttle, 390px).
  const scrub = touch ? 0.2 : 0.6;

  // Where each chapter reads as complete: its frame open, its copy in (set per chapter below).
  const landing = new Map<Element, () => number>();

  // Anchor links glide through Lenis. A keyboard press jumps at once (no motion on keyboard actions)
  // and moves focus to the target, so the next Tab starts there.
  document.querySelectorAll<HTMLAnchorElement>('.hubw a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.querySelector<HTMLElement>(a.getAttribute('href')!);
      if (!target) return;
      e.preventDefault();
      const y = landing.get(target)?.() ?? target.getBoundingClientRect().top + window.scrollY;
      scrollToY(y, e.detail === 0);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      history.replaceState(null, '', a.getAttribute('href'));
    }),
  );

  document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter) => {
    const layer = (n: string) => chapter.querySelector<HTMLElement>(`[data-layer="${n}"]`);
    const facts = chapter.querySelectorAll<HTMLElement>('[data-fact]');
    const title = chapter.querySelector<HTMLElement>('[data-title]');
    const routes = chapter.querySelectorAll<SVGPathElement>('[data-route]');

    gsap.set(routes, { strokeDasharray: 1, strokeDashoffset: 1 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: chapter, start: 'top top', end: 'bottom bottom', scrub, invalidateOnRefresh: true },
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
    // (A mask built from scale transforms was tried and measured: it repainted more than this clip-path.)
    const stage = chapter.querySelector<HTMLElement>('[data-stage]')!;
    tl.fromTo(stage, { clipPath: startInset }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1, ease: 'power2.inOut', immediateRender: true }, 0);
    // The photo settles inside the opening mask: depth from the picture's slow scale, never blur. Each
    // step of that scale repaints the stage, so on a phone it settles with the mask and stops, instead
    // of running on through the copy.
    const photo = layer('mid');
    if (photo) tl.fromTo(photo, { scale: 1.18 }, { scale: 1.0, duration: touch ? 1.0 : 2.0 }, 0);
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
    // The hold, placed by time so the timeline is 3.0 long on every screen.
    tl.to({}, { duration: 1.0 }, 2.0);
    // Land after the route has drawn (1.65 of the timeline's 3.0), in the hold.
    const st = tl.scrollTrigger!;
    landing.set(chapter, () => st.start + (st.end - st.start) * (1.75 / tl.duration()));

    // Exit: once the stage stops sticking and scrolls away, it shrinks into a card, the reverse of how
    // it opened. Scale only, scrubbed; the corners round once by a class (hub.css), not every frame.
    // No fade: on the morning ground a dimmed frame reads as washed out.
    gsap.fromTo(
      stage,
      { scale: 1 },
      {
        scale: 0.9,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: chapter, start: 'bottom bottom', end: 'bottom top', scrub, toggleClass: { targets: chapter, className: 'is-leaving' } },
      },
    );
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
  const visible = new Set<HTMLVideoElement>();
  const onScreen = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          visible.add(v);
          if (!document.hidden) v.play().catch(() => {});
        } else {
          visible.delete(v);
          v.pause();
        }
      }),
    { threshold: 0.15 },
  );
  videos.forEach((v) => {
    near.observe(v);
    onScreen.observe(v);
  });
  // A hidden tab plays nothing; on return, only the clip on screen resumes.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach((v) => v.pause());
    else visible.forEach((v) => v.play().catch(() => {}));
  });
}
