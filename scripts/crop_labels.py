import os
from PIL import Image
import numpy as np

def crop_bottom(img_name, crop_h):
    path = f'apps/web/public/hero/raw/{img_name}'
    if not os.path.exists(path): return
    img = Image.open(path)
    # Crop crop_h pixels from the bottom
    cropped = img.crop((0, 0, img.width, img.height - crop_h))
    out_path = f'apps/web/public/hero/clean_{img_name}'
    cropped.save(out_path)

# Let's check how tall the labels are. 
# Asset 00 is 130x208. Label is at the bottom.
# I will just crop 35 pixels from the bottom of all labeled assets.
crop_bottom('asset_00.png', 32)
crop_bottom('asset_02.png', 32)
crop_bottom('asset_12.png', 32)
crop_bottom('asset_21.png', 32)
crop_bottom('asset_22.png', 32)
crop_bottom('asset_28.png', 32)
crop_bottom('asset_29.png', 32)
crop_bottom('asset_31.png', 32)
crop_bottom('asset_32.png', 32)
crop_bottom('asset_43.png', 32)

# Copy the ones that don't need cropping
os.system("cp apps/web/public/hero/raw/asset_01.png apps/web/public/hero/clean_asset_01.png")
os.system("cp apps/web/public/hero/raw/asset_19.png apps/web/public/hero/clean_asset_19.png")

print("Cropped labels.")
