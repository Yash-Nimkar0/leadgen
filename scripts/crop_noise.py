import os
from PIL import Image

os.makedirs('apps/web/public/noise', exist_ok=True)

def copy_and_crop(in_name, out_name, crop_bottom=0):
    in_path = f'apps/web/public/hero/raw/{in_name}'
    if not os.path.exists(in_path): return
    img = Image.open(in_path)
    if crop_bottom > 0:
        img = img.crop((0, 0, img.width, img.height - crop_bottom))
    img.save(f'apps/web/public/noise/{out_name}')

# I don't remember exactly which ones had labels. Let's just crop 32px from all of them if they are tall enough.
# Wait, let's check if the bottom 32px has the label color (dark grey).
# Better to just use the contact sheet visually? No I can't look at it easily.
# I'll just check if there's a dark grey rectangle at the bottom.
def smart_crop(in_name, out_name):
    in_path = f'apps/web/public/hero/raw/{in_name}'
    if not os.path.exists(in_path): return
    img = Image.open(in_path).convert("RGBA")
    
    # Check bottom row of pixels
    # If a large percentage is dark grey, crop 32px
    pixels = list(img.crop((0, img.height - 10, img.width, img.height)).getdata())
    # dark grey is around rgb(22, 34, 49)
    dark_count = sum(1 for p in pixels if p[3] > 200 and p[0] < 50 and p[1] < 60 and p[2] < 70)
    
    if dark_count > img.width * 5: # At least half of the 10 bottom rows are dark
        print(f"Cropping label from {in_name}")
        img = img.crop((0, 0, img.width, img.height - 32))
    
    img.save(f'apps/web/public/noise/{out_name}')

# From previous run, I know the noise creatures are around 9 to 18.
smart_crop('asset_13.png', 'noise_01.png')
smart_crop('asset_14.png', 'noise_02.png')
smart_crop('asset_15.png', 'noise_03.png')
smart_crop('asset_16.png', 'noise_04.png')
smart_crop('asset_17.png', 'noise_05.png')
smart_crop('asset_18.png', 'noise_06.png')

print("Processed noise assets.")
