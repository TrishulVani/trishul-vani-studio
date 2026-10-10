"""Bounded, non-destructive STFT workspaces. Hann/1024/256, 16 kHz mono."""
from __future__ import annotations
import hashlib
import io
import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from typing import Literal

import numpy as np
import soundfile as sf
from scipy import signal
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field, model_validator
from .dsp import FS, resample

router = APIRouter(prefix='/api/spectral', tags=['Spectral studio'])
ROOT = Path(os.environ.get('TRISHUL_SPECTRAL_DIR', 'artifacts/spectral'))
LOCK = RLock()
NFFT, HOP = 1024, 256


class Edit(BaseModel):
    operation: Literal['attenuate', 'isolate'] = 'attenuate'
    start_s: float = Field(ge=0, le=60)
    end_s: float = Field(gt=0, le=60)
    min_hz: float = Field(ge=0, le=8000)
    max_hz: float = Field(gt=0, le=8000)
    gain_db: float = Field(default=-18, ge=-80, le=0)

    @model_validator(mode='after')
    def ordered(self):
        if self.start_s >= self.end_s or self.min_hz >= self.max_hz:
            raise ValueError('Selection bounds must be increasing')
        return self


class Recipe(BaseModel):
    edits: list[Edit] = Field(default_factory=list, max_length=50)


def stft(x):
    return signal.stft(x, fs=FS, window='hann', nperseg=NFFT,
                       noverlap=NFFT-HOP, boundary='zeros', padded=True)


def render(x: np.ndarray, edits: list[Edit]):
    f, t, z = stft(x)
    for edit in edits:
        if edit.end_s > len(x)/FS + 1/FS:
            raise ValueError('Selection exceeds audio duration')
        mask = ((f[:, None] >= edit.min_hz) & (f[:, None] <= edit.max_hz) &
                (t[None, :] >= edit.start_s) & (t[None, :] <= edit.end_s)).astype(float)
        # Two-dimensional bin taper reduces hard selection-edge discontinuities.
        mask = signal.convolve2d(mask, np.ones((3, 3))/9, mode='same', boundary='symm')
        gain = 10**(edit.gain_db/20)
        z *= (1-mask*(1-gain)) if edit.operation == 'attenuate' else mask
    _, out = signal.istft(z, fs=FS, window='hann', nperseg=NFFT, noverlap=NFFT-HOP)
    return out[:len(x)].astype(np.float32)


def decode(data):
    if len(data) > 20*1024*1024:
        raise HTTPException(413, 'File exceeds 20 MiB')
    try:
        with sf.SoundFile(io.BytesIO(data)) as src:
            if src.format not in ('WAV', 'FLAC') or src.channels not in (1, 2):
                raise ValueError('Use mono/stereo WAV or FLAC')
            if not .1 <= src.frames/src.samplerate <= 60:
                raise ValueError('Duration must be 0.1–60 seconds')
            metadata = dict(original_sample_rate=src.samplerate, original_channels=src.channels)
            x = resample(src.read(dtype='float32'), src.samplerate)
        return x, metadata
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(422, str(exc)) from exc


def folder(sid):
    if not re.fullmatch('[a-f0-9]{16}', sid):
        raise HTTPException(404, 'Session not found')
    path = ROOT/sid
    if not (path/'manifest.json').exists():
        raise HTTPException(404, 'Session not found')
    return path


def manifest(sid):
    return json.loads((folder(sid)/'manifest.json').read_text(encoding='utf-8'))


def save(path, data):
    temp = path/'manifest.tmp'
    temp.write_text(json.dumps(data, indent=2, allow_nan=False), encoding='utf-8')
    temp.replace(path/'manifest.json')


def wave(sid, layer):
    if layer not in ('source', 'external') and not re.fullmatch('[a-f0-9]{16}', layer):
        raise HTTPException(404, 'Layer not found')
    path = folder(sid)/(layer+'.wav')
    if not path.is_file():
        raise HTTPException(404, 'Layer not found')
    return sf.read(path, dtype='float32')[0]


def diagnostics(x):
    return dict(rms=float(np.sqrt(np.mean(x.astype(float)**2))), peak=float(np.max(np.abs(x))),
                clipped_samples=int(np.sum(np.abs(x)>=1)), samples=len(x))


@router.post('/sessions')
async def create(file: UploadFile = File(...), provenance: str = Form('unknown')):
    data = await file.read(20*1024*1024+1)
    x, info = decode(data)
    sid = uuid.uuid4().hex[:16]
    path = ROOT/sid
    path.mkdir(parents=True)
    sf.write(path/'source.wav', x, FS, subtype='FLOAT')
    doc = dict(id=sid, name=Path(file.filename or 'Audio').name[:180], sample_rate=FS,
               duration_s=len(x)/FS, source_sha256=hashlib.sha256(data).hexdigest(),
               provenance=provenance[:1000], created_at=datetime.now(timezone.utc).isoformat(),
               channel_policy='Stereo averaged to mono; polyphase resample to 16 kHz',
               stft=dict(window='hann', fft_size=NFFT, hop=HOP, boundary='zeros', scale='20 log10(abs(STFT)); amplitude relative to full scale'),
               layers=[dict(id='source', label='Original · locked', kind='source', **diagnostics(x))], **info)
    save(path, doc)
    return doc


@router.get('/sessions')
def sessions():
    return [json.loads(p.read_text(encoding='utf-8')) for p in sorted(ROOT.glob('*/manifest.json'))][-50:]


@router.get('/sessions/{sid}')
def get_session(sid: str):
    return manifest(sid)


@router.get('/sessions/{sid}/view')
def view(sid: str, layer: str = 'source', start_s: float = Query(0, ge=0, le=60),
         end_s: float = Query(60, gt=0, le=60)):
    x = wave(sid, layer)
    end_s = min(end_s, len(x)/FS)
    if start_s >= end_s:
        raise HTTPException(422, 'Empty time range')
    f, t, z = stft(x)
    indices = np.flatnonzero((t>=start_s) & (t<=end_s))
    indices = indices[::max(1, int(np.ceil(len(indices)/800)))]
    db = np.clip(20*np.log10(np.maximum(abs(z[:, indices]), 1e-6)), -120, 0)
    segment = x[int(start_s*FS):int(end_s*FS)]
    blocks = np.array_split(segment, min(800, len(segment)))
    return dict(frequencies_hz=f.tolist(), times_s=t[indices].tolist(), db=db.round(1).tolist(),
                waveform=[[float(v.min()), float(v.max())] for v in blocks],
                start_s=start_s, end_s=end_s, **diagnostics(x))


@router.post('/sessions/{sid}/render')
def apply(sid: str, recipe: Recipe):
    path = folder(sid)
    x = wave(sid, 'source')
    try:
        out = render(x, recipe.edits)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    payload = recipe.model_dump()
    lid = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:16]
    with LOCK:
        doc = manifest(sid)
        sf.write(path/(lid+'.wav'), out, FS, subtype='FLOAT')
        entry = dict(id=lid, label=f'Spectral edit · {len(recipe.edits)} operations', kind='spectral',
                     recipe=payload, sha256=hashlib.sha256((path/(lid+'.wav')).read_bytes()).hexdigest(), **diagnostics(out))
        doc['layers'] = [v for v in doc['layers'] if v['id'] != lid] + [entry]
        save(path, doc)
    return entry


@router.post('/sessions/{sid}/reference')
async def external(sid: str, file: UploadFile = File(...), tool: str = Form('Unknown external tool'),
                   settings: str = Form('unknown'), offset_ms: float = Form(0)):
    path = folder(sid)
    raw = await file.read(20*1024*1024+1)
    x, info = decode(raw)
    source = wave(sid, 'source')
    if not np.isfinite(offset_ms) or abs(offset_ms)>10000:
        raise HTTPException(422, 'Alignment offset must be within ±10000 ms')
    shift = round(offset_ms*FS/1000)
    if abs(len(x)-len(source)) > FS*2:
        raise HTTPException(422, 'Reference differs in duration by more than 2 seconds')
    aligned = np.zeros_like(source)
    start, dest = max(0, shift), max(0, -shift)
    count = min(len(x)-start, len(source)-dest)
    if count <= 0:
        raise HTTPException(422, 'Alignment leaves no overlapping audio')
    aligned[dest:dest+count] = x[start:start+count]
    with LOCK:
        doc = manifest(sid)
        sf.write(path/'external.wav', aligned, FS, subtype='FLOAT')
        entry = dict(id='external', kind='external', label='External offline reference', tool=tool[:200],
                     settings=settings[:1000], offset_ms=offset_ms, source_sha256=hashlib.sha256(raw).hexdigest(),
                     snr_db=None, stoi=None, pesq=None, metric_note='External processing is not independent clean ground truth',
                     alignment='User-specified offset; positive values trim reference start; zero padding preserves source length', **info, **diagnostics(aligned))
        doc['layers'] = [v for v in doc['layers'] if v['id'] != 'external'] + [entry]
        save(path, doc)
    return entry


@router.get('/sessions/{sid}/audio/{layer}')
def audio(sid: str, layer: str):
    wave(sid, layer)
    return FileResponse(folder(sid)/(layer+'.wav'), media_type='audio/wav', filename=f'trishul-{sid}-{layer}.wav')


@router.get('/sessions/{sid}/export')
def export(sid: str):
    return Response(json.dumps(manifest(sid), indent=2), media_type='application/json',
                    headers={'Content-Disposition':f'attachment; filename="trishul-{sid}-recipe.json"'})
