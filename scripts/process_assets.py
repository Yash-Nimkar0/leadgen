from rembg import remove
from PIL import Image
import os
import glob

# Step 1: Copy original JPGs from artifact dir to public/hero
artifact_dir = "/Users/yashnimkar/.gemini/antigravity/brain/84961bd2-f799-431c-8e5e-9cfed1696464"
base_dir = "apps/web/public/hero"

assets_map = {
    "factory_conveyor.png": "factory_conveyor_*.jpg",
    "machine_scanner.png": "machine_scanner_*.jpg",
    "machine_meter.png": "machine_meter_*.jpg",
    "machine_refinery.png": "machine_refinery_*.jpg",
    "chute_glow.png": "chute_glow_*.jpg"
}

for out_name, pattern in assets_map.items():
    matches = glob.glob(os.path.join(artifact_dir, pattern))
    if not matches:
        print(f"No match for {pattern}")
        continue
    
    in_path = matches[0]
    out_path = os.path.join(base_dir, out_name)
    
    print(f"Processing {in_path} -> {out_path}")
    
    # Read raw image
    with open(in_path, 'rb') as i:
        input_data = i.read()
    
    # Remove background using rembg
    output_data = remove(input_data)
    
    # Save temporarily to parse with PIL
    temp_path = out_path + ".tmp.png"
    with open(temp_path, 'wb') as o:
        o.write(output_data)
        
    # Crop bounds
    with Image.open(temp_path) as img:
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            img.save(out_path)
            print(f"Saved {out_path} with bounds {bbox}")
        else:
            print(f"Empty image? {out_path}")
            
    os.remove(temp_path)

print("Done processing assets.")
