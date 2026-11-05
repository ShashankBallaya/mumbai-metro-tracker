# Joins the placed key plan pieces into Line 5's tender route (Dhamankar Naka
# to Kalyan, and the Ulhasnagar spur), sets chainage on it from the stations
# whose coordinates the tender prints, and places the other stations by
# chainage. Writes scripts/data/line5-tender-route-2026.geojson.
#
# Run from the repo root: python -P -E scripts/line5-tenders/assemble.py
import json
from pathlib import Path
import numpy as np
from pyproj import Transformer

HERE = Path(__file__).parent
TO_UTM = Transformer.from_crs('EPSG:4326', 'EPSG:32643', always_xy=True)
TO_LL = Transformer.from_crs('EPSG:32643', 'EPSG:4326', always_xy=True)

pieces = {f['properties']['id']: np.array([TO_UTM.transform(*c) for c in f['geometry']['coordinates']])
          for f in json.loads((HERE / 'keyplan_pieces.geojson').read_text())['features'] if f['geometry']['type'] == 'LineString'}

# Fixed points (UTM 43N). Dhamankar Naka: the built station on our site (imagery, 2026-10-12).
DHAMANKAR = np.array(TO_UTM.transform(73.052414, 19.285912))
KNOWN = {  # chainage (m): position. From the plan sheets of CA-317 and CA-318.
    17371.93: (298312.372, 2132116.316),   # Temghar
    18307.86: (298863.539, 2131345.327),   # Rajnouli (CA-318 sheets)
    19539.62: (299728.158, 2130394.430),   # Gove Gaon
    20804.94: (300622.210, 2129587.432),   # Kon Gaon West
    21921.18: (301522.673, 2129107.952),   # Kon Gaon East
    23098.94: (302599.634, 2129478.831),   # Durgadi
}

def chain(ids, start=None, end=None):
    """Join pieces in the given order, flipping each to meet the last point."""
    pts = [start] if start is not None else []
    for i in ids:
        p = pieces[i]
        if pts:
            last = pts[-1] if not isinstance(pts[-1], np.ndarray) or pts[-1].ndim == 1 else pts[-1][-1]
            if np.hypot(*(p[-1] - last)) < np.hypot(*(p[0] - last)):
                p = p[::-1]
        pts.append(p)
    if end is not None:
        pts.append(end)
    return np.vstack([np.atleast_2d(q) for q in pts])

def by_guide(ids, guide, buffer=250):
    """Order the points of many pieces by their position along a guide line."""
    P = np.vstack([pieces[i] for i in ids])
    g = np.asarray(guide, float)
    seg = g[1:] - g[:-1]
    L = np.r_[0, np.cumsum(np.hypot(*seg.T))]
    out = []
    for p in P:
        best = None
        for k in range(len(seg)):
            t = np.clip(((p - g[k]) @ seg[k]) / (seg[k] @ seg[k]), 0, 1)
            d = np.hypot(*(g[k] + t * seg[k] - p))
            if best is None or d < best[0]:
                best = (d, L[k] + t * np.hypot(*seg[k]))
        if best[0] < buffer and 0 < best[1] < L[-1]:
            out.append((best[1], p))
    out.sort(key=lambda x: x[0])
    return np.vstack([g[0]] + [p for _, p in out] + [g[-1]])

def clean(P, step=8):
    """Thin the points, and drop any that turn back (where two key plan pieces overlap)."""
    keep = [P[0]]
    for p in P[1:]:
        if np.hypot(*(p - keep[-1])) < step:
            continue
        if len(keep) >= 2:
            a, b = keep[-1] - keep[-2], p - keep[-1]
            if a @ b < -0.5 * np.hypot(*a) * np.hypot(*b):  # turns back by more than 120 degrees
                keep.pop()
                if len(keep) >= 2 and (keep[-1] - keep[-2]) @ (p - keep[-1]) < 0:
                    continue
        keep.append(p)
    return np.array(keep)

ROADS = None

def snap(P, mask, reach=60):
    """Move the points in mask onto OpenStreetMap's road centre line (scripts/data/line5-osm-roads.json).
    Where the road is two one-way carriageways, use the midpoint between them."""
    global ROADS
    if ROADS is None:
        ways = json.loads(Path('scripts/data/line5-osm-roads.json').read_text(encoding='utf-8'))['ways']
        ROADS = [(w, np.array([TO_UTM.transform(*c) for c in w['coords']])) for w in ways if w['highway'] in ('trunk', 'primary', 'secondary', 'trunk_link', 'primary_link')]
    out = P.copy()
    for k in np.nonzero(mask)[0]:
        q = P[k]
        hits = []
        for w, R in ROADS:
            if (np.abs(R - q).min(axis=0) > reach).any() and np.min(np.hypot(*(R - q).T)) > reach * 4:
                continue
            v = R[1:] - R[:-1]
            t = np.clip(((q - R[:-1]) * v).sum(1) / np.maximum((v * v).sum(1), 1e-9), 0, 1)
            near = R[:-1] + v * t[:, None]
            d = np.hypot(*(near - q).T)
            i = int(np.argmin(d))
            if d[i] < reach:
                hits.append((d[i], near[i], w['oneway'] == 'yes'))
        if not hits:
            continue
        hits.sort(key=lambda h: h[0])
        best = hits[0]
        pair = next((h for h in hits[1:] if h[2] and best[2] and np.hypot(*(h[1] - best[1])) < 45 and (h[1] - q) @ (best[1] - q) < 0), None)
        out[k] = (best[1] + pair[1]) / 2 if pair else best[1]
    # light smoothing of the snapped stretch
    sm = out.copy()
    idx = np.nonzero(mask)[0]
    for k in idx:
        lo, hi = max(k - 2, idx[0]), min(k + 3, idx[-1] + 1)
        sm[k] = out[lo:hi].mean(0)
    return sm

def cumlen(P):
    return np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]

def at(P, s):
    L = cumlen(P)
    return np.array([np.interp(s, L, P[:, 0]), np.interp(s, L, P[:, 1])])

def project(P, q):
    L = cumlen(P)
    best = None
    for k in range(len(P) - 1):
        v = P[k + 1] - P[k]
        t = np.clip(((q - P[k]) @ v) / (v @ v), 0, 1)
        d = np.hypot(*(P[k] + t * v - q))
        if best is None or d < best[0]:
            best = (d, L[k] + t * np.hypot(*v))
    return best[1], best[0]

def main():
    st = {k: np.array(v) for k, v in KNOWN.items()}
    temghar, durgadi = st[17371.93], st[23098.94]
    # Agra Road (gr2) runs on past Bhiwandi Junction: cut it where the tunnel (bl0) starts.
    g2, b0 = pieces['gr2'], pieces['bl0']
    j = min(range(len(g2)), key=lambda i: min(np.hypot(*(g2[i] - b0[0])), np.hypot(*(g2[i] - b0[-1]))))
    near_dham = np.hypot(*(g2[0] - DHAMANKAR)) < np.hypot(*(g2[-1] - DHAMANKAR))
    pieces['gr2'] = g2[: j + 1] if near_dham else g2[j:]
    # The elevated stretch into Temghar is the amber piece that reaches Temghar (amber pieces are numbered by size).
    amb = min((k for k in pieces if k.startswith('amb')), key=lambda k: min(np.hypot(*(pieces[k][0] - temghar)), np.hypot(*(pieces[k][-1] - temghar))))
    a = chain(['gr2', 'bl0', 'bl1', 'cya1', amb], start=DHAMANKAR, end=temghar)
    guide = [st[k] for k in sorted(st)]
    b = by_guide(['gr5', 'gr8', 'gr12', 'gr13', 'gr14', 'gr11', 're0', 're2', 're3', 're5'], guide)
    c = chain(['li3', 'li1', 'li2', 'li5', 'pu1', 'pu3', 'pu6'], start=durgadi)
    main_line = clean(np.vstack([a, b[1:], c[1:]]))
    # chainage: anchor Dhamankar and the known stations, piecewise linear, then 1:1 past Durgadi
    anchors_ch = [12125.569] + sorted(st)
    anchors_s = [0.0] + [project(main_line, st[k])[0] for k in sorted(st)]
    L = cumlen(main_line)
    ch = np.interp(L, anchors_s, anchors_ch)
    past = L > anchors_s[-1]
    ch[past] = anchors_ch[-1] + (L[past] - anchors_s[-1])
    # The road flyover and the metro share one structure from Rajnouli Junction to the creek (CA-318
    # Vol III, Table 0-2): put that stretch on the road's centre line, then measure again.
    main_line = clean(snap(main_line, (ch >= 17860) & (ch <= 22145)), step=4)
    anchors_s = [0.0] + [project(main_line, st[k])[0] for k in sorted(st)]
    L = cumlen(main_line)
    ch = np.interp(L, anchors_s, anchors_ch)
    past = L > anchors_s[-1]
    ch[past] = anchors_ch[-1] + (L[past] - anchors_s[-1])

    def pos(c):
        return np.array([np.interp(c, ch, main_line[:, 0]), np.interp(c, ch, main_line[:, 1])])
    print('main line', round(L[-1]), 'm; chainage at end', round(ch[-1]))
    for k in sorted(st):
        print(f'  station at ch {k}: {project(main_line, st[k])[1]:.0f} m off the line')
    # The spur (Part B) starts at Bhavani Chowk, runs beside Part A along NH-61 (or1), turns down the
    # Valdhuni (or2, or3, or4) and follows SH-35 to Ulhasnagar (red). It starts where or1 leaves the line.
    o1 = pieces['or1']
    if project(main_line, o1[-1])[0] < project(main_line, o1[0])[0]:
        pieces['or1'] = o1[::-1]
    s0, _ = project(main_line, pieces['or1'][0])
    junction = at(main_line, s0)
    sp = clean(chain(['or1', 'or2', 'or3', 'or4', 're6', 're8', 're9'], start=junction))
    sL = cumlen(sp)
    # Part B is a double-decker from spur ch 1,860 to the end (CA-314 Vol III, 2.1.1.17): snap it to SH-35.
    sp = clean(snap(sp, sL >= 1860 * sL[-1] / 5272.63), step=4)
    sL = cumlen(sp)
    print('spur', round(sL[-1]), 'm (tender: to spur ch 5,272); spur chainage scaled to fit')
    k_sp = sL[-1] / 5272.63
    sat = lambda c: at(sp, c * k_sp)
    stations = {
        'Dhamankar Naka': (DHAMANKAR, 12125.569, 'site'),
        'Bhiwandi': (pos(14220), 14220, 'chainage'),
        'Temghar': (st[17371.93], 17371.93, 'tender'),
        'Rajnouli': (st[18307.86], 18307.86, 'tender'),
        'Gove Gaon': (st[19539.62], 19539.62, 'tender'),
        'Kon Gaon West': (st[20804.94], 20804.94, 'tender'),
        'Kon Gaon East': (st[21921.18], 21921.18, 'tender'),
        'Durgadi': (st[23098.94], 23098.94, 'tender'),
        'Khadakpada': (pos(24604), 24604, 'chainage'),
        'Bhoirwadi': (pos(25875), 25875, 'chainage'),
        'Shivaji Maharaj Path': (pos(27820.44), 27820.44, 'chainage'),
    }
    for name, us in [('Shanti Nagar', 28226.41), ('Shivaji Maharaj Chowk', 29606.41), ('Ulhasnagar', 30856.41)]:
        stations[name] = (sat(us - 26177), us, 'spur chainage')
    pkg = [('CA-317', 12200, 17860), ('CA-318', 17860, 26140), ('CA-314 Part A', 26140, 29065)]
    print(f'spur leaves at main-line ch {np.interp(s0, L, ch):.0f} (tender: spur ch 0 = line ch 26,177)')
    ll = lambda P: [[round(v, 6) for v in TO_LL.transform(*p)] for p in P]
    feats = []
    for name, a0, a1 in pkg:
        m = (ch >= a0) & (ch <= a1)
        P = np.vstack([pos(a0)[None], main_line[m], pos(min(a1, ch[-1]))[None]]) if m.any() else None
        if P is not None:
            feats.append({'type': 'Feature', 'properties': {'part': name, 'from_ch': a0, 'to_ch': min(a1, round(ch[-1]))}, 'geometry': {'type': 'LineString', 'coordinates': ll(P)}})
    # underground: from the end of the open-cut ramp to the start of the solid ramp up (CA-317 Vol III, Table 2-1)
    m = (ch >= 13160) & (ch <= 16420)
    feats.append({'type': 'Feature', 'properties': {'part': 'Underground', 'from_ch': 13160, 'to_ch': 16420}, 'geometry': {'type': 'LineString', 'coordinates': ll(np.vstack([pos(13160)[None], main_line[m], pos(16420)[None]]))}})
    m = sL >= 383 * k_sp
    feats.append({'type': 'Feature', 'properties': {'part': 'CA-314 Part B', 'from_ch': 383, 'to_ch': 5272, 'chainage': 'spur'}, 'geometry': {'type': 'LineString', 'coordinates': ll(np.vstack([sat(383)[None], sp[m]]))}})
    if (~m).any():
        feats.append({'type': 'Feature', 'properties': {'part': 'Spur start (CA-318 or CA-314 boundary)'}, 'geometry': {'type': 'LineString', 'coordinates': ll(np.vstack([sp[~m], sat(383)[None]]))}})
    for name, (p, c, how) in stations.items():
        feats.append({'type': 'Feature', 'properties': {'station': name, 'chainage': c, 'position': how}, 'geometry': {'type': 'Point', 'coordinates': ll([p])[0]}})
    meta = {
        'description': "Line 5 past Dhamankar Naka as MMRDA's civil tenders of Oct 2026 draw it (CA-317, CA-318, CA-314). The route is traced from the key plan in the tender drawings (MMRDA-MML-05-MTR-GAD-TD-1000, CA-314 Volume V), placed on the map by fitting its Line 12 to MMRDA's Line 12 file and its route to the six stations whose coordinates the CA-317 and CA-318 plan sheets print (UTM 43N, WGS84). Those six stations are within 6 m of the traced line and within 6 m of the main road in OpenStreetMap. Other stations are placed by their tender chainage along the line (good to about 50 m). Built by scripts/line5-tenders/assemble.py.",
        'source_url': 'https://mahatenders.gov.in/nicgep/app?page=FrontEndTendersByOrganisation&service=page',
        'last_verified': '2026-11-05',
    }
    out = {'type': 'FeatureCollection', 'properties': meta, 'features': feats}
    Path('scripts/data/line5-tender-route-2026.geojson').write_text(json.dumps(out), encoding='utf-8')
    for name, (p, c, how) in stations.items():
        lng, lat = TO_LL.transform(*p)
        print(f'  {name:24s} {lat:.6f},{lng:.6f}  ch {c}  ({how})')

if __name__ == '__main__':
    main()
