"""Render studio product photography for a Poly Haven .blend.

Usage:
    blender -b <asset>.blend -P scripts/assets/render_shots.py -- <output_dir> <slug> [samples]

Writes <slug>-1..4.webp (three-quarter, front, side, detail) at 1200x1500 on a warm
seamless backdrop, so every product photo in the store shares one lighting setup.
"""

import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

BACKDROP_COLOR = (0.84, 0.78, 0.69, 1.0)  # linear; reads as warm cream once AgX is applied

scene = bpy.context.scene

def bounds(objects):
    corners = [obj.matrix_world @ Vector(c) for obj in objects for c in obj.bound_box]
    low = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
    high = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
    return low, high

def add_backdrop(floor_z):
    """Seamless L-shaped cyclorama: floor curving up into a back wall."""
    mesh = bpy.data.meshes.new("backdrop")
    bm = bmesh.new()
    radius, depth, height, width = 2.5, 12.0, 10.0, 30.0
    profile = [(-depth, 0.0)]
    for step in range(13):
        angle = (math.pi / 2) * step / 12
        profile.append((6 - radius + math.sin(angle) * radius, radius - math.cos(angle) * radius))
    profile.append((6.0, height))
    left = [bm.verts.new((-width / 2, y, z + floor_z)) for y, z in profile]
    right = [bm.verts.new((width / 2, y, z + floor_z)) for y, z in profile]
    for i in range(len(profile) - 1):
        bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True

    backdrop = bpy.data.objects.new("backdrop", mesh)
    scene.collection.objects.link(backdrop)
    material = bpy.data.materials.new("backdrop")
    material.use_nodes = True
    shader = material.node_tree.nodes["Principled BSDF"]
    shader.inputs["Base Color"].default_value = BACKDROP_COLOR
    shader.inputs["Roughness"].default_value = 0.9
    mesh.materials.append(material)

def add_area_light(name, location, energy, size, color=(1.0, 0.96, 0.9)):
    light = bpy.data.lights.new(name, "AREA")
    light.energy = energy
    light.size = size
    light.color = color
    obj = bpy.data.objects.new(name, light)
    obj.location = location
    direction = -Vector(location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(obj)

def setup_world():
    world = bpy.data.worlds.new("studio")
    world.use_nodes = True
    background = world.node_tree.nodes["Background"]
    background.inputs["Color"].default_value = BACKDROP_COLOR
    background.inputs["Strength"].default_value = 0.35
    scene.world = world

def setup_render(samples, width=1200, height=1500):
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.device = "CPU"
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.quality = 82
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"

def place_camera(target, radius, azimuth_deg, elevation_deg, zoom=1.0, focus_offset=Vector(), lens=70):
    camera_data = bpy.data.cameras.new("camera")
    camera_data.lens = lens
    camera = bpy.data.objects.new("camera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera

    width, height = scene.render.resolution_x, scene.render.resolution_y
    fov = 2 * math.atan(camera_data.sensor_width / 2 / camera_data.lens) * (width / height if width < height else 1)
    distance = radius / math.sin(fov / 2) * 1.08 / zoom

    azimuth, elevation = math.radians(azimuth_deg), math.radians(elevation_deg)
    direction = Vector((math.sin(azimuth) * math.cos(elevation), -math.cos(azimuth) * math.cos(elevation), math.sin(elevation)))
    focus = target + focus_offset
    camera.location = focus + direction * distance
    camera.rotation_euler = (focus - camera.location).to_track_quat("-Z", "Y").to_euler()
    return camera

def setup_studio(floor_z):
    setup_world()
    add_backdrop(floor_z)
    add_area_light("key", (-3.0, -3.5, 4.5), 900, 3.0)
    add_area_light("fill", (4.0, -2.5, 2.0), 250, 4.0, (0.9, 0.93, 1.0))
    add_area_light("rim", (1.5, 4.0, 4.0), 400, 2.0)

def render_to(path):
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {path}")

def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    output_dir = Path(argv[0])
    slug = argv[1]
    samples = int(argv[2]) if len(argv) > 2 else 96
    meshes = [obj for obj in scene.objects if obj.type == "MESH"]

    low, high = bounds(meshes)
    center = (low + high) / 2
    radius = (high - low).length / 2

    setup_render(samples)
    setup_studio(low.z)

    shots = [
        (1, dict(azimuth_deg=-38, elevation_deg=16, zoom=1.15)),
        (2, dict(azimuth_deg=0, elevation_deg=8, zoom=1.15)),
        (3, dict(azimuth_deg=-82, elevation_deg=10, zoom=1.15)),
        (4, dict(azimuth_deg=-25, elevation_deg=22, zoom=2.3, focus_offset=Vector((-(high.x - low.x) * 0.22, low.y - center.y, (high.z - low.z) * 0.3)))),
    ]

    output_dir.mkdir(parents=True, exist_ok=True)
    for index, options in shots:
        for obj in [o for o in scene.objects if o.type == "CAMERA"]:
            bpy.data.objects.remove(obj)
        place_camera(center, radius, **options)
        render_to(output_dir / f"{slug}-{index}.webp")

if __name__ == "__main__":
    main()
