# Architecture Decision Record / 001 — Offline-first, evidence-first

## Project objective

TRISHUL VANI 2.0 by VoltEdge is a two-operator communication research demonstrator intended to **improve speech intelligibility in noisy environments** using a primary close-talk microphone and an ambient/reference microphone. The long-term implementation is a low-latency **Linux-edge-first (Raspberry Pi)** real-time processing system, then a tested C/C++ embedded audio pipeline. A locally wired link connects **Operator A → Node A → noise reduction → link → Node B → Operator B**. AKSHARA is an *optional* two/three fixed-phrase confirmation/display add-on **only after the basic two-node path works**. No ASR/LLM/cloud is required for core operation.

## Practical software architecture

```text
                        LOCAL WEB WORKBENCH
                HTML/CSS/JS, browser WebAudio playback
                          /api/* JSON
                              |
                      FastAPI control plane
                              |
  WAV/FLAC speech --+          +--- deterministic experiment config, seed
  WAV/FLAC noise ---+--> Audio conditioning, resample to 16k, bound/clipping
  dual-mic WAV A ---+                  |
  dual-mic WAV B ---+      primary speech+noise, ambient reference
                              |
      +-----------------------+-------------------------+
      |                      |                         |
    RAW                 NLMS-only                  spectral-only
      |                      |                         |
      +--------- HYBRID reference policy ---------------+
                          |
       reference level, local frame correlation, impulse detector
       adapt/freeze/bypass NLMS; residual stage (RNNoise if real)
                          |
                  Audio output / optional AI
                          |
            metrics and provenance (when clean truth exists)
                          |
            report.json / WAV / CSV / control trace
                          |
       browser comparisons / benchmark export / presentation
```

The web backend is **control plane and offline experiment runner**. It is deliberately *not* the production audio callback. After algorithms have been evaluated, implement a dedicated native **data plane** (`libtrishul`) for low-allocation sample processing and two-node transport. Never place HTTP callbacks or blocking database/file/model/network operations in the audio callback.

## Core modules & interfaces

- **Dataset ingestion** — validate mono/stereo, sample rates, duration, clipping; resample explicitly. Distinguish `clean` (evaluation-only), `primary` (speech+noise), and `reference` (ambient correlated-noise channel). A later RIR simulator can produce geometry-specific, delayed two-mic signals; no shared exact-noise oracle.
- **Classical adaptive** — NLMS filter with persistent weight/history state; provide frozen-weight execution when a transient threatens stability. Experiment tests should cover convergence, double-talk, unequal delays, no-reference, correlated versus independent noise, sample amplitude, numerical stability.
- **Neural residual** — separate interchangeable interface. True RNNoise only when a real .rnnn model is present and loaded. Typical RNNoise native processing works with 48 kHz / 10ms frames: 480 samples. The internal *controller* uses 16 kHz / 10ms = 160 samples. Resample at the interface; account for delay and preserve state across frames. FFmpeg path is for file-based evidence, **not** a proven hard-real-time callback.
- **Controller** — stationary/reference-trusted → NLMS + neural; nonstationary/uncorrelated → neural-only fallback; strong impulsive sound → freeze adaptation; if neural unavailable → **explicitly named spectral DSP fallback**; excessive CPU → documented bypass policy. Current gating is *heuristic* and not yet validated with field recordings.
- **Supervisor** — in native application collect p50/p95/p99 per-frame compute time, audio under/overruns, CPU/RAM/temperature, clipping, clock sync, packet loss and queue depth **off the callback thread**; push immutable low-rate state snapshots to UI. Never use a fake "connected Raspberry Pi" UI when hardware absent.
- **Sender/receiver transport** — first loopback PCM framing: sequence ID, monotonic timestamp, PCM payload, fixed small buffer, loss concealment, fade-out; then local wired transport per final electronics design, dropout/resync tests. No claim of encryption without tested secure implementation.
- **Persistence** — current local on-disk JSON + WAV + CSV. Before multi-user remote deployment migrate to relational metadata and an explicit retention/auth policy.

## Core invariants

1. **One ground truth** for SNR/STOI/PESQ: captured clean human speech must be truly aligned. The enhancement algorithm must not see the clean reference; it exists only in the scorer/mixer for controlled evaluation.
2. **Sample-rate awareness**: every file carries its original and effective sample rates; RNNoise boundary documented with actual conversion.
3. **Comparable input**: RAW, NLMS, RNNoise, and Hybrid must receive the same primary WAV and appropriate same-session reference. Compare like with like; no cherry-picking.
4. **No false AI path**: if neural unavailable, the dashboard says DSP fallback, stores that model state in JSON and omits RNNoise result row.
5. **No invented metrics**: if ground truth absent, SNR/STOI/PESQ = null; no simulated Pi telemetry, no measured latency until instrumented.
6. **Run reproducibility**: config, seed, data hashes, model hash, library versions, Git SHA, waveform clipping counts, CPU details recorded with each benchmark before publication.
7. **Privacy by default**: offline processing; raw mic audio user-provided; data stays on local disk; no analytics beacons, API keys or online inference.
8. **User trust**: the platform is a scientific measurement interface, *not* a special-effects presentation with fictional success badges.

## UI/UX design system

**Theme:** "Obsidian Signal Lab": #080e10 base, #101919 cards, bioluminescent #b8f6b2 primary, muted teal secondary, fine hairline borders, chart precision. Identity uses three abstract prongs referencing Trishul. Fonts Space Grotesk/DM Sans (system fallbacks). Responsive and accessible; keyboard focus states and reduced-motion support.

**Information architecture:** Overview → Audio Laboratory → Signal Intelligence → History → Dataset Vault → System Diagnostics. Primary user journey: configure scenario → run → compare wave/audio → audit numeric result → download proof → repeat. Code uses `fetch` to render real records only. Visual movement (orbit, waveform, progress, hover rise) communicates *state and hierarchy*; animation doesn't replace scientific evidence.

**Next design iteration**: Once basic correctness is stable, migrate to React + TypeScript + Vite, preferably with Tailwind 4, shadcn/ui, Motion for React, and a waveform/spectrogram component. This is optional; the **current dependency-free UI already works** and a React migration must not interrupt API/algorithm correctness or require paid services. If migrating, carry screenshots and automated Playwright tests for regression checks.

## Decisions yet to validate experimentally

- Frame structure, NLMS taps/step size/leakage, measured convergence, reference delay estimation and alignment.
- Speech leakage and double-talk detectors: global correlation alone may be unreliable with clean speech and transients.
- Impulse threshold/hysteresis, blockwise artifacts/clicks across mode switches, crossfade/gain normalization.
- RNNoise real model selection, version license and 16k ↔ 48k anti-alias/delay compensation.
- Platform latencies: process compute versus physical input/output, p95/max per-frame, underruns, packet jitter.
- Noise realism: DEMAND recordings are environmental ambience; gunfire/impulse stand-ins must not be presented as tested tactical acoustics.
- C/C++ reference output parity and platform-specific testing before firmware integration.
