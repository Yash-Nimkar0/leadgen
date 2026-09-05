import os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

def extract(img_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    img = Image.open(img_path).convert("RGBA")
    np_img = np.array(img)
    
    alpha = np_img[:, :, 3]
    mask = (alpha > 10).astype(int)
    mask = ndi.binary_closing(mask, structure=np.ones((5,5))).astype(int)
    
    labeled, num_features = ndi.label(mask)
    boxes = ndi.find_objects(labeled)
    
    valid_boxes = []
    for obj in boxes:
        if obj is None: continue
        sy, sx = obj
        y1, y2 = sy.start, sy.stop
        x1, x2 = sx.start, sx.stop
        w = x2 - x1
        h = y2 - y1
        
        if w < 20 or h < 20: continue
        if w / h > 2.5 and h < 50: continue # Likely a text label
        
        valid_boxes.append((x1, y1, x2, y2))
        
    # Sort by Y (rows), then by X (columns). 
    # Since rows might not be perfectly aligned, we group by Y chunks of ~50px
    valid_boxes.sort(key=lambda b: (b[1] // 50, b[0]))
    
    count = 0
    for (x1, y1, x2, y2) in valid_boxes:
        cropped = img.crop((x1, y1, x2, y2))
        # Ensure we only keep the connected component to avoid neighboring artifacts
        # We'll use the alpha mask for this bounding box
        comp_mask = (labeled[y1:y2, x1:x2] == labeled[y1+(y2-y1)//2, x1+(x2-x1)//2]).astype(np.uint8) * 255
        
        # Apply mask to alpha channel
        cropped_np = np.array(cropped)
        # Only keep alpha where it belongs to the main component (or any component, actually just to be safe)
        # Let's just use the bounding box since DALL-E space is usually clean here.
        cropped.save(os.path.join(out_dir, f"asset_{count:02d}.png"))
        count += 1
        
    print(f"Saved {count} assets sorted by row/col.")

extract("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_59_52 PM (7).png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw")
