import numpy as np
from app.dsp import FS, FRAME, evaluate_methods, hybrid, mix_pair, nlms, snr_db, spectral_denoise, synthetic_noise, synthetic_voice

def test_reproducible():
    a=synthetic_noise('wind',2.0,42)
    b=synthetic_noise('wind',2.0,42)
    np.testing.assert_array_equal(a,b)

def test_snr_target():
    clean=synthetic_voice(2.0)
    p=mix_pair(clean,synthetic_noise('factory',2.0,14),0,14)
    # full-signal SNR differs from activity-normalized target; should remain sane
    result=snr_db(clean,p['primary'])
    assert -8 < result < 5

def test_nlms_reduces_correlated_noise():
    rng=np.random.default_rng(7)
    n=rng.normal(0,.15,48000).astype(np.float32)
    clean=np.zeros_like(n)
    primary=clean+np.roll(n,3)
    estimate=nlms(primary,n)
    assert float(np.mean(estimate[2000:]**2))<float(np.mean(primary[2000:]**2))*.15

def test_spectral_and_hybrid_finite_and_aligned():
    clean=synthetic_voice(2)
    p=mix_pair(clean,synthetic_noise('impulse',2,4),3,4)
    for a in [spectral_denoise(p['primary']), hybrid(p['primary'],p['reference'])[0]]:
        assert len(a)==len(clean)
        assert np.all(np.isfinite(a))
    assert len(hybrid(p['primary'],p['reference'])[1])==len(clean)//FRAME

def test_without_model_no_fake_neural_score():
    clean=synthetic_voice(2)
    p=mix_pair(clean,synthetic_noise('engine',2,3),0,3)
    data,metrics,trace=evaluate_methods(clean,p['primary'],p['reference'],None)
    assert 'rnnoise' not in data
    assert set(data)==set(metrics)=={'raw','nlms','spectral','hybrid'}
    assert all(m['pesq'] is None or isinstance(m['pesq'],float) for m in metrics.values())
    assert len(trace)>10
