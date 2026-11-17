# Builds Line 11's route and stations for the hub map:
#   src/data/line-11-alignment.geojson  (the route, two parts)
#   src/data/planned-stations.json       (the "line-11" entry: its stations, in order)
#
# Line 11 has no tracker yet. Two sources:
#   - Anik Depot to Gateway of India: MMRCL's alignment file "250721_Alignment_Line 11.kmz" (21 Jul 2025), in the
#     Google Drive folder that MMRCL's Line 11 chainage file links to (Project Reports & Documents page). It is a CAD
#     export: the two tracks are layers "Polyline [3336]" and "Polyline [9881]", drawn as some 2,400 short pieces each,
#     and each station is a text label "<NAME> (UG)" placed beside the line (three copies, within about 30 m of each
#     other along the line). The centre line is the midpoint of the two tracks; each station sits where its labels,
#     moved onto the centre line, meet (median chainage). Graded verified.
#   - Wadala (Anik Depot) to Bandra Terminus, the proposed extension: traced from MMRC's map of the extension (a
#     north-up image at about 3.5 m a pixel, shared by the site owner on 2026-11-17). The image is fitted to the ground
#     with five points: Anik Depot and Wadala Depot from the KMZ, and Line 3's Dharavi, BKC and Shitala Devi Mandir
#     stations from OpenStreetMap (src/data/open-stations.json). Every control point fits within 35 m. The traced line
#     is 6.9 km, as reported. Indicative only: graded unverified.
# Run from the repo root: python scripts/build-line11.py [cache-dir]
# With a cache dir, a KMZ already there is read instead of downloaded. Standard library only.
import io
import json
import math
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

CHECKED = '2026-11-17'
KMZ_URL = 'https://drive.usercontent.google.com/download?id=1IY8vsKyRuKgLkOTq1W9pXOyMdoU2IUnF&export=download'
KMZ_FOLDER = 'https://drive.google.com/drive/folders/1jTjTVYGkqTeHlBDEb6en51lGo5gAAWXJ'
DOCS = 'https://corporate.mmrcl.com/en/corporate/pages/project-reports-documents'
EXT_NEWS = 'https://www.freepressjournal.in/mumbai/mumbai-metro-line-11-gets-major-expansion-69-km-dharavibandra-link-added-to-wadalagateway-corridor-adding-5-new-stations-check-project-cost-new-route'
OUT_LINE = 'src/data/line-11-alignment.geojson'
OUT_STATIONS = 'src/data/planned-stations.json'
OPEN = 'src/data/open-stations.json'
UA = {'User-Agent': 'Mozilla/5.0 (mumbai-metro-tracker build script)'}
K = '{http://www.opengis.net/kml/2.2}'

LAT0 = 19.0
KX = 111_319.49 * math.cos(math.radians(LAT0))
KY = 111_132.954
xy = lambda p: (p[0] * KX, p[1] * KY)
ll = lambda q: (round(q[0] / KX, 6), round(q[1] / KY, 6))

# The KMZ's labels, as the site writes them (MMRCL's EIA, Dec 2024, uses the same names).
NAMES = {
    'ANIK DEPOT': 'Anik Depot', 'WADALA DEPOT': 'Wadala Depot', 'CGS COLONY': 'CGS Colony', 'GANESH NAGAR': 'Ganesh Nagar',
    'BPT HOSPITAL': 'BPT Hospital', 'SEWRI': 'Sewri', 'SEWARI': 'Sewri', 'HAY BUNDER': 'Hay Bunder', 'DARUKHANA': 'Darukhana',
    'BYCULLA': 'Byculla', 'NAGPADA JUNCTION': 'Nagpada Junction', 'NAGAPADA JUNCTION': 'Nagpada Junction',
    'BHENDI BAZAAR': 'Bhendi Bazaar', 'CSMT METRO': 'CSMT Metro', 'HORNIMAN CIRCLE': 'Horniman Circle',
    'GATEWAY OF INDIA': 'Gateway of India',
}

# MMRC's extension map: the red line from its northern tip past Bandra Terminus to Anik Depot, in image pixels
# (image 1592 px wide), and its stations.
EXT_PATH = [(313, 188), (272, 302), (245, 370), (225, 440), (208, 510), (203, 574), (212, 625), (232, 665), (262, 695),
            (300, 715), (360, 727), (430, 740), (500, 755), (550, 768), (600, 800), (650, 838), (690, 862), (730, 885),
            (770, 902), (810, 900), (850, 880), (885, 845), (910, 805), (932, 757), (960, 712), (1000, 668), (1045, 628),
            (1090, 595), (1130, 577), (1175, 567), (1220, 568), (1265, 585), (1305, 615), (1340, 660), (1362, 710),
            (1375, 760), (1383, 815)]
EXT_STATIONS = [('Bandra Terminus', (272, 302)), ('Bandra', (203, 574)), ('Central Dharavi', (690, 862)),
                ('Sion', (932, 757)), ('Chunabhatti', (1130, 577))]
# Control points: pixel -> a station whose ground position is known.
EXT_CONTROL = [((1383, 815), ('kmz', 'Anik Depot')), ((1243, 1068), ('kmz', 'Wadala Depot')),
               ((522, 800), ('line-3', 'Dharavi')), ((678, 353), ('line-3', 'Bandra Kurla Complex (BKC)')),
               ((283, 1053), ('line-3', 'Shitala Devi Mandir'))]


def get_kmz(cache):
    path = cache and os.path.join(cache, 'line-11-mmrcl-2025.kmz')
    if path and os.path.exists(path):
        return open(path, 'rb').read()
    body = urllib.request.urlopen(urllib.request.Request(KMZ_URL, headers=UA), timeout=180).read()
    if path:
        open(path, 'wb').write(body)
    return body


def chain(segs, tol=3.0):
    """Joins short pieces end to end into the longest line they make."""
    segs = [s[:] for s in segs]
    out = []
    while segs:
        cur = segs.pop(0)
        grown = True
        while grown:
            grown = False
            for i, s in enumerate(segs):
                if math.dist(cur[-1], s[0]) < tol:
                    cur += s[1:]
                elif math.dist(cur[-1], s[-1]) < tol:
                    cur += s[::-1][1:]
                elif math.dist(cur[0], s[-1]) < tol:
                    cur = s[:-1] + cur
                elif math.dist(cur[0], s[0]) < tol:
                    cur = s[::-1][:-1] + cur
                else:
                    continue
                segs.pop(i)
                grown = True
                break
        out.append(cur)
    return max(out, key=length)


def length(p):
    return sum(math.dist(a, b) for a, b in zip(p, p[1:]))


def resample(p, n):
    cum = [0.0]
    for a, b in zip(p, p[1:]):
        cum.append(cum[-1] + math.dist(a, b))
    out, j = [], 0
    for i in range(n + 1):
        s = cum[-1] * i / n
        while j < len(cum) - 2 and cum[j + 1] < s:
            j += 1
        f = (s - cum[j]) / ((cum[j + 1] - cum[j]) or 1)
        out.append((p[j][0] + f * (p[j + 1][0] - p[j][0]), p[j][1] + f * (p[j + 1][1] - p[j][1])))
    return out


def rdp(p, tol):
    if len(p) < 3:
        return p
    s, e = p[0], p[-1]
    span = math.dist(s, e) or 1
    dm, im = 0, 0
    for i in range(1, len(p) - 1):
        q = p[i]
        dd = abs((e[0] - s[0]) * (s[1] - q[1]) - (s[0] - q[0]) * (e[1] - s[1])) / span
        if dd > dm:
            dm, im = dd, i
    return rdp(p[:im + 1], tol)[:-1] + rdp(p[im:], tol) if dm > tol else [s, e]


def onto(line, q):
    """(distance from the line, nearest point, chainage) of point q."""
    best, run = None, 0.0
    for a, b in zip(line, line[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]
        seg2 = dx * dx + dy * dy or 1
        t = max(0.0, min(1.0, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / seg2))
        p = (a[0] + t * dx, a[1] + t * dy)
        d = math.dist(p, q)
        if best is None or d < best[0]:
            best = (d, p, run + t * math.sqrt(seg2))
        run += math.sqrt(seg2)
    return best


def point_at(line, s):
    run = 0.0
    for a, b in zip(line, line[1:]):
        seg = math.dist(a, b)
        if run + seg >= s:
            f = (s - run) / seg
            return (a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1]))
        run += seg
    return line[-1]


def solve3(rows, ys):
    a = [[sum(r[i] * r[j] for r in rows) for j in range(3)] + [sum(r[i] * y for r, y in zip(rows, ys))] for i in range(3)]
    for i in range(3):
        p = max(range(i, 3), key=lambda k: abs(a[k][i]))
        a[i], a[p] = a[p], a[i]
        for k in range(3):
            if k != i:
                f = a[k][i] / a[i][i]
                a[k] = [x - f * y for x, y in zip(a[k], a[i])]
    return [a[i][3] / a[i][i] for i in range(3)]


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else None
    if cache:
        os.makedirs(cache, exist_ok=True)
    root = ET.fromstring(zipfile.ZipFile(io.BytesIO(get_kmz(cache))).read('doc.kml'))
    tracks, labels = {'3336': [], '9881': []}, {}
    for pm in root.iter(K + 'Placemark'):
        name = pm.findtext(K + 'name') or ''
        m = re.match(r'Polyline \[(3336|9881)\]', name)
        if m:
            for ls in pm.iter(K + 'LineString'):
                p = [xy(tuple(map(float, c.split(',')[:2]))) for c in ls.findtext(K + 'coordinates').split()]
                if len(p) > 1:
                    tracks[m.group(1)].append(p)
        label = re.match(r'(.+?) \((UG|AT[ -]GRADE)\)$', name)
        pt = pm.find('.//' + K + 'Point')
        if label and pt is not None:
            labels.setdefault(NAMES[label.group(1)], []).append(xy(tuple(map(float, pt.findtext(K + 'coordinates').split(',')[:2]))))

    # Centre line, Anik Depot first.
    a, b = chain(tracks['3336']), chain(tracks['9881'])
    anik_label = labels['Anik Depot'][0]
    if math.dist(a[0], anik_label) > math.dist(a[-1], anik_label):
        a = a[::-1]
    if math.dist(b[0], a[0]) > math.dist(b[-1], a[0]):
        b = b[::-1]
    n = 3500
    centre = rdp([((p[0] + q[0]) / 2, (p[1] + q[1]) / 2) for p, q in zip(resample(a, n), resample(b, n))], 3.0)

    main_stations = []
    for name, pts in labels.items():
        ch = sorted(onto(centre, p)[2] for p in pts)
        main_stations.append((ch[len(ch) // 2], name))
    main_stations.sort()
    kmz_at = {name: point_at(centre, s) for s, name in main_stations}

    # The extension: fit MMRC's map to the ground (least-squares affine), then trace it.
    open_l3 = {s['name']: xy((s['lng'], s['lat'])) for s in json.load(open(OPEN, encoding='utf-8'))['lines']['line-3']['stations']}
    ground = [kmz_at[n] if src == 'kmz' else open_l3[n] for _, (src, n) in EXT_CONTROL]
    rows = [(x, y, 1.0) for (x, y), _ in EXT_CONTROL]
    fx, fy = solve3(rows, [g[0] for g in ground]), solve3(rows, [g[1] for g in ground])
    fit = lambda p: (fx[0] * p[0] + fx[1] * p[1] + fx[2], fy[0] * p[0] + fy[1] * p[1] + fy[2])
    worst = max(math.dist(fit(px), g) for (px, _), g in zip(EXT_CONTROL, ground))
    if worst > 60:
        sys.exit(f'Extension map fits badly: a control point is {worst:.0f} m off')
    ext = [fit(p) for p in EXT_PATH]
    ext[-1] = kmz_at['Anik Depot']

    gj = {
        'type': 'FeatureCollection',
        'properties': {
            'note': 'Line 11. Anik Depot to Gateway of India: the centre line between the two tracks of MMRCL\'s alignment file '
                    '(KMZ, 21 Jul 2025). Wadala to Bandra Terminus: traced from MMRC\'s map of the proposed extension, fitted '
                    f'to the ground within {worst:.0f} m; indicative. Built by scripts/build-line11.py.',
            'last_verified': CHECKED,
        },
        'features': [
            {'type': 'Feature', 'properties': {'part': 'main', 'name': 'Anik Depot to Gateway of India', 'status': 'verified',
                                               'source_url': KMZ_FOLDER, 'length_m': round(length(centre))},
             'geometry': {'type': 'LineString', 'coordinates': [list(ll(p)) for p in centre]}},
            {'type': 'Feature', 'properties': {'part': 'extension', 'name': 'Wadala (Anik Depot) to Bandra Terminus', 'status': 'unverified',
                                               'indicative': True, 'source_url': EXT_NEWS, 'length_m': round(length(ext))},
             'geometry': {'type': 'LineString', 'coordinates': [list(ll(p)) for p in ext]}},
        ],
    }
    with open(OUT_LINE, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(gj, fh, indent=1)
        fh.write('\n')

    stations = [{'name': n, 'lat': ll(fit(px))[1], 'lng': ll(fit(px))[0], 'part': 'extension', 'stage': 'proposed',
                 'position': 'indicative, traced from MMRC\'s extension map'} for n, px in EXT_STATIONS]
    stations += [{'name': n, 'lat': ll(kmz_at[n])[1], 'lng': ll(kmz_at[n])[0], 'part': 'main', 'stage': 'planned',
                  'position': 'MMRCL alignment file, station label moved onto the centre line'} for _, n in main_stations]
    data = json.load(open(OUT_STATIONS, encoding='utf-8')) if os.path.exists(OUT_STATIONS) else {
        '_meta': {'note': 'Stations of planned lines that have no tracker, in route order, for the hub map\'s names and cards. '
                          'Each line names its sources.'}, 'lines': {}}
    data['lines']['line-11'] = {
        'sources': {'main': KMZ_FOLDER, 'main_status': 'verified', 'extension': EXT_NEWS, 'extension_status': 'reported',
                    'documents': DOCS},
        'last_verified': CHECKED,
        'stations': stations,
    }
    with open(OUT_STATIONS, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print(f'main {length(centre):.0f} m, {len(centre)} points; extension {length(ext):.0f} m; fit worst {worst:.0f} m')
    for s in stations:
        print(f"  {s['stage']:9} {s['name']:18} {s['lat']:.6f} {s['lng']:.6f}")


if __name__ == '__main__':
    main()
