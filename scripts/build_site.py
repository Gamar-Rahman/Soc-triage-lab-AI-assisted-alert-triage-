"""Regenerate browser fixtures and static distributable/standalone site."""
from pathlib import Path
import json, shutil, re
ROOT = Path(__file__).resolve().parents[1]
fixtures = json.loads((ROOT/'data/scenarios.json').read_text(encoding='utf-8'))
assert len(fixtures) >= 6
(ROOT/'js/scenarios.js').write_text('/* Generated from data/scenarios.json; training data only. */\nwindow.SOC_SCENARIOS = '+json.dumps(fixtures, separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
dist = ROOT/'dist'
if dist.exists(): shutil.rmtree(dist)
for relative in ['index.html','assets/favicon.svg','css/styles.css','js/core.js','js/app.js','js/scenarios.js','docs/architecture.md','docs/threat-model.md','docs/evaluation.md','docs/practical-roadmap.md']:
    f=dist/relative;f.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/relative,f)
# Self-contained HTML preview opens directly offline from one file.
html = (ROOT/'index.html').read_text(encoding='utf-8')
css=(ROOT/'css/styles.css').read_text(encoding='utf-8')
html = html.replace('<link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />', '')
html = html.replace('<link rel="stylesheet" href="css/styles.css" />', '<style>\n'+css+'\n</style>')
for script in ['core','scenarios','app']:
    path='js/'+script+'.js'
    body=(ROOT/path).read_text(encoding='utf-8')
    if script == 'app':
        body='document.addEventListener("DOMContentLoaded", function () {\n'+body+'\n});'
    html=html.replace('<script defer src="'+path+'"></script>', '<script>\n'+body+'\n</script>')
html = html.replace('<a href="docs/architecture.md" target="_blank" rel="noopener">Architecture ↗</a>', '')
(ROOT.parent/'SOC_Triage_Lab_Interactive_Demo.html').write_text(html, encoding='utf-8')
print(f'Built {len(fixtures)} cases, {len(list(dist.rglob("*")))} distribution paths and single-file HTML preview')
