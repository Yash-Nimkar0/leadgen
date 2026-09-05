from PIL import Image
import glob
import os

artifact_dir = "/Users/yashnimkar/.gemini/antigravity/brain/84961bd2-f799-431c-8e5e-9cfed1696464"
base_dir = "apps/web/public/hero"

assets_map = {
    "observatory_platform.png": "observatory_platform_*.jpg",
    "observatory_terminal.png": "observatory_terminal_*.jpg"
}

def remove_magenta(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r > 180 and b > 180 and g < 100:
                pixels[x, y] = (0, 0, 0, 0)
                
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path, format="PNG")
    print(f"Keyed {out_path} - new size {img.size}")

for out_name, pattern in assets_map.items():
    matches = glob.glob(os.path.join(artifact_dir, pattern))
    if matches:
        matches.sort(key=os.path.getmtime, reverse=True)
        in_path = matches[0]
        out_path = os.path.join(base_dir, out_name)
        remove_magenta(in_path, out_path)

