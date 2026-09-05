import re

with open("apps/web/components/hero/ActionScene.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "<ScoreDial score={94} size={50} showLabel={false} />",
    "<ScoreDial score={94} size=\"lg\" autoAnimate={true} className=\"mb-2\" />"
)

with open("apps/web/components/hero/ActionScene.tsx", "w") as f:
    f.write(content)
print("Patched.")
