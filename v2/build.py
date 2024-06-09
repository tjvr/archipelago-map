#!/usr/bin/env python3
from pathlib import Path
from pprint import pprint
import shlex
import subprocess
import sys

# 1 Topographic
# 2 Railway
# 3 Road
# 4 Complete

src_root = Path('./src/')
dest_root = Path('./tmp/')

# 256px @1.5x
tile_size = 384

dry_run = '--dry-run' in sys.argv

processes = []
vector_files = []
for src in src_root.rglob('*.pdf'):
    dest = dest_root / src.relative_to(src_root).with_suffix('.svg')
    vector_files.append(dest)

    actions = [
        f"file-open:{src}",
        f"export-filename:{dest}",
        "export-do",
    ]

    command = [
        'inkscape',
        '--actions',
        "; ".join(actions),
    ]
    print(" ".join(map(shlex.quote, command)))
    if not dry_run:
        p = subprocess.Popen(command)
        processes.append(p)

for p in processes:
    returncode = p.wait()
    print(f"Inkscape exited {returncode}")

processes = []
image_files = []
for src in vector_files:
    #dest = dest_root / src.relative_to(src_root).with_suffix('.svg')
    #actions = [
    #    f"file-open:{src}",
    #    f"export-filename:{dest}",
    #    "export-do",
    #]

    dest = dest_root / src.relative_to(dest_root).with_suffix('.png')
    image_files.append(dest)

    actions = [
        f"file-open:{src}",
        f"export-filename:{dest}",
        f"export-width:{2**6 * tile_size}",
        f"export-height:{2**6 * tile_size}",
        "export-do",
    ]

    command = [
        'inkscape',
        '--actions',
        "; ".join(actions),
    ]
    print(" ".join(map(shlex.quote, command)))
    if not dry_run:
        p = subprocess.Popen(command)
        processes.append(p)

for p in processes:
    returncode = p.wait()
    print(f"Inkscape exited {returncode}")

processes = []
for src in image_files:
    name = src.stem
    dest = Path(f"tiles/{name}")
    dest.mkdir(parents=True, exist_ok=True) #False)
    command = [
        "vips", "dzsave", src, dest,
        "--overlap", "0",
        "--layout", "google",
        "--suffix", ".png",
        "--background", "216,248,248,1", # water
        #"--suffix", ".webp[Q=100]",
        "--tile-size", tile_size,
        "--skip-blanks", "-1", # don't skip blanks -- TODO undo this
        "--depth", "onetile",
    ]
    print(" ".join(map(shlex.quote, map(str, command))))
    if not dry_run:
        p = subprocess.Popen(map(str, command))
        processes.append(p)

for p in processes:
    returncode = p.wait()
    print(f"vips exited {returncode}")

