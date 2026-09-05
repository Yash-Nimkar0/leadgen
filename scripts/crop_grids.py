import os
from PIL import Image

def crop_grid(img_path, cols, rows, out_dir, prefix):
    img = Image.open(img_path)
    w, h = img.size
    cw = w // cols
    ch = h // rows
    
    os.makedirs(out_dir, exist_ok=True)
    
    count = 1
    for r in range(rows):
        for c in range(cols):
            box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
            cropped = img.crop(box)
            # Find actual bounding box of non-transparent pixels
            bbox = cropped.getbbox()
            if bbox:
                cropped = cropped.crop(bbox)
                out_path = os.path.join(out_dir, f"{prefix}_{count:02d}.png")
                cropped.save(out_path)
                print(f"Saved {out_path}")
            count += 1

crop_grid("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw/blip_basic_full.png", 2, 1, "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero", "blip_basic")
crop_grid("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw/blip_sheet_full.png", 5, 2, "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero", "blip")
crop_grid("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw/noise_creatures_full.png", 3, 2, "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero", "creature")

# For the dark environment, we can manually crop out the first huge galaxy/planet section
# The top part of env_dark (Image 6) contains backgrounds
env_img = Image.open("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw/env_dark_full.png")
# Let's crop a generic background block from it
bg = env_img.crop((0, 700, 1536, 1024))
bg_box = bg.getbbox()
if bg_box:
    bg.crop(bg_box).save("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/bg_nebula.png")

# Let's crop a floating island from the 4th image (3_09_30 PM)
# Need to make transparent first
env2_img = Image.open("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_09_30 PM.png").convert("RGBA")
pixels = env2_img.load()
w, h = env2_img.size
mask = Image.new('L', (w, h), 0)
mask_pixels = mask.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r < 240 or g < 240 or b < 240:
            mask_pixels[x, y] = 255
env2_img.putalpha(mask)

# Crop out two floating islands (one big, one small)
island_large = env2_img.crop((0, 180, 400, 500))
island_l_box = island_large.getbbox()
if island_l_box: island_large.crop(island_l_box).save("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/fragment_large.png")

island_small = env2_img.crop((920, 230, 1160, 400))
island_s_box = island_small.getbbox()
if island_s_box: island_small.crop(island_s_box).save("/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/fragment_small.png")

print("Done cropping.")
