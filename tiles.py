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

# If we're rendering rail tiles, we want a transparent background.
if 'rail' in dst_path:
    # Add an alpha channel, based on a grayscale copy of the image.
    alpha = base.colourspace('b-w')
    alpha = alpha + alpha.gaussblur(2)
    base = base.bandjoin(alpha * 2)
    # Render the image, so we don't re-run these operations for each tile.
    base = base.copy_memory()

    max_zoom = 6
    assert base.width == 16800
else:
    # 6 zoom levels gives us a max zoom of 2^5 which is 32x32 tiles which is
    # 8400/32 = 262.5-wide tiles which is roughly 256, so our highest zoom level is
    # roughly 1:1 with the original source.
    max_zoom = 5
    assert base.width == 8400

dst = Path(dst_path)
if dst.exists():
    shutil.rmtree(dst)
dst.mkdir(parents=True)

for zoom in range(max_zoom + 1):
    z_dir = dst / f"{zoom}"
    z_dir.mkdir()

    # A single tile is replaced by 4 tiles when zooming in.
    rows = pow(2, zoom)

    # Resize to the desired zoom level so cropping is cheap.
    size = 256
    zoomed = (base
        .thumbnail_image(size * rows)
        .copy_memory()
    )

    for x in range(rows):
        x_dir = z_dir / f"{x}"
        x_dir.mkdir()

        for y in range(rows):
            y_path = x_dir / f"{y}{ext}"

            left = x * size
            right = x * (size + 1)
            top = y * size
            bottom = y * (size + 1)
            tile = zoomed.crop(left, top, size, size)
            tile.write_to_file(str(y_path))
            print(y_path)

