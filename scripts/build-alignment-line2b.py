# Builds Line 2B's route line and station positions from MMRDA's alignment file.
#
# MMRDA publishes "Line 2B : D.N.Nagar-Mandale" as a KML on its Metro Influence Zone for NOC page
# (uploaded March 2025). Like the Line 4 and Line 5 files it has no centre line: it holds the corridor
# as one polygon, from D N Nagar to past Mandale, and a point for each of 21 stations (MMRDA's 20 and
# Kurla Terminus, which its list no longer has). This script:
#   - derives the centre line from the polygon. The two tips are the polygon's northernmost point (at
#     D N Nagar, where Line 2B leaves Line 2A) and its easternmost (past Mandale). Each side runs from
#     tip to tip; the centre line is the midpoint between each point of one side and the nearest point
#     of the other. (The halfway-round pairing of build-alignment-line4.py fails here: the two sides
#     differ in length by about 3 km, so pairs drift apart.)
#   - starts the line at ESIC Nagar, the first station, so distances count from it,
#   - writes src/data/lines/line-2b/alignment-mmrda-2025.geojson (simplified to ~1 m),
#   - moves every station in src/data/lines/line-2b/stations.json, and the dropped Kurla Terminus, to
#     MMRDA's point, graded verified, and sets along_m.
# The script stops if a station point is more than 25 m from the derived line, or out of order.
# Run from the repo root: python scripts/build-alignment-line2b.py [path/to/line_2b.kml]
# Without a path it downloads the file. Uses only the Python standard library.
import json
import math
import sys
import urllib.request
import xml.etree.ElementTree as ET

KML_URL = 'https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/line_2b.kml'
PAGE_URL = 'https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc'
CHECKED = '2026-10-30'
K = '{http://www.opengis.net/kml/2.2}'
STATIONS = 'src/data/lines/line-2b/stations.json'
OUT = 'src/data/lines/line-2b/alignment-mmrda-2025.geojson'
# The schematic's one 45-degree bend (src/lib/route.ts): at Bandra, where the line leaves the north-south
# run from Andheri along S V Road and turns east through BKC to Kurla and Chembur.
BEND_AT_STATION = 'bandra-metro'

LAT0 = 19.07
KX = 111_319.49 * math.cos(math.radians(LAT0))
KY = 111_132.954
to_xy = lambda lng, lat: (lng * KX, lat * KY)
to_ll = lambda x, y: (x / KX, y / KY)


def seg_nearest(a, b, p):
    """Nearest point to p on segment ab, its distance, and how far along ab it is."""
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
    """Douglas-Peucker on projected points, tolerance in metres."""
    keep = [False] * len(p)
    keep[0] = keep[-1] = True
    stack = [(0, len(p) - 1)]
    while stack:
        i, j = stack.pop()
        best, idx = 0.0, None
        for k in range(i + 1, j):
            _, d, _ = seg_nearest(p[i], p[j], p[k])
            if d > best:
                best, idx = d, k
        if idx is not None and best > tol:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    return [q for q, kp in zip(p, keep) if kp]


# ---------- Read the KML ----------
if len(sys.argv) > 1:
    data = open(sys.argv[1], 'rb').read()
else:
    data = urllib.request.urlopen(urllib.request.Request(KML_URL, headers={'User-Agent': 'mumbai-metro-tracker build script'}), timeout=120).read()
root = ET.fromstring(data)

ring, points = None, {}
for pm in root.iter(K + 'Placemark'):
    name = (pm.findtext(K + 'name') or '').strip()
    coords = [tuple(map(float, c.split(',')[:2])) for c in pm.find('.//' + K + 'coordinates').text.split()]
    if pm.find('.//' + K + 'Polygon') is not None:
        if ring is not None:
            sys.exit('Expected one corridor polygon, found more')
        ring = coords
    else:
        points[name] = coords[0]
if ring is None:
    sys.exit('No corridor polygon in the KML')

doc = json.load(open(STATIONS, encoding='utf-8'))
all_stations = doc['stations'] + doc['dropped_stations']
kml_names = {s['kml_name']: s for s in all_stations}
if set(points) != set(kml_names):
    sys.exit(f'Station names in the KML changed: {sorted(set(points) ^ set(kml_names))}')

# ---------- Centre line ----------
if ring[0] == ring[-1]:
    ring = ring[:-1]
R = [to_xy(*c) for c in ring]
n = len(R)
i0 = max(range(n), key=lambda i: R[i][1])  # the northern tip, at D N Nagar
i1 = max(range(n), key=lambda i: R[i][0])  # the eastern tip, past Mandale
side_a = densify([R[(i0 + j) % n] for j in range((i1 - i0) % n + 1)], 2.0)
side_b = densify([R[(i0 - j) % n] for j in range((i0 - i1) % n + 1)], 2.0)

CELL = 200.0
grid = {}
for k, (a, b) in enumerate(zip(side_b, side_b[1:])):
    grid.setdefault((int(a[0] // CELL), int(a[1] // CELL)), []).append(k)


def nearest_on_b(p):
    gx, gy = int(p[0] // CELL), int(p[1] // CELL)
    best = None
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for k in grid.get((gx + dx, gy + dy), []):
                r = seg_nearest(side_b[k], side_b[k + 1], p)
                if best is None or r[1] < best[1]:
                    best = r
    return best


mid = []
for k in range(0, len(side_a), 5):
    p = side_a[k]
    r = nearest_on_b(p)
    if r is None or r[1] > 150:
        sys.exit(f'No opposite side within 150 m of {to_ll(*p)}: the polygon is not a corridor here')
    mid.append(((p[0] + r[0][0]) / 2, (p[1] + r[0][1]) / 2))
centre = simplify(mid, 1.0)


def cumulate(line):
    c = [0.0]
    for a, b in zip(line, line[1:]):
        c.append(c[-1] + math.dist(a, b))
    return c


cum_c = cumulate(centre)


def along(lng, lat):
    p = to_xy(lng, lat)
    best = (1e18, 0.0)
    for i, (a, b) in enumerate(zip(centre, centre[1:])):
        _, d, s = seg_nearest(a, b, p)
        if d < best[0]:
            best = (d, cum_c[i] + s)
    return best


def point_at(s):
    for i in range(len(centre) - 1):
        if cum_c[i + 1] >= s:
            t = (s - cum_c[i]) / ((cum_c[i + 1] - cum_c[i]) or 1e-9)
            a, b = centre[i], centre[i + 1]
            return (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
    return centre[-1]


# ---------- Start the line at ESIC Nagar ----------
tip_to_first = along(*points['ESIC NAGAR (M) STATION'])[1]
centre = [point_at(tip_to_first)] + [q for q, c in zip(centre, cum_c) if c > tip_to_first]
cum_c = cumulate(centre)
length = cum_c[-1]
print(f'Line starts at ESIC Nagar, {tip_to_first:.0f} m from the polygon tip at D N Nagar; {length:.0f} m to the eastern tip')

# ---------- Stations from MMRDA's file ----------
along_of = {}
for kml_name, st in sorted(kml_names.items(), key=lambda kv: along(*points[kv[0]])[1]):
    lng, lat = points[kml_name]
    off, at = along(lng, lat)
    if off > 25:
        sys.exit(f'{kml_name} is {off:.0f} m from the derived centre line')
    along_of[st['id']] = at
    st['location'] = {
        'lng': round(lng, 6),
        'lat': round(lat, 6),
        'along_m': round(at),
        'method': f'MMRDA alignment file for Line 2B (KML on the Metro Influence Zone page, uploaded March 2025): point "{kml_name}". along_m is measured along a centre line derived from MMRDA\'s corridor polygon, from ESIC Nagar station; the point is {round(off)} m from that line.',
        'status': 'verified',
        'source_url': PAGE_URL,
    }
    print(f'{st["id"]:22s} {at / 1000:7.3f} km  {off:5.1f} m off the line')

order = [s['id'] for s in doc['stations']]
if order != sorted(order, key=lambda sid: along_of[sid]):
    sys.exit("MMRDA's station points are not in the order of its station list")

with open(STATIONS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write('\n')

geo = {
    'type': 'FeatureCollection',
    'properties': {
        'note': f'Derived from MMRDA\'s alignment file for Line 2B ({KML_URL}), which gives the corridor from D N Nagar to past Mandale as one polygon; the centre line runs midway between its two sides from ESIC Nagar station: south from Andheri along S V Road to Bandra, east through Bandra Kurla Complex to Kurla, then through Chembur to Mandale (verified). The line from D N Nagar to ESIC Nagar ({tip_to_first:.0f} m) is not drawn. Simplified to about 1 m by scripts/build-alignment-line2b.py.',
        'source_url': PAGE_URL,
        'status': 'verified',
        'last_verified': CHECKED,
        'length_m': round(length),
        'bend_along_m': round(along_of[BEND_AT_STATION]),
    },
    'features': [
        {
            'type': 'Feature',
            'properties': {'name': 'Line 2B centre line', 'part': 'current', 'note': "ESIC Nagar to the end of line past Mandale, from MMRDA's 2025 file (verified)."},
            'geometry': {'type': 'LineString', 'coordinates': [[round(c, 6) for c in to_ll(*q)] for q in centre]},
        }
    ],
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(geo, f, indent=1)
    f.write('\n')
print(f'Wrote {OUT}: {len(centre)} points, {length / 1000:.2f} km')
