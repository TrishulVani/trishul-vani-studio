"""Auditable cross-dataset offline benchmark for TRISHUL VANI.

Usage:
    python -m scripts.evaluate_dataset \
      --speech-dir data/LibriSpeech/dev-clean \
      --noise-dir data/DEMAND \
      --speech-license 'CC BY 4.0' \
      --noise-license 'CC BY-SA 3.0' \
      --snrs -10 -5 0 5 10 --limit 2 --duration 3

No data is downloaded, redistributed or committed by this script.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import soundfile as sf

from app.dsp import FS, evaluate_methods, mix_pair, resample, repeat_or_crop

EXTENSIONS = {'.wav','.flac'}


def discover(folder: Path) -> list[Path]:
    if not folder.is_dir():
        raise ValueError(f'Dataset directory does not exist: {folder}')
    return sorted(p for p in folder.rglob('*') if p.is_file() and p.suffix.lower() in EXTENSIONS)


def load_clip(path: Path) -> np.ndarray:
    waveform,rate = sf.read(path,dtype='float32')
    return resample(waveform,rate)


def hash_file(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):
            h.update(chunk)
    return h.hexdigest()


def git_commit() -> str | None:
    try:
        return subprocess.check_output(['git','rev-parse','HEAD'],stderr=subprocess.DEVNULL,text=True,timeout=2).strip()
    except (OSError,subprocess.CalledProcessError,subprocess.TimeoutExpired):
        return None


def benchmark(speech_files: list[Path],noise_files: list[Path],out_dir:Path, *,
              duration:float,snrs:list[float],seed:int,speech_license:str,noise_license:str,
              model_path:str|None=None) -> dict:
    """Evaluation only — no dataset training or automatic model parameter fitting."""
    if not speech_files or not noise_files:
        raise ValueError('Provide at least one readable speech and noise WAV/FLAC file')
    if not speech_license.strip() or not noise_license.strip():
        raise ValueError('Licenses are mandatory, including unknown/restricted where appropriate')
    out_dir.mkdir(parents=True,exist_ok=True)
    clips=out_dir/'audio';clips.mkdir(exist_ok=True)
    samples=int(duration*FS)
    rows=[]; records=[]; issues=[]
    for si,speech_file in enumerate(speech_files):
        try:
            original=load_clip(speech_file)
            if len(original)<samples or np.max(np.abs(original))<1e-5:
                raise ValueError('Speech clip too short or silent')
            rng=np.random.default_rng(seed+si)
            clean=repeat_or_crop(original,samples,rng)
        except (RuntimeError,ValueError,OSError) as e:
            issues.append({'path':str(speech_file),'problem':str(e)});continue
        for ni,noise_file in enumerate(noise_files):
            try:
                noise=load_clip(noise_file)
                if np.sqrt(np.mean(noise.astype(float)**2))<1e-7:
                    raise ValueError('Noise clip is silent')
            except (RuntimeError,ValueError,OSError) as e:
                issues.append({'path':str(noise_file),'problem':str(e)});continue
            for target_snr in snrs:
                key=seed+si*1103+ni*43+int((target_snr+30)*3)
                pair=mix_pair(clean,noise,target_snr,key)
                outputs,metrics,_=evaluate_methods(pair['clean'],pair['primary'],pair['reference'],model_path,real_speech=True)
                uid=f's{si:03d}_n{ni:03d}_snr{target_snr:+05.1f}'.replace('.','p')
                if len(records)<4:  # one folder of actual audible proof, not huge archives
                    for method,audio in outputs.items():
                        sf.write(clips/f'{uid}_{method}.wav',audio,FS)
                for method,metric in metrics.items():
                    rows.append({'run':uid,'speech':str(speech_file),'noise':str(noise_file),
                                 'seed':key,'target_snr_db':target_snr,'method':method,
                                 **metric})
                records.append({'id':uid,'speech_sha256':hash_file(speech_file),'noise_sha256':hash_file(noise_file),
                                'target_snr_db':target_snr,'seed':key})
    if not rows:
        raise RuntimeError(f'No valid combinations. Issues: {issues[:5]}')
    cols=list(rows[0])
    with (out_dir/'metrics.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(rows)
    summary=[]
    grouped=defaultdict(list)
    for r in rows:
        grouped[(r['method'],r['target_snr_db'])].append(r)
    for (method,snr),items in sorted(grouped.items()):
        group={'method':method,'target_snr_db':snr,'n':len(items)}
        for metric in ('snr_db','stoi','pesq','processing_ms','rtf'):
            values=[row[metric] for row in items if isinstance(row[metric],(int,float)) and np.isfinite(row[metric])]
            group['mean_'+metric] = round(float(np.mean(values)),4) if values else None
            group['std_'+metric] = round(float(np.std(values)),4) if values else None
        summary.append(group)
    with (out_dir/'summary.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=list(summary[0]));w.writeheader();w.writerows(summary)
    manifest={'generated_at':datetime.now(timezone.utc).isoformat(),
              'project_version':'0.1.0','commit':git_commit(),'sample_rate':FS,
              'snrs_db':snrs,'duration_s':duration,'initial_seed':seed,'method_note':'RNNoise requires external model. Spectral is DSP only.',
              'licenses':{'speech':speech_license,'noise':noise_license},
              'speech_files':[{'path':str(p),'sha256':hash_file(p)} for p in speech_files],
              'noise_files':[{'path':str(p),'sha256':hash_file(p)} for p in noise_files],
              'records':records,'skipped_files':issues,
              'interpretation':'SNR from known aligned reference; STOI/PESQ only meaningful for actual clean human speech.'}
    (out_dir/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    return {'combinations':len(records),'method_rows':len(rows),'skipped_files':len(issues),'out':str(out_dir)}


def main():
    p=argparse.ArgumentParser(description=__doc__,formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--speech-dir',type=Path,required=True)
    p.add_argument('--noise-dir',type=Path,required=True)
    p.add_argument('--out-dir',type=Path,default=Path('artifacts/benchmark'))
    p.add_argument('--speech-license',required=True)
    p.add_argument('--noise-license',required=True)
    p.add_argument('--limit',type=int,default=3,help='Max number of files from EACH source directory')
    p.add_argument('--snrs',type=float,nargs='+',default=[-10,-5,0,5,10])
    p.add_argument('--duration',type=float,default=3)
    p.add_argument('--seed',type=int,default=42)
    args=p.parse_args()
    if not 1.5<=args.duration<=10 or not 1<=args.limit<=1000 or len(args.snrs)>25 or any(not -30<=s<=30 for s in args.snrs):
        p.error('Duration=1.5..10s, limit=1..1000, at most 25 SNRs all between -30..30')
    speech=discover(args.speech_dir)[:args.limit]
    noise=discover(args.noise_dir)[:args.limit]
    result=benchmark(speech,noise,args.out_dir,duration=args.duration,snrs=args.snrs,
                     seed=args.seed,speech_license=args.speech_license,noise_license=args.noise_license,
                     model_path=os.environ.get('RNNOISE_MODEL'))
    print(json.dumps(result,indent=2))

if __name__=='__main__':
    main()
