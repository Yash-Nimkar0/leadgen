from PIL import Image
import os
import glob

def get_border_colors(img, thickness=2):
    pixels = img.load()
    w, h = img.size
    colors = []
    for x in range(w):
        for y in range(thickness):
            colors.append(pixels[x, y])
            colors.append(pixels[x, h - 1 - y])
    for y in range(h):
        for x in range(thickness):
            colors.append(pixels[x, y])
            colors.append(pixels[w - 1 - x, y])
    return colors

def cluster_colors(colors, tolerance=30):
    clusters = []
    for c in colors:
        c_rgb = c[:3]
        found = False
        for cluster in clusters:
            ref_rgb = cluster['color']
            dist = sum(abs(a - b) for a, b in zip(c_rgb, ref_rgb))
            if dist < tolerance:
                cluster['count'] += 1
                found = True
                break
        if not found:
            clusters.append({'color': c_rgb, 'count': 1})
    clusters.sort(key=lambda x: x['count'], reverse=True)
    return clusters

def remove_bg_flood_fill(image_path, out_path):
    img = Image.open(image_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    
    border_colors = get_border_colors(img, 4)
    clusters = cluster_colors(border_colors)
    
    # A checkerboard usually has 2 main colors. Let's take the top 2 clusters if they are prominent.
    bg_colors = []
    total_samples = len(border_colors)
    for c in clusters[:4]:
        if c['count'] > total_samples * 0.1: # At least 10% of border
            bg_colors.append(c['color'])
            
    if not bg_colors:
        print(f"No clear background for {image_path}")
        return
        
    print(f"Found BG colors for {os.path.basename(image_path)}: {[c for c in bg_colors]}")
    
    # Flood fill starting from all border pixels
    visited = set()
    stack = []
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))
        
    tolerance = 45 # Increased tolerance for checkerboard interpolation
    
    while stack:
        x, y = stack.pop()
        if (x, y) in visited: continue
        
        visited.add((x, y))
        
        # Check color distance
        p = pixels[x, y][:3]
        is_bg = False
        for bg in bg_colors:
            if sum(abs(a - b) for a, b in zip(p, bg)) < tolerance:
                is_bg = True
                break
                
        if is_bg:
            pixels[x, y] = (0, 0, 0, 0)
            if x > 0: stack.append((x - 1, y))
            if x < w - 1: stack.append((x + 1, y))
            if y > 0: stack.append((x, y - 1))
            if y < h - 1: stack.append((x, y + 1))
            
    # Crop
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    img.save(out_path)
    print(f"Cleaned {out_path}, new size {img.size}")

artifact_dir = "/Users/yashnimkar/.gemini/antigravity/brain/84961bd2-f799-431c-8e5e-9cfed1696464"
base_dir = "apps/web/public/hero"

assets_map = {
    "factory_conveyor.png": "factory_conveyor_*.jpg",
    "machine_scanner.png": "machine_scanner_*.jpg",
    "machine_meter.png": "machine_meter_*.jpg",
    "machine_refinery.png": "machine_refinery_*.jpg",
    "chute_glow.png": "chute_glow_*.jpg"
}

for out_name, pattern in assets_map.items():
    matches = glob.glob(os.path.join(artifact_dir, pattern))
    if matches:
        in_path = matches[0]
        out_path = os.path.join(base_dir, out_name)
        remove_bg_flood_fill(in_path, out_path)

