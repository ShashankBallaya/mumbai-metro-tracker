# Pulls the route lines out of MMRDA's key plan for Line 5 Phase II/III
# (drawing MMRDA-MML-05-MTR-GAD-TD-1000, page 2 of CA-314 Volume V Part 1).
# The lines are vector shapes, one fill colour per line. Each colour is drawn
# as a mask, thinned to a centre line and traced into ordered points in page
# coordinates (PDF points). Output: keyplan_lines.json next to this file.
#
# Run: python -P -E scripts/line5-tenders/keyplan_lines.py tenders/CA-314/Volume_V__PART_1.pdf
import json, sys
from pathlib import Path
import numpy as np
import pymupdf
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize, remove_small_objects
from skimage.measure import label

S = 3.0  # pixels per PDF point
COLOURS = {
    'light_blue': (0.43, 0.65, 0.87),
    'purple': (0.75, 0.0, 1.0),
    'red': (1.0, 0.0, 0.0),
    'orange': (1.0, 0.49, 0.11),
    'blue': (0.0, 0.0, 1.0),
    'green': (0.0, 1.0, 0.0),
    'peach': (1.0, 0.75, 0.5),
    'darkred': (0.87, 0.0, 0.0),
    'amber': (1.0, 0.5, 0.0),
    'pink': (1.0, 0.0, 0.75),
    'magenta': (1.0, 0.0, 1.0),
    'cyan': (0.0, 1.0, 1.0),
}

def bez(p0, p1, p2, p3, n=12):
    t = np.linspace(0, 1, n)[:, None]
    P = [np.array([q.x, q.y]) for q in (p0, p1, p2, p3)]
    return ((1 - t) ** 3) * P[0] + 3 * ((1 - t) ** 2) * t * P[1] + 3 * (1 - t) * t * t * P[2] + t ** 3 * P[3]

def mask_for(page, rgb):
    W, H = int(page.rect.width * S), int(page.rect.height * S)
    im = Image.new('L', (W, H), 0)
    dr = ImageDraw.Draw(im)
    for g in page.get_drawings():
        c = g.get('fill')
        if not c or tuple(round(x, 2) for x in c) != rgb:
            continue
        if any(it[0] == 're' for it in g['items']):
            continue  # label boxes
        pts = []
        for it in g['items']:
            if it[0] == 'l':
                pts += [(it[1].x, it[1].y), (it[2].x, it[2].y)]
            elif it[0] == 'c':
                pts += [tuple(p) for p in bez(*it[1:5])]
        if len(pts) >= 3:
            dr.polygon([(x * S, y * S) for x, y in pts], fill=255)
    return np.array(im) > 0

def trace(skel):
    """Order the pixels of each skeleton component into the longest path."""
    out = []
    lab = label(skel, connectivity=2)
    for k in range(1, lab.max() + 1):
        ys, xs = np.nonzero(lab == k)
        if len(xs) < 60:
            continue
        pts = set(zip(xs.tolist(), ys.tolist()))
        nb = lambda p: [(p[0] + dx, p[1] + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy) and (p[0] + dx, p[1] + dy) in pts]
        def bfs(src):
            prev = {src: None}; q = [src]; i = 0
            while i < len(q):
                for n in nb(q[i]):
                    if n not in prev:
                        prev[n] = q[i]; q.append(n)
                i += 1
            return q[-1], prev
        a, _ = bfs(next(iter(pts)))
        b, prev = bfs(a)
        path = []
        p = b
        while p is not None:
            path.append(p); p = prev[p]
        if len(path) < 60:
            continue
        out.append([[round(x / S, 2), round(y / S, 2)] for x, y in path[::3]])
    return out

def main(pdf):
    page = pymupdf.open(pdf)[1]
    res = {'page_size': [page.rect.width, page.rect.height], 'lines': {}}
    for name, rgb in COLOURS.items():
        m = mask_for(page, rgb)
        m = remove_small_objects(m, max_size=200)
        res['lines'][name] = trace(skeletonize(m))
        print(name, [len(l) for l in res['lines'][name]])
    Path(__file__).with_name('keyplan_lines.json').write_text(json.dumps(res))

if __name__ == '__main__':
    main(sys.argv[1])
