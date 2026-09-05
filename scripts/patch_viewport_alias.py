with open("apps/web/components/hero/ViewportStage.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "../ui/button";'
)

with open("apps/web/components/hero/ViewportStage.tsx", "w") as f:
    f.write(content)
print("Patched.")
