"""Export a Poly Haven .blend as a web-ready .glb.

Usage:
    blender -b <asset>.blend -P scripts/assets/export_glb.py -- <output.glb> [texture_size]

Textures are downscaled in memory (Poly Haven ships 4K, the viewer needs ~1K) and
written as WebP. The object is moved so its footprint is centred on the origin and it
stands on y=0, which keeps the viewer's auto-framing predictable.
"""

import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
output_path = argv[0]
texture_size = int(argv[1]) if len(argv) > 1 else 1024

for image in bpy.data.images:
    if image.source != "FILE" or not image.has_data and not image.filepath:
        continue
    image.reload()
    width, height = image.size
    if width > texture_size or height > texture_size:
        scale = texture_size / max(width, height)
        image.scale(max(1, round(width * scale)), max(1, round(height * scale)))

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]

bpy.ops.object.select_all(action="DESELECT")
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
min_corner = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
max_corner = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
shift = Vector(((min_corner.x + max_corner.x) / -2, (min_corner.y + max_corner.y) / -2, -min_corner.z))

for obj in meshes:
    if obj.parent is None:
        obj.location += shift

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    use_selection=True,
    export_image_format="WEBP",
    export_image_quality=85,
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
    export_cameras=False,
    export_lights=False,
)

size = max_corner - min_corner
print(f"EXPORTED {output_path} size_m=({size.x:.3f}, {size.z:.3f}, {size.y:.3f})")
