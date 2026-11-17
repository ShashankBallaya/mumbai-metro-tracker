# Builds the bullet train context for the hub map: src/data/context-hsr.geojson.
#
# The hub's map tiles (OpenMapTiles) leave out railways being built, so the Mumbai-Ahmedabad bullet train comes from
# OpenStreetMap directly (ODbL): its ways tagged highspeed=yes in the MMR box, one track of each pair, clipped at
# 19.75 N; and its three MMR stations: BKC (the middle of the station box at the line's Mumbai end), Thane and Virar
# (the station nodes mapped "under construction"). The owner chose this context layer on 2026-11-17 (/lab/context/).
# Run from the repo root: python scripts/build-context-hsr.py [cache-dir]
# Uses the Overpass API (the main server, then a mirror). Standard library only.
import json
import math
import os
import sys
import urllib.parse
import urllib.request

CHECKED = '2026-11-17'
OUT = 'src/data/context-hsr.geojson'
BOX = '18.85,72.75,19.75,73.35'
NORTH = 19.75
SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
UA = {'User-Agent': 'mumbai-metro-tracker build script (github.com/ShashankBallaya/mumbai-metro-tracker)'}
QUERY = f'[out:json][timeout:120];(way["highspeed"="yes"]({BOX});node["railway"="construction"]["construction"="station"]["name"~"^(Thane|Virar) Station$"]({BOX}););out tags geom;'


def fetch(cache):
    path = cache and os.path.join(cache, 'hsr.json')
    if path and os.path.exists(path):
        return json.load(open(path, encoding='utf-8'))
    data = urllib.parse.urlencode({'data': QUERY}).encode()
    for url in SERVERS:
        try:
            body = urllib.request.urlopen(urllib.request.Request(url, data=data, headers=UA), timeout=180).read()
            d = json.loads(body)
            if path:
                open(path, 'w', encoding='utf-8').write(json.dumps(d))
            return d
        except (OSError, ValueError) as e:
            print(f'{url}: {e}; trying the next server')
    sys.exit('No Overpass server answered')


def length(g):
    return sum(math.hypot((b['lon'] - a['lon']) * 105_000, (b['lat'] - a['lat']) * 111_000) for a, b in zip(g, g[1:]))


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else None
    els = fetch(cache)['elements']
    ways = [e for e in els if e['type'] == 'way']
    # Twin tracks run side by side: keep a way unless its middle lies within 50 m of a kept way (its twin).
    xy = lambda p: (p['lon'] * 105_000, p['lat'] * 111_000)

    def gap(q, g):
        best = math.inf
        for a, b in zip(map(xy, g), map(xy, g[1:])):
            dx, dy = b[0] - a[0], b[1] - a[1]
            t = max(0.0, min(1.0, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / ((dx * dx + dy * dy) or 1)))
            best = min(best, math.hypot(a[0] + t * dx - q[0], a[1] + t * dy - q[1]))
        return best

    kept = []
    for w in sorted(ways, key=lambda w: -length(w['geometry'])):
        g = w['geometry']
        if not any(gap(xy(g[len(g) // 2]), k['geometry']) < 50 for k in kept):
            kept.append(w)
    lines = [[[round(p['lon'], 6), round(p['lat'], 6)] for p in w['geometry'] if p['lat'] < NORTH] for w in kept]
    lines = [l for l in lines if len(l) > 1]
    # BKC: the middle of the station box, the shortest way that reaches the line's southern end.
    end = min(p['lat'] for w in ways for p in w['geometry'])
    south = min((w for w in ways if min(p['lat'] for p in w['geometry']) < end + 0.001), key=lambda w: length(w['geometry']))
    g = south['geometry']
    bkc = (round(sum(p['lon'] for p in g) / len(g), 4), round(sum(p['lat'] for p in g) / len(g), 4))
    feats = [{'type': 'Feature', 'properties': {'kind': 'hsr', 'name': 'Mumbai-Ahmedabad bullet train (being built)'},
              'geometry': {'type': 'MultiLineString', 'coordinates': lines}},
             {'type': 'Feature', 'properties': {'kind': 'hsr-station', 'name': 'BKC', 'source': f"OpenStreetMap way {south['id']} (station box)"},
              'geometry': {'type': 'Point', 'coordinates': list(bkc)}}]
    for n in sorted((e for e in els if e['type'] == 'node'), key=lambda n: n['lat']):
        feats.append({'type': 'Feature', 'properties': {'kind': 'hsr-station', 'name': n['tags']['name'].replace(' Station', ''), 'source': f"OpenStreetMap node {n['id']}"},
                      'geometry': {'type': 'Point', 'coordinates': [round(n['lon'], 6), round(n['lat'], 6)]}})
    out = {'type': 'FeatureCollection',
           '_meta': {'note': f'The bullet train in the MMR and its stations, from OpenStreetMap (ODbL), fetched with Overpass {CHECKED}. '
                             'Context on the hub map. Built by scripts/build-context-hsr.py.',
                     'source_url': 'https://www.openstreetmap.org/copyright', 'status': 'reported', 'last_verified': CHECKED},
           'features': feats}
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(out, fh, separators=(',', ':'))
    print(f'{len(lines)} line pieces, stations: {[f["properties"]["name"] for f in feats[1:]]}')


if __name__ == '__main__':
    main()
