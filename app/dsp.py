"""Reproducible, offline speech enhancement and reference-mic experiments.

Research prototype, NOT a hearing-protection, tactical safety or certified
real-time communications product. No evaluation signal is used by algorithms.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory
from time import perf_counter
from typing import Callable
import shutil
import subprocess

import numpy as np
from scipy import signal
import soundfile as sf

FS = 16000
FRAME = 160  # 10 ms internal control frames at 16 kHz, not RNNoise frame size
EPS = 1e-9


def _safe(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 2:
        x = x.mean(axis=1)
    if x.ndim != 1 or x.size == 0 or not np.all(np.isfinite(x)):
        raise ValueError('Audio must be nonempty finite mono/stereo samples')
    return x


def resample(audio: np.ndarray, source_rate: int, target_rate: int = FS) -> np.ndarray:
    from math import gcd
    if source_rate < 8000 or source_rate > 192000:
        raise ValueError('Unsupported sample rate')
    audio = _safe(audio)
    if source_rate == target_rate:
        return audio
    g = gcd(source_rate, target_rate)
    return signal.resample_poly(audio, target_rate // g, source_rate // g).astype(np.float32)


def repeat_or_crop(data: np.ndarray, n: int, rng: np.random.Generator) -> np.ndarray:
    data = _safe(data)
    if len(data) >= n:
        start = int(rng.integers(0, len(data) - n + 1))
        return data[start : start + n].copy()
    return np.tile(data, int(np.ceil(n / len(data))))[:n].copy()


def synthetic_voice(seconds: float, fs: int = FS) -> np.ndarray:
    """Clearly labelled FORMANT-LIKE SYNTHETIC TEST TONE, not real intelligible speech."""
    t = np.arange(int(seconds * fs), dtype=np.float32) / fs
    fundamental = 135 + 18 * np.sin(2 * np.pi * 1.3 * t)
    phase = np.cumsum(2 * np.pi * fundamental / fs)
    src = np.zeros_like(t)
    for k in range(1, 15):
        f = k * 140.0
        formants = sum(np.exp(-0.5 * ((f - c) / w)**2) for c, w in [(700, 180), (1260, 230), (2500, 340)])
        src += (formants / k) * np.sin(k * phase + k * 0.23)
    syllable = (np.sin(2 * np.pi * 3.1 * t) + 1) / 2
    envelope = (0.22 + 0.78 * syllable**2) * np.minimum(1, t * 16) * np.minimum(1, (seconds-t) * 16)
    src *= envelope
    return (0.30 * src / max(float(np.max(np.abs(src))), EPS)).astype(np.float32)


def synthetic_noise(kind: str, seconds: float, seed: int, fs: int = FS) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(seconds * fs)
    t = np.arange(n) / fs
    w = rng.normal(0, 1, n)
    if kind == 'engine':
        out = 0.68*np.sin(2*np.pi*85*t) + 0.24*np.sin(2*np.pi*170*t) + 0.35*signal.lfilter([1], [1, -0.91], w)/5
    elif kind == 'wind':
        out = signal.lfilter([1], [1, -0.993], w)/12 + 0.15*w
    elif kind == 'impulse':
        out = 0.20*w
        for loc in np.arange(.26, seconds, .47):
            i = int(loc*fs)
            width = min(1600, n-i)
            if width > 0:
                decay = np.exp(-np.arange(width)/140)
                out[i:i+width] += 3.2 * decay * (np.sin(2*np.pi*1300*np.arange(width)/fs) + .4*rng.normal(size=width))
    elif kind == 'crowd':
        out = 0.42*signal.lfilter([1, 0.1], [1, -0.66], w) + .3*np.sin(2*np.pi*(230*t + 23*t*t))
        out *= 0.65 + 0.35*np.sin(2*np.pi*.7*t)**2
    elif kind == 'factory':
        out = 0.5*w + 0.38*np.sin(2*np.pi*310*t) + 0.17*np.sin(2*np.pi*930*t)
    else:
        raise ValueError(f'Unknown noise scenario: {kind}')
    out = np.asarray(out, dtype=np.float32)
    out -= np.mean(out)
    return out / (np.sqrt(np.mean(out**2)) + EPS)


def mix_pair(clean: np.ndarray, noise: np.ndarray, snr_db: float, seed: int = 42) -> dict:
    """Primary=clean + colored noise; reference=delayed/filtered noise + small leakage.

    Simulation preserves a physically plausible correlation, but NOT a real
    2-microphone transfer function. Test this independently on real recordings.
    """
    clean = _safe(clean)
    rng = np.random.default_rng(seed)
    noise = repeat_or_crop(noise, len(clean), rng)
    # Use full-duration power, identical to the SNR evaluator, so the user's
    # requested input SNR matches the measured RAW input (not a VAD estimate).
    p_s = float(np.mean(clean**2))
    # Model the noise source reaching the ambient microphone BEFORE the
    # close-talk microphone. A causal reference can then predict primary noise.
    # This is a configurable *simulation assumption*, not proof of geometry.
    primary_noise_unit = signal.lfilter([0, .67, .25, .08], [1], noise).astype(np.float32)
    p_n = float(np.mean(primary_noise_unit**2))
    gain = np.sqrt(p_s / (max(p_n, EPS) * 10 ** (snr_db / 10)))
    n_primary = primary_noise_unit * gain
    primary = clean + n_primary
    reference = (noise * gain).astype(np.float32)
    reference += (.007 * rng.normal(size=len(clean))).astype(np.float32)
    # One common gain preserves SNR and avoids PCM clipping in the stored WAVs.
    peak = max(float(np.max(np.abs(primary))), float(np.max(np.abs(reference))), .01)
    scale = min(1.0, .96 / peak)
    return {'clean':clean*scale, 'noise':n_primary*scale,
            'primary':(primary*scale).astype(np.float32), 'reference':reference*scale}


@dataclass
class NLMSState:
    taps: int = 48
    mu: float = .28
    leak: float = 0.0

    def __post_init__(self) -> None:
        self.weights = np.zeros(self.taps, dtype=np.float64)
        self.history = np.zeros(self.taps, dtype=np.float64)

    def process(self, primary: np.ndarray, reference: np.ndarray, adapt: bool = True) -> np.ndarray:
        output = np.empty(len(primary), dtype=np.float32)
        for i, (d, x) in enumerate(zip(primary, reference)):
            self.history[1:] = self.history[:-1]
            self.history[0] = float(x)
            y_hat = float(np.dot(self.weights, self.history))
            error = float(d) - y_hat
            if adapt:
                norm = float(np.dot(self.history, self.history)) + 1e-5
                self.weights *= 1 - self.leak
                self.weights += self.mu * error * self.history / norm
            output[i] = error
        return output


def nlms(primary: np.ndarray, reference: np.ndarray, taps: int = 48, mu: float = .28) -> np.ndarray:
    return NLMSState(taps=taps, mu=mu).process(_safe(primary), _safe(reference))


def spectral_denoise(x: np.ndarray, strength: float = 1.1) -> np.ndarray:
    """Transparent DSP baseline, not AI or an RNNoise impersonation."""
    x = _safe(x)
    if len(x) < 512:
        return x.copy()
    _, _, z = signal.stft(x, fs=FS, nperseg=512, noverlap=384, boundary='zeros')
    mag = np.abs(z)
    noise_floor = np.percentile(mag, 18, axis=1, keepdims=True)
    gain = np.clip((mag - strength * noise_floor) / (mag + EPS), .13, 1)
    # Smooth to reduce musical noise.
    gain = signal.convolve2d(gain, np.ones((3, 5))/15, mode='same', boundary='symm')
    _, enhanced = signal.istft(z * gain, fs=FS, nperseg=512, noverlap=384)
    return np.asarray(enhanced[:len(x)], dtype=np.float32)


def rnnoise_available(model_path: str | None) -> bool:
    return bool(model_path and Path(model_path).is_file() and shutil.which('ffmpeg'))


def rnnoise_denoise(x: np.ndarray, model_path: str) -> np.ndarray:
    """Actual FFmpeg arnndn inference, with resampling managed by FFmpeg.

    This optional adapter executes actual RNNoise only if a valid model is set.
    Throws on unavailable/misconfigured model; never silently substitutes DSP.
    """
    if not rnnoise_available(model_path):
        raise RuntimeError('RNNoise not configured; set RNNOISE_MODEL to a valid .rnnn model')
    with TemporaryDirectory() as tmp:
        src, dst = Path(tmp)/'source.wav', Path(tmp)/'processed.wav'
        sf.write(src, _safe(x), FS)
        # Output 16k WAV is resampled back transparently. Quoting protects path syntax.
        expr = 'arnndn=m=' + str(Path(model_path).resolve()).replace('\\', '/').replace(':', r'\:')
        cmd = ['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-y','-i',str(src),'-af',expr,'-ar',str(FS),'-ac','1',str(dst)]
        run = subprocess.run(cmd, capture_output=True, text=True, timeout=60, check=False)
        if run.returncode != 0:
            raise RuntimeError('RNNoise inference failed: '+run.stderr[-450:])
        out, rate = sf.read(dst, dtype='float32')
        out = resample(out, rate)
        return np.pad(out[:len(x)], (0, max(0,len(x)-len(out))), mode='constant')


def hybrid(primary: np.ndarray, reference: np.ndarray, *, neural: Callable[[np.ndarray], np.ndarray] | None = None) -> tuple[np.ndarray, list[dict]]:
    """Reference gating, impulse freeze, adaptive filtering, residual enhancement.

    The default residual stage is *spectral*, not RNNoise; actual RNNoise is
    activated only via an explicit configured model and supplied callable.
    """
    primary, reference = _safe(primary), _safe(reference)
    if len(primary) != len(reference):
        raise ValueError('Primary and reference must have equal samples')
    nl = NLMSState()
    frames = []
    cleaned = np.empty_like(primary)
    prior_energy = 1e-6
    for i in range(0, len(primary), FRAME):
        p = primary[i:i+FRAME]
        r = reference[i:i+FRAME]
        power = float(np.mean(p*p)) + EPS
        ref_power = float(np.mean(r*r)) + EPS
        crest = float(np.max(np.abs(p)) / (np.sqrt(power) + EPS))
        burst = crest > 5.6 or power > 7.0 * prior_energy
        corr = float(np.corrcoef(p, r)[0,1]) if len(p) > 2 and np.std(r)>1e-6 and np.std(p)>1e-6 else 0
        corr = corr if np.isfinite(corr) else 0.0
        # Low energy reference or weakly-related mic bypass NLMS.
        trusted = abs(corr) > 0.11 and ref_power > 2e-6 and not burst
        cleaned[i:i+FRAME] = nl.process(p, r, adapt=trusted) if trusted else nl.process(p, r, adapt=False) if abs(corr)>0.11 else p
        frames.append({'t':round(i/FS, 3),'corr':round(corr,3),'freeze':bool(burst),'nlms_active':bool(trusted)})
        prior_energy = .8*prior_energy + .2*power
    residual = neural(cleaned) if neural else spectral_denoise(cleaned, strength=.8)
    return np.asarray(residual, dtype=np.float32), frames


def snr_db(clean: np.ndarray, estimate: np.ndarray) -> float | None:
    clean, estimate = _safe(clean), _safe(estimate)
    if len(clean)!=len(estimate):
        return None
    err = float(np.mean((estimate.astype(np.float64)-clean)**2))
    power = float(np.mean(clean.astype(np.float64)**2))
    if power < EPS:
        return None
    return float(round(10 * np.log10(power / max(err, EPS)),3))


def stoi_score(clean: np.ndarray, enhanced: np.ndarray) -> float | None:
    try:
        from pystoi import stoi
        return float(round(stoi(clean, enhanced, FS, extended=False), 4)) if len(clean)>=FS else None
    except (ImportError, ValueError, RuntimeError):
        return None


def pesq_score(clean: np.ndarray, enhanced: np.ndarray) -> float | None:
    try:
        from pesq import pesq
        return float(round(pesq(FS, clean, enhanced, 'wb'), 4))
    except (ImportError, ValueError, RuntimeError):
        return None


def evaluate_methods(clean: np.ndarray | None, primary: np.ndarray, reference: np.ndarray, model_path: str | None, *, real_speech: bool = False) -> tuple[dict,dict,list[dict]]:
    methods: dict[str,np.ndarray] = {'raw':primary.copy()}
    durations: dict[str,float] = {'raw':0.0}
    start = perf_counter(); methods['nlms'] = nlms(primary,reference); durations['nlms'] = perf_counter()-start
    start = perf_counter(); methods['spectral'] = spectral_denoise(primary); durations['spectral'] = perf_counter()-start
    model = bool(rnnoise_available(model_path))
    if model:
        start = perf_counter()
        methods['rnnoise'] = rnnoise_denoise(primary, model_path or '')
        durations['rnnoise'] = perf_counter()-start
    start = perf_counter()
    processed, trace = hybrid(primary,reference,neural=(lambda x:rnnoise_denoise(x,model_path or '')) if model else None)
    methods['hybrid'] = processed
    durations['hybrid'] = perf_counter()-start
    # Evaluate the same clipped signal we deliver as downloadable PCM16 audio.
    # The clipping ratio is also recorded so pathological inputs are visible.
    methods = {name: np.clip(arr, -1.0, 1.0) for name, arr in methods.items()}
    metrics = {}
    for name, arr in methods.items():
        metrics[name] = {'snr_db':snr_db(clean, arr) if clean is not None else None,
                          'stoi':stoi_score(clean,arr) if real_speech and clean is not None else None,
                          'pesq':pesq_score(clean,arr) if real_speech and clean is not None else None,'processing_ms':round(durations[name]*1000,2),
                          'rtf':round(durations[name]/(len(primary)/FS),3),
                          'peak':round(float(np.max(np.abs(arr))),4),
                          'clipped_samples':int(np.sum(np.abs(arr)>=1.0))}
    return methods,metrics,trace


def envelope(x: np.ndarray, bins: int = 190) -> list[float]:
    x=_safe(x)
    edges=np.linspace(0,len(x),bins+1, dtype=int)
    return [round(float(np.sqrt(np.mean(x[edges[i]:max(edges[i]+1,edges[i+1])]**2))),4) for i in range(bins)]
