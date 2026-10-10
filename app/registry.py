"""Local, content-addressed audio registry. Metadata is a user declaration."""
import hashlib
import io
import json
import os
from pathlib import Path
from typing import Literal

import numpy as np
import soundfile as sf
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field, HttpUrl

router = APIRouter(prefix='/api/registry', tags=['Dataset provenance'])
ROOT = Path(os.environ.get('TRISHUL_DATASET_DIR', 'data/registry'))


class Provenance(BaseModel):
    source: str = Field(min_length=1, max_length=150)
    source_url: HttpUrl
    license: str = Field(min_length=1, max_length=200)
    attribution: str = Field(min_length=1, max_length=300)
    version: str = Field(default='unknown', max_length=100)
    role: Literal['clean', 'noise', 'dual_mic']
    split: Literal['tune', 'test']
    label: str = Field(min_length=1, max_length=150)
    real_recording: bool


def ingest(data: bytes, metadata: Provenance, root: Path = None):
    root = root or ROOT
    if len(data) > 20*1024*1024:
        raise ValueError('Maximum file size is 20 MiB')
    with sf.SoundFile(io.BytesIO(data)) as f:
        if f.format not in ('WAV', 'FLAC') or not 8000 <= f.samplerate <= 192000 or not 1 <= f.channels <= 16:
            raise ValueError('Use WAV/FLAC, 8–192 kHz, 1–16 channels')
        if not 0 < f.frames/f.samplerate <= 60:
            raise ValueError('Audio must be between 0 and 60 seconds')
        audio = f.read(dtype='float32', always_2d=True)
        info = dict(sample_rate=f.samplerate, channels=f.channels, duration_s=f.frames/f.samplerate)
    if not np.isfinite(audio).all():
        raise ValueError('Non-finite audio samples')
    digest = hashlib.sha256(data).hexdigest()
    root.mkdir(parents=True, exist_ok=True)
    target = root / (digest + '.json')
    if target.exists():
        previous = json.loads(target.read_text())
        if previous['split'] != metadata.split:
            raise ValueError('Identical audio cannot occur in both tuning and test splits')
        return previous
    entry = {**metadata.model_dump(mode='json'), **info, 'sha256': digest,
             'provenance_status': 'user-declared; license not independently verified',
             'clipped_samples': int((np.abs(audio) >= 1).sum())}
    (root / (digest + '.audio')).write_bytes(data)
    target.write_text(json.dumps(entry, indent=2), encoding='utf-8')
    return entry


@router.get('')
def installed():
    entries = [json.loads(p.read_text(encoding='utf-8')) for p in sorted(ROOT.glob('*.json'))]
    for item in entries:
        path = ROOT / (item['sha256'] + '.audio')
        item['integrity_ok'] = path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256']
    return {'entries': entries, 'count': len(entries)}


@router.post('')
async def import_audio(file: UploadFile = File(...), metadata: str = Form(...)):
    try:
        return ingest(await file.read(20*1024*1024+1), Provenance.model_validate_json(metadata))
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(422, str(exc)) from exc
