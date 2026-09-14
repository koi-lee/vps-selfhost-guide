"""Check source Chinese copy for known internal or awkward phrasing."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# AGENTS.md names the terms it forbids, so inspect user-facing source documents
# separately from the rule file itself.
FILES = [ROOT / "README.md", *sorted((ROOT / "docs").glob("*.md"))]
FORBIDDEN = {
    "本包": "用仓库、教程或项目说明具体指代对象",
    "接收者": "用使用者或读者，避免内部流程称呼",
    "交付证据": "用验收证据",
    "本次没有部署独立站或 GitHub Pages": "部署状态变化后应更新事实说明",
    "每个人拥有独立密码/UUID和": "改为“每位用户使用独立密码、UUID 和”",
}

errors = []
for path in FILES:
    text = path.read_text()
    for phrase, advice in FORBIDDEN.items():
        if phrase in text:
            errors.append(f"{path.relative_to(ROOT)}: {phrase}（{advice}）")

if errors:
    raise SystemExit("\n".join(errors))
print("PASS: source Chinese copy has no known awkward or internal phrasing")
