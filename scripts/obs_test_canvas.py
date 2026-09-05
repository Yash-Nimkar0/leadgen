from PIL import Image
import os

base_dir = "apps/web/public/hero"

bg = Image.open(f"{base_dir}/drift_bg.png").convert("RGBA")
platform = Image.open(f"{base_dir}/observatory_platform.png").convert("RGBA")
terminal = Image.open(f"{base_dir}/observatory_terminal.png").convert("RGBA")
blip = Image.open(f"{base_dir}/blip_idle.png").convert("RGBA")
signal = Image.open(f"{base_dir}/signal_active.png").convert("RGBA")

# Create a 1200x800 canvas
canvas = Image.new("RGBA", (1200, 800), (10, 13, 20, 255))

# Paste bg
canvas.paste(bg, (0, 0), bg)

# Resize assets slightly for the composition
platform = platform.resize((int(platform.width * 0.8), int(platform.height * 0.8)), Image.NEAREST)
terminal = terminal.resize((int(terminal.width * 0.4), int(terminal.height * 0.4)), Image.NEAREST)
blip = blip.resize((int(blip.width * 0.6), int(blip.height * 0.6)), Image.NEAREST)
signal = signal.resize((int(signal.width * 0.5), int(signal.height * 0.5)), Image.NEAREST)

# Position platform at bottom center
px = (1200 - platform.width) // 2
py = 800 - platform.height - 50
canvas.paste(platform, (px, py), platform)

# Position terminal on the platform
tx = px + platform.width // 2 - terminal.width // 2
ty = py - terminal.height + 150
canvas.paste(terminal, (tx, ty), terminal)

# Position blip and signal
canvas.paste(blip, (tx - 150, ty + 100), blip)
canvas.paste(signal, (tx + terminal.width // 2 - signal.width // 2, ty - 50), signal)

canvas.save(f"{base_dir}/obs_test_canvas.png")
print("Saved obs_test_canvas.png")
