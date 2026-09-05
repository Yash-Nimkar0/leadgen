import os
from PIL import Image

assets_dir = "/Users/yashnimkar/Desktop/Leadgen/assets"
for file in sorted(os.listdir(assets_dir)):
    if file.endswith(".png"):
        path = os.path.join(assets_dir, file)
        with Image.open(path) as img:
            print(f"{file}: {img.size}, mode: {img.mode}, format: {img.format}")
