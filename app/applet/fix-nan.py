import os
import re

def process_dir(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                changed = False
                
                # Replace Number(x).toFixed(2) -> (Number(x) || 0).toFixed(2)
                def replace_number(m):
                    n = m.group(1)
                    if '||' in n:
                        return m.group(0)
                    return f"(Number({n}) || 0).toFixed({m.group(2)})"
                    
                new_content, n = re.subn(r'Number\(([^)]+)\)\.toFixed\((2|0)\)', replace_number, content)
                if n > 0:
                    changed = True
                    content = new_content

                # Replace plain var.toFixed(2) -> (Number(var) || 0).toFixed(2)
                def replace_var(m):
                    v = m.group(1)
                    if v == 'Number' or v.startswith('Number(') or v.startswith('(Number'):
                        return m.group(0)
                    if 'Math.min' in v or 'toFixed' in v:
                        return m.group(0)
                    if '||' in v:
                        return f"(Number({v}) || 0).toFixed({m.group(2)})"
                    return f"(Number({v}) || 0).toFixed({m.group(2)})"
                
                new_content, n = re.subn(r'([a-zA-Z0-9_?.]+)\.toFixed\((2|0)\)', replace_var, content)
                if n > 0:
                    changed = True
                    content = new_content

                if changed:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")

process_dir('src/components')
process_dir('src/pages')
process_dir('src/services')
