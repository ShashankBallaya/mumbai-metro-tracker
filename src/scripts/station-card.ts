/**
 * A station on the hub map: its name as a platform sign on hover (the line's colour, the Marathi name,
 * the line's number), and its card in a sheet at the foot of the map on a click or tap
 * (chosen on /lab/stations/, 2026-11-16: hover C, card B). Styles: src/styles/hub-stage.css.
 */
import type { StationCard } from '../lib/station-cards';

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const cvars = (s: StationCard) => (s.colour ? `--c:var(--${s.colour});--on-c:var(--on-${s.colour})` : '');
/** A pin at the station's point (not a search by name: most stations are not built yet). */
const mapsUrl = (s: StationCard) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
const dirUrl = (s: StationCard) => `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;

export function signHtml(s: StationCard): string {
  return `<div class="ssign" style="${cvars(s)}"><div class="ssign__row"><span class="ssign__name">${esc(s.name)}</span><span class="ssign__mark">${esc(s.mark)}</span></div>${s.mr ? `<div class="ssign__mr" lang="mr">${esc(s.mr)}</div>` : ''}</div>`;
}

export function sheetHtml(s: StationCard): string {
  const photo = s.photo
    ? `<figure class="scard__photo"><img src="${esc(s.photo.src)}" alt="${esc(s.photo.alt)}" loading="lazy"><figcaption>${esc(s.photo.credit)}</figcaption></figure>`
    : '';
  const changes = s.changes.length ? `<li><span>Change for</span> ${s.changes.map(esc).join('; ')}</li>` : '';
  return `<div class="scard${s.photo ? '' : ' scard--text'}" style="${cvars(s)}" role="dialog" aria-label="${esc(s.name)}">
    ${photo}
    <div class="scard__text">
      <span class="scard__chip">${esc(s.label)}</span>
      <h3 class="scard__name">${esc(s.name)}</h3>
      <ul class="scard__facts">
        <li><span class="scard__status${s.open ? ' is-open' : ''}">${s.open ? 'Open to riders' : esc(s.status)}</span></li>
        <li><span>Station</span> ${s.order} of ${s.of}</li>
        ${changes}
      </ul>
    </div>
    <div class="scard__links">
      ${s.href ? `<a class="is-main" href="${s.href}">${esc(s.hrefLabel)}</a>` : ''}
      <a href="${mapsUrl(s)}" target="_blank" rel="noopener">Google Maps ↗</a>
      ${s.open ? `<a href="${dirUrl(s)}" target="_blank" rel="noopener">Directions ↗</a>` : ''}
    </div>
    <button class="scard__close" type="button" aria-label="Close" data-close>×</button>
  </div>`;
}
