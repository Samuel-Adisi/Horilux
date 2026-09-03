#!/usr/bin/env python3
"""Adds Meta.ordering to Transaction and Viewing models if missing."""
import re

TARGETS = [
    ("transactions/models.py", "class Transaction("),
    ("viewings/models.py", "class Viewing("),
]

for path, class_sig in TARGETS:
    with open(path, "r") as f:
        content = f.read()

    if "class Meta" in content.split(class_sig)[1].split("\nclass ")[0] if class_sig in content else False:
        # Meta exists somewhere after the class — check if ordering already set nearby
        pass

    # Find the class block
    idx = content.find(class_sig)
    if idx == -1:
        print(f"SKIP {path}: class signature not found, check manually")
        continue

    block_end = content.find("\nclass ", idx + 1)
    block = content[idx:block_end if block_end != -1 else len(content)]

    if "ordering" in block and "class Meta" in block:
        print(f"SKIP {path}: Meta.ordering already present")
        continue

    if "class Meta" in block:
        # Insert ordering line into existing Meta
        new_block = re.sub(
            r"(class Meta:\n)",
            r"\1        ordering = ['-created_at']\n",
            block,
            count=1,
        )
    else:
        # No Meta class — append one at end of the model block (before next class)
        new_block = block.rstrip() + "\n\n    class Meta:\n        ordering = ['-created_at']\n\n"

    content = content[:idx] + new_block + (content[block_end:] if block_end != -1 else "")
    with open(path, "w") as f:
        f.write(content)
    print(f"PATCHED {path}")

print("\nNow run:")
print("  python3 manage.py makemigrations transactions viewings")
print("  python3 manage.py migrate")
