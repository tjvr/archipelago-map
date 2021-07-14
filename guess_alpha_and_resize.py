#!/usr/bin/env python3

from pathlib import Path
import sys
import shutil

import pyvips

src_filename = sys.argv[1]
dst_filename = sys.argv[2]

base = pyvips.Image.new_from_file(src_filename)
assert base.width == base.height

# When rendering rail tiles, we want a transparent background.

# Add an alpha channel, based on a grayscale copy of the image.
alpha = base.colourspace('b-w')
alpha = alpha + alpha.gaussblur(2)
base = base.bandjoin(alpha * 2)

# 6 zoom levels gives us a max zoom of 2^5 which is 32x32 tiles which is
# 8400/32 = 262.5-wide tiles which is roughly 256, so our highest zoom level is
# roughly 1:1 with the original source.
assert base.width == 16800 or base.width == 8400
base = base.resize(8192/8400)

# Render the image, so we don't re-run these operations for each tile.
base.write_to_file(str(dst_filename))

