import os
import subprocess
import sys

def test_public_workspace_isolation(tmp_path):
    code = '''
from fastapi.testclient import TestClient
from app.main import app
import io
import numpy as np
import soundfile as sf
with TestClient(app, base_url="https://testserver") as a, TestClient(app, base_url="https://testserver") as b:
    assert a.get('/api/spectral/sessions').status_code == 401
    assert a.get('/studio.html').status_code == 200
    assert a.get('/lab.html?design=2').status_code == 200
    assert b.get('/studio.html').status_code == 200
    assert a.cookies.get('trishul_workspace') != b.cookies.get('trishul_workspace')
    assert a.get('/api/spectral/sessions').json() == []
    assert b.get('/api/experiments').json() == []
    data=io.BytesIO()
    sf.write(data,np.zeros(16000,dtype='float32'),16000,format='WAV')
    created=a.post('/api/spectral/sessions',files={'file':('silence.wav',data.getvalue(),'audio/wav')})
    assert created.status_code == 200, created.text
    sid=created.json()['id']
    assert len(a.get('/api/spectral/sessions').json()) == 1
    assert b.get('/api/spectral/sessions').json() == []
    assert b.get('/api/spectral/sessions/'+sid).status_code == 404
    assert a.post('/api/experiments/simulate', headers={'Origin':'https://evil.example'},json={}).status_code == 403
    assert b.post('/api/registry',json={}).status_code == 403
    token='a'*64
    pages={'Origin':'https://trishulvani.github.io','X-Trishul-Workspace':token}
    preflight=a.options('/api/experiments/simulate',headers={
        'Origin':'https://trishulvani.github.io',
        'Access-Control-Request-Method':'POST',
        'Access-Control-Request-Headers':'content-type,x-trishul-workspace',
    })
    assert preflight.status_code == 200, preflight.text
    assert preflight.headers['access-control-allow-origin'] == 'https://trishulvani.github.io'
    assert a.get('/api/meta',headers=pages).status_code == 200
    assert a.get('/api/meta?workspace='+token,headers={'Origin':'https://trishulvani.github.io'}).status_code == 200
    static_origin='https://trishul-vani-frontend.onrender.com'
    static_preflight=a.options('/api/experiments/simulate',headers={
        'Origin':static_origin,
        'Access-Control-Request-Method':'POST',
        'Access-Control-Request-Headers':'content-type,x-trishul-workspace',
    })
    assert static_preflight.status_code == 200, static_preflight.text
    assert static_preflight.headers['access-control-allow-origin'] == static_origin
    invalid=a.post('/api/experiments/simulate',headers=pages,json={'noise':'not-real'})
    assert invalid.status_code == 422, invalid.text
'''
    env = dict(os.environ, TRISHUL_PUBLIC_HOSTING='1', TRISHUL_HOST_DATA=str(tmp_path))
    result = subprocess.run([sys.executable,'-c',code],env=env,capture_output=True,text=True,timeout=30)
    assert result.returncode == 0, result.stderr

