with open("apps/web/app/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { ViewportStage } from "@/components/hero/ViewportStage";',
    'import { ViewportStage } from "../components/hero/ViewportStage";'
)

with open("apps/web/app/page.tsx", "w") as f:
    f.write(content)
print("Patched.")
