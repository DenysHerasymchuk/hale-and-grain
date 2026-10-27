"""Render the landing-page hero: three pieces arranged together on the studio backdrop.

Usage:
    blender -b --factory-startup -P scripts/assets/render_hero.py -- <source_dir> <output.webp> [samples]

<source_dir> holds the unzipped Poly Haven folders (<asset>/<asset>_4k.blend).
"""

import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.append(str(Path(__file__).resolve().parent))
from render_shots import bounds, place_camera, render_to, scene, setup_render, setup_studio  # noqa: E402

ARRANGEMENT = [
    ("wooden_display_shelves_01", -1.35, 0.25, 0),
    ("wooden_table_02", 0.05, -0.45, -6),
    ("chinese_console_table", 1.85, 0.35, 0),
]

argv = sys.argv[sys.argv.index("--") + 1:]
source_dir, output_path = Path(argv[0]), Path(argv[1])
samples = int(argv[2]) if len(argv) > 2 else 128

for obj in list(scene.objects):
    bpy.data.objects.remove(obj)

placed = []
for asset_id, x, y, rotation in ARRANGEMENT:
    blend = source_dir / asset_id / f"{asset_id}_4k.blend"
    with bpy.data.libraries.load(str(blend)) as (source, target):
        target.objects = [name for name in source.objects]
    meshes = [obj for obj in target.objects if obj is not None and obj.type == "MESH"]
    for obj in meshes:
        scene.collection.objects.link(obj)
    bpy.context.view_layer.update()

    low, high = bounds(meshes)
    shift = Vector((x - (low.x + high.x) / 2, y - (low.y + high.y) / 2, -low.z))
    for obj in meshes:
        if obj.parent is None:
            obj.location += shift
            obj.rotation_euler.z += rotation * 3.14159 / 180
    placed.extend(meshes)

bpy.context.view_layer.update()
low, high = bounds(placed)
center = (low + high) / 2
radius = (high - low).length / 2

setup_render(samples, width=1680, height=1120)
setup_studio(low.z)
place_camera(center, radius, azimuth_deg=-10, elevation_deg=10, zoom=1.3, lens=60, focus_offset=Vector((0.05, 0, -0.1)))
render_to(output_path)
