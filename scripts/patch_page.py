with open("apps/web/app/page.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
in_hero = False
for line in lines:
    if "{/* HERO */}" in line:
        in_hero = True
        new_lines.append(line)
        new_lines.append("        <ViewportStage />\n")
        continue
    
    if in_hero:
        if "</section>" in line:
            in_hero = False
        continue
    
    new_lines.append(line)

content = "".join(new_lines)
# Add import if not present
if "import { ViewportStage }" not in content:
    content = "import { ViewportStage } from \"@/components/hero/ViewportStage\";\n" + content

with open("apps/web/app/page.tsx", "w") as f:
    f.write(content)
print("Patched page.tsx")
