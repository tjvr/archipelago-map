#!/usr/bin/env python3
from xml.dom import minidom

print('parsing')
doc = minidom.parse("tmp/1953mapv1.svg")

# There should be a single SVG with a single group.
svg, = doc.getElementsByTagName('svg')
g, = svg.getElementsByTagName('g')

print('cloning')
result = doc.cloneNode(deep=True)

print('iterating')
last = None
last_2 = None
group = []
groups = [group]
for el in g.childNodes:
    if isinstance(el, minidom.Text):
        continue
    style = el.getAttribute('style')
    continue_group = any((
        last is None,
        last == style,
        last_2 is None,
        last_2 == style,
    ))
    if continue_group:
        group.append(el)
    else:
        group = [el]
        groups.append(group)
    last_2, last = last, style

for group in groups:
    count = len(group)
    style = group[0].getAttribute('style')
    print(count, style)
