#!/usr/bin/env python3

from pathlib import Path
import sys
import shutil

import pyvips

src_filename = sys.argv[1]
dst_path = sys.argv[2]
ext = sys.argv[3]
assert ext.startswith(".")
assert dst_path.replace(".", "").replace("/", "")

base = pyvips.Image.new_from_file(src_filename)
assert base.width == base.height

# 6 zoom levels gives us a max zoom of 2^5 which is 32x32 tiles which is
# 8400/32 = 262.5-wide tiles which is roughly 256, so our highest zoom level is
# roughly 1:1 with the original source.
assert base.width == 8400
max_zoom = 5

# If we're rendering rail tiles, we want a transparent background.
if 'rail' in dst_path:
    # Add an alpha channel, based on a grayscale copy of the image.
    alpha = base.colourspace('b-w')
    alpha = alpha + alpha.gaussblur(2)
    base = base.bandjoin(alpha * 2)
    # Render the image, so we don't re-run these operations for each tile.
    base = base.copy_memory()

dst = Path(dst_path)
if dst.exists():
    shutil.rmtree(dst)
dst.mkdir()

for zoom in range(max_zoom + 1):
    z_dir = dst / f"{zoom}"
    z_dir.mkdir()

    # A single tile is replaced by 4 tiles when zooming in.
    rows = pow(2, zoom)
    size = base.width / rows

    for x in range(rows):
        x_dir = z_dir / f"{x}"
        x_dir.mkdir()

        for y in range(rows):
            y_path = x_dir / f"{y}{ext}"

            left = x * size
            right = x * (size + 1)
            top = y * size
            bottom = y * (size + 1)
            tile = (base
                .crop(left, top, size, size)
                .thumbnail_image(256)
            )
            tile.write_to_file(str(y_path))
            print(y_path)

