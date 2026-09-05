import numpy as np
from PIL import Image, ImageDraw
import scipy.ndimage as ndi

def debug_extract(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    np_img = np.array(img)
    
    # Mask based on alpha > 10 (ignore faint artifacts)
    alpha = np_img[:, :, 3]
    mask = (alpha > 10).astype(int)
    
    labeled, num_features = ndi.label(mask)
    boxes = ndi.find_objects(labeled)
    
    debug_img = img.copy()
    draw = ImageDraw.Draw(debug_img)
    
    valid = 0
    for obj in boxes:
        if obj is None: continue
        sy, sx = obj
        y1, y2 = sy.start, sy.stop
        x1, x2 = sx.start, sx.stop
        w = x2 - x1
        h = y2 - y1
        
        if w < 20 or h < 20: continue
        
        draw.rectangle([x1, y1, x2, y2], outline="green", width=2)
        valid += 1
            
    debug_img.save(out_path)
    print(f"Found {valid} components.")

debug_extract("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_59_52 PM (7).png", "scripts/debug_7.png")
