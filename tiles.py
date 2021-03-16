#!/usr/bin/env python3

from pathlib import Path
import sys
import shutil

import pyvips

src_filename = sys.argv[1]
dst_path = sys.argv[2]
assert dst_path.replace(".", "").replace("/", "")

base = pyvips.Image.new_from_file(src_filename)
assert base.width == base.height

# 6 zoom levels gives us a max zoom of 2^5 which is 32x32 tiles which is
# 8400/32 = 262.5-wide tiles which is roughly 256, so our highest zoom level is
# roughly 1:1 with the original source.
assert base.width = 8400

dst = Path(dst_path)
if dst.exists():
    shutil.rmtree(dst)
dst.mkdir()

for zoom in range(6):
    z_dir = dst / str(zoom)
    z_dir.mkdir()

    # A single tile is replaced by 4 tiles when zooming in.
    rows = pow(2, zoom)
    size = base.width / rows

    for x in range(rows):
        x_dir = z_dir / str(x)
        x_dir.mkdir()

        for y in range(rows):
            y_path = x_dir / f"{y}.jpg"

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

