with open("apps/web/components/hero/ViewportStage.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { Button } from "../ui/button";',
    'import { Button } from "../ui/Button";'
)

with open("apps/web/components/hero/ViewportStage.tsx", "w") as f:
    f.write(content)
print("Patched.")
