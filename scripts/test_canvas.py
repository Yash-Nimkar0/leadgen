from PIL import Image
import os

base_dir = "apps/web/public/hero"

def load(name):
    path = os.path.join(base_dir, name)
    if os.path.exists(path):
        return Image.open(path).convert("RGBA")
    return None

new_assets = {
    "Conveyor": load("factory_conveyor.png"),
    "Scanner": load("machine_scanner.png"),
    "Meter": load("machine_meter.png"),
    "Refinery": load("machine_refinery.png"),
    "Chute": load("chute_glow.png")
}

existing_assets = {
    "Blip": load("blip_idle.png"),
    "Signal Idle": load("signal_idle.png"),
    "Signal Active": load("signal_active.png"),
    "Fragment": load("fragment_large.png")
}

# Create a large neutral canvas (e.g., 2000x1500)
canvas = Image.new("RGBA", (2400, 1500), (40, 44, 52, 255)) # dark slate gray

# Layout constants
margin = 50
x_offset = margin
y_offset = margin
max_height = 0

# Draw new assets in a row
for name, img in new_assets.items():
    if not img: continue
    # scale if too huge? Let's just place them as is so we can judge scale!
    if x_offset + img.width > canvas.width - margin:
        x_offset = margin
        y_offset += max_height + margin
        max_height = 0
        
    canvas.paste(img, (x_offset, y_offset), img)
    x_offset += img.width + margin
    max_height = max(max_height, img.height)

# Next row for existing assets
y_offset += max_height + 100
x_offset = margin
max_height = 0

for name, img in existing_assets.items():
    if not img: continue
    canvas.paste(img, (x_offset, y_offset), img)
    x_offset += img.width + margin
    max_height = max(max_height, img.height)
    
canvas.save(os.path.join(base_dir, "test_canvas.png"))
print("Saved test_canvas.png")

