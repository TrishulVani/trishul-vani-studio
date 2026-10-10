import io
import hashlib
import numpy as np
import pytest
import soundfile as sf
from fastapi.testclient import TestClient
from app.main import app
from app import spectral

@pytest.mark.parametrize('n',[1600,16001,48000])
def test_roundtrip(n):
    x = np.random.default_rng(12).normal(0,.1,n).astype('float32')
    y = spectral.render(x, [])
    assert len(x) == len(y)
    assert np.max(np.abs(x-y)) < 2e-7

def test_selected_band_suppression():
    t=np.arange(32000)/16000
    x=(.2*np.sin(2*np.pi*500*t)+.2*np.sin(2*np.pi*3000*t)).astype('float32')
    edit=spectral.Edit(start_s=0,end_s=2,min_hz=400,max_hz=600,gain_db=-40)
    y=spectral.render(x,[edit])
    def amplitude(a,f):
        return abs(np.dot(a[4000:-4000],np.exp(-2j*np.pi*f*t[4000:-4000])))
    assert amplitude(y,500)/amplitude(x,500)<.02
    assert amplitude(y,3000)/amplitude(x,3000)>.99
    isolate=edit.model_copy(update={'operation':'isolate'})
    y=spectral.render(x,[isolate])
    assert amplitude(y,500)/amplitude(x,500)>.99
    assert amplitude(y,3000)/amplitude(x,3000)<.01

def wav(x,rate=16000):
    b=io.BytesIO();sf.write(b,x,rate,format='WAV');return b.getvalue()

def test_spectral_full_flow(tmp_path,monkeypatch):
    monkeypatch.setattr(spectral,'ROOT',tmp_path)
    client=TestClient(app)
    t=np.arange(16001)/16000
    data=wav(.2*np.sin(2*np.pi*1000*t))
    r=client.post('/api/spectral/sessions',files={'file':('tone.wav',data)})
    assert r.status_code==200,r.text
    sid=r.json()['id'];base=f'/api/spectral/sessions/{sid}'
    source=(tmp_path/sid/'source.wav').read_bytes()
    v=client.get(base+'/view').json()
    power=np.array(v['db']).mean(axis=1)
    assert abs(v['frequencies_hz'][int(power.argmax())]-1000)<20
    recipe={'edits':[dict(start_s=0,end_s=1,min_hz=800,max_hz=1200,gain_db=-20)]}
    a=client.post(base+'/render',json=recipe)
    assert a.status_code==200,a.text
    b=client.post(base+'/render',json=recipe)
    assert a.json()['sha256']==b.json()['sha256']
    assert source==(tmp_path/sid/'source.wav').read_bytes()
    out=client.get(base+'/audio/'+a.json()['id'])
    assert len(sf.read(io.BytesIO(out.content))[0])==16001
    ext=client.post(base+'/reference',files={'file':('external.wav',data)},data={'tool':'Manual reference'})
    assert ext.status_code==200 and ext.json()['snr_db'] is None
    assert client.get(base+'/export').json()['source_sha256']==hashlib.sha256(data).hexdigest()
    assert client.get(base+'/view?start_s=50').status_code==422
    assert client.post(base+'/render',json={'edits':[dict(start_s=0,end_s=40,min_hz=1,max_hz=500)]}).status_code==422
    assert client.post('/api/spectral/sessions',files={'file':('bad.wav',b'bad')}).status_code==422
