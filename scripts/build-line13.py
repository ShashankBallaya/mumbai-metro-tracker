# Builds Line 13's indicative route and stations for the hub map:
#   src/data/line-13-alignment.geojson   (the route)
#   src/data/planned-stations.json        (the "line-13" entry: its stations, in order)
#
# MMRDA has published no route file for Line 13. Its post on X of 31 Aug 2026 has a route map (image 3276 px wide,
# satellite background, north up within a few degrees) that names all 16 stations, from Naigaon to Dongarpada, with
# the line starting beside Line 9's Subhash Chandra Bose Stadium station and crossing Vasai Creek. Its three underground
# stations are marked (UG). The map draws no station dots, only labels, so each station is put where its label meets
# the line.
# The line was read from the image's pixels (its purple and cyan strokes, ordered south to north) and fitted to the
# ground with a similarity transform (scale, rotation, shift; weighted least squares) on six points:
#   - the Subhash Chandra Bose Stadium circle -> Line 9's station point (MMRDA, src/data/lines/line-9/stations.json),
#     weight 3;
#   - Naigaon, Nallasopara (midway between East and West) and Virar -> their suburban railway stations (OpenStreetMap),
#     as MMRDA names them as rail interchanges;
#   - VIVA College and Yazoo Park -> those places in OpenStreetMap.
# The worst fit is about 730 m and the line comes out 24.5 km (MMRDA: 25.03 km). Indicative only: graded unverified.
# Run from the repo root: python scripts/build-line13.py   (no downloads; the reading of the image is below)
import json
import math
import os

CHECKED = '2026-11-17'
SOURCE = 'https://x.com/MMRDAOfficial/status/2094370679206629747'
OUT_LINE = 'src/data/line-13-alignment.geojson'
OUT_STATIONS = 'src/data/planned-stations.json'
LINE9 = 'src/data/lines/line-9/stations.json'

# The line in image pixels, south to north (purple and cyan strokes; sampled every 24 px).
PATH = [(813, 1350), (813, 1341), (813, 1317), (813, 1293), (813, 1269), (816, 1245), (816, 1221), (816, 1197), (819, 1173),
        (819, 1149), (819, 1125), (819, 1101), (819, 1077), (819, 1053), (819, 1029), (819, 1005), (819, 981), (837, 963),
        (855, 945), (867, 921), (885, 903), (909, 891), (918, 867), (921, 843), (933, 819), (939, 795), (933, 771),
        (927, 747), (915, 726), (891, 717), (873, 699), (873, 675), (855, 657), (834, 639), (831, 615), (819, 591),
        (795, 576), (771, 567), (741, 555), (723, 537), (711, 513), (711, 489), (699, 468), (678, 447), (657, 429),
        (633, 429), (609, 429), (585, 435), (567, 417), (567, 393), (567, 369), (567, 345), (567, 321), (567, 297),
        (567, 273), (555, 249), (543, 225), (543, 201), (543, 177), (549, 153), (561, 129), (576, 105), (571, 62)]
SCB_CIRCLE = (858, 1346)
DONGARPADA = (571, 62)
# Each label's edge nearest the line, in image pixels; the station is the nearest point of the line.
LABELS = [('Naigaon', (781, 958)), ('Chhatrapati Shivaji Maharaj Chowk', (926, 920)), ('Juchandra', (886, 840)),
          ('Rajvali', (956, 802)), ('Golani Naka', (893, 755)), ('Vasai', (906, 677)),
          ('VVMC Fire Brigade Station', (806, 637)), ('Achole Gaon', (749, 520)), ('Nallasopara East', (706, 437)),
          ('Nallasopara West', (544, 420)), ('Morya Nagar', (544, 317)), ('Yashwant Nagar', (586, 280)),
          ('Virar', (526, 235)), ('VIVA College', (561, 185)), ('Yazoo Park', (531, 137))]
UNDERGROUND = {'VVMC Fire Brigade Station', 'Achole Gaon', 'Nallasopara East'}
# Ground points: (lng, lat) and where they come from.
RAIL = {'Naigaon': (72.8465229, 19.3510925), 'Nallasopara': (72.8185693, 19.4178997), 'Virar': (72.811816, 19.4553059)}
PLACES = {'VIVA College': (72.8049572, 19.4582341), 'Yazoo Park': (72.8067789, 19.4690494)}

KX = 111_319.49 * math.cos(math.radians(19.38))
KY = 111_132.954


def nearest(path, q):
    best = None
    for a, b in zip(path, path[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]
        seg2 = dx * dx + dy * dy or 1
        t = max(0.0, min(1.0, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / seg2))
        p = (a[0] + t * dx, a[1] + t * dy)
        if best is None or math.dist(p, q) < best[0]:
            best = (math.dist(p, q), p)
    return best[1]


def main():
    at = {n: nearest(PATH, q) for n, q in LABELS}
    at['Dongarpada'] = DONGARPADA
    scb = next(s for s in json.load(open(LINE9, encoding='utf-8'))['stations'] if s['id'] == 'subhash-chandra-bose-stadium')['location']
    mid = ((at['Nallasopara East'][0] + at['Nallasopara West'][0]) / 2, (at['Nallasopara East'][1] + at['Nallasopara West'][1]) / 2)
    ctrl = [(SCB_CIRCLE, (scb['lng'], scb['lat']), 3), (at['Naigaon'], RAIL['Naigaon'], 1), (mid, RAIL['Nallasopara'], 1),
            (at['Virar'], RAIL['Virar'], 1), (at['VIVA College'], PLACES['VIVA College'], 1), (at['Yazoo Park'], PLACES['Yazoo Park'], 1)]
    w = [complex(p[0], -p[1]) for p, _, _ in ctrl]
    z = [complex(g[0] * KX, g[1] * KY) for _, g, _ in ctrl]
    k = [c[2] for c in ctrl]
    mw = sum(a * b for a, b in zip(w, k)) / sum(k)
    mz = sum(a * b for a, b in zip(z, k)) / sum(k)
    c = sum(kk * (zz - mz) * (ww - mw).conjugate() for ww, zz, kk in zip(w, z, k)) / sum(kk * abs(ww - mw) ** 2 for ww, kk in zip(w, k))
    t = mz - c * mw

    def ground(p):
        g = c * complex(p[0], -p[1]) + t
        return (round(g.real / KX, 6), round(g.imag / KY, 6))

    worst = max(math.hypot((ground(p)[0] - g[0]) * KX, (ground(p)[1] - g[1]) * KY) for p, g, _ in ctrl)
    line = [ground(p) for p in PATH]
    km = sum(math.dist(a, b) for a, b in zip(PATH, PATH[1:])) * abs(c) / 1000
    gj = {
        'type': 'FeatureCollection',
        'properties': {'note': "Line 13, indicative. Read from MMRDA's route map (X, 31 Aug 2026) and fitted to the ground "
                               f'within {worst:.0f} m. Built by scripts/build-line13.py.', 'last_verified': CHECKED},
        'features': [{'type': 'Feature',
                      'properties': {'part': 'main', 'name': 'Subhash Chandra Bose Stadium to Dongarpada', 'status': 'unverified',
                                     'indicative': True, 'source_url': SOURCE, 'length_m': round(km * 1000)},
                      'geometry': {'type': 'LineString', 'coordinates': [list(p) for p in line]}}],
    }
    with open(OUT_LINE, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(gj, fh, indent=1)
        fh.write('\n')
    names = [n for n, _ in LABELS] + ['Dongarpada']
    stations = [{'name': n, 'lat': ground(at[n])[1], 'lng': ground(at[n])[0], 'part': 'main', 'stage': 'planned',
                 'underground': n in UNDERGROUND, 'position': "indicative, where the label meets the line on MMRDA's route map"}
                for n in names]
    data = json.load(open(OUT_STATIONS, encoding='utf-8')) if os.path.exists(OUT_STATIONS) else {'_meta': {}, 'lines': {}}
    data['lines']['line-13'] = {'sources': {'main': SOURCE, 'main_status': 'verified', 'positions_status': 'unverified'},
                                'last_verified': CHECKED, 'stations': stations}
    with open(OUT_STATIONS, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print(f'scale {abs(c):.2f} m/px, rotation {math.degrees(math.atan2(c.imag, c.real)):.1f} deg, worst fit {worst:.0f} m, {km:.2f} km')
    for s in stations:
        print(f"  {s['name']:34} {s['lat']:.6f} {s['lng']:.6f}{'  UG' if s['underground'] else ''}")


if __name__ == '__main__':
    main()
