import io
import numpy as np
import pytest
import soundfile as sf
from app.registry import Provenance, ingest

def test_hash_dedup_and_split_leakage(tmp_path):
    stream = io.BytesIO()
    sf.write(stream, np.zeros(16000), 16000, format='WAV')
    meta = Provenance(source='Test fixture', source_url='https://example.org', license='Original test', attribution='Tests', role='noise', split='tune', label='Silence', real_recording=False)
    a = ingest(stream.getvalue(), meta, tmp_path)
    b = ingest(stream.getvalue(), meta, tmp_path)
    assert a == b and a['duration_s'] == 1
    with pytest.raises(ValueError, match='both tuning'):
        ingest(stream.getvalue(), meta.model_copy(update={'split':'test'}), tmp_path)

def test_invalid_audio(tmp_path):
    meta = Provenance(source='Test', source_url='https://example.org', license='Original', attribution='Tests', role='noise', split='test', label='Invalid', real_recording=False)
    with pytest.raises((ValueError, RuntimeError)):
        ingest(b'not audio', meta, tmp_path)
