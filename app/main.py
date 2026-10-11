"""TRISHUL VANI: reproducible speech-enhancement research dashboard API.

Run: uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import csv
import io
import json
import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock

import numpy as np
import soundfile as sf
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .dsp import (FS, envelope, evaluate_methods, mix_pair, repeat_or_crop,
                  resample, rnnoise_available, synthetic_noise, synthetic_voice)
from . import db

BASE = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get('TRISHUL_ARTIFACT_DIR', str(BASE/'artifacts'))).resolve()
MODEL_PATH = os.environ.get('RNNOISE_MODEL') or None
LOCK = RLock()
KINDS = ['factory', 'engine', 'wind', 'impulse', 'crowd']

app = FastAPI(title='TRISHUL VANI Lab API', version='0.1.0',
              description='Offline research prototype. Unverified for safety-critical use.')


class SimulationRequest(BaseModel):
    noise: str = Field(default='factory')
    snr_db: float = Field(default=0, ge=-15, le=20)
    duration_s: float = Field(default=3, ge=1.5, le=10)
    seed: int = Field(default=42, ge=0, le=2**31-1)


def _dir(run_id: str) -> Path:
    if not run_id or not all(c in '0123456789abcdef' for c in run_id) or len(run_id) != 12:
        raise HTTPException(404,'Experiment not found')
    p = DATA_DIR/run_id
    if db.configured():
        if db.get_experiment(run_id) is None:
            raise HTTPException(404,'Experiment not found')
        if not (p/'report.json').is_file():
            raise HTTPException(410,'Audio and file-based report expired; export results before temporary storage resets')
    if not (p/'report.json').is_file():
        raise HTTPException(404,'Experiment not found')
    return p


def _index() -> list[dict]:
    if db.configured():
        records = db.list_experiments()
        return [{k:record.get(k) for k in ('id','created_at','source','noise','snr_db','duration_s','seed','model','metrics')} for record in records]
    if not DATA_DIR.exists():
        return []
    reports = []
    for path in DATA_DIR.glob('*/report.json'):
        try:
            record=json.loads(path.read_text(encoding='utf-8'))
            reports.append({k:record.get(k) for k in ('id','created_at','source','noise','snr_db','duration_s','seed','model','metrics')})
        except (ValueError, OSError):
            continue
    return sorted(reports,key=lambda x:x['created_at'] or '',reverse=True)[:80]


def _store(clean:np.ndarray|None, primary:np.ndarray, reference:np.ndarray, *, source:str, noise:str, snr_db:float|None, seed:int|None, info:dict|None=None) -> dict:
    if (clean is not None and len(clean) != len(primary)) or len(primary) != len(reference):
        raise HTTPException(422,'Audio length mismatch')
    model = 'rnnoise' if rnnoise_available(MODEL_PATH) else 'spectral_fallback'
    try:
        methods, metrics, trace = evaluate_methods(clean, primary, reference, MODEL_PATH, real_speech=source=='user_uploaded')
    except (RuntimeError,ValueError) as exc:
        raise HTTPException(422,f'Audio processing error: {exc}') from exc
    run_id=uuid.uuid4().hex[:12]
    record = {
        'id':run_id,'created_at':datetime.now(timezone.utc).isoformat(),
        'source':source,'noise':noise,'snr_db':snr_db,
        'duration_s':round(len(primary)/FS,3),'sample_rate':FS,'seed':seed,
        'model':model,'metrics':metrics,
        'trace':trace,
        'input': {'clip_rms':round(float(np.sqrt(np.mean(primary.astype(float)**2))),4),
                  'reference_rms':round(float(np.sqrt(np.mean(reference.astype(float)**2))),4)},
        'waveforms': {'raw':envelope(primary),'reference':envelope(reference),
                      **({'clean':envelope(clean)} if clean is not None else {}),
                      **{name:envelope(wave) for name,wave in methods.items() if name!='raw'}},
        'method_notes':{
            'raw':'Unprocessed input',
            'nlms':'Reference-mic adaptive NLMS cancellation',
            'spectral':'DSP spectral gate; NOT neural',
            'rnnoise':'Actual RNNoise via FFmpeg arnndn, when configured',
            'hybrid':'NLMS reference gating + impulse freeze + '+ ('RNNoise residual stage' if model=='rnnoise' else 'DSP spectral fallback (not AI)')},
        'limitations': ['Synthetic tone is not intelligible human speech; no STOI/PESQ is claimed' if source=='synthetic' else '',
                        'SNR/STOI/PESQ require aligned clean ground truth; unavailable for raw dual-mic uploads' if clean is None else 'Metrics reference the known aligned clean source',
                        'Processing time is offline host runtime, not physical end-to-end latency'],
        **(info or {}),
    }
    with LOCK:
        target = DATA_DIR/run_id
        target.mkdir(parents=True,exist_ok=False)
        for name, wave in {'raw':primary,'reference':reference,**({'clean':clean} if clean is not None else {}),**methods}.items():
            sf.write(target/f'{name}.wav',np.clip(wave,-1,1),FS,subtype='PCM_16')
        (target/'report.json').write_text(json.dumps(record,allow_nan=False,indent=2),encoding='utf-8')
        if db.configured():
            try:
                db.save_experiment(record)
            except Exception as exc:
                shutil.rmtree(target)
                raise HTTPException(503,'Database save failed; experiment was not retained') from exc
    return record


@app.get('/api/health')
def health():
    return {'status':'ok','service':'TRISHUL VANI','version':'0.1.0'}


@app.get('/api/readiness')
def readiness():
    if not db.configured():
        return {'status':'ready','metadata_mode':'ephemeral_files','database':'disabled'}
    if not db.ready():
        return JSONResponse({'status':'unavailable','metadata_mode':'mysql','database':'unavailable_or_unmigrated'},status_code=503)
    return {'status':'ready','metadata_mode':'mysql','database':'connected'}


@app.get('/api/meta')
def meta():
    active=rnnoise_available(MODEL_PATH)
    return {'name':'TRISHUL VANI','edition':'Research Workbench / Alpha 0.1',
            'sample_rate':FS,'control_frame_ms':10,'scenarios':KINDS,
            'capabilities':{'nlms':True,'spectral':True,'rnnoise':active,'hybrid':True,
                            'stoi':_has('pystoi'),'pesq':_has('pesq'),'dual_mic_upload':True},
            'ai_status':'real RNNoise configured' if active else 'RNNoise model not configured; hybrid uses spectral DSP only',
            'safety':'NOT validated for hearing protection, combat, life safety, or secure communications'}


def _has(pkg):
    from importlib.util import find_spec
    return find_spec(pkg) is not None


@app.get('/api/experiments')
def experiments():
    return _index()


@app.post('/api/experiments/simulate')
def simulate(params:SimulationRequest):
    if params.noise not in KINDS:
        raise HTTPException(422,'Unknown noise scenario')
    clean=synthetic_voice(params.duration_s)
    noise=synthetic_noise(params.noise,params.duration_s,params.seed)
    pair=mix_pair(clean,noise,params.snr_db,params.seed)
    return _store(pair['clean'],pair['primary'],pair['reference'],source='synthetic',
                  noise=params.noise,snr_db=params.snr_db,seed=params.seed)


def _decode(data:bytes, label:str) -> np.ndarray:
    if len(data)>20*1024*1024:
        raise HTTPException(413,f'{label} file exceeds 20 MB limit')
    try:
        signal,rate=sf.read(io.BytesIO(data),dtype='float32',always_2d=False)
        if len(signal)/rate > 15:
            raise HTTPException(413,f'{label} exceeds 15-second duration limit')
        return resample(signal,rate)
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(422,f'Cannot decode {label}: provide supported WAV/FLAC: {exc}') from exc


@app.post('/api/experiments/upload')
async def upload(clean:UploadFile=File(...), noise:UploadFile=File(...),
                 reference:UploadFile|None=File(None),snr_db:float=Form(0),seed:int=Form(42)):
    if not -15<=snr_db<=20 or not 0<=seed<=2**31-1:
        raise HTTPException(422,'SNR or seed outside allowed range')
    # Default means uploaded clean speech plus separate noise; optional reference
    # is a synchronized, properly-aligned ambient recording of the same length.
    clean_audio=_decode(await clean.read(20*1024*1024+1),'clean speech')
    noise_audio=_decode(await noise.read(20*1024*1024+1),'noise')
    if len(clean_audio)<int(1.5*FS):
        raise HTTPException(422,'Clean audio must be at least 1.5 seconds')
    if not np.any(np.abs(clean_audio)>1e-5):
        raise HTTPException(422,'Clean audio is silent')
    clean_audio=clean_audio[:10*FS]
    if reference is None:
        pair=mix_pair(clean_audio,noise_audio,snr_db,seed)
    else:
        ref_audio=_decode(await reference.read(20*1024*1024+1),'reference')
        # Don't pretend independently uploaded ambient audio is synchronized
        # with a separately-synthesized primary. Use it as noise source.
        pair=mix_pair(clean_audio,noise_audio,snr_db,seed)
        if len(ref_audio)<len(clean_audio):
            raise HTTPException(422,'Reference mic recording shorter than clean audio')
        pair['reference']=ref_audio[:len(clean_audio)].copy()
    return _store(pair['clean'],pair['primary'],pair['reference'],source='user_uploaded',
                  noise=noise.filename or 'uploaded noise',snr_db=snr_db,seed=seed,
                  info={'upload_notes':'Ground truth from uploaded clean speech. Reference should correspond to target noise, be correctly time aligned, and have low speech leakage.'})


@app.post('/api/experiments/dual-mic')
async def dual_mic(primary:UploadFile=File(...), reference:UploadFile=File(...)):
    """Process synchronized raw 2-microphone recordings; do not fabricate truth metrics."""
    main=_decode(await primary.read(20*1024*1024+1),'primary microphone')
    ambient=_decode(await reference.read(20*1024*1024+1),'reference microphone')
    if not int(1.5*FS)<=len(main)<=int(10*FS):
        raise HTTPException(422,'Primary microphone clip must be 1.5–10 seconds')
    if len(main)!=len(ambient):
        raise HTTPException(422,'Microphone channels must be synchronized and equal-length after resampling')
    return _store(None,main,ambient,source='raw_dual_microphone',
                  noise='actual microphone capture',snr_db=None,seed=None,
                  info={'upload_notes':'Paired primary and ambient microphones; no ground-truth clean audio. Listening and processing time only; objective SNR/STOI/PESQ intentionally unavailable.'})


@app.get('/api/experiments/{run_id}')
def experiment(run_id:str):
    return json.loads((_dir(run_id)/'report.json').read_text(encoding='utf-8'))


@app.get('/api/experiments/{run_id}/audio/{method}')
def audio(run_id:str,method:str):
    if method not in ('clean','raw','reference','nlms','spectral','rnnoise','hybrid'):
        raise HTTPException(404,'Audio track not found')
    path=_dir(run_id)/(method+'.wav')
    if not path.is_file():
        raise HTTPException(404,'Audio track not generated (method unavailable)')
    return FileResponse(path,media_type='audio/wav',filename=f'trishul-{run_id}-{method}.wav')


@app.get('/api/experiments/{run_id}/export.csv')
def export_csv(run_id:str):
    report=json.loads((_dir(run_id)/'report.json').read_text(encoding='utf-8'))
    stream=io.StringIO()
    columns=['run_id','source','noise','input_snr_db','method','output_snr_db','stoi','pesq','processing_ms','rtf','algorithm']
    writer=csv.DictWriter(stream,fieldnames=columns)
    writer.writeheader()
    for method, metric in report['metrics'].items():
        writer.writerow({'run_id':run_id,'source':report['source'],'noise':report['noise'],
                         'input_snr_db':report['snr_db'],'method':method,
                         'output_snr_db':metric['snr_db'],'stoi':metric['stoi'],'pesq':metric['pesq'],
                         'processing_ms':metric['processing_ms'],'rtf':metric['rtf'],
                         'algorithm':report['method_notes'].get(method,'')})
    return Response(stream.getvalue(),media_type='text/csv',headers={'Content-Disposition':f'attachment; filename="trishul-{run_id}.csv"'})


@app.get('/api/datasets')
def datasets():
    return {'entries':[
        {'name':'LibriSpeech','type':'Clean speech','license':'CC BY 4.0','url':'https://www.openslr.org/12/','note':'Read speech, human speakers; use to validate intelligibility.'},
        {'name':'DEMAND','type':'Ambient noise / multichannel','license':'CC BY-SA 3.0','url':'https://zenodo.org/records/1227121','note':'Real 16-channel environmental noise, good for multi-mic tests.'},
        {'name':'DNS Challenge','type':'Clean/noise and test scripts','license':'Mixed upstream licenses','url':'https://github.com/microsoft/DNS-Challenge','note':'Large dataset; sample small licensed subset only and record provenance.'},
        {'name':'Freesound','type':'Event noises','license':'Per-file (filter CC0)','url':'https://freesound.org/','note':'Check and record per-file licenses; do not assume every upload is freely reusable.'},
        {'name':'RNNoise (Xiph)','type':'Neural enhancer implementation','license':'BSD-3-Clause (code); check model terms','url':'https://github.com/xiph/rnnoise','note':'Real optional model integration needs a compatible FFmpeg .rnnn model.'}
    ]}


@app.get('/api/diagnostics')
def diagnostics():
    entries=_index()
    return {'experiment_count':len(entries),'mode':'offline file-based research',
            'rnnoise_enabled':rnnoise_available(MODEL_PATH),'data_path':str(DATA_DIR),
            'storage':'local disk','two_node_link':'not implemented','live_microphones':'not implemented',
            'embedded_deployment':'not implemented'}


from .registry import router as registry_router
from .spectral import router as spectral_router
app.include_router(registry_router)
app.include_router(spectral_router)
from .hosting import enable_hosting
enable_hosting(app)
app.mount('/',StaticFiles(directory=BASE/'web',html=True),name='web')
