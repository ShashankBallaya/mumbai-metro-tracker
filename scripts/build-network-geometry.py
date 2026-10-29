# Builds the hub's network map geometry: src/data/network-geometry.geojson.
#
# One LineString (or MultiLineString) for each stretch of a line that is in one stage (src/data/network.json
# `parts`), and one Point for each station. Sources, best first:
#   - MMRDA's alignment files on its Metro Influence Zone NOC page (March 2025): Lines 1, 2A, 2B, 6, 7, 7A, 9.
#     Each holds the corridor as a polygon; the centre line is the midpoints between its two long sides, as in
#     build-alignment-line4.py. Line 7A's file holds line pieces instead, which are used as drawn.
#   - The tracked lines' own files: src/data/lines/<id>/alignment-*.geojson (Lines 4, 5, 12, 12A).
#   - The Thane Integral Ring Metro project's route map (Google My Maps, linked from thanemetrorail.com).
#   - OpenStreetMap (ODbL) for Line 3 and Navi Mumbai Metro Line 1, which have no agency file.
# Lines with no published route (8, 10, 11, 13, 14, Navi Mumbai Line 2, Virar to Alibaug) get no geometry.
# Run from the repo root: python scripts/build-network-geometry.py [cache-dir]
# With a cache dir, files already there are read instead of downloaded. Standard library only.
import io
import json
import math
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

CHECKED = '2026-10-29'
OUT = 'src/data/network-geometry.geojson'
NETWORK = 'src/data/network.json'
UA = {'User-Agent': 'mumbai-metro-tracker build script (github.com/ShashankBallaya/mumbai-metro-tracker)'}
K = '{http://www.opengis.net/kml/2.2}'
MMRDA = 'https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/'
NOC_PAGE = 'https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc'
RING_KML = 'https://www.google.com/maps/d/kml?mid=1YNvo8fqUuYUWJqEiwstEdGWJTZMJbEQ&forcekml=1'
RING_PAGE = 'https://thanemetrorail.com/route-map'

# MMRDA corridor files. `split`: the KML station where a line changes stage, and the stage on each side
# (start side first; the start is the corridor tip nearest `start`).
POLYGON_LINES = {
    'line-1': {'file': 'metro_line_1.kml', 'start': (72.8135, 19.1307)},
    'line-2a': {'file': 'metro_line_2a.kml', 'start': (72.8609, 19.2497)},
    # Line 2B's corridor polygon defeats the midpoint method (the line drifts up to 900 m), so it is drawn
    # through MMRDA's station points in the file's order, Mandale first.
    'line-2b': {'file': 'line_2b.kml', 'start': (72.9303, 19.0488), 'chain': True, 'split': 'CHEMBUR (M) STATION'},
    'line-6': {'file': 'line-6.kml', 'start': (72.8253, 19.1374)},
    'line-7': {'file': 'metro_line_7.kml', 'start': (72.8497, 19.1155)},
    'line-9': {'file': 'line-9_2.kml', 'start': (72.8617, 19.2515), 'split': 'Zankar Company (M) Station'},
}
# OpenStreetMap route relations (found with an Overpass query for subway routes in Maharashtra, 2026-10-29).
OSM_LINES = {'line-3': 7898597, 'nmm-1': 16533436}  # Line 3 (Aarey JVLR to Cuffe Parade); Line 1 (CBD Belapur to Pendhar)

LAT0 = 19.1
KX = 111_319.49 * math.cos(math.radians(LAT0))
KY = 111_132.954
to_xy = lambda c: (c[0] * KX, c[1] * KY)
to_ll = lambda p: (round(p[0] / KX, 6), round(p[1] / KY, 6))


def get(url, name, cache, data=None):
    path = cache and os.path.join(cache, name)
    if path and os.path.exists(path):
        return open(path, 'rb').read()
    req = urllib.request.Request(url, data=data, headers=UA)
    body = urllib.request.urlopen(req, timeout=180).read()
    if path:
        open(path, 'wb').write(body)
    return body


def seg_nearest(a, b, p):
    dx, dy = b[0] - a[0], b[1] - a[1]
    l2 = dx * dx + dy * dy or 1e-12
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
    q = (a[0] + t * dx, a[1] + t * dy)
    return q, math.dist(p, q), t * math.sqrt(l2)


def densify(pts, step):
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        n = max(1, int(math.dist(a, b) // step))
        out += [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n) for i in range(1, n + 1)]
    return out


def simplify(p, tol):
    keep = [False] * len(p)
    keep[0] = keep[-1] = True
    stack = [(0, len(p) - 1)]
    while stack:
        i, j = stack.pop()
        best, idx = 0.0, None
        for k in range(i + 1, j):
            d = seg_nearest(p[i], p[j], p[k])[1]
            if d > best:
                best, idx = d, k
        if idx is not None and best > tol:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    return [q for q, kp in zip(p, keep) if kp]


def kml_parts(data):
    root = ET.fromstring(data)
    polys, lines, points = [], [], {}
    for pm in root.iter(K + 'Placemark'):
        name = (pm.findtext(K + 'name') or '').strip()
        for geom, bucket in (('Polygon', polys), ('LineString', lines), ('Point', None)):
            for g in pm.iter(K + geom):
                el = g.find('.//' + K + 'coordinates')
                coords = [tuple(map(float, c.split(',')[:2])) for c in el.text.split()]
                if bucket is None:
                    points[name] = coords[0]
                else:
                    bucket.append(coords)
    return polys, lines, points


def centre_line(ring, start, end=None):
    """Midpoints between the two long sides of a corridor polygon, from the tip nearest `start`
    to the tip nearest `end` (default: the vertex halfway round the polygon)."""
    if ring[0] == ring[-1]:
        ring = ring[:-1]
    R = [to_xy(c) for c in ring]
    n = len(R)
    cum = [0.0]
    for i in range(n):
        cum.append(cum[-1] + math.dist(R[i], R[(i + 1) % n]))
    perimeter = cum[-1]
    s = to_xy(start)
    i0 = min(range(n), key=lambda i: math.dist(R[i], s))
    ahead = lambda a, b: (cum[b] - cum[a]) % perimeter
    if end:
        e = to_xy(end)
        i1 = min(range(n), key=lambda i: math.dist(R[i], e))
    else:
        i1 = min(range(n), key=lambda i: abs(ahead(i0, i) - perimeter / 2))
    side_a = densify([R[(i0 + j) % n] for j in range((i1 - i0) % n + 1)], 5.0)
    side_b = densify([R[(i0 - j) % n] for j in range((i0 - i1) % n + 1)], 5.0)
    # Pair each point of side A with the nearest point of side B anywhere (a 100 m grid finds it fast),
    # but never step backwards along side B, so a lobe (a depot spur) on one side cannot pull the line across.
    cell = 100.0
    grid = {}
    for j, q in enumerate(side_b):
        grid.setdefault((int(q[0] // cell), int(q[1] // cell)), []).append(j)
    mid, last = [], 0
    for k in range(0, len(side_a), 4):
        p = side_a[k]
        gx, gy = int(p[0] // cell), int(p[1] // cell)
        near = [j for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2) for j in grid.get((gx + dx, gy + dy), ()) if j >= last]
        if not near:
            continue
        j = min(near, key=lambda j: math.dist(p, side_b[j]))
        if math.dist(p, side_b[j]) > 180:
            continue
        last = j
        q = side_b[j]
        mid.append(((p[0] + q[0]) / 2, (p[1] + q[1]) / 2))
    return simplify(mid, 8.0)


def split_at(line, point):
    """Splits a projected polyline at the point nearest `point` (lng, lat)."""
    p = to_xy(point)
    best = min(((i, *seg_nearest(a, b, p)) for i, (a, b) in enumerate(zip(line, line[1:]))), key=lambda r: r[2])
    i, q = best[0], best[1]
    if best[2] > 60:
        sys.exit(f'Split station is {best[2]:.0f} m from the line')
    return line[:i + 1] + [q], [q] + line[i + 1:]


def feature(geom_type, coords, **props):
    return {'type': 'Feature', 'properties': props, 'geometry': {'type': geom_type, 'coordinates': coords}}


def line_feature(line_id, stage, parts_xy, source, **extra):
    coords = [[list(to_ll(p)) for p in part] for part in parts_xy]
    if len(coords) == 1:
        return feature('LineString', coords[0], line=line_id, stage=stage, source=source, **extra)
    return feature('MultiLineString', coords, line=line_id, stage=stage, source=source, **extra)


def stages_of(net, line_id):
    entry = next(l for l in net['lines'] if l['id'] == line_id)
    return [p['stage'] for p in entry['parts']]


def osm_geometry(rel_id, cache):
    """The route's railway ways, from the OpenStreetMap API (relation/<id>/full)."""
    url = f'https://api.openstreetmap.org/api/0.6/relation/{rel_id}/full.json'
    d = json.loads(get(url, f'osm-{rel_id}.json', cache))
    nodes = {e['id']: (e['lon'], e['lat']) for e in d['elements'] if e['type'] == 'node'}
    rel = next(e for e in d['elements'] if e['type'] == 'relation' and e['id'] == rel_id)
    way_ids = {m['ref'] for m in rel['members'] if m['type'] == 'way' and m.get('role', '') in ('', 'forward', 'backward')}
    return [[nodes[n] for n in e['nodes']] for e in d['elements'] if e['type'] == 'way' and e['id'] in way_ids]


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else None
    if cache:
        os.makedirs(cache, exist_ok=True)
    net = json.load(open(NETWORK, encoding='utf-8'))
    feats = []
    src_mmrda = {'name': "MMRDA alignment file (Metro Influence Zone NOC page, Mar 2025)", 'url': NOC_PAGE, 'status': 'verified', 'checked': CHECKED}

    # MMRDA corridor polygons.
    for line_id, cfg in POLYGON_LINES.items():
        polys, _, points = kml_parts(get(MMRDA + cfg['file'], cfg['file'], cache))
        if len(polys) != 1:
            sys.exit(f'{cfg["file"]}: expected one corridor polygon, found {len(polys)}')
        if cfg.get('chain'):
            line = [to_xy(p) for p in reversed(list(points.values()))]
        else:
            line = centre_line(polys[0], cfg['start'], points.get(cfg.get('end_station')))
        stages = stages_of(net, line_id)
        if 'split' in cfg:
            a, b = split_at(line, points[cfg['split']])
            src = dict(src_mmrda, method='through station points') if cfg.get('chain') else src_mmrda
            feats.append(line_feature(line_id, stages[0], [a], src))
            feats.append(line_feature(line_id, stages[-1], [b], src))
        else:
            if len(set(stages)) != 1:
                sys.exit(f'{line_id}: parts in more than one stage but no split station')
            feats.append(line_feature(line_id, stages[0], [line], src_mmrda))
        for pt in points.values():
            feats.append(feature('Point', list(to_ll(to_xy(pt))), line=line_id, kind='station'))

    # Line 7A: line pieces as drawn (the file has no corridor polygon for the route itself).
    raw = get(MMRDA + 'line_7a_1_3.kmz', 'line_7a_1_3.kmz', cache)
    kml = zipfile.ZipFile(io.BytesIO(raw)).read('doc.kml')
    _, lines, points = kml_parts(kml)
    pieces = [simplify([to_xy(c) for c in l], 8.0) for l in lines if len(l) > 1]
    feats.append(line_feature('line-7a', stages_of(net, 'line-7a')[0], pieces, src_mmrda))
    for pt in points.values():
        feats.append(feature('Point', list(to_ll(to_xy(pt))), line='line-7a', kind='station'))

    # Tracked lines: their own alignment files, split where the tracked data says the stage changes.
    tracked = {
        'line-4': ('src/data/lines/line-4/alignment-mmrda-2025.geojson', {'current': 'under_construction', 'extension': 'under_construction'}),
        'line-5': ('src/data/lines/line-5/alignment-mmrda-2025.geojson', {'current': 'under_construction', 'spur': 'planned'}),
        'line-12': ('src/data/lines/line-12/alignment-mmrda-2025.geojson', None),
        'line-12a': ('src/data/lines/line-12a/alignment-indicative.geojson', None),
    }
    for line_id, (path, by_part) in tracked.items():
        gj = json.load(open(path, encoding='utf-8'))
        stage0 = stages_of(net, line_id)[0]
        for f in gj['features']:
            g, part = f['geometry'], f['properties'].get('part')
            if g['type'] != 'LineString' or part in ('superseded', 'underground') or 'depot' in f['properties'].get('name', '').lower():
                continue
            stage = (by_part or {}).get(part, stage0)
            src = {'name': f'{line_id} alignment ({os.path.basename(path)})', 'url': f'/{line_id}/', 'status': f['properties'].get('status', 'verified' if 'mmrda' in path else 'unverified'), 'checked': CHECKED}
            feats.append(line_feature(line_id, stage, [[to_xy(c) for c in g['coordinates']]], src, indicative=line_id == 'line-12a' or None))
    # Line 5 beyond Phase 1 is approved, not under construction: split the centre line at Dhamankar Naka.
    st5 = json.load(open('src/data/lines/line-5/stations.json', encoding='utf-8'))['stations']
    dhamankar = next(s for s in st5 if s['id'] == 'dhamankar-naka')
    for i, f in enumerate(feats):
        if f['properties']['line'] == 'line-5' and f['properties']['stage'] == 'under_construction':
            loc = dhamankar['location']
            a, b = split_at([to_xy(c) for c in f['geometry']['coordinates']], (loc['lng'], loc['lat']))
            props = f['properties']
            feats[i] = line_feature('line-5', 'under_construction', [a], props['source'])
            feats.append(line_feature('line-5', 'planned', [b], props['source']))
            break
    # Line 4: Gaimukh to Cadbury Junction is the first stretch; both sides are under construction, so no split.

    # Thane Integral Ring Metro: the project's own route map.
    root = ET.fromstring(get(RING_KML, 'thane-ring.kml', cache))
    ring_pieces, ring_points = [], []
    for folder in root.iter(K + 'Folder'):
        name = folder.findtext(K + 'name')
        for pm in folder.findall(K + 'Placemark'):
            if name == 'Line Features':
                for g in pm.iter(K + 'LineString'):
                    cs = [tuple(map(float, c.split(',')[:2])) for c in g.find(K + 'coordinates').text.split()]
                    ring_pieces.append(simplify([to_xy(c) for c in cs], 8.0))
            elif name == 'Point Features':
                c = pm.find('.//' + K + 'coordinates').text.strip().split(',')
                ring_points.append((float(c[0]), float(c[1])))
    src_ring = {'name': 'Thane Integral Ring Metro route map (project website)', 'url': RING_PAGE, 'status': 'reported', 'checked': CHECKED}
    feats.append(line_feature('thane-ring', stages_of(net, 'thane-ring')[0], ring_pieces, src_ring))
    for pt in ring_points:
        feats.append(feature('Point', list(to_ll(to_xy(pt))), line='thane-ring', kind='station'))

    # OpenStreetMap: Line 3 and Navi Mumbai Metro Line 1.
    src_osm = {'name': 'OpenStreetMap contributors (ODbL)', 'url': 'https://www.openstreetmap.org/copyright', 'status': 'reported', 'checked': CHECKED}
    for line_id, rel in OSM_LINES.items():
        if rel is None:
            print(f'{line_id}: no OpenStreetMap relation set; skipped')
            continue
        pieces = [simplify([to_xy(c) for c in w], 8.0) for w in osm_geometry(rel, cache) if len(w) > 1]
        feats.append(line_feature(line_id, stages_of(net, line_id)[0], pieces, src_osm, osm_relation=rel))

    for f in feats:
        f['properties'] = {k: v for k, v in f['properties'].items() if v is not None}
    out = {'type': 'FeatureCollection', '_meta': {'description': 'Built by scripts/build-network-geometry.py from the sources it names; do not edit by hand.', 'built': CHECKED}, 'features': feats}
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    lines = [f for f in feats if f['geometry']['type'] != 'Point']
    print(f'{OUT}: {len(lines)} line features, {len(feats) - len(lines)} stations, {os.path.getsize(OUT) // 1024} KB')


if __name__ == '__main__':
    main()
