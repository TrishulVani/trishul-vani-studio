"""Build the public browser-only spectral edition; no audio is uploaded to a server."""
from pathlib import Path
import shutil

BASE=Path(__file__).resolve().parent.parent
def build(destination=None):
    dest=Path(destination) if destination else BASE/'dist'
    dest.mkdir(parents=True,exist_ok=True)
    for name in ['studio.css','studio.js','dsp-core.js','dsp-worker.js','browser-engine.js','favicon.svg']:
        shutil.copy2(BASE/'web'/name,dest/name)
    html=(BASE/'web/studio.html').read_text(encoding='utf-8')
    html=html.replace('<script src="studio.js">','<script src="dsp-core.js"></script><script src="browser-engine.js"></script><script src="studio.js">')
    html=html.replace('href="index.html#audio-lab"','href="about.html#local-lab"').replace('href="index.html#analytics"','href="about.html#evidence"').replace('href="index.html#datasets"','href="about.html#datasets"').replace('href="index.html#system"','href="about.html#status"').replace('href="index.html"','href="about.html"')
    html=html.replace('Mono or stereo · up to 60 s / 20 MiB','Audio stays in your browser · 60 s / 20 MiB')
    for name in ['index.html','studio.html']:(dest/name).write_text(html,encoding='utf-8')
    shutil.copy2(BASE/'web/about.html',dest/'about.html')
    (dest/'.nojekyll').write_text('')
    print(dest)
if __name__=='__main__':
    import sys
    build(sys.argv[1] if len(sys.argv)>1 else None)
