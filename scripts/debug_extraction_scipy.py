import numpy as np
from PIL import Image, ImageDraw
import scipy.ndimage as ndi

def debug_extract(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    np_img = np.array(img)
    
    # Mask of non-white pixels
    r, g, b = np_img[:, :, 0], np_img[:, :, 1], np_img[:, :, 2]
    mask = ((r < 240) | (g < 240) | (b < 240)).astype(int)
    
    # Label connected components
    labeled, num_features = ndi.label(mask)
    
    # Find bounding boxes
    boxes = ndi.find_objects(labeled)
    
    debug_img = img.copy()
    draw = ImageDraw.Draw(debug_img)
    
    valid_boxes = []
    label_boxes = []
    
    for obj in boxes:
        if obj is None: continue
        sy, sx = obj
        y1, y2 = sy.start, sy.stop
        x1, x2 = sx.start, sx.stop
        w = x2 - x1
        h = y2 - y1
        
        if w < 20 or h < 20: continue
        
        aspect = w / h
        if aspect > 2.5 and h < 50:
            label_boxes.append((x1, y1, x2, y2))
            draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
        else:
            valid_boxes.append((x1, y1, x2, y2))
            draw.rectangle([x1, y1, x2, y2], outline="green", width=2)
            
    debug_img.save(out_path)
    print(f"Found {len(valid_boxes)} sprites, {len(label_boxes)} labels.")

debug_extract("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_59_52 PM (7).png", "scripts/debug_7.png")
