<div align="center">

# TRISHUL VANI

**Adaptive Speech Enhancement · Dual-Microphone DSP · Reproducible Research**

`VOLTEDGE ENGINEERING / SOFTWARE RESEARCH WORKBENCH / ALPHA 0.2`

**A connected spectral studio and speech-enhancement research laboratory with real processing, reproducible records, auditable metrics, and automated tests.**

[![Live Studio](https://img.shields.io/badge/LIVE_STUDIO-trishulvani.github.io-b8f6b2?style=for-the-badge&labelColor=080e10)](https://trishulvani.github.io/)
[![Python CI](https://img.shields.io/github/actions/workflow/status/TrishulVani/trishul-vani-studio/ci.yml?style=for-the-badge&label=TESTS)](https://github.com/TrishulVani/trishul-vani-studio/actions)
[![Source](https://img.shields.io/badge/SOURCE-PUBLIC-82b98b?style=for-the-badge&labelColor=080e10)](https://github.com/TrishulVani/trishul-vani-studio)

</div>

> [!IMPORTANT]
> **Research prototype.** No claims of certified real-time performance, speech recognition, hearing protection, tactical safety, secure voice communication, or completed Raspberry Pi deployment. Neural inference only runs when a genuine FFmpeg-compatible RNNoise model is configured; otherwise the UI explicitly displays a **spectral DSP fallback**. Synthetic voice is **not real speech**.

### Version 2 preview branch

The `feat/immersive-story` candidate uses a coherent dark green palette with restrained copper and gold details, Syne display type, and Manrope UI text. [Preview the automatic intro locally](http://127.0.0.1:8002/experience.html), or [open the connected V2 landing and lab](http://127.0.0.1:8002/index.html?design=2). A sculpted original trident moves through an animated sound field in the intro, approaches the viewer and passes through a circular reveal into the working application after about seven seconds; Skip Intro and Escape provide immediate entry. The landing opens on a framed, original acoustic chamber with a floating signal-field figure. Scrolling expands the chamber to full screen and moves the figure through acquire, separate and reveal chapters before the actual laboratory, measurements, history and spectral editor. Pointer movement subtly shifts the scene. Ground, sea and air are illustrative acoustic conditions in the copy, not recordings or claims of service testing. No microphone product imagery appears in the served V2 flow. The optional synthetic comparison, measured RMS waveform and STFT spectrogram still use the real FastAPI processor. Audio never autoplays. The [separate Version 2 public alias](https://trishulvani.github.io/design-v2/) remains on the previous public design until this candidate is approved and released; the [Version 1 site](https://trishulvani.github.io/) remains unchanged.

Run the browser tests with `pnpm install && pnpm exec playwright install chrome && pnpm exec playwright test`. They cover desktop, tablet and mobile navigation, the trident-to-lab transition, the connected WAV/STFT comparison, reduced motion, disconnected processor behavior, laboratory measurement/CSV export, and a non-destructive spectral edit with WAV exports. CI runs these alongside the existing Python, DSP and Docker checks.

## Two live designs · one connected v0.2 engine

Implemented: real STFT visualization, non-destructive attenuation/isolation, immutable source layers, previews, undo/redo, A/B playback, external WAV references, and WAV/JSON exports. The Python lab includes controlled experiments, NLMS, spectral gating, hybrid processing and measured metrics.

### Open the working application

| Destination | URL | Purpose |
|---|---|---|
| Version 1 | **https://trishulvani.github.io/** | Original mint visual system and intro, then the connected dashboard and studio |
| Design 02 | **https://trishulvani.github.io/design-v2/** | Current public design; rebuilt dark-green candidate is pending review |
| Direct Python application | https://trishul-vani-studio.onrender.com/ | FastAPI dashboard, experiment lab and spectral editor |
| Spectral workspace | https://trishul-vani-studio.onrender.com/studio.html | Direct editor access if a browser blocks embedded cookies |
| API documentation | https://trishul-vani-studio.onrender.com/docs | Interactive endpoint reference |

Both GitHub Pages entries load the complete Render application in an embedded workspace. The default backend URL serves Version 1; `?design=2` selects Design 02 without changing API behavior. The frontend calls FastAPI using same-origin `/api/...` routes inside that workspace, so uploads, STFT analysis, edits, experiment processing, history and exports are connected to the deployed Python service. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

### First-visit guidance

On the preview branch, Mission Control and Spectral Studio include a **? Help & tour** control in both designs. The five-step guided tour highlights real controls across both screens, can be skipped or replayed, and stores only the tour choice in browser local storage. The 80-second product video is **not yet recorded**; see [`docs/TUTORIAL_STORYBOARD.md`](docs/TUTORIAL_STORYBOARD.md) and caption draft for the planned authentic screen capture. The processor badge checks `/api/health` and `/api/meta`, reports disconnection honestly, and offers Retry.

### Visual experience and flow

1. The public address opens on an original, sculpted trident and animated signal field. It enters the connected dashboard automatically after 8.5 seconds; the Enter button and Escape key can advance earlier.
2. The dashboard is the actual working application. Start a synthetic experiment, import your own WAV/FLAC recordings, or launch the spectral editor. The browser stays at the public address while navigating inside the embedded workspace.
3. Design 02 lives at its own address. The candidate uses an original sculpted trident intro, an original floating field figure and acoustic chamber, editorial typography, scroll-driven sound ripples, a framed-to-full-screen reveal and a cohesive dark green palette with copper-gold accents. It automatically enters the landing after the intro, and immediately enters on Skip or Escape. Motion reduces when the visitor requests reduced motion. [Lusion](https://lusion.co/), [Spaace](https://lusion.co/projects/spaace/) and [DDD 2024](https://lusion.co/projects/ddd_2024/) informed the pacing and spatial composition; their images, code and branding are not used.

The public website and the backend are separate repositories/services: [`TrishulVani/trishulvani.github.io`](https://github.com/TrishulVani/trishulvani.github.io) hosts the entry shell on GitHub Pages, and this repository hosts the full app on Render. The source for the Pages shell is mirrored in [`deploy/pages/`](deploy/pages/).

### Release and CI/CD

- **Version 1:** the original mint intro, typography, dashboard and editor remain at the root address.
- **Design 02:** a separate `/design-v2/` website path and opt-in `?design=2` backend presentation. The work was developed on the `feat/design-v2` branch. Both designs use the same v0.2 alpha DSP and API.
- GitHub Actions runs Python 3.11/3.12 API and DSP tests, JavaScript syntax/DSP tests, Design 02 asset checks and a Docker build on pushes and pull requests. The workflow is in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
- Render automatically builds this repository's `main` Docker image on every new commit. Feature-branch CI is checked before merging; main CI runs alongside deployment and does not gate it. GitHub Pages publishes the public shell from `TrishulVani/trishulvani.github.io` `main` branch. See the [deployment guide](docs/DEPLOYMENT.md) for configuration and verification.

> [!NOTE]
> Render's free service can take about a minute to wake. Hosted workspaces are separated by an unguessable secure browser cookie, but storage is temporary and resets when the service restarts. Export WAV, CSV and JSON results you need to retain.

## What is working now

| Area | Status | Evidence |
|---|---|---|
| Responsive interactive web workbench | ✅ Built | `web/index.html`, `web/styles.css`, `web/app.js` |
| Python/FastAPI REST backend | ✅ Built | `app/main.py`, OpenAPI at `/docs` (see note below) |
| Synthetic stationary/changing/impulsive noise | ✅ Built | Factory, engine, wind, crowd, impulse; seeded generators |
| Clean + noise controlled SNR mixture | ✅ Built | SNR calibrated on the entire waveform, common gain clipping prevention |
| Reference-mic NLMS adaptive cancellation | ✅ Built | `app/dsp.py` + repeatable tests |
| Spectral DSP reference baseline | ✅ Built | `app/dsp.py`, explicitly not labelled neural |
| Hybrid controller (gating, freeze, fallback) | ✅ Prototype | DSP fallback works; RNNoise only with optional real model |
| Actual RNNoise neural inference | ⚙️ Optional | Configure compatible model in `RNNOISE_MODEL` |
| Upload clean speech + noise | ✅ Built | UI/API accepts WAV/FLAC; computes known-reference metrics |
| Upload synchronized primary and ambient recordings | ✅ Built | SNR/STOI/PESQ intentionally N/A without clean reference |
| Experiment playback, waveform, method comparison | ✅ Built | Four methods, optional fifth when model is present |
| SNR, STOI, PESQ*, processing time, RTF, CSV export | ✅ Built | Only when mathematically available; *PESQ requires optional package/licensing check |
| Local provenance and repeatable histories | ✅ Built | Persist WAV, parameters, control trace and metrics per run |
| Dataset benchmark CLI with hashes/CSV/manifest | ✅ Built | `scripts/evaluate_dataset.py` |
| Unit and end-to-end API tests | ✅ Built | `pytest` |
| GitHub Actions CI | ✅ Configured | `.github/workflows/ci.yml` |
| C++/Raspberry Pi and actual two-node link | ◻ Planned | Detailed gates in `docs/ROADMAP.md` |

## Quick start (Windows PowerShell / Linux / macOS)

```powershell
# From the repository root:
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt
python -m pytest
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Then open **http://127.0.0.1:8000**. Interactive REST API docs: **http://127.0.0.1:8000/docs** (FastAPI docs route is registered before the static mount). No JavaScript build step, npm subscription, paid API key, database server, or cloud account required. Fonts use online enhancement *only when reachable*, with system fallbacks.

For private durable storage or sensitive recordings, run the application locally. The public service is a bounded research demonstration, not a durable multi-user archive.

### Docker (optional)

```bash
docker compose up --build
```

Open the same local URL. In Compose, the server binds to **127.0.0.1**, and output files persist in a named Docker volume.

## Research workflow

1. Open the **Audio laboratory**. Choose a noise class, controlled input SNR (-15 to +20 dB), duration and deterministic seed.
2. Click **Run signal analysis**. The backend creates clean synthetic test signals, reference-mic noise, raw mixture, NLMS, spectral output and hybrid output.
3. Compare waveform, listen to **RAW / NLMS / SPECTRAL / HYBRID**, inspect computed SNR, objective metrics if applicable, processing time and RTF.
4. Download WAV and per-run CSV. Each run is persisted at `artifacts/<run_id>/` and can be re-opened from history.
5. **Use real human speech before interpreting STOI or PESQ.** Upload speech + noise WAV/FLAC via the UI. Data sources and licensing are in Dataset vault and `docs/DATA_PROVENANCE.md`.
6. Upload *paired, synchronized* mic recordings through the dual-mic importer once captured. With no true clean ground truth, SNR and intelligibility quality metrics are deliberately unavailable.
7. Execute multi-file benchmark matrix via the CLI, store licenses, hashes and exact source paths for presentation-ready evidence.

### Benchmark actual public datasets

Download **only the speech/noise subset you are licensed to use**, retain its original terms, then:

```bash
python -m scripts.evaluate_dataset \
  --speech-dir data/LibriSpeech/dev-clean \
  --noise-dir data/DEMAND \
  --speech-license 'CC BY 4.0' \
  --noise-license 'CC BY-SA 3.0' \
  --limit 3 \
  --snrs -10 -5 0 5 10 \
  --duration 3 \
  --out-dir artifacts/benchmark-librispeech-demand
```

The benchmark writes `metrics.csv`, `summary.csv` (means and standard deviations), `manifest.json` (file SHA-256, seed, source terms and commit), and a small group of WAV examples. **It does not download or commit datasets.** Data in `data/` should be `.gitignore`d and stored locally or in approved research storage.

### Optional real RNNoise (neural) path

The app does **not bundle neural models**. For real RNNoise: install an FFmpeg build that contains the `arnndn` filter, obtain a compatible `.rnnn` model from a source whose model license you have verified, and set an absolute path to the model before starting the backend:

```bash
# Linux/macOS:
export RNNOISE_MODEL=/absolute/path/to/verified-model.rnnn
ffmpeg -filters | grep arnndn
# Windows PowerShell:
$env:RNNOISE_MODEL='C:\models\verified-model.rnnn'
```

A valid model enables **RNNoise** as a *separate* fifth method and changes the hybrid residual stage from spectral to actual neural inference. Misconfigured models raise errors, not fake results. The reference RNNoise interface uses 48 kHz internally; FFmpeg handles conversion from/to the 16 kHz research pipeline. Measure delay after integration. Code is not a neural training system.

### Benchmarks, limitations, interpretation

- **SNR** is an error-based `10log10(Pclean / P(clean−enhanced))` for known, time-aligned clean reference. It is not a subjective quality measurement and is marked `null` without clean reference.
- **STOI** (via `pystoi`) and **PESQ** (optional) are used for *real speech with known clean reference*; we intentionally do **not** give the synthetic tone a meaningful intelligibility score.
- **RTF** is offline processing time divided by audio duration. RTF < 1 on a host **does not prove** glitch-free playback or <10 ms real-time latency on Raspberry Pi.
- **Reference gating** based on short-frame correlation is an initial policy to tune on synchronized real recordings. It is not robust to all speech leakage, multipath propagation, or high-energy transients; validation gates must address this.
- Do not present software-inferred results as measured military gunfire, vehicle, or battlefield performance. Simulated impulse and engine signals are **proxies**, not field recordings.
- Generated/audio artifacts use signed PCM16 WAV: processing outputs are clipped to valid WAV range. Peak and clipped-sample counts are saved for analysis. Examine clipping counts before treating outputs as comparable.

## Architecture

```mermaid
flowchart LR
    P[trishulvani.github.io<br/>intro + public entry] --> A[Hosted web lab / UI]
    A -->|same-origin JSON + WAV| B[Render FastAPI service]
    B --> C[Dataset mixer / two-mic ingest]
    C --> D[NLMS reference baseline]
    C --> E[Spectral baseline]
    C --> F[Optional actual RNNoise]
    C --> G[Hybrid controller]
    G --> D
    G --> H[Residual spectral or RNNoise]
    D --> I[Quality / runtime evaluator]
    E --> I
    F --> I
    H --> I
    I --> J[Visitor-isolated temporary store]
    J -->|WAV, CSV, history, trace| A
    K[(LibriSpeech / DEMAND / CC0 clips)] -. local, user-supplied .-> C
```

The longer-term target remains **Operator A → Node A / reference-mic NLMS → residual neural stage → wired link → Node B → Operator B**. AKSHARA is optional, **after** the reliable two-node demonstration; it is not part of the core software scope.

## Repository map

```text
app/                   FastAPI, WAV input/output, experiment orchestration
  dsp.py               Algorithms, simulated sources, optional genuine RNNoise
  main.py              API, validation, local persistence and static web
web/                   Zero-build responsive UI (CSS, JS, SVG)
scripts/               Offline benchmark, reproducibility manifests
tests/                 Deterministic DSP tests, API end-to-end tests
docs/                  Architecture, dataset licenses, validation, build strategy
.github/workflows/     Continuous integration pipeline
artifacts/             Gitignored results (CSV, WAV, JSON, provenance)
CODEX_MASTER_PROMPT.md  Task contract for Codex to finish software progressively
```

## API surface

| Endpoint | Function |
|---|---|
| `GET /api/health` | Connectivity |
| `GET /api/meta` | Honest method/capability flags |
| `GET /api/diagnostics` | Infrastructure state, no pretend Pi telemetry |
| `POST /api/experiments/simulate` | Deterministic synthetic environment |
| `POST /api/experiments/upload` | Real clean speech and noise files |
| `POST /api/experiments/dual-mic` | Recorded synchronized primary/reference mic WAV |
| `GET /api/experiments` | Stored history |
| `GET /api/experiments/{id}` | Full report, trace, metrics, waveforms |
| `GET /api/experiments/{id}/audio/{method}` | 16 kHz WAV download and playback |
| `GET /api/experiments/{id}/export.csv` | Auditable per-method CSV |
| `GET /api/datasets` | Source URLs, use and license warnings |
| `GET /docs` | OpenAPI UI |

## Contributing + Git hygiene

Every software milestone is committed separately with tests and documentation. See `CONTRIBUTING.md` and `CODEX_MASTER_PROMPT.md`. Do **not** commit third-party WAVs, models, datasets, tokens or unvalidated benchmark images. The public repository is [`TrishulVani/trishul-vani-studio`](https://github.com/TrishulVani/trishul-vani-studio); design work is developed on feature branches and integrated into `main` after validation.
