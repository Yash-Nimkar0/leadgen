from PIL import Image, ImageDraw
import os

path = "apps/web/public/hero/machine_meter.png"
out_path = "apps/web/public/hero/meter_needle_test.png"

if os.path.exists(path):
    img = Image.open(path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    
    # Draw a simple red line to represent the needle from the center
    w, h = img.size
    cx, cy = w // 2, h // 2
    # The pivot might not be exactly in the center of the image, let's just draw it around the center
    draw.line((cx, cy, cx + 150, cy - 150), fill=(255, 0, 0, 255), width=8)
    draw.ellipse((cx - 15, cy - 15, cx + 15, cy + 15), fill=(255, 0, 0, 255))
    
    img.save(out_path)
    print("Created meter needle test.")
