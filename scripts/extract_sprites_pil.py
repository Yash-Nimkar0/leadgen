import os
from PIL import Image, ImageMath

def extract_sprites(image_path, out_dir, prefix, bg_color='white'):
    img = Image.open(image_path).convert("RGBA")
    
    # Create mask: true where pixel is NOT background
    # For white, background is roughly R>240, G>240, B>240
    # For dark, background is roughly R<20, G<20, B<20
    
    pixels = img.load()
    width, height = img.size
    
    mask = Image.new('L', img.size, 0)
    mask_pixels = mask.load()
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if bg_color == 'white':
                if r < 240 or g < 240 or b < 240:
                    mask_pixels[x, y] = 255
            else:
                if r > 25 or g > 25 or b > 35:
                    mask_pixels[x, y] = 255

    # Since there's no findContours in PIL, we can do a simple grid split or connected components.
    # Actually, the user just wants standard images.
    # Let's crop manually for Blip since it's a known grid.
    
    os.makedirs(out_dir, exist_ok=True)
    
    # Just save the transparent version first to see if transparency worked
    transparent_img = img.copy()
    transparent_img.putalpha(mask)
    transparent_img.save(os.path.join(out_dir, f"{prefix}_full.png"))
    print(f"Saved transparent full image to {out_dir}/{prefix}_full.png")

extract_sprites("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_53_23 PM.png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw", "blip_basic", "white")
extract_sprites("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_57_00 PM.png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw", "blip_sheet", "white")
extract_sprites("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 02_59_46 PM.png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw", "noise_creatures", "white")
extract_sprites("/Users/yashnimkar/Desktop/Leadgen/assets/ChatGPT Image Sep 4, 2026, 03_14_57 PM.png", "/Users/yashnimkar/Desktop/Leadgen/apps/web/public/hero/raw", "env_dark", "dark")
