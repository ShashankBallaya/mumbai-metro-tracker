# Builds Line 7A's route line and station positions from MMRDA's alignment file.
#
# MMRDA publishes Line 7A (Andheri (E) to the airport) as a KMZ on its Metro Influence Zone for NOC page
# (line_7a_1_3.kmz, uploaded March 2025). Unlike the other lines' files it is a CAD drawing: in its
# "Horiz Linear" layer it holds the two tracks (up and down line) as long lines, each about 3.52 km from
# Gundavali, where 7A leaves Line 7, to the end of the tunnel past the airport station, and a point for
# each of the two stations. This script:
#   - pairs each point of one track with the nearest point of the other and takes the midpoint, which
#     gives the centre line,
#   - starts the line at Airport Colony, the first station, so distances count from it (the stretch from
#     Gundavali is not drawn, as for Line 2B from D N Nagar),
#   - marks the last 2.195 km as underground: MMRDA's underground length for Lines 9 and 7A, all of it
#     on 7A, measured back from the end of the tracks,
#   - puts the schematic's bend where the line turns east off the Western Express Highway (the start of
#     the drawing's eastward track piece),
#   - writes src/data/lines/line-7a/alignment-mmrda-2025.geojson and moves both stations in
#     src/data/lines/line-7a/stations.json to MMRDA's points, graded verified, with along_m.
# The script stops if a station point is more than 40 m from the centre line.
# Run from the repo root: python scripts/build-alignment-line7a.py [path/to/line_7a_1_3.kmz]
# Without a path it downloads the file. Uses only the Python standard library.
import io
import json
import math
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

KMZ_URL = 'https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/line_7a_1_3.kmz'
PAGE_URL = 'https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc'
MMRDA_PAGE = 'https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-9/overview'
CHECKED = '2026-10-30'
UNDERGROUND_M = 2195  # MMRDA's Line 9 and 7A page: '2.195 km underground'
TURN_EAST = (72.85533, 19.10267)  # start of the drawing's eastward track piece, off the highway
K = '{http://www.opengis.net/kml/2.2}'
STATIONS = 'src/data/lines/line-7a/stations.json'
OUT = 'src/data/lines/line-7a/alignment-mmrda-2025.geojson'

LAT0 = 19.105
KX = 111_319.49 * math.cos(math.radians(LAT0))
KY = 111_132.954
to_xy = lambda lng, lat: (lng * KX, lat * KY)
to_ll = lambda x, y: (x / KX, y / KY)


def seg_nearest(a, b, p):
    dx, dy = b[0] - a[0], b[1] - a[1]
    l2 = dx * dx + dy * dy or 1e-12
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
    q = (a[0] + t * dx, a[1] + t * dy)
    return q, math.dist(p, q), t * math.sqrt(l2)


def simplify(p, tol):
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


def cumulate(line):
    c = [0.0]
    for a, b in zip(line, line[1:]):
        c.append(c[-1] + math.dist(a, b))
    return c


# ---------- Read the KMZ ----------
raw = open(sys.argv[1], 'rb').read() if len(sys.argv) > 1 else urllib.request.urlopen(
    urllib.request.Request(KMZ_URL, headers={'User-Agent': 'mumbai-metro-tracker build script'}), timeout=120).read()
root = ET.fromstring(zipfile.ZipFile(io.BytesIO(raw)).read('doc.kml'))

tracks, points = [], {}
for folder in root.iter(K + 'Folder'):
    if folder.findtext(K + 'name') != 'Horiz Linear':
        continue
    for ls in folder.iter(K + 'LineString'):
        cs = [tuple(map(float, c.split(',')[:2])) for c in ls.find(K + 'coordinates').text.split()]
        line = [to_xy(*c) for c in cs]
        if sum(cumulate(line)[-1:]) > 3000:  # the two through tracks; the rest are short pieces
            tracks.append(line)
for pm in root.iter(K + 'Placemark'):
    pt = pm.find('.//' + K + 'Point')
    if pt is not None:
        points[(pm.findtext(K + 'name') or '').strip()] = tuple(map(float, pt.find(K + 'coordinates').text.split(',')[:2]))
if len(tracks) != 2:
    sys.exit(f'Expected two through tracks in "Horiz Linear", found {len(tracks)}')

# Both tracks run from Gundavali (north) to the airport (east); orient them so.
tracks = [t if t[0][1] > t[-1][1] else t[::-1] for t in tracks]
a, b = tracks


def nearest_on(line, p):
    best = None
    for i in range(len(line) - 1):
        r = seg_nearest(line[i], line[i + 1], p)
        if best is None or r[1] < best[1]:
            best = r
    return best


mid = []
for p in a:
    q, d, _ = nearest_on(b, p)
    if d > 30:
        sys.exit(f'The tracks are {d:.0f} m apart at {to_ll(*p)}')
    mid.append(((p[0] + q[0]) / 2, (p[1] + q[1]) / 2))
centre = simplify(mid, 1.0)
cum = cumulate(centre)
tip_length = cum[-1]


def along(lng, lat):
    p = to_xy(lng, lat)
    best = (1e18, 0.0)
    for i in range(len(centre) - 1):
        _, d, s = seg_nearest(centre[i], centre[i + 1], p)
        if d < best[0]:
            best = (d, cum[i] + s)
    return best


def point_at(s):
    for i in range(len(centre) - 1):
        if cum[i + 1] >= s:
            t = (s - cum[i]) / ((cum[i + 1] - cum[i]) or 1e-9)
            return (centre[i][0] + t * (centre[i + 1][0] - centre[i][0]), centre[i][1] + t * (centre[i + 1][1] - centre[i][1]))
    return centre[-1]


# ---------- Start at Airport Colony ----------
first = along(*points['AIRPORT COLONY'])[1]
underground_from = tip_length - UNDERGROUND_M - first
turn = along(*TURN_EAST)[1] - first
centre = [point_at(first)] + [q for q, c in zip(centre, cum) if c > first]
cum = cumulate(centre)
length = cum[-1]
print(f'Gundavali to Airport Colony {first:.0f} m (not drawn); Airport Colony to the end {length:.0f} m; tracks {tip_length:.0f} m')


def along2(lng, lat):
    p = to_xy(lng, lat)
    best = (1e18, 0.0)
    for i in range(len(centre) - 1):
        _, d, s = seg_nearest(centre[i], centre[i + 1], p)
        if d < best[0]:
            best = (d, cum[i] + s)
    return best


# ---------- Stations ----------
doc = json.load(open(STATIONS, encoding='utf-8'))
along_of = {}
for st in doc['stations']:
    lng, lat = points[st['kml_name']]
    off, at = along2(lng, lat)
    if off > 40:
        sys.exit(f"{st['kml_name']} is {off:.0f} m from the centre line")
    along_of[st['id']] = at
    st['location'] = {
        'lng': round(lng, 6), 'lat': round(lat, 6), 'along_m': round(at),
        'method': f'MMRDA alignment file for Line 7A (KMZ on the Metro Influence Zone page, uploaded March 2025): point "{st["kml_name"]}". along_m is measured along the centre line between the file\'s two tracks, from Airport Colony station; the point is {round(off)} m from that line.',
        'status': 'verified', 'source_url': PAGE_URL,
    }
    print(f"{st['id']:16s} {at / 1000:6.3f} km  {off:5.1f} m off the line")
if [s['id'] for s in doc['stations']] != sorted(along_of, key=along_of.get):
    sys.exit('Stations are out of order along the line')
with open(STATIONS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write('\n')

# ---------- GeoJSON ----------
ll = lambda line: [[round(c, 6) for c in to_ll(*q)] for q in line]
ug = [q for q, c in zip(centre, cum) if c >= underground_from]
start_ug = None
for i in range(len(centre) - 1):
    if cum[i] <= underground_from <= cum[i + 1]:
        t = (underground_from - cum[i]) / ((cum[i + 1] - cum[i]) or 1e-9)
        start_ug = (centre[i][0] + t * (centre[i + 1][0] - centre[i][0]), centre[i][1] + t * (centre[i + 1][1] - centre[i][1]))
ug = [start_ug] + ug
geo = {
    'type': 'FeatureCollection',
    'properties': {
        'note': f"Derived from MMRDA's alignment file for Line 7A ({KMZ_URL}), a CAD drawing whose 'Horiz Linear' layer holds the two tracks; the centre line runs midway between them from Airport Colony station: south along the Western Express Highway, then east and underground beneath the airport to its Terminal 2 station and the end of the tunnel (verified). The {first:.0f} m from Gundavali, where 7A leaves Line 7, is not drawn. Simplified to about 1 m by scripts/build-alignment-line7a.py.",
        'source_url': PAGE_URL, 'status': 'verified', 'last_verified': CHECKED,
        'length_m': round(length),
        'bend_along_m': round(turn),
        'underground_along_m': [round(underground_from), round(length)],
    },
    'features': [
        {'type': 'Feature', 'properties': {'name': 'Line 7A centre line', 'part': 'current', 'note': "Airport Colony to the end of the tunnel past the airport station, from MMRDA's 2025 file (verified)."},
         'geometry': {'type': 'LineString', 'coordinates': ll(centre)}},
        {'type': 'Feature', 'properties': {'name': 'Line 7A underground stretch', 'part': 'underground', 'status': 'verified', 'source_url': MMRDA_PAGE, 'last_verified': CHECKED,
                                           'note': f"The last {UNDERGROUND_M} m of the tracks: MMRDA's underground length for Lines 9 and 7A, all of it on 7A, measured back from the end of the tracks. Where the ramp goes below ground is not published exactly."},
         'geometry': {'type': 'LineString', 'coordinates': ll(ug)}},
    ],
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(geo, f, indent=1)
    f.write('\n')
print(f'Wrote {OUT}: {len(centre)} points, {length / 1000:.2f} km, underground from {underground_from / 1000:.2f} km, bend at {turn / 1000:.2f} km')
