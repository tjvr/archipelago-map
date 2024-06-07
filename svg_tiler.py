#!/usr/bin/env python3
import itertools
import math
from pathlib import Path
import shlex
import subprocess
import sys
import time

def log(message):
    print(message, file=sys.stderr)


source = 'tmp/1953mapv1.opt.svg'
x_min, y_min = 755, 1511
x_max, y_max = 9827, 10583
log(f"{x_min}:{y_min}:{x_max}:{y_max}")

# At zoom level 0 there is one tile, etc.
min_zoom, max_zoom = 4,6

# Individual tiles at all zoom levels will be 256x256px.
tile_size = 256

def generate_tiles(): 
    for z in range(min_zoom, max_zoom+1):
        steps = 2 ** z

        log(f"zoom level {z}: {steps*steps} tiles")

        for y in range(steps):
            Path(f"tmp/tiles/{z}/{y}/").mkdir(parents=True, exist_ok=True)
            for x in range(steps):
                x0 = int(x_min + x*(x_max-x_min)/steps)
                x1 = int(x_min + (x+1)*(x_max-x_min)/steps)

                y0 = int(y_min + y*(y_max-y_min)/steps)
                y1 = int(y_min + (y+1)*(y_max-y_min)/steps)
                
                filename = f"tmp/tiles/{z}/{y}/{x}.png"
                if Path(filename).exists():
                    continue

                yield [
                    # element-image-crop causes Inkscape to crash.
                    f"export-area:{x0}:{y0}:{x1}:{y1}",
                    f"export-filename:{filename}",
                    # TODO do we have to set these every time?
                    f"export-width:{tile_size}",
                    f"export-height:{tile_size}",
                    "export-do",
                ]

tiles = list(generate_tiles())
log(f"total {len(tiles)} tiles")

# Run at least this many copies of Inkscape.
min_jobs = 8
# Each inkscape command must be under ~100K bytes, which is around 5000
# actions, or ~1000 tiles.
batch_size = min(1000, int(math.ceil(len(tiles)/min_jobs)))

batches = list(itertools.batched(tiles, batch_size))
log(f"{len(batches)} copies of Inkscape, batch size {batch_size}")

processes = []
for tiles in batches:
    # We export multiple tiles from each invocation of Inkscape, because the
    # time to load in the SVG is much greater than the time to export each
    # tile.
    actions = [
        f"file-open:{source}",
    ]
    for tile_actions in tiles:
        actions += tile_actions

    command = [
        'inkscape',
        '--actions',
        "; ".join(actions),
    ]
    #print(" ".join(map(shlex.quote, command)))
    p = subprocess.Popen(command)
    processes.append(p)
    # Make stderr a pipe so that Inkscape doesn't crash??
    #, stderr=subprocess.PIPE)

    # Ratelimit starting jobs; otherwise Inkscape reports a dbus error.
    time.sleep(1)

for p in processes:
    returncode = p.wait()
    print(f"Inkscape exited {returncode}")

