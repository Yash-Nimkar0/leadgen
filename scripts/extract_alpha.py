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
    
    # Optional: dilate and erode to connect slightly disconnected parts of the same sprite
    mask = ndi.binary_closing(mask, structure=np.ones((5,5))).astype(int)
    
    labeled, num_features = ndi.label(mask)
    boxes = ndi.find_objects(labeled)
    
    count = 0
    for obj in boxes:
        if obj is None: continue
        sy, sx = obj
        y1, y2 = sy.start, sy.stop
        x1, x2 = sx.start, sx.stop
        w = x2 - x1
        h = y2 - y1
        
        if w < 20 or h < 20: continue
        if w / h > 2.5 and h < 50: continue # Likely a text label
        
        # We don't want to crop the mask, we want to crop the original image but ONLY keep the pixels for THIS component
        # to remove neighboring artifacts that might fall in the bounding box
        
        # Actually, if we just crop the image with the bounding box, it's usually fine if they don't overlap much.
        # But to be perfectly safe, we can apply the mask.
        comp_mask = (labeled[y1:y2, x1:x2] == labeled[y1 + h//2, x1 + w//2]).astype(np.uint8) * 255
        # Wait, the center pixel might not be part of the component.
        # Better: (labeled[y1:y2, x1:x2] > 0)
        # Actually, let's just crop the original image because DALL-E sprites usually don't overlap in their bounding boxes.
        
        cropped = img.crop((x1, y1, x2, y2))
        cropped.save(os.path.join(out_dir, f"asset_{count:02d}.png"))
        count += 1
        
    print(f"Saved {count} assets.")

extract("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_59_52 PM (7).png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw")
