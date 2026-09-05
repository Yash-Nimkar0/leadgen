from PIL import Image
import glob
import os

artifact_dir = "/Users/yashnimkar/.gemini/antigravity/brain/84961bd2-f799-431c-8e5e-9cfed1696464"
base_dir = "apps/web/public/hero"

assets_map = {
    "station_receiver.png": "station_receiver_*.jpg"
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

def defringe(img_path):
    img = Image.open(img_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    to_remove = []
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if pixels[nx, ny][3] == 0:
                            is_edge = True
                            break
                    else:
                        is_edge = True
                        
                if is_edge:
                    if r > g + 20 and b > g + 20:
                        to_remove.append((x, y))
                        
    for x, y in to_remove:
        pixels[x, y] = (0, 0, 0, 0)
        
    img.save(img_path)
    print(f"Defringed {img_path} (removed {len(to_remove)} halo pixels)")

for out_name, pattern in assets_map.items():
    matches = glob.glob(os.path.join(artifact_dir, pattern))
    if matches:
        matches.sort(key=os.path.getmtime, reverse=True)
        in_path = matches[0]
        out_path = os.path.join(base_dir, out_name)
        remove_magenta(in_path, out_path)
        defringe(out_path)

