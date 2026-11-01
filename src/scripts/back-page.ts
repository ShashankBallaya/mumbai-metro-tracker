/**
 * The back page's one moment (src/components/BackPageScene.astro). When the drawing first comes into
 * view, the light trails draw in colour by colour, the train glides in from the left and brakes to a
 * stop, and its headlight comes on. After that the light keeps streaming, but only while the drawing
 * is on screen, so a phone does no work for it elsewhere on the page.
 *
 * Without this script, or with prefers-reduced-motion, the drawing is complete and still: the hidden
 * start state exists only once the script has set data-motion="ready".
 */
const frame = document.querySelector<HTMLElement>('[data-scene-frame]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

if (frame && !reduce.matches && 'IntersectionObserver' in window) {
  // A reader who loads the page already at its foot sees the finished drawing, not a replay.
  const startsInView = frame.getBoundingClientRect().top < window.innerHeight;
  if (!startsInView) {
    frame.dataset.motion = 'ready';
    const arrive = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        arrive.disconnect();
        frame.dataset.motion = 'run';
      },
      { threshold: 0.35 },
    );
    arrive.observe(frame);
  }

  // The streaming light runs only while the drawing is on screen.
  const flow = new IntersectionObserver((entries) => {
    for (const e of entries) frame.toggleAttribute('data-flowing', e.isIntersecting);
  });
  flow.observe(frame);

  // While the reader scrolls, the streaming light holds still, so the scroll gets the whole frame.
  let settle = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (!frame.hasAttribute('data-flowing')) return;
      frame.setAttribute('data-scrolling', '');
      clearTimeout(settle);
      settle = window.setTimeout(() => frame.removeAttribute('data-scrolling'), 160);
    },
    { passive: true },
  );

  // Turning reduced motion on mid-visit settles everything at once.
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    delete frame.dataset.motion;
    frame.removeAttribute('data-flowing');
    flow.disconnect();
  });
}
