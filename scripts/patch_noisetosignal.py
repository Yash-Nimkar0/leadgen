import re

with open("apps/web/components/NoiseToSignal.tsx", "r") as f:
    content = f.read()

# 1. Fix the text overlapping (LINES)
old_lines = """const LINES = [
  { text: "Every thread looks like this.", range: [0, 0.2], output: [0, 1] },
  { text: "Most of it isn't about you.", range: [0.2, 0.4], output: [0, 1] },
  { text: "Until you find the one that is.", range: [0.6, 0.8], output: [0, 1] },
];"""

new_lines = """const LINES = [
  { text: "Every thread looks like this.", range: [0, 0.1, 0.2, 0.3], output: [0, 1, 1, 0] },
  { text: "Most of it isn't about you.", range: [0.35, 0.45, 0.55, 0.65], output: [0, 1, 1, 0] },
  { text: "Until you find the one that is.", range: [0.7, 0.8, 1, 1], output: [0, 1, 1, 1] },
];"""

content = content.replace(old_lines, new_lines)

# 2. Add maxScroll to make it one-way
if "const maxScroll = useMotionValue(0);" not in content:
    content = content.replace(
        'const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });',
        'const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });\n  const maxScroll = useMotionValue(0);\n  useMotionValueEvent(scrollYProgress, "change", (latest) => {\n    if (latest > maxScroll.get()) maxScroll.set(latest);\n  });'
    )
    
    # 3. Replace scrollYProgress with maxScroll for ALL useTransforms inside the component
    # We only want to replace it inside the component body, not in the useScroll hook itself.
    # The simplest way is to replace "scrollYProgress, " with "maxScroll, " in useTransform calls.
    content = content.replace('useTransform(scrollYProgress,', 'useTransform(maxScroll,')
    
    # Also replace in useMotionValueEvent for the blip sprite
    content = content.replace('useMotionValueEvent(scrollYProgress, "change"', 'useMotionValueEvent(maxScroll, "change"')

# 4. Update the "celebrating" state so he stays happy at the end instead of going idle
content = content.replace(
    'if (latest > 0.95) setBlipSprite("blip_idle.png");',
    'if (latest > 0.95) setBlipSprite("blip_found.png");' # stays happy!
)

with open("apps/web/components/NoiseToSignal.tsx", "w") as f:
    f.write(content)
print("Patched NoiseToSignal text and maxScroll.")
