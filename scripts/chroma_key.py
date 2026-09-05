from PIL import Image
import glob
import os

artifact_dir = "/Users/yashnimkar/.gemini/antigravity/brain/84961bd2-f799-431c-8e5e-9cfed1696464"
base_dir = "apps/web/public/hero"

assets_map = {
    "factory_conveyor.png": "factory_conveyor_v2_*.jpg",
    "machine_scanner.png": "machine_scanner_v2_*.jpg",
    "machine_meter.png": "machine_meter_v2_*.jpg",
    "machine_refinery.png": "machine_refinery_v2_*.jpg",
    "chute_glow.png": "chute_glow_v2_*.jpg"
}

def remove_magenta(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # We want to remove pixels that are very close to #FF00FF
    # In JPEG, it might be (255, 0, 255), or (250, 10, 240), etc.
    # We can calculate distance to pure magenta:
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Distance to magenta (255, 0, 255)
            # A pixel is magenta if it has high R, high B, and low G.
            # Using a ratio is safer.
            if r > 180 and b > 180 and g < 100:
                # Calculate alpha based on how close it is to magenta? No, just hard cutoff for pixel art.
                pixels[x, y] = (0, 0, 0, 0)
                
    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path, format="PNG")
    print(f"Keyed {out_path} - new size {img.size}")

for out_name, pattern in assets_map.items():
    matches = glob.glob(os.path.join(artifact_dir, pattern))
    if matches:
        # get the latest one
        matches.sort(key=os.path.getmtime, reverse=True)
        in_path = matches[0]
        out_path = os.path.join(base_dir, out_name)
        remove_magenta(in_path, out_path)

