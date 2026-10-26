# Asset sources and licences

## 3D models

All furniture models come from [Poly Haven](https://polyhaven.com) and are released under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (public domain, no attribution
required). We credit them anyway, in the footer and in each product's model metadata.

| Product                | Poly Haven asset                                                              | File                                        |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| Harrow Dining Table    | [Wooden Table 02](https://polyhaven.com/a/wooden_table_02)                     | `frontend/public/models/harrow-dining-table.glb`    |
| Atelier Drawer Cabinet | [Drawer Cabinet](https://polyhaven.com/a/drawer_cabinet)                       | `frontend/public/models/atelier-drawer-cabinet.glb` |
| Forge Shelving Unit    | [Steel Frame Shelves 01](https://polyhaven.com/a/steel_frame_shelves_01)       | `frontend/public/models/forge-shelving-unit.glb`    |
| Orchard Display Shelf  | [Wooden Display Shelves 01](https://polyhaven.com/a/wooden_display_shelves_01) | `frontend/public/models/orchard-display-shelf.glb`  |
| Lune Console           | [Chinese Console Table](https://polyhaven.com/a/chinese_console_table)         | `frontend/public/models/lune-console.glb`           |

The source downloads are the 4K `.blend` packages. They are not committed (≈125 MB); the
web assets are derived from them with the scripts below.

## Product photography

Every product image under `frontend/public/images/` is an original render of the models
above, produced with `scripts/assets/render_shots.py` (Blender, Cycles). No stock photography
is used.

## Regenerating assets

Requires Blender 4.2+ (the official portable build works if the distro package does not).

```sh
# GLB: textures downscaled to 1K WebP, model centred and grounded at the origin
blender -b wooden_table_02_4k.blend -P scripts/assets/export_glb.py -- frontend/public/models/harrow-dining-table.glb 1024

# Four studio shots: <slug>-1..4.webp
blender -b wooden_table_02_4k.blend -P scripts/assets/render_shots.py -- frontend/public/images/products harrow-dining-table 64
```
