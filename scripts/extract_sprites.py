import cv2
import numpy as np
from PIL import Image
import os

def extract_sprites(image_path, out_dir, prefix, bg_color='white'):
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Failed to load {image_path}")
        return

    # Convert to RGBA if not already
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        
    # Create mask for background
    if bg_color == 'white':
        # White background often has some JPEG artifacts if DALL-E, let's use a threshold
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    else:
        # Dark background
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 20, 255, cv2.THRESH_BINARY)
        
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    count = 0
    os.makedirs(out_dir, exist_ok=True)
    
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w < 50 or h < 50: # ignore noise
            continue
            
        # Extract sprite
        sprite = img[y:y+h, x:x+w].copy()
        
        # Make background transparent in the sprite
        sprite_mask = mask[y:y+h, x:x+w]
        sprite[:, :, 3] = sprite_mask
        
        out_path = os.path.join(out_dir, f"{prefix}_{count:02d}.png")
        cv2.imwrite(out_path, sprite)
        count += 1
    print(f"Extracted {count} sprites from {os.path.basename(image_path)} to {out_dir}")

extract_sprites("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_53_23 PM.png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw", "blip_basic", "white")
extract_sprites("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_57_00 PM.png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw", "blip_sheet", "white")
extract_sprites("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_59_46 PM.png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw", "noise_creatures", "white")
