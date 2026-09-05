import os
from PIL import Image, ImageDraw, ImageFont

img_w = 2000
img_h = 2000
contact = Image.new('RGBA', (img_w, img_h), (255, 255, 255, 255))
draw = ImageDraw.Draw(contact)

x, y = 0, 0
max_h = 0

for i in range(45):
    path = f'apps/web/public/hero/raw/asset_{i:02d}.png'
    if not os.path.exists(path): continue
    
    img = Image.open(path)
    if x + img.width > img_w:
        x = 0
        y += max_h + 30
        max_h = 0
        
    contact.paste(img, (x, y), img)
    draw.text((x, y + img.height), f"asset_{i:02d}", fill="black")
    
    x += img.width + 30
    max_h = max(max_h, img.height)

contact.save("apps/web/public/hero/raw/contact.png")
print("Saved contact.png")
