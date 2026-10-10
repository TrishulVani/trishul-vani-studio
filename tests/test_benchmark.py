import csv
import json
from pathlib import Path
import numpy as np
import soundfile as sf
from scripts.evaluate_dataset import benchmark, discover
from app.dsp import FS, synthetic_voice

def test_benchmark_outputs_provenance(tmp_path):
    speech=tmp_path/'speech';noise=tmp_path/'noise'
    speech.mkdir();noise.mkdir()
    sf.write(speech/'synthetic-voice.wav',synthetic_voice(2),FS)
    sf.write(noise/'noise.wav',np.random.default_rng(12).normal(0,.12,2*FS),FS)
    out=tmp_path/'results'
    result=benchmark(discover(speech),discover(noise),out,duration=1.5,snrs=[0],seed=2,
                     speech_license='local test only',noise_license='local test only')
    assert result['combinations']==1
    assert result['method_rows']==4
    assert (out/'metrics.csv').exists()
    assert (out/'summary.csv').exists()
    assert len(json.loads((out/'manifest.json').read_text())['records'])==1
    assert len(list((out/'audio').glob('*.wav')))==4
