with open("apps/web/components/NoiseToSignal.tsx", "r") as f:
    content = f.read()

# Replace percentages with the same values, but we will apply them to x and y of a full-size wrapper
content = content.replace("left: blipX, top: blipY,", "x: blipX, y: blipY,")

# We need to wrap Blip in a full-size container so x and y (translateX/Y) operate on the container's width/height.
content = content.replace(
'''            {/* --- BLIP PROTAGONIST --- */}
            <motion.div 
              style={{ left: blipX, top: blipY, scale: blipScale, rotate: blipRotate }}
              className="absolute w-[100px] z-40 origin-center"
            >''',
'''            {/* --- BLIP PROTAGONIST --- */}
            {/* We animate x/y on a 100% size wrapper so % translates relative to the container size, 
                avoiding animating top/left layout properties directly. */}
            <motion.div 
              style={{ x: blipX, y: blipY }}
              className="absolute inset-0 z-40 pointer-events-none"
            >
              <motion.div 
                style={{ scale: blipScale, rotate: blipRotate }}
                className="absolute top-0 left-0 w-[100px] origin-center -ml-[50px] -mt-[50px]"
              >'''
)

content = content.replace(
'''              </motion.div>
            </motion.div>''',
'''              </motion.div>
              </motion.div>
            </motion.div>'''
)

with open("apps/web/components/NoiseToSignal.tsx", "w") as f:
    f.write(content)
print("Patched transforms.")
