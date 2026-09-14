"""Check translation coverage and source freshness, not linguistic quality."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[1]
locales = ("en", "ja", "ko", "es", "fr")
errors = []
expected = {"README.md", "AGENTS.md", "scripts/shared-profile.js", "templates/clash.example.yaml"}
expected.update(str(p.relative_to(root)) for p in (root / "docs").glob("*.md"))
manifest = json.loads((root / "i18n/source-sha256.json").read_text())
if set(manifest) != expected:
    errors.append("Source manifest coverage changed; review translations")
for name in sorted(expected):
    if hashlib.sha256((root / name).read_bytes()).hexdigest() != manifest.get(name):
        errors.append(f"{name}: source changed; review translations before updating hashes")
for locale in locales:
    page = root / f"i18n/README.{locale}.md"
    if not page.exists():
        errors.append(f"Missing locale: {locale}")
        continue
    text = page.read_text()
    for token in ("../README.md", "上网线路", "自动切换（推荐）", "TLS", "TUN", "REPLACE_", "../docs/deployment.md", "../scripts/shared-profile.js", "python3 tests/check_i18n.py"):
        if token not in text:
            errors.append(f"{locale}: missing shared reference {token}")
    for other in locales:
        if f"README.{other}.md" not in text:
            errors.append(f"{locale}: missing navigation {other}")
    if f"i18n/README.{locale}.md" not in (root / "README.md").read_text():
        errors.append(f"Root navigation missing {locale}")
if errors:
    raise SystemExit("\n".join(errors))
print("PASS: six-language navigation, shared references and translation source freshness")
