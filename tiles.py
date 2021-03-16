#!/usr/bin/env python3

from pathlib import Path
import shutil

from PIL import Image



base = Image.open('ground.ppm')
base.width

dest = Path('./tiles')
if dest.exists():
    shutil.rmtree(dest)
dest.mkdir()

for zoom in range(5):
    z_dir = dest / str(zoom)
    z_dir.mkdir()

    # A single tile is replaced by 4 tiles when zooming in.
    rows = pow(2, zoom)
    size = 8400/rows

    for x in range(rows):
        x_dir = z_dir / str(x)
        x_dir.mkdir()

        for y in range(rows):
            y_path = x_dir / f"{y}.jpg"

            left = x * size
            right = x * (size + 1)
            top = y * size
            bottom = y * (size + 1)
            tile = base.crop((left, top, right, bottom)).resize((256, 256))
            base.save(y_path) 
            print(y_path)

