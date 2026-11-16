# Builds the stations of the running lines that have no tracker of their own: src/data/open-stations.json.
#
# The hub map names every station of a running line (a reader's idea, 2026-11-16). Lines 2B and 9 have trackers
# with their own station data; Lines 1, 2A, 3, 7 and Navi Mumbai Metro Line 1 do not. Their stations come from
# OpenStreetMap (ODbL): each line's route relation, its stop nodes in route order, with the English and Marathi
# names as signed. One direction of each route is enough: both stop at the same stations.
# Run from the repo root: python scripts/build-open-stations.py [cache-dir]
# With a cache dir, files already there (o<relation>.json) are read instead of downloaded. Standard library only.
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

CHECKED = '2026-11-16'
OUT = 'src/data/open-stations.json'
OVERPASS = 'https://overpass-api.de/api/interpreter'
UA = {'User-Agent': 'mumbai-metro-tracker build script (github.com/ShashankBallaya/mumbai-metro-tracker)'}
# Route relations (found with an Overpass query for metro routes in Maharashtra, 2026-11-16).
# OpenStreetMap tags Line 2A as "Line 2 (Andheri West to Dahisar (East))".
ROUTES = {'line-1': 3808111, 'line-2a': 13989912, 'line-3': 7898597, 'line-7': 13989914, 'nmm-1': 16533436}


def fetch(rel, cache):
    path = cache and os.path.join(cache, f'o{rel}.json')
    if path and os.path.exists(path):
        return json.load(open(path, encoding='utf-8'))
    query = f'[out:json][timeout:50];rel({rel});out body;node(r:"stop");out body;'
    body = urllib.parse.urlencode({'data': query}).encode()
    for attempt in range(4):
        try:
            raw = urllib.request.urlopen(urllib.request.Request(OVERPASS, data=body, headers=UA), timeout=90).read()
            data = json.loads(raw)
            break
        except Exception as e:  # Overpass answers 502 and 504 when busy: wait and try again
            if attempt == 3:
                sys.exit(f'relation {rel}: {e}')
            time.sleep(10 * (attempt + 1))
    if path:
        json.dump(data, open(path, 'w', encoding='utf-8'))
    return data


def clean(name):
    """'Dahisar (East) [Line 2]' and 'Marol Naka (Line 1)' name the station without the line; a stop's
    direction ('(eastbound)') is not part of the station's name."""
    name = re.sub(r'\s*[\[(](Line \d+|लाइन [०-९]+|eastbound|westbound)[\])]', '', name or '').strip()
    return name or None


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else None
    if cache:
        os.makedirs(cache, exist_ok=True)
    lines = {}
    for line_id, rel in ROUTES.items():
        data = fetch(rel, cache)
        nodes = {e['id']: e for e in data['elements'] if e['type'] == 'node'}
        route = next(e for e in data['elements'] if e['type'] == 'relation')
        stations = []
        for m in route['members']:
            if m['type'] != 'node' or not m['role'].startswith('stop'):
                continue
            n = nodes[m['ref']]
            tags = n.get('tags', {})
            name = clean(tags.get('name'))
            if not name:
                sys.exit(f'{line_id}: stop {n["id"]} has no name')
            stations.append({'name': name, 'name_mr': clean(tags.get('name:mr')), 'lat': round(n['lat'], 6), 'lng': round(n['lon'], 6), 'osm_node': n['id']})
        lines[line_id] = {'osm_relation': rel, 'route': route['tags'].get('name'), 'stations': stations}
        print(f'{line_id}: {len(stations)} stations')
    out = {
        '_meta': {
            'source': 'OpenStreetMap contributors (ODbL)',
            'source_url': 'https://www.openstreetmap.org/copyright',
            'status': 'reported',
            'last_verified': CHECKED,
            'note': 'Stop nodes of each route relation, in route order. Built by scripts/build-open-stations.py.',
        },
        'lines': lines,
    }
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')


main()
