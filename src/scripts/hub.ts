/**
 * The hub's front page: the map and its fact box.
 *   - Choosing a line, on the map or in the box's index, prints that line's record (the same
 *     record the register below holds) into the box, dims the other lines and frames this one.
 *   - "All lines" or Escape returns to the index. The choice lives in the address (?line=), so it
 *     can be shared and survives a reload.
 *   - The street map (MapLibre) loads after the first paint; until then, the drawing of the same
 *     geometry answers clicks. With Data Saver on, it loads only when the reader touches the map.
 * Without JavaScript, each index entry is a link to its record in the register.
 */
import type { NetworkMap } from './network-map';

const front = document.querySelector<HTMLElement>('[data-front]');
if (front) {
  const mapEl = front.querySelector<HTMLElement>('[data-network-map]')!;
  const drawing = front.querySelector<SVGSVGElement>('[data-drawing]')!;
  const box = front.querySelector<HTMLElement>('[data-box]')!;
  const index = box.querySelector<HTMLElement>('[data-box-index]')!;
  const record = box.querySelector<HTMLElement>('[data-box-record]')!;
  const slot = box.querySelector<HTMLElement>('[data-box-slot]')!;
  const back = box.querySelector<HTMLButtonElement>('[data-box-back]')!;
  const narrow = () => matchMedia('(max-width: 63.99rem)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let map: NetworkMap | null = null;
  let current: string | null = null;
  let lastPick: HTMLElement | null = null;

  const markDrawing = (id: string | null) => {
    drawing.classList.toggle('has-pick', Boolean(id));
    drawing.querySelectorAll<SVGElement>('[data-line]').forEach((n) => n.classList.toggle('is-on', n.dataset.line === id));
  };

  function pick(id: string, opts: { from: 'index' | 'map' | 'load'; keyboard?: boolean }) {
    const source = document.querySelector<HTMLElement>(`[data-record="${CSS.escape(id)}"]`);
    if (!source) return;
    // A copy of the register's record, without ids, so the page keeps one of each.
    const copy = source.cloneNode(true) as HTMLElement;
    copy.removeAttribute('id');
    copy.removeAttribute('aria-labelledby');
    copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    slot.replaceChildren(copy);
    slot.setAttribute('aria-label', `Record of ${copy.querySelector('h4')?.textContent?.trim() ?? 'the line'}`);
    index.hidden = true;
    record.hidden = false;
    box.scrollTop = 0;
    current = id;
    markDrawing(id);
    map?.select(id);
    history.replaceState(null, '', `${location.pathname}?line=${encodeURIComponent(id)}`);
    if (opts.from === 'index') slot.focus({ preventScroll: true });
    // On a phone the box sits under the map: a line chosen on the map brings its record into view.
    if (opts.from === 'map' && narrow()) box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function unpick() {
    if (!current) return;
    slot.replaceChildren();
    record.hidden = true;
    index.hidden = false;
    current = null;
    markDrawing(null);
    map?.select(null);
    history.replaceState(null, '', location.pathname);
    (lastPick ?? index.querySelector<HTMLElement>('[data-pick]'))?.focus({ preventScroll: true });
  }

  index.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('[data-pick]');
    if (!link) return;
    event.preventDefault();
    lastPick = link;
    pick(link.dataset.pick!, { from: 'index', keyboard: event.detail === 0 });
  });
  back.addEventListener('click', unpick);
  box.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && current) unpick();
  });
  drawing.addEventListener('click', (event) => {
    const id = (event.target as Element).closest<SVGElement>('[data-line]')?.dataset.line;
    if (id) pick(id, { from: 'map' });
  });

  // The street map, after the first paint.
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    import('./network-map')
      .then((m) => m.mount(mapEl, (id) => pick(id, { from: 'map' })))
      .then((m) => {
        map = m;
        if (current) m.select(current);
      })
      .catch(() => {
        /* no WebGL or no network: the drawing stays */
      });
  };
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData) mapEl.addEventListener('pointerdown', start, { once: true });
  else if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2500 });
  else setTimeout(start, 600);

  // A shared or reloaded address opens on its line.
  const asked = new URLSearchParams(location.search).get('line');
  if (asked) pick(asked, { from: 'load' });
}
