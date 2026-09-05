import os
from PIL import Image

for i in range(1, 7):
    path = f"/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/creature_{i:02d}.png"
    if not os.path.exists(path): continue
    
    img = Image.open(path)
    w, h = img.size
    
    # Split exactly in half horizontally
    left = img.crop((0, 0, w//2, h))
    right = img.crop((w//2, 0, w, h))
    
    bbox_l = left.getbbox()
    if bbox_l: left.crop(bbox_l).save(f"/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/creature_{i:02d}_idle.png")
    
    bbox_r = right.getbbox()
    if bbox_r: right.crop(bbox_r).save(f"/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/creature_{i:02d}_active.png")
    
    os.remove(path)

print("Split creature pairs.")
