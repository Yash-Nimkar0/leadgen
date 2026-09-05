import re

with open("apps/web/components/hero/ActionScene.tsx", "r") as f:
    content = f.read()

# Change height animation to scaleY
content = content.replace(
    'threadControls.set({ height: "100vh", opacity: 0.8 });',
    'threadControls.set({ scaleY: 1, opacity: 0.8 });'
)
content = content.replace(
    'threadControls.set({ height: "0vh", opacity: 0 });',
    'threadControls.set({ scaleY: 0, opacity: 0 });'
)
content = content.replace(
    'threadControls.start({ height: "100vh", opacity: 0.8, transition: { duration: 1.5, ease: "circIn" } });',
    'threadControls.start({ scaleY: 1, opacity: 0.8, transition: { duration: 1.5, ease: "circIn" } });'
)
content = content.replace(
    'initial={{ height: "0vh", opacity: 0 }}',
    'initial={{ scaleY: 0, opacity: 0 }}'
)
content = content.replace(
    'className="absolute top-full left-1/2 w-px bg-gradient-to-b from-signal to-transparent -translate-x-1/2 z-0 origin-top"',
    'className="absolute top-full left-1/2 w-px h-[100vh] bg-gradient-to-b from-signal to-transparent -translate-x-1/2 z-0 origin-top"'
)

with open("apps/web/components/hero/ActionScene.tsx", "w") as f:
    f.write(content)
print("Fixed thread perf.")
