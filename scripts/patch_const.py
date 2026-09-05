with open("apps/web/components/NoiseToSignal.tsx", "r") as f:
    content = f.read()

content = content.replace("] as const;", "];")
content = content.replace("line.range as number[],", "line.range,")
content = content.replace("line.output as number[])", "line.output)")

with open("apps/web/components/NoiseToSignal.tsx", "w") as f:
    f.write(content)
print("Patched.")
