from PIL import Image
import os
import sys

def color_distance(c1, c2):
    return sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))

def remove_background(image_path):
    img = Image.open(image_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # Sample background colors from corners
    samples = []
    for x in (0, width-1):
        for y in (0, height-1):
            samples.append(pixels[x, y])
            
    # Also sample the midpoints of the edges
    samples.append(pixels[width//2, 0])
    samples.append(pixels[width//2, height-1])
    samples.append(pixels[0, height//2])
    samples.append(pixels[width-1, height//2])
    
    bg_colors = samples
    tolerance = 25 # Manhattan distance for RGB
    
    # Flood fill to find all connected background pixels
    # We treat any pixel that is close to ANY of the bg_colors as a background pixel
    visited = set()
    stack = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    while stack:
        x, y = stack.pop()
        if (x, y) in visited:
            continue
            
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        visited.add((x, y))
        p = pixels[x, y]
        
        # Check if it matches any background color
        is_bg = False
        for bg in bg_colors:
            if color_distance(p, bg) < tolerance:
                is_bg = True
                break
                
        if is_bg:
            pixels[x, y] = (0, 0, 0, 0) # Make transparent
            stack.append((x+1, y))
            stack.append((x-1, y))
            stack.append((x, y+1))
            stack.append((x, y-1))

    # Second pass: trim the image (crop out transparent borders)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(image_path)
    print(f"Cleaned {image_path} (new size: {img.width}x{img.height})")

assets = [
    "factory_conveyor.png",
    "machine_scanner.png",
    "machine_meter.png",
    "machine_refinery.png",
    "chute_glow.png"
]

base_dir = "apps/web/public/hero"
for asset in assets:
    path = os.path.join(base_dir, asset)
    if os.path.exists(path):
        remove_background(path)

