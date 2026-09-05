import cv2
import numpy as np
from PIL import Image

def debug_extract(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    np_img = np.array(img)
    
    # We will detect the background. The background might be white.
    # Let's create a mask of non-white pixels.
    # White is roughly R>240, G>240, B>240.
    # Wait, earlier I found that alpha is 0 for background. 
    # Let's use alpha channel if it's reliable.
    alpha = np_img[:, :, 3]
    if np.max(alpha) < 255: # meaning it has some transparency, but max is 254?
        pass # DALL-E uses 254 max alpha sometimes.
    
    # Let's just use RGB white-detection to be safe, since DALL-E "white" backgrounds are often just white.
    r, g, b = np_img[:, :, 0], np_img[:, :, 1], np_img[:, :, 2]
    mask = ((r < 240) | (g < 240) | (b < 240)).astype(np.uint8) * 255
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    debug_img = cv2.cvtColor(np_img[:, :, :3], cv2.COLOR_RGB2BGR)
    
    valid_boxes = []
    label_boxes = []
    
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w < 20 or h < 20: continue
        
        # Detect if it's a label. Labels are dark rounded rects, usually wide and short.
        # Aspect ratio > 3, and height < 40?
        aspect = w / h
        if aspect > 2.5 and h < 50:
            label_boxes.append((x, y, w, h))
            cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0, 0, 255), 2) # Red for labels
        else:
            valid_boxes.append((x, y, w, h))
            cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0, 255, 0), 2) # Green for sprites
            
    cv2.imwrite(out_path, debug_img)
    print(f"Found {len(valid_boxes)} sprites, {len(label_boxes)} labels.")

debug_extract("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_59_52 PM (7).png", "scripts/debug_7.png")
