with open("apps/web/components/NoiseToSignal.tsx", "r") as f:
    content = f.read()

# Fix the broken tracking hook
bad_hook = """  useMotionValueEvent(maxScroll, "change", (latest) => {
    if (latest > maxScroll.get()) maxScroll.set(latest);
  });"""

good_hook = """  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > maxScroll.get()) maxScroll.set(latest);
  });"""

content = content.replace(bad_hook, good_hook)

# Fix the missed useTransforms for scanner and blipRotateY and the NoiseCreatures
content = content.replace('useTransform(\n    scrollYProgress,', 'useTransform(\n    maxScroll,')
content = content.replace('progress={scrollYProgress}', 'progress={maxScroll}')

with open("apps/web/components/NoiseToSignal.tsx", "w") as f:
    f.write(content)
print("Fixed maxScroll tracking and missed references.")
