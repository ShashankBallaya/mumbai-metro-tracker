# Builds Line 12A's indicative route line and station positions.
#
# MMRDA has published no alignment file, station points or project page for Line 12A (checked
# 2026-10-28: its Metro Influence Zone for NOC page lists 11 lines, not 12A). The news reports say
# the line runs on Kalyan-Shilphata Road from Manpada to Kalyan Phata, then on the Mumbra-Panvel road
# (NH 48) to Khutari village near Taloja. Until MMRDA publishes a route, this script draws an
# indicative one (owner's decision, 2026-10-28):
#   - each station that an open map source names gets a point: its place in OpenStreetMap, moved to
#     the nearest point on the road the line follows (OSRM's nearest service on OpenStreetMap roads);
#     Manpada takes Line 12's Manpada station point from MMRDA's approved alignment,
#   - the route line is the road route through those points (OSRM, driving profile), so it follows
#     the roads, not the viaduct's real line,
#   - along_m is the distance along that route from Manpada.
# Every position is graded unverified. Stations no open source names keep a null position.
# Writes src/data/lines/line-12a/alignment-indicative.geojson and fills the placed stations'
# location in src/data/lines/line-12a/stations.json.
# Run from the repo root: python scripts/build-alignment-line12a.py
# Uses only the Python standard library and two public services (OpenStreetMap API, OSRM demo).
import json
import math
import urllib.request

CHECKED = '2026-10-28'
STATIONS = 'src/data/lines/line-12a/stations.json'
LINE12 = 'src/data/lines/line-12/stations.json'
OUT = 'src/data/lines/line-12a/alignment-indicative.geojson'
OSRM = 'https://router.project-osrm.org'
MMRDA_NOC = 'https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc'
UA = {'User-Agent': 'mumbai-metro-tracker build script (github.com/ShashankBallaya/mumbai-metro-tracker)'}

# Station id -> where its place comes from. 'road' is the OSM road name to move the point onto
# (None: the nearest road). Order is the line's order; stations not listed stay unplaced.
PLACES = [
    ('manpada', {'line12': 'manpada'}),
    ('katai-naka', {'node': 1712272441, 'what': 'Katai Gao Toll Plaza', 'road': 'Kalyan - Shil Road'}),
    ('desai-naka', {'node': 10717689044, 'what': 'Desai Naka (neighbourhood)', 'road': 'Kalyan - Shil Road'}),
    ('padle-gaon', {'node': 10247438117, 'what': 'Padle Gaon bus stop', 'road': 'Kalyan - Shil Road'}),
    ('kalyan-phata', {'node': 344399096, 'what': 'Kalyan Phata', 'road': None}),
    ('rohinjan', {'node': 13703628282, 'what': 'Rohinjan bus stop', 'road': None}),
]

# A flat projection, good to well under a metre across this short line.
LAT0 = 19.13
KX = 111_319.49 * math.cos(math.radians(LAT0))
KY = 111_132.954


def get(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120))


def osm_node(nid):
    el = get(f'https://api.openstreetmap.org/api/0.6/node/{nid}.json')['elements'][0]
    return el['lon'], el['lat']


def onto_road(lng, lat, road):
    ways = get(f'{OSRM}/nearest/v1/driving/{lng},{lat}?number=12')['waypoints']
    if road:
        ways = [w for w in ways if w['name'] == road] or ways
    w = ways[0]
    return w['location'][0], w['location'][1], w['distance']


def main():
    data = json.load(open(STATIONS, encoding='utf-8'))
    by_id = {s['id']: s for s in data['stations']}
    line12 = {s['id']: s for s in json.load(open(LINE12, encoding='utf-8'))['stations']}

    points = []  # (id, lng, lat, method, source_url)
    for sid, src in PLACES:
        if 'line12' in src:
            loc = line12[src['line12']]['location']
            points.append((sid, loc['lng'], loc['lat'],
                           "Indicative. Line 12's Manpada station point in MMRDA's approved alignment of 20 Mar 2025. "
                           'No source says whether Line 12A uses the same station.', MMRDA_NOC))
            continue
        lng, lat = osm_node(src['node'])
        rl, rt, moved = onto_road(lng, lat, src['road'])
        on = src['road'] or 'the nearest road'
        points.append((sid, round(rl, 6), round(rt, 6),
                       f"Indicative. OpenStreetMap node {src['node']} ({src['what']}), moved {round(moved)} m onto {on}. "
                       'MMRDA has published no station points for Line 12A.',
                       f"https://www.openstreetmap.org/node/{src['node']}"))

    coords = ';'.join(f'{p[1]},{p[2]}' for p in points)
    route = get(f'{OSRM}/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=false')['routes'][0]
    along, total = [0.0], 0.0
    for leg in route['legs']:
        total += leg['distance']
        along.append(total)

    for (sid, lng, lat, method, url), a in zip(points, along):
        s = by_id[sid]
        s['location'] = {'lng': lng, 'lat': lat, 'along_m': round(a), 'method': method,
                         'status': 'unverified', 'source_url': url}
        s['last_verified'] = CHECKED
    json.dump(data, open(STATIONS, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=2)
    open(STATIONS, 'a', encoding='utf-8', newline='\n').write('\n')

    line = [[round(x, 6), round(y, 6)] for x, y in route['geometry']['coordinates']]
    gj = {
        'type': 'FeatureCollection',
        'properties': {
            'note': ('Indicative only. MMRDA has published no route for Line 12A. This line follows the roads the news reports '
                     'name (Kalyan-Shilphata Road from Manpada to Kalyan Phata, then the Mumbra-Panvel road towards Taloja) '
                     'through the stations that OpenStreetMap names, from Manpada to Rohinjan. It is a road route from OSRM on '
                     'OpenStreetMap data, not the viaduct. Built by scripts/build-alignment-line12a.py.'),
            'source_url': 'https://www.openstreetmap.org/copyright',
            'status': 'unverified',
            'last_verified': CHECKED,
            'length_m': round(total),
            'indicative': True,
        },
        'features': [{
            'type': 'Feature',
            'properties': {'name': 'Line 12A centre line', 'part': 'indicative',
                           'note': 'Road route from Manpada to Rohinjan through the named places. Not the viaduct.'},
            'geometry': {'type': 'LineString', 'coordinates': line},
        }],
    }
    json.dump(gj, open(OUT, 'w', encoding='utf-8', newline='\n'), indent=1)
    open(OUT, 'a', encoding='utf-8', newline='\n').write('\n')
    for (sid, lng, lat, method, _), a in zip(points, along):
        print(f'{sid:14} {lat:.6f} {lng:.6f} along {round(a):6} m  {method[:70]}')
    print('route', round(total), 'm,', len(line), 'points')


if __name__ == '__main__':
    main()
