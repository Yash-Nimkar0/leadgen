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
        
        has_alpha = img.mode == "RGBA"
        transparent_pixels = 0
        if has_alpha:
            pixels = img.load()
            for x in range(img.width):
                for y in range(img.height):
                    if pixels[x, y][3] == 0:
                        transparent_pixels += 1
                        
        report[asset] = {
            "format": img.format,
            "dimensions": f"{img.width}x{img.height}",
            "alpha": has_alpha,
            "transparency": f"{(transparent_pixels / (img.width * img.height) * 100):.1f}% transparent" if has_alpha else "None"
        }

print(json.dumps(report, indent=2))
