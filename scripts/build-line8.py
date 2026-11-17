# Builds Line 8's indicative route and stations for the hub map:
#   src/data/line-8-alignment.geojson   (the route)
#   src/data/planned-stations.json       (the "line-8" entry: its stations, in order)
#
# Neither CIDCO nor MMRDA has published a route map or station list for Line 8 (checked 2026-11-17). Sources:
#   - the station list and order: HomeBazaar's Line 8 page (21 Oct 2026), the only full list of the 20 stations found;
#     a real estate blog, so every name is graded unverified (owner's decision, 2026-11-17). Its own text also names
#     Belapur and Ulwe, which its table does not.
#   - Free Press Journal (9 Dec 2025): the 11 Navi Mumbai stations, from Vashi along the Sion-Panvel Highway, turning
#     in at LP Junction (Nerul) near Dr D.Y. Patil University, through inner Nerul and Seawoods, past Apollo Hospital
#     and behind the NMMC headquarters (Sagar Sangam, interchange with Navi Mumbai Metro Line 1A) to the airport.
#   - Swarajya and others: underground from CSMIA Terminal 2 to about Chedda Nagar, then elevated.
# Each station is put at the place its name points to (OpenStreetMap, or Line 2B's MMRDA station point where Line 2B
# has a station of that name); where no map source names the place, at the place the news describes. The route is
# straight lines between stations: indicative only, graded unverified.
# Run from the repo root: python scripts/build-line8.py   (no downloads; the points are below)
import json
import math
import os

CHECKED = '2026-11-17'
LIST = 'https://www.homebazaar.com/knowledge/?p=25764'
FPJ = 'https://www.freepressjournal.in/mumbai/metro-line-8-to-link-mumbai-navi-mumbai-airports-with-11-stations-across-key-suburbs'
OUT_LINE = 'src/data/line-8-alignment.geojson'
OUT_STATIONS = 'src/data/planned-stations.json'
LINE2B = 'src/data/lines/line-2b/stations.json'

# (name, underground, (lng, lat) or a Line 2B station id, what the point is)
STATIONS = [
    ('CSMIA Terminal 2', True, (72.8725934, 19.1013571), 'OpenStreetMap node 4237791504 (CSMI Airport Terminal 2)'),
    ('Phoenix Mall', True, (72.8892153, 19.0862777), 'OpenStreetMap way 151889253 (Phoenix Marketcity, Kurla)'),
    ('SG Barve Marg', True, 'sg-barve-marg', "Line 2B's SG Barve Marg station point (MMRDA)"),
    ('Kurla', True, (72.8802836, 19.0658169), 'OpenStreetMap way 122303852 (Kurla railway station)'),
    ('Lokmanya Tilak Terminus', True, (72.8919779, 19.0694658), 'OpenStreetMap node 6175360983 (Lokmanya Tilak Terminus)'),
    ('Garodia Nagar', True, (72.9085221, 19.0741334), 'OpenStreetMap node 245667945 (Garodia Nagar)'),
    ('Baiganwadi', False, (72.9249694, 19.0618979), 'OpenStreetMap way 289795851 (Baiganwadi)'),
    ('Mankhurd', False, 'mankhurd', "Line 2B's Mankhurd station point (MMRDA)"),
    ('ISBT', False, (72.958, 19.056), 'No map source; put by the Sion-Panvel Highway on the Mankhurd side of Vashi Creek'),
    ('Vashi', False, (73.0002509, 19.0637159), 'OpenStreetMap way 1013444814 (Vashi railway station)'),
    ('Sanpada', False, (73.0093933, 19.0679524), 'OpenStreetMap node 4665010293 (Sanpada railway station stop, on the Sion-Panvel Highway)'),
    ('Juinagar', False, (73.0191551, 19.0559287), 'OpenStreetMap node 4646739694 (Juinagar railway station stop, on the Sion-Panvel Highway)'),
    ('LP', False, (73.024486, 19.0458899), 'OpenStreetMap node 4646678594 (Nerul LP (DY Patil College) bus stop)'),
    ('Nerul', False, (73.0196832, 19.0341403), 'OpenStreetMap node 4662975890 (Nerul railway station stop, east)'),
    ('Seawoods', False, (73.0184576, 19.0203665), 'OpenStreetMap node 9861985267 (Seawoods railway station stop)'),
    ('Apollo', False, (73.0291285, 19.0205772), 'OpenStreetMap way 566277100 (Apollo Hospitals, Navi Mumbai)'),
    ('Sagar Sangam', False, (73.037, 19.017), 'No map source; put behind the NMMC headquarters, CBD Belapur, as Free Press Journal describes'),
    ('Targhar', False, (73.0344023, 18.9901343), 'OpenStreetMap way 648990356 (Targhar railway station)'),
    ('NMIA West', False, (73.0539765, 18.9885013), 'OpenStreetMap way 1413816601 (NMIA Terminal 1, the west terminal)'),
    ('NMIA Terminal 2', False, (73.0657484, 18.9913513), 'No map source for Terminal 2; put at the centre of the airport (OpenStreetMap way 455547086)'),
]


def main():
    l2b = {s['id']: s['location'] for s in json.load(open(LINE2B, encoding='utf-8'))['stations']}
    pts = []
    for name, ug, at, what in STATIONS:
        if isinstance(at, str):
            at = (l2b[at]['lng'], l2b[at]['lat'])
        pts.append({'name': name, 'lat': round(at[1], 6), 'lng': round(at[0], 6), 'part': 'main', 'stage': 'planned',
                    'underground': ug, 'position': f'indicative: {what}'})
    kx = 111_319.49 * math.cos(math.radians(19.05))
    ky = 111_132.954
    km = sum(math.hypot((b['lng'] - a['lng']) * kx, (b['lat'] - a['lat']) * ky) for a, b in zip(pts, pts[1:])) / 1000
    gj = {
        'type': 'FeatureCollection',
        'properties': {'note': 'Line 8, indicative: straight lines between station places. No agency has published a route. '
                               'Built by scripts/build-line8.py.', 'last_verified': CHECKED},
        'features': [{'type': 'Feature',
                      'properties': {'part': 'main', 'name': 'CSMIA Terminal 2 to NMIA Terminal 2', 'status': 'unverified',
                                     'indicative': True, 'source_url': FPJ, 'length_m': round(km * 1000)},
                      'geometry': {'type': 'LineString', 'coordinates': [[p['lng'], p['lat']] for p in pts]}}],
    }
    with open(OUT_LINE, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(gj, fh, indent=1)
        fh.write('\n')
    data = json.load(open(OUT_STATIONS, encoding='utf-8')) if os.path.exists(OUT_STATIONS) else {'_meta': {}, 'lines': {}}
    data['lines']['line-8'] = {'sources': {'list': LIST, 'list_status': 'unverified', 'navi_mumbai': FPJ, 'navi_mumbai_status': 'reported',
                                           'positions_status': 'unverified'},
                               'last_verified': CHECKED, 'stations': pts}
    with open(OUT_STATIONS, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print(f'{len(pts)} stations, {km:.1f} km in straight lines (reported: about 35 km)')


if __name__ == '__main__':
    main()
