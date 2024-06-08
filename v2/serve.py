#!/usr/bin/env python3
import http.server
import io
from matplotlib import font_manager
from PIL import Image, ImageFont
from PIL.ImageDraw import Draw
import re
import socketserver

PORT = 1953
tile_size = 384

pat = re.compile(r'/gentiles/([a-z]+)/([0-9-]+)/([0-9-]+)/([0-9-]+).png')

def color_channel(bits):
    return (bits & 0x7f) | 0x80

file = font_manager.findfont('DejaVu Sans')
font = ImageFont.truetype(file, 32)

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        m = pat.match(self.path) 
        if not m:
            return super().do_GET()

        name, z, y, x = m.groups()

        id = hash((z, y, x))
        background = color_channel(id >> 16), color_channel(id >> 8), color_channel(id >> 0), 255
        tile = Image.new('RGBA', size=(tile_size, tile_size), color=background)
        draw = Draw(tile)

        draw.text((tile_size/2, tile_size/2), f"{x},{y}\n@{z}", font=font, fill=(0, 0, 0), anchor='mm')

        f = io.BytesIO()
        tile.save(f, format='PNG')
        raw_image = f.getvalue()

        self.send_header("Content-type", 'image/png')
        self.send_header("Content-Length", str(len(raw_image)))
        self.wfile.write(raw_image)


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()

