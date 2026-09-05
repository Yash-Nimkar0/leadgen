import re

with open("apps/web/components/NoiseToSignal.tsx", "r") as f:
    content = f.read()

# Let's find the exact string
old_blip = """            {/* --- BLIP PROTAGONIST --- */}
            <motion.div 
              style={{ x: blipX, y: blipY, scale: blipScale, rotate: blipRotate }}
              className="absolute w-[100px] z-40 origin-center"
            >
              <img 
                src={`/hero/${blipSprite}`} 
                alt="Blip" 
                className="w-full pixelated drop-shadow-2xl transition-all duration-150" 
              />
              
              {/* Flashlight/Scanner Cone */}
              <motion.div 
                style={{ opacity: scannerOpacity, rotate: scannerRotate }}
                className="absolute top-1/2 left-full -translate-y-1/2 w-[250px] h-[150px] origin-left"
              >
                <div className="w-full h-full bg-gradient-to-r from-signal/40 to-transparent" 
                     style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)' }} />
              </motion.div>
            </motion.div>"""

new_blip = """            {/* --- BLIP PROTAGONIST --- */}
            {/* Animating x/y on a 100% size wrapper so % translates relative to container bounds, avoiding top/left layout trashing */}
            <motion.div 
              style={{ x: blipX, y: blipY }}
              className="absolute inset-0 z-40 pointer-events-none"
            >
              <motion.div 
                style={{ scale: blipScale, rotate: blipRotate }}
                className="absolute top-0 left-0 w-[100px] origin-center -ml-[50px] -mt-[50px]"
              >
                <img 
                  src={`/hero/${blipSprite}`} 
                  alt="Blip" 
                  className="w-full pixelated drop-shadow-2xl transition-all duration-150" 
                />
                
                {/* Flashlight/Scanner Cone */}
                <motion.div 
                  style={{ opacity: scannerOpacity, rotate: scannerRotate }}
                  className="absolute top-1/2 left-full -translate-y-1/2 w-[250px] h-[150px] origin-left"
                >
                  <div className="w-full h-full bg-gradient-to-r from-signal/40 to-transparent" 
                       style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)' }} />
                </motion.div>
              </motion.div>
            </motion.div>"""

content = content.replace(old_blip, new_blip)

with open("apps/web/components/NoiseToSignal.tsx", "w") as f:
    f.write(content)
print("Patched.")
