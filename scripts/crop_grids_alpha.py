import os
from PIL import Image

def crop_grid(img_path, cols, rows, out_dir, prefix):
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    cw = w // cols
    ch = h // rows
    
    os.makedirs(out_dir, exist_ok=True)
    
    count = 1
    for r in range(rows):
        for c in range(cols):
            box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
            cropped = img.crop(box)
            
            # Find bounding box based on alpha channel
            alpha = cropped.split()[3]
            bbox = alpha.getbbox()
            
            if bbox:
                cropped = cropped.crop(bbox)
                out_path = os.path.join(out_dir, f"{prefix}_{count:02d}.png")
                cropped.save(out_path)
                print(f"Saved {out_path}")
            count += 1

# Extracting from the ORIGINAL files this time!
# Image 1: 2 poses
crop_grid("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_53_23 PM.png", 2, 1, "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero", "blip_basic")
# Image 2: 10 poses
crop_grid("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_57_00 PM.png", 5, 2, "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero", "blip")
# Image 3: 6 pairs
crop_grid("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_59_46 PM.png", 3, 2, "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero", "creature")

print("Splitting creatures...")
for i in range(1, 7):
    path = f"/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/creature_{i:02d}.png"
    if not os.path.exists(path): continue
    
    img = Image.open(path)
    w, h = img.size
    
    # Split exactly in half horizontally
    left = img.crop((0, 0, w//2, h))
    right = img.crop((w//2, 0, w, h))
    
    bbox_l = left.split()[3].getbbox()
    if bbox_l: left.crop(bbox_l).save(f"/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/creature_{i:02d}_idle.png")
    
    bbox_r = right.split()[3].getbbox()
    if bbox_r: right.crop(bbox_r).save(f"/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/creature_{i:02d}_active.png")
    
    os.remove(path)

# Image 4 (03_09_30 PM) is also transparent. Let's crop the fragments out of it.
env2_img = Image.open("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_09_30 PM.png").convert("RGBA")
# Island large
island_large = env2_img.crop((0, 180, 400, 500))
island_l_box = island_large.split()[3].getbbox()
if island_l_box: island_large.crop(island_l_box).save("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/fragment_large.png")

# Island small
island_small = env2_img.crop((920, 230, 1160, 400))
island_s_box = island_small.split()[3].getbbox()
if island_s_box: island_small.crop(island_s_box).save("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/fragment_small.png")

# Image 6 (03_14_57 PM) does NOT have alpha. So I must handle it for the background.
# Wait, background doesn't strictly need alpha if it's the backmost layer, 
# but it has a solid black background. A solid dark background for bg_nebula is fine.
env_img = Image.open("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_14_57 PM.png")
bg = env_img.crop((0, 700, 1536, 1024))
bg.save("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/bg_nebula.png")

print("Done fixing alpha crops.")
