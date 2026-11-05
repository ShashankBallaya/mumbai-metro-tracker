# Writes a KML of Line 5 past Dhamankar Naka, as the Oct 2026 civil tenders draw it,
# for viewing in Google Earth: the route by package, the stations with their tender
# chainage, and chainage ticks every 100 m (labelled every 500 m).
# Reads scripts/data/line5-tender-route-2026.geojson (built by assemble.py).
# Run from the repo root:
#   python -P -E scripts/line5-tenders/kml.py [out.kml]
import json, sys
from pathlib import Path
from xml.sax.saxutils import escape
import numpy as np
from pyproj import Transformer

TO_UTM = Transformer.from_crs('EPSG:4326', 'EPSG:32643', always_xy=True)
TO_LL = Transformer.from_crs('EPSG:32643', 'EPSG:4326', always_xy=True)
SRC = Path('scripts/data/line5-tender-route-2026.geojson')
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else 'share/line5-tenders/line5-tender-chainage.kml')

# KML colours are aabbggrr.
STYLE = {
    'CA-317': 'ff1d6bf2',          # Line 5 orange
    'CA-318': 'ffde862e',          # blue
    'CA-314 Part A': 'ffad448e',   # purple
    'CA-314 Part B': 'ff85a016',   # green
    'Underground': 'ff00d7ff',     # yellow, drawn over CA-317
}


def utm(coords):
    return np.array([TO_UTM.transform(*c) for c in coords])


def ll(p):
    lng, lat = TO_LL.transform(*p)
    return f'{lng:.7f},{lat:.7f},0'


def cumlen(P):
    return np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]


def project(P, q):
    L = cumlen(P)
    best = None
    for k in range(len(P) - 1):
        v = P[k + 1] - P[k]
        t = np.clip(((q - P[k]) @ v) / max(v @ v, 1e-9), 0, 1)
        d = np.hypot(*(P[k] + t * v - q))
        if best is None or d < best[0]:
            best = (d, L[k] + t * np.hypot(*v))
    return best[1], best[0]


def fmt_ch(c):
    c = int(round(c))
    return f'{c // 1000}+{c % 1000:03d}'


def chainage_line(P, anchors):
    """Chainage along P, piecewise linear between anchors [(s along P, chainage)]."""
    a = sorted(anchors)
    s = np.array([x for x, _ in a])
    c = np.array([y for _, y in a])
    keep = np.r_[True, np.diff(s) > 1]
    return s[keep], c[keep]


def ticks(P, s_anchor, c_anchor, c_from, c_to, step=100):
    """Yield (chainage, point, unit normal) every `step` m of chainage."""
    L = cumlen(P)
    first = int(np.ceil(c_from / step) * step)
    for c in range(first, int(c_to) + 1, step):
        s = np.interp(c, c_anchor, s_anchor)
        x, y = np.interp(s, L, P[:, 0]), np.interp(s, L, P[:, 1])
        k = min(max(np.searchsorted(L, s) - 1, 0), len(P) - 2)
        d = P[k + 1] - P[k]
        n = np.array([-d[1], d[0]]) / max(np.hypot(*d), 1e-9)
        yield c, np.array([x, y]), n


def placemark(name, geom, style, desc=''):
    return f'<Placemark><name>{escape(name)}</name>{f"<description>{escape(desc)}</description>" if desc else ""}<styleUrl>#{style}</styleUrl>{geom}</Placemark>'


def line(P):
    return '<LineString><tessellate>1</tessellate><coordinates>' + ' '.join(ll(p) for p in P) + '</coordinates></LineString>'


def point(p):
    return f'<Point><coordinates>{ll(p)}</coordinates></Point>'


def main():
    g = json.loads(SRC.read_text(encoding='utf-8'))
    lines = {f['properties']['part']: f for f in g['features'] if f['geometry']['type'] == 'LineString'}
    pts = [f for f in g['features'] if f['geometry']['type'] == 'Point']
    spur_names = {'Shanti Nagar', 'Shivaji Maharaj Chowk', 'Ulhasnagar'}

    # Main line: CA-317 + CA-318 + Part A, one polyline, with chainage pinned at part ends and stations.
    parts = ['CA-317', 'CA-318', 'CA-314 Part A']
    M = np.vstack([utm(lines[p]['geometry']['coordinates']) for p in parts])
    anchors = []
    for p in parts:
        pr = lines[p]['properties']
        c = utm(lines[p]['geometry']['coordinates'])
        anchors += [(project(M, c[0])[0], pr['from_ch']), (project(M, c[-1])[0], pr['to_ch'])]
    for f in pts:
        n = f['properties']['station']
        if n in spur_names or n == 'Dhamankar Naka':
            continue
        anchors.append((project(M, utm([f['geometry']['coordinates']])[0])[0], f['properties']['chainage']))
    sM, cM = chainage_line(M, anchors)
    if np.any(np.diff(cM) <= 0):
        sys.exit('Chainage does not rise along the main line')

    # Spur: Part B, spur chainage 383 to 5,272 (the spur's own chainage = tender US chainage - 26,177).
    B = utm(lines['CA-314 Part B']['geometry']['coordinates'])
    banch = [(0.0, 383.0), (cumlen(B)[-1], 5272.63)]
    for f in pts:
        if f['properties']['station'] in spur_names:
            banch.append((project(B, utm([f['geometry']['coordinates']])[0])[0], f['properties']['chainage'] - 26177))
    sB, cB = chainage_line(B, banch)

    styles = ''.join(
        f'<Style id="{k.replace(" ", "_")}"><LineStyle><color>{v}</color><width>{6 if k == "Underground" else 5}</width></LineStyle></Style>'
        for k, v in STYLE.items())
    styles += ('<Style id="tick"><LineStyle><color>ffffffff</color><width>2</width></LineStyle></Style>'
               '<Style id="km"><IconStyle><scale>0.6</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle><LabelStyle><scale>0.8</scale></LabelStyle></Style>'
               '<Style id="exact"><IconStyle><color>ff00ff00</color><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle_highlight.png</href></Icon></IconStyle><LabelStyle><scale>1.1</scale></LabelStyle></Style>'
               '<Style id="placed"><IconStyle><color>ff00ffff</color><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle_highlight.png</href></Icon></IconStyle><LabelStyle><scale>1.1</scale></LabelStyle></Style>'
               '<Style id="boundary"><IconStyle><color>ff1d6bf2</color><scale>1.0</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/flag.png</href></Icon></IconStyle></Style>')

    route = ''.join(placemark(f'{p} ({fmt_ch(lines[p]["properties"].get("from_ch", 0))} to {fmt_ch(lines[p]["properties"].get("to_ch", 0))})' if p != 'CA-314 Part B' else 'CA-314 Part B, Ulhasnagar spur (spur 0+383 to 5+272)',
                              line(utm(lines[p]['geometry']['coordinates'])), p.replace(' ', '_'))
                    for p in ['CA-317', 'CA-318', 'CA-314 Part A', 'CA-314 Part B'])
    route += placemark('Underground (13+160 to 16+420), twin tunnels 13+500 to 15+960', line(utm(lines['Underground']['geometry']['coordinates'])), 'Underground')

    stations = ''
    for f in pts:
        pr = f['properties']
        n, how = pr['station'], pr['position']
        spur = n in spur_names
        c = pr['chainage'] - 26177 if spur else pr['chainage']
        label = f'{n} ({"spur " if spur else ""}{fmt_ch(c)})'
        desc = {'tender': 'Position: centre coordinates printed on the tender plan sheets (exact).',
                'site': 'Position: the built station (Phase 1).',
                'chainage': 'Position: tender chainage along the traced route (about 50 m).',
                'spur chainage': 'Position: tender spur chainage along the traced route (about 50 m).'}[how]
        desc = f'Tender chainage {fmt_ch(c)}{" on the spur (line chainage " + fmt_ch(pr["chainage"]) + ")" if spur else ""}. {desc}'
        stations += placemark(label, point(utm([f['geometry']['coordinates']])[0]), 'exact' if how in ('tender', 'site') else 'placed', desc)

    def tick_marks(P, s, c, c0, c1, prefix=''):
        out_t, out_l = '', ''
        for ch, p, n in ticks(P, s, c, c0, c1):
            big = ch % 500 == 0
            h = 25 if big else 12
            out_t += placemark('', line([p - n * h, p + n * h]), 'tick')
            if big:
                out_l += placemark(f'{prefix}{fmt_ch(ch)}', point(p + n * 40), 'km')
        return out_t, out_l

    mt, ml = tick_marks(M, sM, cM, 12200, 29065)
    bt, bl = tick_marks(B, sB, cB, 383, 5272, 'spur ')
    boundaries = ''
    for ch, name in [(12200, 'CA-317 starts (end of the built Dhamankar Naka station)'), (17860, 'CA-317 ends, CA-318 starts (Rajnouli Junction)'),
                     (26140, 'CA-318 ends, CA-314 Part A starts'), (29065, 'CA-314 Part A ends (Kalyan station is in another package)')]:
        if ch <= cM[-1]:
            s = np.interp(ch, cM, sM)
            L = cumlen(M)
            p = np.array([np.interp(s, L, M[:, 0]), np.interp(s, L, M[:, 1])])
            boundaries += placemark(fmt_ch(ch), point(p), 'boundary', name)

    doc = f'''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
<name>Line 5 tenders: route and chainage (Oct 2026)</name>
<description>{escape(g["properties"]["description"])} Chainage ticks every 100 m, labelled every 500 m, in the tender notation km+m. Main line chainage has the same zero as the Phase 1 environmental report; spur chainage is the spur's own (tender US chainage minus 26,177). Green stations: coordinates printed in the tender. Yellow: placed by chainage, good to about 50 m. Mumbai Metro Tracker, mumbaimetrotracker.com. Route traced from MMRDA's drawings; roads from OpenStreetMap contributors (ODbL).</description>
{styles}
<Folder><name>Route by package</name>{route}</Folder>
<Folder><name>Stations</name>{stations}</Folder>
<Folder><name>Package boundaries</name>{boundaries}</Folder>
<Folder><name>Chainage labels (every 500 m)</name>{ml}{bl}</Folder>
<Folder><name>Chainage ticks (every 100 m)</name><visibility>1</visibility>{mt}{bt}</Folder>
</Document></kml>
'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(doc, encoding='utf-8')
    print(f'Wrote {OUT}: main line chainage {fmt_ch(cM[0])} to {fmt_ch(cM[-1])}, spur {fmt_ch(cB[0])} to {fmt_ch(cB[-1])}')


if __name__ == '__main__':
    main()
