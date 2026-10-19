# Builds Line 4's route line and station positions from MMRDA's alignment file.
#
# MMRDA publishes "Line 4 : Wadala-Ghatkopar-Mulund-Thane" as a KML on its Metro Influence Zone for
# NOC page (uploaded March 2025). Like Line 5's file it has no centre line: it holds the corridor as one
# polygon, from Bhakti Park to Gaimukh (Line 4A included), and a point for each of 34 stations,
# including Suman Nagar and Amar Mahal Junction, which MMRDA has since dropped. This script:
#   - derives the centre line as the midpoints between the polygon's two long sides (the two ends of
#     the polygon are its tips south of Bhakti Park and past Gaimukh), then starts the line at Bhakti
#     Park station, so distances count from the first station (the polygon runs on about 490 m south
#     of it, over the end of line),
#   - writes src/data/lines/line-4/alignment-mmrda-2025.geojson (simplified to ~1 m) in two parts,
#     Line 4 to Kasarvadavali and Line 4A on to Gaimukh, split at the end of line past Kasarvadavali
#     that the Line 4A project report gives (450 m past the station),
#   - moves every station in src/data/lines/line-4/stations.json, and the two dropped ones, to MMRDA's
#     point, graded verified, and sets along_m: the distance from the start of the centre line.
# The script stops if a station point is more than 25 m from the derived line, or out of order, which
# would mean the derivation went wrong.
# Run from the repo root: python scripts/build-alignment-line4.py [path/to/line_4.kml]
# Without a path it downloads the file. Uses only the Python standard library.
import json
import math
import sys
import urllib.request
import xml.etree.ElementTree as ET

KML_URL = 'https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/line_4.kml'
PAGE_URL = 'https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc'
CHECKED = '2026-10-19'
K = '{http://www.opengis.net/kml/2.2}'
STATIONS = 'src/data/lines/line-4/stations.json'
OUT = 'src/data/lines/line-4/alignment-mmrda-2025.geojson'
END_OF_LINE_4_M = 450  # Line 4A starts 450 m past Kasarvadavali station (project reports, 2016 and 2017)

# A flat projection, good to well under a metre across this 35 km line.
LAT0 = 19.15
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
cum = [0.0]
for i in range(n):
    cum.append(cum[-1] + math.dist(R[i], R[(i + 1) % n]))
perimeter = cum[-1]
i0 = min(range(n), key=lambda i: R[i][1])  # the southern tip, at Bhakti Park
ahead = lambda a, b: (cum[b] - cum[a]) % perimeter
i1 = min(range(n), key=lambda i: abs(ahead(i0, i) - perimeter / 2))  # the far tip: halfway round
side_a = densify([R[(i0 + j) % n] for j in range((i1 - i0) % n + 1)], 2.0)
side_b = densify([R[(i0 - j) % n] for j in range((i0 - i1) % n + 1)], 2.0)

mid = []
for k in range(0, len(side_a), 5):
    p = side_a[k]
    c = int(k * len(side_b) / len(side_a))
    window = side_b[max(0, c - 400):c + 400]
    q = min((seg_nearest(a, b, p)[:2] for a, b in zip(window, window[1:])), key=lambda r: r[1])[0]
    mid.append(((p[0] + q[0]) / 2, (p[1] + q[1]) / 2))
centre = simplify(mid, 1.0)
cum_c = [0.0]
for a, b in zip(centre, centre[1:]):
    cum_c.append(cum_c[-1] + math.dist(a, b))
length = cum_c[-1]


def along(lng, lat):
    p = to_xy(lng, lat)
    best = (1e18, 0.0)
    for i, (a, b) in enumerate(zip(centre, centre[1:])):
        _, d, s = seg_nearest(a, b, p)
        if d < best[0]:
            best = (d, cum_c[i] + s)
    return best


def cut(s0, s1):
    """The part of the centre line between s0 and s1 metres from its start."""
    def point(s):
        for i in range(len(centre) - 1):
            if cum_c[i + 1] >= s:
                t = (s - cum_c[i]) / ((cum_c[i + 1] - cum_c[i]) or 1e-9)
                a, b = centre[i], centre[i + 1]
                return (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
        return centre[-1]
    inner = [q for q, c in zip(centre, cum_c) if s0 < c < s1]
    return [[round(c, 6) for c in to_ll(*q)] for q in [point(s0), *inner, point(s1)]]


# ---------- Start the line at Bhakti Park station ----------
first_off, first_at = along(*points['BHAKTI PARK (M) STATION'])
centre = [to_xy(*c) for c in cut(first_at, length)]
cum_c = [0.0]
for a, b in zip(centre, centre[1:]):
    cum_c.append(cum_c[-1] + math.dist(a, b))
length = cum_c[-1]
print(f'Line starts at Bhakti Park, {first_at:.0f} m from the polygon tip')

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
        'method': f'MMRDA alignment file for Line 4 (KML on the Metro Influence Zone page, uploaded March 2025): point "{kml_name}". along_m is measured along a centre line derived from MMRDA\'s corridor polygon, from Bhakti Park station; the point is {round(off)} m from that line.',
        'status': 'verified',
        'source_url': PAGE_URL,
    }
    print(f'{st["id"]:22s} {at / 1000:7.3f} km  {off:5.1f} m off the line  (DPR {st["dpr_chainage_m"] / 1000:7.3f} km)')

order = [s['id'] for s in doc['stations']]
if order != sorted(order, key=lambda sid: along_of[sid]):
    sys.exit("MMRDA's station points are not in the order of its station list")

with open(STATIONS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write('\n')

split = along_of['kasarvadavali'] + END_OF_LINE_4_M
feature = lambda props, coords: {'type': 'Feature', 'properties': props, 'geometry': {'type': 'LineString', 'coordinates': coords}}
geo = {
    'type': 'FeatureCollection',
    'properties': {
        'note': f'Derived from MMRDA\'s alignment file for Line 4 ({KML_URL}), which gives the corridor from Bhakti Park to Gaimukh as one polygon; the centre line runs midway between its two sides from Bhakti Park station, along the Eastern Express Highway, LBS Marg and Ghodbunder Road (verified). Line 4 ends {END_OF_LINE_4_M} m past Kasarvadavali, where Line 4A starts (project reports, 2016 and 2017). Simplified to about 1 m by scripts/build-alignment-line4.py.',
        'source_url': PAGE_URL,
        'status': 'verified',
        'last_verified': CHECKED,
        'length_m': round(length),
        'line_4_m': round(split),
        'line_4a_m': round(length - split),
    },
    'features': [
        feature({'name': 'Line 4 centre line', 'part': 'current', 'note': 'Bhakti Park (Wadala) to the end of line past Kasarvadavali, from MMRDA\'s 2025 file (verified).'}, cut(0, split)),
        feature({'name': 'Line 4A', 'part': 'extension', 'note': 'Kasarvadavali to Gaimukh, from MMRDA\'s 2025 file (verified).'}, cut(split, length)),
    ],
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(geo, f, indent=1)
    f.write('\n')
print(f'Centre line {length / 1000:.3f} km: Line 4 {split / 1000:.3f} km, Line 4A {(length - split) / 1000:.3f} km')
