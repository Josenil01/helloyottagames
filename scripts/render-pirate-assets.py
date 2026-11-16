"""Render Kenney OBJ assets into transparent, antialiased game sprites.

Requires numpy and Pillow. Run from any directory; no Blender or GPU required.
The source meshes, UV palette and authored normals are used directly. This is
an orthographic 3D rasterizer, not an enlargement of the 64px preview images.
"""
from pathlib import Path
import argparse
import json
import re

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'assets/image/kenney_pirate-kit'
SOURCE = PACK / 'Models/OBJ format'
OUTPUT = PACK / 'Rendered'


def unit(vector):
    return vector / np.linalg.norm(vector)


def load_obj(path):
    vertices, uvs, normals, faces = [], [], [], []
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        parts = line.split()
        if not parts:
            continue
        if parts[0] == 'v':
            vertices.append(list(map(float, parts[1:4])))
        elif parts[0] == 'vt':
            uvs.append(list(map(float, parts[1:3])))
        elif parts[0] == 'vn':
            normals.append(list(map(float, parts[1:4])))
        elif parts[0] == 'f':
            polygon = []
            for value in parts[1:]:
                indices = value.split('/')
                polygon.append(tuple(int(i) - 1 if i else -1 for i in indices))
            for i in range(1, len(polygon) - 1):
                faces.append([polygon[0], polygon[i], polygon[i + 1]])
    return np.array(vertices), np.array(uvs), np.array(normals), faces


def render(name, size):
    vertices, uvs, normals, faces = load_obj(SOURCE / (name + '.obj'))
    # Shared three-quarter camera and lights keep the pack visually consistent.
    toward_camera = unit(np.array([6., 4., 8.]))
    right = unit(np.cross(np.array([0., 1., 0.]), toward_camera))
    up = np.cross(toward_camera, right)
    camera = np.stack([right, up, toward_camera], axis=1)
    projected = vertices @ camera
    low, high = projected[:, :2].min(axis=0), projected[:, :2].max(axis=0)

    # Retain the preview's canvas occupancy so existing game layouts keep their
    # visual scale; only the mesh projection is rendered at higher resolution.
    with Image.open(PACK / 'Previews' / (name + '.png')) as old:
        bounds = old.convert('RGBA').getchannel('A').getbbox()
        x0, y0, x1, y1 = np.array(bounds) / np.array([old.width, old.height] * 2)
    supersample = 2
    resolution = size * supersample
    fit = min((x1 - x0) / (high[0] - low[0]), (y1 - y0) / (high[1] - low[1])) * resolution
    center = (low + high) / 2
    projected[:, 0] = (projected[:, 0] - center[0]) * fit + (x0 + x1) / 2 * resolution
    projected[:, 1] = -(projected[:, 1] - center[1]) * fit + (y0 + y1) / 2 * resolution

    rgba = np.zeros((resolution, resolution, 4), dtype=np.uint8)
    depth = np.full((resolution, resolution), -np.inf, dtype=np.float32)
    texture = np.array(Image.open(SOURCE / 'Textures/colormap.png').convert('RGB'))
    key = unit(np.array([-3., 7., 5.]))
    fill = unit(np.array([5., 2., -4.]))

    for face in faces:
        ids = [corner[0] for corner in face]
        points = projected[ids]
        minx, miny = np.maximum(np.floor(points[:, :2].min(axis=0)).astype(int), 0)
        maxx, maxy = np.minimum(np.ceil(points[:, :2].max(axis=0)).astype(int), resolution - 1)
        if minx > maxx or miny > maxy:
            continue
        a, b, c = points
        denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(denominator) < 1e-9:
            continue
        yy, xx = np.mgrid[miny:maxy + 1, minx:maxx + 1].astype(np.float32)
        xx += .5
        yy += .5
        w0 = ((b[1] - c[1]) * (xx - c[0]) + (c[0] - b[0]) * (yy - c[1])) / denominator
        w1 = ((c[1] - a[1]) * (xx - c[0]) + (a[0] - c[0]) * (yy - c[1])) / denominator
        w2 = 1 - w0 - w1
        z = w0 * a[2] + w1 * b[2] + w2 * c[2]
        region_depth = depth[miny:maxy + 1, minx:maxx + 1]
        visible = (w0 >= -1e-5) & (w1 >= -1e-5) & (w2 >= -1e-5) & (z > region_depth)
        if not visible.any():
            continue
        weights = np.stack([w0[visible], w1[visible], w2[visible]], axis=1)
        uv = weights @ uvs[[corner[1] for corner in face]]
        tx = np.clip((uv[:, 0] * texture.shape[1]).astype(int), 0, texture.shape[1] - 1)
        ty = np.clip(((1 - uv[:, 1]) * texture.shape[0]).astype(int), 0, texture.shape[0] - 1)
        normal = unit(normals[[corner[2] for corner in face]].mean(axis=0))
        illumination = np.clip(.62 + .32 * max(0, normal @ key) + .10 * max(0, normal @ fill), .58, 1.04)
        color = np.clip(texture[ty, tx].astype(float) * illumination, 0, 255).astype(np.uint8)
        region = rgba[miny:maxy + 1, minx:maxx + 1]
        region[visible, :3] = color
        region[visible, 3] = 255
        region_depth[visible] = z[visible]

    result = Image.fromarray(rgba).resize((size, size), Image.Resampling.LANCZOS)
    assert result.getchannel('A').getbbox(), name
    result.save(OUTPUT / (name + '.png'), optimize=True)
    return {'name': name, 'size': size, 'triangles': len(faces), 'bytes': (OUTPUT / (name + '.png')).stat().st_size}


def used_assets():
    game = ROOT / 'Matematica Pirata'
    code = '\n'.join((game / p).read_text(encoding='utf-8') for p in ['main.js', 'pirate-assets.js', 'cannon-feedback.js'])
    names = set(re.findall(r'name="([a-z0-9-]+)"', code))
    tracks = code.split('tracks: [')[1].split(']')[0]
    names.update(re.findall(r"'([a-z0-9-]+)'", tracks))
    return sorted(names)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('names', nargs='*', help='Default: every asset used by Matemática Pirata')
    args = parser.parse_args()
    OUTPUT.mkdir(exist_ok=True)
    records = []
    for name in args.names or used_assets():
        record = render(name, 1024 if name.startswith('ship-') else 512)
        records.append(record)
        print(json.dumps(record), flush=True)
    if not args.names:
        (OUTPUT / 'manifest.json').write_text(json.dumps({'source': 'Kenney Pirate Kit 2.1, CC0', 'renderer': 'scripts/render-pirate-assets.py', 'camera': [6, 4, 8], 'supersampling': 2, 'assets': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
