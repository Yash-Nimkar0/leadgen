import re

with open("apps/web/components/hero/ViewportStage.tsx", "r") as f:
    content = f.read()

# Add the import
if "import { ActionScene } from" not in content:
    content = content.replace(
        'import { ArrowRight } from "lucide-react";',
        'import { ArrowRight } from "lucide-react";\nimport { ActionScene } from "./ActionScene";'
    )

# Remove the local ActionScene function
# It starts at: // Separate component for the cinematic timeline to keep it organized
local_func_start = content.find("// Separate component for the cinematic timeline")
if local_func_start != -1:
    content = content[:local_func_start]

with open("apps/web/components/hero/ViewportStage.tsx", "w") as f:
    f.write(content)
print("Fixed ViewportStage.")
