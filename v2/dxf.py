#!/usr/bin/env python3
from pathlib import Path
import pickle
import sys

import ezdxf

dxf_path = "./dxf/19530101.dxf"
pickle_path = Path("./dxf_parsed.pickle")

#if pickle_path.exists():
#    with open(pickle_path, 'rb') as f:
#        doc = pickle.load(f)
#    print(f"read {pickle_path}", file=sys.stderr)
#else:
#    with open(pickle_path, 'wb') as f:
#        pickle.dump(doc, f)
#    print(f"wrote {pickle_path}", file=sys.stderr)

doc = ezdxf.readfile(dxf_path)
print(f"read {dxf_path}", file=sys.stderr)

msp = doc.modelspace()

f = open("./map/search-index.js", "w")
print('window.searchPoints = [', file=f)
for e in msp:
    # Whether the text is multi-line or not seems fairly arbitrary.
    if e.dxftype() == "MTEXT":
        text = e.text
        loc = e.dxf.insert
        x, y = loc.x, loc.y

    elif e.dxftype() == "TEXT":
        text = e.dxf.text
        loc = e.dxf.align_point
        x, y = loc.x, loc.y

    else:
        continue

    kind = e.dxf.layer
    assert kind.startswith('09-Names')
    kind = kind[len('09-Names'):]

    if kind in (
        # Text not useful
        "RoadClassA",
        "RoadClassAMileposts",
        "RailStructureNos",
        "RailZeroDatumPos",

        # Location not meaningful
        "BoundaryRegion",
    ):
        continue

    if kind not in (
        "SettlementPrimaryCity",
        "SettlementPrimaryTown",
        "SettlementSecondaryTown",
        "SettlementSecondaryVillage",
    ):
        continue

    x *= 0.001
    y *= 0.001

    for thing in (
        '\\T1.325;',
        '\\T1.813;',
        '\\T2.626;',
    ):
        if text.startswith(thing):
            text = text[len(thing):]
            break

    # Strip the height from a summit
    if kind == "FeatureSummit":
        assert text.endswith('m')
        assert "\\P" in text
        text, _, _ = text.partition("\\P")

    text = text.replace("\\P", " ")
    text = text.title()

    # Cleanup station names
    if kind == "RailStations": 
        if not text.endswith(" HALT"):
            assert text.endswith(" STA."), text
            text = text[:-len(" STA.")] + " STATION"
        text = text.title()

    print(f'{{"kind": "{kind}", "loc": xy({x:.3f}, {y:.3f}), "title": "{text}"}},', file=f)

print(']', file=f)
