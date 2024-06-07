#!/usr/bin/env python3

from pathlib import Path

source_root = Path("tmp/tiles")
dest_root = Path("static/tiles")

for source in source_root.rglob("**/*.png"):
    dest = dest_root / source.relative_to(source_root)
    Path(dest.parent).mkdir(parents=True, exist_ok=True)
    print('cwebp', '-preset', 'text', source, '-o', dest.with_suffix(".webp"))



