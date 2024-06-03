#!/usr/bin/env python3
from pathlib import Path
import shlex
import subprocess

source = 'tmp/1953mapv1.opt.svg'
x_min, y_min = 755, 1511
x_max, y_max = 9827, 10583
print(f"{x_min}:{y_min}:{x_max}:{y_max}")

# At zoom level 0 there is one tile, etc.

for z in range(2):
    steps = 2 ** z
    print(f"zoom level {z}: {steps} steps, {steps*steps} tiles")
    for y in range(steps):
        Path(f"tiles/{z}/{y}/").mkdir(parents=True, exist_ok=True)
        for x in range(steps):
            x0 = int(x_min + x*(x_max-x_min)/steps)
            x1 = int(x_min + (x+1)*(x_max-x_min)/steps)

            y0 = int(y_min + y*(y_max-y_min)/steps)
            y1 = int(y_min + (y+1)*(y_max-y_min)/steps)

            args = [
                'inkscape', 
                source,
                '--export-area',
                f"{x0}:{y0}:{x1}:{y1}",
                '--export-filename',
                f"tiles/{z}/{y}/{x}.png"
            ]
            print(" ".join(map(shlex.quote, args)))
            p = subprocess.Popen(args)
            p.wait()

