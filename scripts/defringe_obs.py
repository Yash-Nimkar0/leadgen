from PIL import Image
import os

base_dir = "apps/web/public/hero"
assets = [
    "observatory_platform.png",
    "observatory_terminal.png"
]

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

for asset in assets:
    path = os.path.join(base_dir, asset)
    if os.path.exists(path):
        defringe(path)
