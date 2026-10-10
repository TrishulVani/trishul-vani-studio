# COPY INTO CODEX — TRISHUL VANI 2.0 MASTER BUILD CONTRACT v0.2

**Update 2026-10-10: Spectral Intelligence Studio and portal motion design.** This is a SPECIFICATION update, not proof of implemented new functionality or a GitHub push. You have a tested v0.1 codebase. Continue from it.

## Read order / new source of truth

Before editing inspect `AGENTS.md`, `README.md`, `docs/ROADMAP.md`, `docs/SPECTRAL_STUDIO_SPEC.md`, `docs/PORTAL_UI_UX.md`, `docs/PORTAL_REEL_INTAKE.md`, `docs/CODEX_TASK_PROMPTS.md`, `docs/ARCHITECTURE.md`, `docs/VALIDATION_PROTOCOL.md`, `docs/DATA_PROVENANCE.md`, `SECURITY.md`, existing source and actual Git history. New v0.2 documents override prior master prompt **only** about the *new spectral feature/UI and task order*; all previous truthfulness, DSP, reproducibility, CI, Git rules remain.

## Your revised product objective

Transform the existing working TRISHUL VANI research workbench into **a complete local-first Spectral Intelligence Lab** with a premium, interactive, responsive frontend and a real integrated backend: authentic STFT spectrogram, time/frequency interaction, non-destructive spectral mask edits, original/noisy/processed track comparison, manually imported *SpectraLayers-processed* WAV reference, end-to-end reproducible experiments, proper signal metrics, and later verified dual-mic NLMS/genuine RNNoise/TRISHUL Hybrid native streaming. No proprietary extraction, reverse engineering or unsupported claims about Steinberg APIs. Research instrument, NOT SpectraLayers replication.

### SpectraLayers-informed capabilities we ARE implementing (our own code)

- Analyze waveform/spectrogram with quantitative time-frequency axes (true FFT/STFT), markers and frequency inspector.
- Professional-workflow **layer stack**: source locked, reference/processed tracks, selection masks as immutable operations, preview/apply/undo/redo/export.
- Frequency/time rectangular editing and frequency-band attenuation/isolation with documented complex-STFT/iSTFT math and tests. Later brush/lasso only if feasible/tested.
- Independent reference module: user may export result from Steinberg SpectraLayers 13 externally, import WAV here, label edition/module/settings as **user-supplied optional metadata**, and compare A/B; always distinguish `External offline reference`, `Our spectral DSP`, `Actual RNNoise`, `TRISHUL Hybrid`.
- Reference-grounded SNR/STOI/PESQ ONLY with independently recorded clean speech; listening and exploratory spectral diagnostics if no ground truth. NO false 'SpectraLayers API' integration and NO promises of equivalent proprietary AI models.

### Portal/reel-inspired UX — firm constraint

The user likes the existing Obsidian Signal Lab colors, so **KEEP** `#080e10` canvas, mint `#b8f6b2`, technical cards and trident signature. The user mentioned a portal reel but **THE REEL IS NOT PROVIDED IN THE CURRENT PROJECT**: do not invent its elements, screenshot claims, colors, animations or precise timing. Read `docs/PORTAL_REEL_INTAKE.md`; once provided do timestamp-based visual audit and integrate 3–5 inspirations (interaction *principles*, not copyrighted logos/assets/clones). While waiting, deliver a useful, fully functioning generic portal upgrade: expandable navigation, command palette, stepwise experiment journey, collapsible inspector, accurate timeline/ruler, reactive trident controller flow, signal-driven animations, drag/drop audio and source provenance. No fake live telemetry. Respect pointer/touch, reduced motion, audio accessibility and 375/768/1440 viewport tests.

### Revised execution order (highest priority)

1. **S0** verify v0.1 baseline/tests/API/available authorized Git remote. Fix only genuine baseline problems. Save report.
2. **S1** dataset registry/provenance with small REAL human speech + REAL environment noises, licensed and user-installed, fixed seeds and manifests. No fake speech scores.
3. **S1.5 Level A** *Spectral Studio viewer* real FFT/STFT, signed-in? No: local-first research use with safe upload limits. Real spectrogram tiles, accurate waveform/axes and synchronized playback.
4. **S1.5 Level B** non-destructive mask layer editor + preview/undo/redo/export; numeric tests and real audio verification.
5. **S1.5 Level C** SpectraLayers/manual external WAV reference import + alignment, clean-truth metrics only, A/B comparison and provenance report.
6. **S2/S3** validate genuine RNNoise + NLMS reference gate/hybrid policies and per-frame traces, identical data. Distinguish spectral fallback.
7. **S4** uplift complete frontend/navigation/microinteractions/reel-specific mapping **once reel exists** with tested API-connected screens; no disconnected mockups.
8. **S5/S6** real evaluation job queues, C++ parity, two-node software-only simulator.
9. **S7/S8** Pi adapters where accessible, release docs/CI/benchmark evidence, honest pending hardware.

Use each task block from `docs/CODEX_TASK_PROMPTS.md` **separately**; if running under GPT-5.6 Medium or GPT-6 Light, do not implement all at once. Scope one milestone per invocation and do the commit/push before starting next. `docs/ROADMAP.md` is the canonical progress and acceptance-gate ledger.

### New acceptance gates

- Viewer: actual WAV→backend STFT→correct spectrogram and time-frequency units→scrub/play/zoom; test round-trip reconstruction and mismatched formats; mobile UI works.
- Editor: attn/isolate only where selected, preview/export same audio length, no destructive change, undo/redo reproducible, hashes and recipes preserved; wave mask edits quantitatively validated.
- Comparison: external WAV provenance, correct alignment + sample rate handling, loudness-matched A/B, no ground-truth metrics without truly available independent clean speech; no proprietary SDK claims.
- UX: user can **complete** a full upload→view→select→process→compare→export flow; browser E2E; reduced motion and color contrast; animations state-driven.
- DevOps: tests/CI documented and checked; branch per step, meaningful local commit; push only to user-approved GitHub repo. If remote is missing, ASK URL, proceed with local tests/commits and truthfully report not pushed.

**Immediate instruction to execute**: Baseline audit, then S1 only if incomplete. As soon as S1 gate is green, start **Spectral Studio Level A** next rather than unrelated UI decoration. Do not wait for reel to implement functional audio research. At no point announce '90% complete' before counting passed hardware-independent software acceptance gates.

---

# Original v0.1 engineering contract (unchanged where not superseded above)

# COPY INTO CODEX — TRISHUL VANI 2.0 SOFTWARE BUILD CONTRACT

You are the lead full-stack systems engineer, DSP/ML engineer, UI/UX engineer, DevOps maintainer, and test engineer building **TRISHUL VANI 2.0** for team **VoltEdge**. You have a working alpha monorepo; do **not** destroy it or start a disconnected replacement. Begin by reading `README.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/VALIDATION_PROTOCOL.md`, `docs/DATA_PROVENANCE.md`, `SECURITY.md` and the original academic design (if present). Inspect the actual files and Git history before proposing changes. The architecture/scope below is binding unless a technical test justifies a documented change.

**SCOPE PRIORITY:** Complete the maximum possible **software engineering, offline audio research, neural/DSP integration, test automation, interactive user-facing app, and documentation** before physical Raspberry Pi hardware. The output must be a **working application**, not a flashy UI mockup. Target **90% of the hardware-independent software acceptance gates**, but do not claim that percentage based on estimates. Prove completed gates with executed tests, source commits, repeatable benchmarks, and relevant WAV outputs.

**IMPORTANT MODEL CONTEXT:** You are operating under limited reasoning budget (e.g., GPT-5.6 Medium or GPT-6 Light). Work in **small deterministic tasks**: inspect → plan ≤5 lines → implement one coherent feature → test → review diff → commit → push → report evidence → next task. Do not attempt a giant one-shot rewrite, skip tests, or repeat a full context essay per task. Use `docs/ROADMAP.md` as immutable task ledger, updating it carefully after each milestone. Read one module at a time and minimize unnecessary package rewrites.

---

## Product truth and system boundary

**Purpose:** speech improvement in noisy environments with two microphones and an adaptive + neural residual noise reducer. The final demonstrator is:

`Operator A (close talk mic + ambient/ref mic) → Node A (reference gate → NLMS → genuine RNNoise residual → supervisor/fallback) → tested wired communication link → Node B (receiver playback) → Operator B.`

Internal controller example: **16 kHz mono, 10 ms = 160 samples**. **Native RNNoise uses a 48 kHz domain with 10 ms / 480 samples**; resample carefully, retain model state, measure latency and maintain output sync. NLMS requires a correlated ambient/reference microphone; it must be bypassed/frozen if reference fails, leaks speech heavily, or an impulse destabilizes weights. Use one shared neural enhancer, not imaginary three different AIs. Policies: stationary/reference-trusted → adaptive path; nonstationary/reference-unreliable → neural-only; impulsive → freeze adaptation. Supervisor degradation should not block audio callbacks. No cloud requirement for realtime operation. Training/evaluation (offline) separate from realtime inference. A true neural engine **must not be silently emulated** by spectral gating.

**AKSHARA is OUT OF SCOPE** until a real two-node audio communication demo is working; only then optional 2–3 fixed phrases with local confirmation display. No prematurely added ASR, generative AI, tactical map, secure radio label, military-grade speech recognition, or unverified hearing protection/security claim.

---

## Phase implementation requirements

### 1. Capture current green baseline

- `git status`, `git log -6`, `git remote -v`, inspect code. If no remote, **ask for exact GitHub repo URL** and continue local changes as commits; **never push into an unrelated repository**.
- Create `.venv`, install `requirements-dev.txt`, run `python -m pytest -q`, `node --check web/app.js`, `python -m compileall -q app scripts`, start API and inspect `/api/health`, `/api/meta`, `/docs`, UI. Fix baseline problems before feature work.
- Record environment (Python, FFmpeg, NumPy/scipy, OS), visible tool failures, current limitations. Do not invent command success.

### 2. Implement genuine data engineering (high priority)

- Add structured dataset registry with source, source URL, version, license, attribution, SHA-256, splits, duration/sample-rate/channel labels, clean/noise/real-dual-mic flag. Do not commit huge raw audio datasets or copyright-unsafe samples.
- Integrate local **LibriSpeech dev-clean** human speech and **DEMAND** multichannel environmental noise. Optional limited subsets from DNS Challenge and carefully selected CC0 Freesound noises. Check every dataset's actual license. Prefer small, manually installed sample corpus rather than >100GB automatic downloads. NOISEX-92 only if legitimate reuse is clear.
- Make a dataset ingestion CLI and UI import workflow; allow sample selection/caption/provenance; expose local structured metadata in backend.
- Use deterministic mixtures at -10, -5, 0, +5, +10 dB, several speakers/noises/seeds with true input SNR reported. For real dual-mic reference, simulate different RIR/delay/gains/non-correlated noise and test with truly synchronized recordings. Avoid leaked clean reference into the enhancement algorithm.
- Separate tuning corpus and final held-out corpus. Give every run source path+hash+license.
- **Gate:** at least 3 human speech samples, 3 genuine environmental noise classes, at least 5 SNR values, consistent hashes, no data-license violations; expose verified WAV/CSV.

### 3. Harden four algorithm paths

- Baseline 0 **RAW** no processing.
- Baseline 1 **NLMS** with transparent sample-history, step-size/config, norm epsilon, stable numerics, hold/freeze mode; compare algorithm against a reference cross-check.
- Baseline 2 **true RNNoise** via verified licensed model. File mode can use FFmpeg arnndn or validated wrapper; native streaming must use official RNNoise library with correct 48 kHz/480-sample frames. If model missing, mark unavailable and keep **separately named spectral DSP** baseline, not an AI result.
- Main **TRISHUL Hybrid**: reference quality evaluation; noise correlation/energy change; double-talk/speech-leakage defense; impulse threshold + hysteresis + adaptation freeze; NLMS selective update; residual RNNoise; soft crossfades; per-frame mode trace; overload fallback. Expose all thresholds as config, no magic hidden UI constants. Ensure all outputs are sample-aligned and derived from same primary signal.
- Add a stateful offline-streaming `process_frame` interface, compare with batch for parity. Check signal scaling, DC, channel alignment, spikes, stalling and sample timing. Compute per-method objective quality only against actual known clean truth.
- **Gate:** repeatable numeric test suite of convergence, low SNR, reference mismatch, silent input, independent reference, speech leakage, impulses, clipping, no NaNs, precise frame boundaries; actual RNNoise demonstrably loads and runs.

### 4. Complete evaluation platform and provenance

- SNR/ΔSNR, STOI/ΔSTOI, optional PESQ (review underlying algorithm licensing), true processing time, real-time factor, p50/p95/p99 frame compute after instrumentation; CPU/RAM only where measured. Do **not** confuse file processing duration with physical end-to-end latency. Inference timestamps/weights/OS/model hashes should be captured.
- Create test scenario matrix from real free datasets: RAW / NLMS / genuine RNNoise / HYBRID / clearly separated spectral fallback across stationary, nonstationary, impulsive, low/high SNR, poor reference, clipping and dropout.
- Save per-run JSON/CSV and fixed-seed WAV; generate summary (mean/std/n), failure examples and score distributions; add CI offline fixtures.
- If no clean speech source (actual two-mic recording), SNR/STOI/PESQ = `null`. Never generate imaginary quantitative claims.
- Improve reproducibility manifest: exact model SHA, package lock versions, input SHA, source license, tuned thresholds, OS/CPU, Git commit, seed, resampler configuration.
- **Gate:** repeat runs from same manifest produce same outputs within stated numeric tolerance; summary backs individual CSV rows; no chart drawn from fake metrics.

### 5. UI/UX flagship product experience

Respect existing **Obsidian Signal Lab** visual identity: deepest green-black canvas, bioluminescent mint, technical typography, three-prong abstract logo, precise tiny labels, organic signal visualizations. Prioritize a serious research tool, **not a template dashboard**. Study `web/` and improve it; keep actual backend connectivity. A migration to React/TypeScript/Vite/shadcn/Tailwind/Motion may be done if it materially improves testability and maintainability, but do **not** throw away working state to chase framework fashion. Favor performant animations using Canvas / Web Audio / CSS transforms; use `prefers-reduced-motion`.

Implement or refine:
1. **Mission Control**: honest readiness and dataset/model telemetry, useful CTA, no fake live counters.
2. **Experiment Studio**: upload human speech/noise/dual-mic; scenario presets and per-microphone visualization; SNR, duration, speaker/source, reproducibility seed, model/method, threshold tuning; reusable configs.
3. **Signal Viewer**: synchronized RAW / NLMS / RNNoise / HYBRID waveforms, actual FFT spectrogram, channel reference trace, zoom, scrub, loop A/B playback and download at identical loudness.
4. **Adaptive Controller Inspector**: timeline color-coding stationary/uncorrelated/impulse with confidence and frozen NLMS weights; informative tooltips; no invented switching telemetry.
5. **Benchmark Arena**: condition×method heatmap and uncertainty, ∆SNR/STOI/PESQ distributions, process-time p95, per-run drilldowns, reproducible CSV/PDF and generated charts (all real backend data).
6. **Dataset Vault**: browse installed/available corpora, licensing, auditable download/import, provenance and clips.
7. **System / Edge Lab**: real live process state if instrumented; otherwise 'not connected' with a guide. Later overlay real Pi telemetry and link health.
8. **Experiment History**: search/filter/sort, pin/compare, export and delete with confirmation.
9. **Onboarding/Docs**: setup health check, permission-aware mic tests, keyboard accessibility, adaptive responsiveness, animation that indicates an actual transition.

**Visual acceptance:** 375px, 768px, 1440px screenshots in CI; zero horizontal overflow; readable fonts/contrast; focus states; reduced motion; all buttons wired; loading, progress, empty states and errors; no misleading success graph. Use Playwright for run + upload + export + audio switching + history + mobile.

### 6. Architecture, CI/CD, API and security

- FastAPI with typed request/response schema, OpenAPI, narrow routes, clean exception contracts, max size/audio length, safe names/paths, normalizing sample formats and actionable errors.
- Keep async file loading safe. Move long-running experiments to bounded workers with persisted job queue, progress/event stream and cancellation. Never block the frontend while heavy benchmark processing runs. Optional lightweight SQLite metadata backend when file scans become slow.
- Add Pytest DSP unit tests, fixture integration tests, OpenAPI tests, security tests, browser E2E tests, linters, type checking, deterministic benchmark smoke, Docker smoke and selective CPU perf regression gates. Mark hardware-only tests separately so CI never pretends to run them.
- GitHub Actions: run on pushes and PRs, default `contents: read`, cache dependencies, timeout, matrix, pip-audit/Gitleaks if configured, artifact receipts; require green checks before PR merge. Use branch protection where permitted. Build container. A deployment workflow should run only for the right repo/authorized environment and **only when the owner provides destination and credentials**. Do not publicly expose unauthenticated audio-upload service.
- Record API contracts and architectural decisions, CLI reference, reproducibility guide, validation matrix, screenshots and changelog. README quick start must be executable on Windows 11 and Ubuntu.
- Maintain good performance by keeping DSP in NumPy/native optimized code, no per-sample JavaScript computation, bounded memory/small uploads, caching only when correct, sensible payload sizes. Profile before optimizing.
- **Gate:** fresh-clone setup, complete backend frontend connectivity, verified Docker image and green CI; no repository secrets/media blobs.

### 7. Streaming/native software path (still without boards)

- Port NLMS/hybrid controller to C/C++ with CMake; test on recorded WAV, compare against Python reference with preset tolerances. Document tests and model ABI.
- Actual native RNNoise library integration and low-allocation fixed-sized frames. Must not load files or block audio callback; supervisor uses cached configuration, atomic state snapshot and asynchronous workers.
- Build Node A/Node B **software-only** loopback simulator with framed PCM datagrams, sequence/timestamp, jitter buffer, packet-loss/dropout handling and smooth fade/mute; graph measured packet continuity. Then PortAudio/miniaudio streaming lab path if OS permissions support it.
- Test >30min simulated streaming and loss stress, measure frame processing p50/p95/max on the real test host, not on a fictional Raspberry Pi. Do not claim real hardware telemetry until connected.
- **Gate:** C++ vs Python parity fixtures and objectively measured streaming-simulator properties with reproducible logs.

### 8. Demo, review and release

- Build a presentation route emphasizing **actual evidence**: raw voice/noise > enhanced voice, frame-policy graph, benchmark breakdown, honest fallback and failed-case analysis; include project architecture and exact code commits.
- Create setup screenshots, Markdown docs, small test files only if original/licensed, versioned alpha release and a reproducibility procedure an external student can follow.
- State clearly what is physically not yet validated: real microphones, native Pi execution, latency at real endpoint, network transport in actual hardware, long-running load/temperature. Never claim 'battlefield ready', 'hearing protection' or 'secure tactical comms'.
- Show student project value through genuine measurement and a transparent scientific comparison.

---

## Critical GitHub delivery rule: **PUSH EVERY COMPLETED MILESTONE**

For each milestone above, follow **exactly**:
1. Confirm clean git status; `git fetch` and inspect recent remote changes; do not overwrite teammates.
2. Plan one manageable work package, one feature branch `feat/<milestone>-<feature>`, and list explicit acceptance tests.
3. Implement, document, add tests, and run them. Check smoke UI manually or with browser harness.
4. Inspect diff, scanned files and `git status` to ensure **no datasets, models, tokens or extra audio**.
5. Commit with meaningful conventional commit (e.g. `feat(audio): align reference mic input and record provenance`).
6. **Push this branch immediately**: `git push -u origin <branch>`. If connector/client can open PR, open one with summary + test evidence; wait for CI. Do not claim push succeeded if it did not. Do not force push.
7. Merge only via agreed review method with green CI; update main; start next milestone **only after recorded checkpoint**. Always keep an on-disk `docs/BUILD_LOG.md` and update `CHANGELOG.md` with verified steps.
8. If no valid `origin`, do not push to random repo. Ask for exact `owner/repository` URL, preserve local commits and continue coding/testing while waiting.

**Your progress reports after each pushed milestone MUST be compact and explicit:**
`Milestone`, `files changed`, `tests actually run + pass/fail`, `benchmark evidence`, `commit SHA`, `branch / PR / push URL`, `remaining blockers`, `next single task`. Never say completed a test or push you did not execute.

**STOP CONDITIONS:** Breaking existing baseline; unauthorized repo remote; tool permissions failure; missing dataset permissions; nonlicensed model; security-critical defect; repeated unexplained failing tests; invented metrics. Fix or ask before continuing.

**FIRST CODING TASK NOW:** Audit current alpha and implement the **S1 Dataset Registry + provenance checks + 3×3×5 real-audio evaluation harness**, including correctly licensed small-source instructions, fixture tests, dashboard dataset cards backed by installed data, and a passing CI run. Do not work on unrelated UI redesign or hardware until S1 code/test/commit/push is confirmed. Once green and pushed, continue to S2.
