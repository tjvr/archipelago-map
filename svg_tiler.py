#!/usr/bin/env python3
from pathlib import Path
import shlex
import subprocess
import sys

source = 'tmp/1953mapv1.opt.svg'
x_min, y_min = 755, 1511
x_max, y_max = 9827, 10583
print(f"{x_min}:{y_min}:{x_max}:{y_max}")

# At zoom level 0 there is one tile, etc.
min_zoom, max_zoom = 6,6

for z in range(min_zoom, max_zoom+1):
    steps = 2 ** z
    print(f"zoom level {z}: {steps} steps, {steps*steps} tiles")

    actions = [
        f"file-open:{source}",
    ]
    Path(f"tiles2/{z}/").mkdir(parents=True, exist_ok=True)

    for y in range(steps):
        for x in range(steps):
            x0 = int(x_min + x*(x_max-x_min)/steps)
            x1 = int(x_min + (x+1)*(x_max-x_min)/steps)

            y0 = int(y_min + y*(y_max-y_min)/steps)
            y1 = int(y_min + (y+1)*(y_max-y_min)/steps)

            out_width = 512
            out_height = 512

            actions += [
                # element-image-crop causes Inkscape to crash.
                f"export-area:{x0}:{y0}:{x1}:{y1}",
                f"export-filename:tiles2/{z}/{x}-{y}.png",
                f"export-width:{out_width}",
                f"export-height:{out_height}",
                "export-do",
            ]

    # Each inkscape command must be under ~100K bytes, which is around 5000
    # actions, or ~1000 tiles.
    command = [
        'inkscape',
        '--actions',
        "; ".join(actions),
    ]
    #print(" ".join(map(shlex.quote, command)))
    print(len(actions))
    print(len(command[2]))
    p = subprocess.Popen(command)
    p.wait()

