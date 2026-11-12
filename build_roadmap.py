"""Build the career explorer at its existing public URL."""
from pathlib import Path
root = Path(__file__).resolve().parent
src = root / 'src/roadmap'
shell = (src / 'shell.html').read_text()
styles = (src / 'styles.css').read_text()
js = '\n'.join((src / name).read_text() for name in ['data.js', 'explore-data.js', 'app.js', 'explorer-ui.js'])
assert '</script' not in js.lower()
page = shell.replace('<!-- STYLES -->', '<style>\n'+styles+'\n</style>').replace('<!-- SCRIPTS -->','<script>\n'+js+'\n</script>')
page = page.replace('PATHWAYS — 컴퓨터공학에서 실제 직무까지','PATHWAYS — 나의 가능성을 탐색하는 진로 지도')
(root/'docs/cs-career-roadmap-v2.html').write_text(page)
print('Built career explorer: docs/cs-career-roadmap-v2.html')
