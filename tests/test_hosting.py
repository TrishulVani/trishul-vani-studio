import os
import subprocess
import sys

def test_public_workspace_isolation(tmp_path):
    code = '''
from fastapi.testclient import TestClient
from app.main import app
with TestClient(app, base_url="https://testserver") as a, TestClient(app, base_url="https://testserver") as b:
    assert a.get('/api/spectral/sessions').status_code == 401
    assert a.get('/studio.html').status_code == 200
    assert b.get('/studio.html').status_code == 200
    assert a.cookies.get('trishul_workspace') != b.cookies.get('trishul_workspace')
    assert a.get('/api/spectral/sessions').json() == []
    assert b.get('/api/experiments').json() == []
    assert a.post('/api/experiments/simulate', headers={'Origin':'https://evil.example'},json={}).status_code == 403
    assert a.post('/api/registry',json={}).status_code == 403
'''
    env = dict(os.environ, TRISHUL_PUBLIC_HOSTING='1', TRISHUL_HOST_DATA=str(tmp_path))
    result = subprocess.run([sys.executable,'-c',code],env=env,capture_output=True,text=True,timeout=30)
    assert result.returncode == 0, result.stderr
