# Data sources, licensing & reproducibility

## Recommended free/open sources (verify the current terms at download)

| Source | Use | License / major warning | Official source |
|---|---|---|---|
| **LibriSpeech / OpenSLR SLR12** | Real clean read speech (good initial controlled evaluations). | CC BY 4.0; attribute appropriately; `dev-clean` download is hundreds of MB, not trivial. | https://www.openslr.org/12/ |
| **DEMAND** | Diverse real environmental noise, useful multichannel background. | CC BY-SA 3.0; 16-channel recordings, 16k/48k WAV; give attribution, consider ShareAlike on redistributed derived audio. | https://zenodo.org/records/1227121 |
| **Microsoft DNS Challenge** | Additional clean/noise/RIR lists and benchmark synthesizer; optional. | **Mixed upstream licenses**; large (>hundreds GB) if full download. Start with a tiny compliant subset. | https://github.com/microsoft/DNS-Challenge |
| **Freesound** | CC0-licensed effects for footsteps/wind/machinery, selected with attribution records. | Each file may carry a different license. Never treat all recordings as CC0; retain the clip's author, license, URL, hash. | https://freesound.org |
| **NOISEX-92** | Historical benchmark if a permissible copy is available. | Access and re-use terms are not universally clear; verify origin and rights; it is not a mandatory blocker. | See relevant academic archive/rightsholder; do not auto-mirror. |
| **Xiph RNNoise** | Real neural inference binary library. | Repository code BSD-3-Clause; verify separate pretrained **model-weight** terms if redistributed. | https://github.com/xiph/rnnoise |
| **pystoi** | STOI implementation. | MIT library, input must be correctly aligned real speech. | https://github.com/mpariente/pystoi |
| **pesq** | Optional PESQ evaluation. | Wrapper can be MIT while underlying ITU reference / PESQ algorithm terms have restrictions. Confirm permissions for intended use. | https://github.com/ludlows/PESQ |

**Tip:** Use LibriSpeech `dev-clean` and a few DEMAND environments before downloading any full corpus. Small, diverse, legally-sourced experiments with good controls are more defensible than a terabyte of unlabeled noise.

## Data layout (on researchers' machines, outside Git)

```text
data/                         # .gitignore and/or mounted storage
  LibriSpeech/dev-clean/      # audio + original accompanying license
  DEMAND/                      # environmental noise WAV, keep scene names
  Freesound_CC0/               # per-clip provenance.csv
  recordings/                  # synchronized mic channels + metadata
artifacts/
  benchmark-YYYYMMDD/
    metrics.csv                # unaggregated outputs
    summary.csv                # mean, std, number of samples
    manifest.json              # source SHA-256, seed, code commit, licenses
    audio/                     # few legally distributable samples only
```

The repository ignores `*.wav`, `*.flac` and zip packages by default. For team reproducibility share a **manifest**, not the audio data, unless licensing, speaker consent and institution rules permit distribution. Prefer speaker-disjoint held-out testing and distinguish tuning versus final evaluation files.

## Benchmarks that matter

- Stationary: industrial hum, engine-like tone, ventilation.
- Nonstationary: crowd, traffic, intermittent machinery, gusts.
- Impulsive: abrupt bangs/clicks/drop events (simulate as generic impulse; don't claim live gunfire measurement).
- Stress: very low SNR (-10 dB and -5 dB), 0, +5, +10 dB; 3+ diverse noise classes; multiple speakers, seeds, durations.
- Channel realism: add geometry-based delay, reverberation, mic gain mismatch, independent background and speech leakage. Use Pyroomacoustics if beneficial; document simulator settings.
- Real microphone recordings: measure channel skew/DC offset/clipping, label whether clean ground truth exists, listening tests with consent. Objective reference metrics absent if truth unavailable.

## Provenance schema for any published graph

For every row: exact clean/noise clip IDs, SHA-256, dataset version/license, seed, target and measured SNR, sample rate, duration, channel geometry or simulation profile, algorithm configuration, model name + hash, Git SHA, OS/CPU, wall runtime, RTF, optional end-to-end latency on hardware, STOI/PESQ version, exceptions, and audio clips for auditory comparison where permissible.

Do not infer absolute intelligibility from SNR alone. One good clip does not demonstrate generalized robustness.
