"""Build only the site shell. Canonical data lives in docs/jobs-data.json.
Run: python3 build_site.py
Does NOT change verifiedAt, gather listings, or publish the site.
"""
from pathlib import Path
import json


def main():
    root=Path(__file__).resolve().parent
    data=json.loads((root/'docs/jobs-data.json').read_text(encoding='utf-8'))
    if data.get('schemaVersion')!=1 or not isinstance(data.get('jobs'),list):
        raise ValueError('Unsupported dataset')
    css=(root/'src/styles.css').read_text(encoding='utf-8')
    validator=(root/'src/validate-data.js').read_text(encoding='utf-8')
    live=(root/'src/live.js').read_text(encoding='utf-8')
    app=(root/'src/app.js').read_text(encoding='utf-8')
    payload=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
    js=validator+'\n'+live+'\n'+app
    if '</script' in js.lower():
        raise ValueError('Script-closing sequence in application source')
    page=('''<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light">
<meta name="description" content="PATHWAYS 채용 탐색 — 기업·플랫폼 공고, 실제 직무 로드맵, 온라인 데이터 연결판">
<title>PATHWAYS — 채용 탐색</title><style>'''+css+'''</style></head><body>
<div id="app"><main class="loading-shell"><h1>PATHWAYS</h1><p>채용 데이터를 확인하고 있어요.</p></main></div>
<div id="dock"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>
<input id="import-input" type="file" accept="application/json,.json" hidden>
<noscript>검색·비교와 데이터 동기화에는 JavaScript가 필요합니다.</noscript>
<script type="application/json" id="site-data">'''+payload+'''</script><script>
(async()=>{\n'''+js+'''\n})().catch(()=>{document.getElementById('app').textContent='화면을 열지 못했습니다. 새로고침하거나 이전 파일을 사용해주세요.';});
</script></body></html>''')
    for n in ['index.html','pathways-jobs.html']:
        (root/'docs'/n).write_text(page,encoding='utf-8')
    print(f'Built online shell with fallback snapshot ({len(data["jobs"])} jobs).')


if __name__=='__main__':
    main()
