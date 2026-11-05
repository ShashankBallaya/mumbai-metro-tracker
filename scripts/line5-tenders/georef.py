# Places MMRDA's Line 5 key plan (drawing MMRDA-MML-05-MTR-GAD-TD-1000, page 2 of
# CA-314 Volume V Part 1) on the map, then writes its route pieces as GeoJSON.
#
# The fit is a similarity transform (scale, rotation, shift) from page points
# to UTM 43N metres, found by least squares on two things at once:
#   - the key plan's Line 12 (pink) against MMRDA's own Line 12 centre line
#     (src/data/lines/line-12/alignment-mmrda-2025.geojson), robust to the
#     pink pieces that are not Line 12;
#   - the six stations whose coordinates the CA-317 and CA-318 plan sheets
#     print, against the key plan's route lines.
# Scale is searched from 6.5 to 9.5 m per point and rotation within 3 degrees
# of north-up, keeping the lowest cost. Result (2026-11-05): 8.70 m per point,
# -0.18 degrees; stations 1 to 7 m from the route lines.
#
# Run from the repo root, after keyplan_lines.py:
#   python -P -E scripts/line5-tenders/georef.py tenders/CA-314/Volume_V__PART_1.pdf
# Writes georef.json and keyplan_pieces.geojson next to this file.
import json, sys
from pathlib import Path
import numpy as np
from pyproj import Transformer
from scipy.optimize import least_squares
from scipy.spatial import cKDTree

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))

TO_UTM = Transformer.from_crs('EPSG:4326', 'EPSG:32643', always_xy=True)
TO_LL = Transformer.from_crs('EPSG:32643', 'EPSG:4326', always_xy=True)

# Station centres printed on the plan sheets (UTM 43N, WGS84). Each is within
# 6 m of the main road in OpenStreetMap (checked 2026-11-05).
STATIONS_UTM = {
    'Temghar': (298312.372, 2132116.316),
    'Rajnouli': (298863.539, 2131345.327),
    'Gove Gaon': (299728.158, 2130394.430),
    'Kon Gaon West': (300622.210, 2129587.432),
    'Kon Gaon East': (301522.673, 2129107.952),
    'Durgadi': (302599.634, 2129478.831),
}

def densify(xy, step):
    out = [xy[0]]
    for a, b in zip(xy[:-1], xy[1:]):
        n = max(1, int(np.hypot(*(b - a)) / step))
        out += [a + (b - a) * k / n for k in range(1, n + 1)]
    return np.array(out)

def apply(T, P):
    s, R, t = T
    return (s * (R @ np.asarray(P).T)).T + t

def page_xy(p):  # page y points down; flip so north is up
    return np.array([[x, -y] for x, y in p])

def T_of(p):
    s, th, tx, ty = p
    return s, np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]]), np.array([tx, ty])

def main(pdf):
    kp = json.loads((HERE / 'keyplan_lines.json').read_text())
    pink = np.vstack([page_xy(l) for l in kp['lines']['pink']])
    route = np.vstack([densify(page_xy(l), 0.5) for n in ('green', 'red', 'light_blue') for l in kp['lines'][n]])
    g = json.loads(Path('src/data/lines/line-12/alignment-mmrda-2025.geojson').read_text())
    ref = densify(np.array([TO_UTM.transform(*c) for c in g['features'][0]['geometry']['coordinates']]), 5)
    tree = cKDTree(ref)
    st = np.array(list(STATIONS_UTM.values()))
    # first guess: the Rajnouli and Durgadi labels on the key plan
    lab = np.array([(748.8, -691.5), (1208.9, -934.2)])

    def res(p):
        T = T_of(p)
        d, _ = tree.query(apply(T, pink))
        sd, _ = cKDTree(apply(T, route)).query(st)
        return np.concatenate([np.minimum(d, 150) / np.sqrt(len(pink)) * 3, sd])

    best = None
    for s0 in np.arange(6.5, 9.6, 0.25):
        for th in np.radians(np.arange(-3, 3.1, 1)):
            R = T_of([s0, th, 0, 0])[1]
            t = st[[1, 5]].mean(0) - s0 * R @ lab.mean(0)
            r = least_squares(res, [s0, th, *t], loss='soft_l1', f_scale=20, x_scale=[0.1, 0.01, 100, 100], max_nfev=200)
            if best is None or r.cost < best[0]:
                best = (r.cost, r.x)
    p = best[1]
    T = T_of(p)
    sd, _ = cKDTree(apply(T, route)).query(st)
    print(f'scale {p[0]:.3f} m/pt, rotation {np.degrees(p[1]):.2f} deg')
    print('stations to route (m):', {k: round(float(v)) for k, v in zip(STATIONS_UTM, sd)})
    if sd.max() > 25:
        sys.exit('The fit puts a station more than 25 m from the route: check the key plan pieces')
    (HERE / 'georef.json').write_text(json.dumps({'s': T[0], 'R': T[1].tolist(), 't': T[2].tolist(), 'note': 'page (x, -y) in PDF points to UTM 43N metres'}, indent=1))
    feats = []
    for n, ls in kp['lines'].items():
        for i, l in enumerate(ls):
            ll = [[round(v, 6) for v in TO_LL.transform(*q)] for q in apply(T, page_xy(l))]
            feats.append({'type': 'Feature', 'properties': {'id': f'{n[:3] if n in ("peach", "darkred", "amber", "pink", "magenta", "cyan") else n[:2]}{i}', 'colour': n}, 'geometry': {'type': 'LineString', 'coordinates': ll}})
    (HERE / 'keyplan_pieces.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': feats}))

if __name__ == '__main__':
    main(sys.argv[1])
