from PIL import Image
import os

path = "apps/web/public/hero/factory_conveyor.png"

if os.path.exists(path):
    img = Image.open(path).convert("RGBA")
    
    # Just paste 3 in a row
    test_w = img.width * 3
    test_h = img.height
    seam_test = Image.new("RGBA", (test_w, test_h), (40, 44, 52, 255))
    
    seam_test.paste(img, (0, 0), img)
    seam_test.paste(img, (img.width, 0), img)
    seam_test.paste(img, (img.width * 2, 0), img)
    
    seam_test.save("apps/web/public/hero/conveyor_seam_test.png")
    print("Created conveyor seam test.")
