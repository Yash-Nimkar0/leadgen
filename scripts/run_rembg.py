from rembg import remove
from PIL import Image
import os

assets = [
    "factory_conveyor.png",
    "machine_scanner.png",
    "machine_meter.png",
    "machine_refinery.png",
    "chute_glow.png"
]

base_dir = "apps/web/public/hero"
# We'll use the raw generated images which I copied earlier!
# Oh wait, I overwrote the files in apps/web/public/hero/ with my failed flood fill!
# Let me re-copy the original images from the artifact directory first.

