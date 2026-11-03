# Builds the Thane Integral Ring Metro's route line and station positions from the project's own map.
#
# MahaMetro's Thane Metro site (thanemetrorail.com/route-map) embeds a Google My Maps map, "Thane Metro
# Route Map". Its KML export is a CAD drawing: in the "Line Features" folder one closed line tagged
# PROPOSED_CL is the ring's centre line (about 27.5 km), the "Point Features" folder holds a point for
# each of the 22 stations, and the "Ramp" folder draws the ramp where the tunnel comes up between New
# Thane and Raila Devi. The same file also draws Lines 4 and 5 for reference. This script:
#   - starts the ring at Raila Devi, the first station on MahaMetro's list, and runs it the way the list
#     runs (north past Wagle Estate, along Ghodbunder Road, back south past Kolshet and Balkum to Thane
#     station), round to Raila Devi again, so the drawn line closes the ring,
#   - marks the underground stretch: it ends where the ramp in the file meets the centre line, and starts
#     3.0 km before it, MahaMetro's "approx 3.0 km including ramps" for the underground section (tender
#     T1-038/DDC-06/2026), which is also the Cabinet's 3 km underground,
#   - writes src/data/lines/thane-ring/alignment-mahametro-2026.geojson and moves each station in
#     src/data/lines/thane-ring/stations.json to its point in the file, graded verified, with along_m.
# The script stops if a station point is more than 45 m from the centre line (the points sit about 30 m
# off it, on the station's side of the road), or if the stations are out of order round the ring.
# Run from the repo root: python scripts/build-alignment-thane-ring.py [path/to/thane-ring.kml]
# Without a path it downloads the file. Uses only the Python standard library.
import json
import math
import sys
import urllib.request
import xml.etree.ElementTree as ET

KML_URL = 'https://www.google.com/maps/d/kml?mid=1YNvo8fqUuYUWJqEiwstEdGWJTZMJbEQ&forcekml=1'
PAGE_URL = 'https://thanemetrorail.com/route-map'
TENDERS_URL = 'https://thanemetrorail.com/Tenders'
CHECKED = '2026-11-03'
UNDERGROUND_M = 3000  # T1-038/DDC-06/2026: "Section Length: Approx 3.0 km including ramps"
K = '{http://www.opengis.net/kml/2.2}'
STATIONS = 'src/data/lines/thane-ring/stations.json'
OUT = 'src/data/lines/thane-ring/alignment-mahametro-2026.geojson'

LAT0 = 19.22
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


def coords(el):
    return [tuple(map(float, c.split(',')[:2])) for c in el.find(K + 'coordinates').text.split()]


# ---------- Read the KML ----------
raw = open(sys.argv[1], 'rb').read() if len(sys.argv) > 1 else urllib.request.urlopen(
    urllib.request.Request(KML_URL, headers={'User-Agent': 'mumbai-metro-tracker build script'}), timeout=120).read()
root = ET.fromstring(raw)

ring, ramps, points = None, [], {}
for folder in root.iter(K + 'Folder'):
    name = folder.findtext(K + 'name')
    for pm in folder.iter(K + 'Placemark'):
        tag = (pm.findtext(K + 'description') or '').strip()
        if name == 'Line Features' and tag == 'PROPOSED_CL':
            ring = [to_xy(*c) for c in coords(pm.find('.//' + K + 'LineString'))]
        elif name == 'Ramp':
            ramps += [to_xy(*c) for ls in pm.iter(K + 'LineString') for c in coords(ls)]
        elif name == 'Point Features':
            pt = pm.find('.//' + K + 'Point')
            label = (pm.findtext(K + 'name') or '').strip()
            if pt is not None and not label.endswith('(M) STATION') and '(M)' not in label:
                points[label] = coords(pt)[0]
if ring is None:
    sys.exit('No PROPOSED_CL line in "Line Features"')
if math.dist(ring[0], ring[-1]) > 1:
    sys.exit(f'The centre line does not close: its ends are {math.dist(ring[0], ring[-1]):.0f} m apart')
ring = simplify(ring, 1.0)
cum = cumulate(ring)
total = cum[-1]


def along_on(line, c, p):
    best = (1e18, 0.0)
    for i in range(len(line) - 1):
        _, d, s = seg_nearest(line[i], line[i + 1], p)
        if d < best[0]:
            best = (d, c[i] + s)
    return best


def point_at(line, c, s):
    for i in range(len(line) - 1):
        if c[i + 1] >= s:
            t = (s - c[i]) / ((c[i + 1] - c[i]) or 1e-9)
            return (line[i][0] + t * (line[i + 1][0] - line[i][0]), line[i][1] + t * (line[i + 1][1] - line[i][1]))
    return line[-1]


# ---------- Start at Raila Devi and close the ring there ----------
start = along_on(ring, cum, to_xy(*points['RAILA DEVI']))[1]
first = point_at(ring, cum, start)
loop = [first] + [q for q, c in zip(ring, cum) if c > start] + [q for q, c in zip(ring[1:], cum[1:]) if c < start] + [first]
lcum = cumulate(loop)
length = lcum[-1]
print(f'Ring {total:.0f} m; starts {start:.0f} m along the file\'s line, at Raila Devi')

# The ramp: the farthest point round the ring that the drawn ramp touches is where the tunnel ends.
ramp_at = [along_on(loop, lcum, p) for p in ramps]
ramp_end = max(a for d, a in ramp_at if d < 40)
underground = (ramp_end - UNDERGROUND_M, ramp_end)
print(f'Ramp meets the line {ramp_end:.0f} m round; underground {underground[0]:.0f} to {underground[1]:.0f} m')

# ---------- Stations ----------
doc = json.load(open(STATIONS, encoding='utf-8'))
along_of = {}
for st in doc['stations']:
    lng, lat = points[st['kml_name']]
    off, at = along_on(loop, lcum, to_xy(lng, lat))
    if st['order'] == 1:
        at = 0.0
    if off > 45:
        sys.exit(f"{st['kml_name']} is {off:.0f} m from the centre line")
    along_of[st['id']] = at
    st['location'] = {
        'lng': round(lng, 6), 'lat': round(lat, 6), 'along_m': round(at),
        'method': f'The project\'s official route map (Google My Maps, on thanemetrorail.com/route-map): point "{st["kml_name"]}". along_m is measured along the map\'s centre line (PROPOSED_CL) from Raila Devi, in the order of MahaMetro\'s list; the point is {round(off)} m from that line.',
        'status': 'verified', 'source_url': PAGE_URL,
    }
    print(f"{st['id']:32s} {at / 1000:6.3f} km  {off:5.1f} m off the line")
if [s['id'] for s in doc['stations']] != sorted(along_of, key=along_of.get):
    sys.exit('Stations are out of order round the ring')
last = max(along_of.values())
if not (underground[0] < along_of['thane-junction'] < along_of['new-thane'] < underground[1]):
    sys.exit('The underground stretch does not hold both underground stations')
with open(STATIONS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write('\n')

# ---------- GeoJSON ----------
ll = lambda line: [[round(c, 6) for c in to_ll(*q)] for q in line]


def piece(a, b):
    inner = [q for q, c in zip(loop, lcum) if a < c < b]
    return [point_at(loop, lcum, a)] + inner + [point_at(loop, lcum, b)]


geo = {
    'type': 'FeatureCollection',
    'properties': {
        'note': f"Derived from the Thane Integral Ring Metro's official route map ({KML_URL}), a CAD drawing whose 'Line Features' folder holds the ring's centre line (PROPOSED_CL). The line starts at Raila Devi, runs the way MahaMetro lists the stations and closes back at Raila Devi (verified). Simplified to about 1 m by scripts/build-alignment-thane-ring.py.",
        'source_url': PAGE_URL, 'status': 'verified', 'last_verified': CHECKED,
        'length_m': round(length),
        'ring': True,
        'underground_along_m': [round(underground[0]), round(underground[1])],
    },
    'features': [
        {'type': 'Feature', 'properties': {'name': 'Thane Ring Metro centre line', 'part': 'current', 'note': "The whole ring, from Raila Devi round to Raila Devi, from MahaMetro's map (verified)."},
         'geometry': {'type': 'LineString', 'coordinates': ll(loop)}},
        {'type': 'Feature', 'properties': {'name': 'Thane Ring Metro underground stretch', 'part': 'underground', 'status': 'verified', 'source_url': TENDERS_URL, 'last_verified': CHECKED,
                                           'note': f"Thane Junction and New Thane. It ends where the map's ramp meets the line, between New Thane and Raila Devi, and starts {UNDERGROUND_M} m before that: MahaMetro's 'approx 3.0 km including ramps' (tender T1-038/DDC-06/2026). Where the other ramp is, past Shivaji Chowk, is not drawn on the map."},
         'geometry': {'type': 'LineString', 'coordinates': ll(piece(*underground))}},
    ],
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(geo, f, indent=1)
    f.write('\n')
print(f'Wrote {OUT}: {len(loop)} points, {length / 1000:.2f} km; last station {last / 1000:.2f} km')
