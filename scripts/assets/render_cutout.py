"""Render a product as a transparent cutout (with its contact shadow) for layering over the site.

Usage:
    blender -b <asset>.blend -P scripts/assets/render_cutout.py -- <output.webp> [azimuth] [samples]

A shadow-catcher floor keeps only the shadow; the backdrop and world stay transparent.
"""

import sys
from pathlib import Path

import bpy

sys.path.append(str(Path(__file__).resolve().parent))
from render_shots import add_area_light, bounds, place_camera, render_to, scene, setup_render, setup_world  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:]
output_path = Path(argv[0])
azimuth = float(argv[1]) if len(argv) > 1 else 35
samples = int(argv[2]) if len(argv) > 2 else 128

meshes = [obj for obj in scene.objects if obj.type == "MESH"]
low, high = bounds(meshes)
center = (low + high) / 2
radius = (high - low).length / 2

setup_render(samples, width=1100, height=1600)
setup_world()
scene.render.film_transparent = True
scene.render.image_settings.color_mode = "RGBA"

bpy.ops.mesh.primitive_plane_add(size=20, location=(center.x, center.y, low.z))
scene.objects[-1].is_shadow_catcher = True
bpy.context.active_object.is_shadow_catcher = True

add_area_light("key", (-3.0, -3.5, 4.5), 900, 3.0)
add_area_light("fill", (4.0, -2.5, 2.0), 300, 4.0, (0.9, 0.93, 1.0))
add_area_light("rim", (2.5, 3.5, 3.5), 600, 2.0, (1.0, 0.85, 0.65))

place_camera(center, radius, azimuth_deg=azimuth, elevation_deg=8, zoom=1.2, lens=60)
render_to(output_path)
