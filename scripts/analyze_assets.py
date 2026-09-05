from PIL import Image
import os
import json

assets = [
    "factory_conveyor.png",
    "machine_scanner.png",
    "machine_meter.png",
    "machine_refinery.png",
    "chute_glow.png"
]

base_dir = "apps/web/public/hero"
report = {}

for asset in assets:
    path = os.path.join(base_dir, asset)
    if not os.path.exists(path):
        continue
    
    with Image.open(path) as img:
        # Get 4 corners
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((img.width - 1, 0)),
            img.getpixel((0, img.height - 1)),
            img.getpixel((img.width - 1, img.height - 1))
        ]
        
        # Look at a 10x10 grid in the top-left to detect checkerboard
        sample_grid = []
        for x in range(10):
            for y in range(10):
                sample_grid.append(img.getpixel((x, y)))
                
        unique_colors = list(set(sample_grid))
        
        report[asset] = {
            "format": img.format,
            "mode": img.mode,
            "dimensions": img.size,
            "corner_colors": corners,
            "unique_corner_colors": len(unique_colors)
        }

print(json.dumps(report, indent=2))
