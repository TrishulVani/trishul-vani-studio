from pathlib import Path
from fastapi.testclient import TestClient
import app.main as core

client=TestClient(core.app)

def test_api_end_to_end(tmp_path, monkeypatch):
    monkeypatch.setattr(core,'DATA_DIR',tmp_path)
    resp=client.post('/api/experiments/simulate',json={'noise':'factory','snr_db':0,'duration_s':1.5,'seed':9})
    assert resp.status_code==200,resp.text
    report=resp.json()
    rid=report['id']
    assert report['model']=='spectral_fallback'
    assert all(key in report['metrics'] for key in ['raw','nlms','spectral','hybrid'])
    assert client.get('/api/experiments').json()[0]['id']==rid
    assert client.get(f'/api/experiments/{rid}/audio/hybrid').status_code==200
    assert 'method' in client.get(f'/api/experiments/{rid}/export.csv').text
    assert client.get(f'/api/experiments/{rid}/audio/rnnoise').status_code==404
    assert client.get('/api/health').json()['status']=='ok'
    assert client.get('/api/meta').json()['capabilities']['hybrid'] is True


def test_reject_invalid_values():
    assert client.post('/api/experiments/simulate',json={'noise':'invalid'}).status_code==422
    assert client.post('/api/experiments/simulate',json={'duration_s':999}).status_code==422
    assert client.get('/api/experiments/../../etc/passwd').status_code in (404,405)


def test_dual_mic_without_ground_truth(tmp_path, monkeypatch):
    import io
    import numpy as np
    import soundfile as sf
    monkeypatch.setattr(core,'DATA_DIR',tmp_path)
    rng=np.random.default_rng(3)
    primary=rng.normal(0,.1,24000)
    reference=primary*.8
    def buf(samples):
        stream=io.BytesIO()
        sf.write(stream,samples,16000,format='WAV')
        return stream.getvalue()
    result=client.post('/api/experiments/dual-mic',files={
        'primary':('main.wav',buf(primary),'audio/wav'),
        'reference':('ambient.wav',buf(reference),'audio/wav')})
    assert result.status_code==200,result.text
    obj=result.json()
    assert obj['source']=='raw_dual_microphone'
    assert obj['metrics']['hybrid']['snr_db'] is None
    assert obj['metrics']['hybrid']['stoi'] is None
    assert obj['metrics']['hybrid']['pesq'] is None
