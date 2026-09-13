from pathlib import Path
import re
from urllib.parse import unquote
root = Path(__file__).resolve().parents[1]
errors = []
for p in root.rglob('*'):
    if not p.is_file() or '.git' in p.parts or '__pycache__' in p.parts:
        continue
    text = p.read_text()
    if p.suffix == '.md' or p.name == 'llms.txt':
        for target in re.findall(r'\]\(([^\n)]+)\)', text):
            if '://' in target or target.startswith('#'):
                continue
            if not (p.parent / unquote(target.split('#')[0])).exists():
                errors.append(str(p.relative_to(root)) + ': missing link')
    if p.suffix in ['.md', '.yaml', '.js']:
        if re.search(r'BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|/Users/|/var/folders/', text):
            errors.append(str(p.relative_to(root)) + ': private material')
assert not errors, errors
print('PASS: local document links and private-material patterns')
