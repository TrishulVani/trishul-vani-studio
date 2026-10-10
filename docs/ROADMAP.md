# v0.2 extension — Spectral Intelligence and UI reference capture

> **Implementation note:** This is a new plan, not a completed feature. The existing workbench code is alpha v0.1 and its previously tested behavior is unchanged. The specific portal reel remains **unprovided** and cannot be faithfully studied until attached.

**New time-boxed micro-gates interleaved after S1 datasets:**
- **S1.5.A Spectral viewer:** real validated audio→STFT PNG/numeric tiles→waveform sync→time/frequency crosshair/zoom→selection+playback. Tests and commit/push receipt.
- **S1.5.B Spectral editor:** non-destructive operations (rectangle/band attenuate/isolate), preview, undo/redo and WAV+recipe export, measured reconstruction and exact output alignment. Tests and commit/push receipt.
- **S1.5.C External professional-reference import:** import externally processed WAV exported by SpectraLayers/other app, optional module/version metadata, clean-source distinction, verifiable A/B and valid metric handling. Tests and commit/push receipt.
- **S4.1 Portal foundation:** connected app-shell, task progress, workspace inspector, keyboard/mobile/reduced-motion interactions tested, without reference claims.
- **S4.2 Portal reel mapping (BLOCKED until user supplies reel):** timestamped observed-feature audit, prioritized animation spec, integrate 3–5 meaningful elements, visual E2E and screenshots.

Detailed contracts: `docs/SPECTRAL_STUDIO_SPEC.md`, `docs/PORTAL_UI_UX.md`, `docs/PORTAL_REEL_INTAKE.md`; exact one-task Codex prompts: `docs/CODEX_TASK_PROMPTS.md`. All former S0–S8 gates below remain applicable. The 90% target is based on **passed software tests**, not page count.

---

# Software-first execution roadmap (not the original hardware phase plan)

The user's initial phase document went from setup → datasets → scoring → NLMS → RNNoise → hybrid → real recordings → C++ → two Raspberry Pis → final demo. The following reorganizes work around **software deliverables and review gates**, allowing independent research and a convincing interactive workbench *before hardware arrives*. This is not a claim that 90% is already complete.

## Phase S0 — Tracked foundation / green CI

**Existing alpha:** repository structure, FastAPI, dashboard, tests, Docker, CI, docs, reproducible sample simulator, local WAV/CSV. Ensure branch and remote are resolved before GitHub pushes. Gate: clean clone launches and tests pass with no API keys. Commit `chore: establish tested research workbench`.

## Phase S1 — Correct and realistic datasets

Add consent and licenses, small LibriSpeech + DEMAND download instructions (don't bundle), manifest validation, *sample-level* reproducible joins, train/tune/test separation, impulse and speech-leakage profiles, RIR/microphone transfer simulation. Gate: at least three actual speakers, three noise classes, five SNR points; no sample leak; exact hashes in CSV/JSON. Push `feat(data): add traceable speech and noise registry`.

## Phase S2 — Rigorous baselines

Harden NLMS with comprehensive convergence/poor-reference/double-talk tests. Integrate a *genuine* RNNoise model with licensing, resampling, exact latency accounting; no substitution. Compare RAW, NLMS, RNNoise and spectral DSP honestly. Gate: batch benchmark produces repeatable outputs and can be verified against Python control implementation. Push `feat(dsp): validate adaptive and neural baselines`.

## Phase S3 — Production-worthy hybrid controller (on files)

Transition to stateful per-frame streaming API (160 samples internal; 480 at 48k RNNoise); better reference gate, impulse freeze, crossfade, hysteresis, limiter, state monitor, fallback. Run high-amplitude, synthetic impulsive, uncorrelated noise, two-mic offset tests. Gate: numerically stable with <=10 ms frame interface, no NaN, correct frame state, comparable metrics and input parity. Push `feat(hybrid): add gated streaming controller with traces`.

## Phase S4 — Deep interactive UX

Enhance dashboard: true synchronized raw/reference/enhanced waveform and spectrogram, A/B loop audition, playback scrub and segment zoom, 5-condition lab presets, real experiment progress/queue, accessible sound settings, filter weights visualizer, policy timeline, CSV/PDF experimental report export, long-running benchmark job status, comparison matrix heatmap and failure gallery. Use React/TS if worthwhile, not mandatory. Gate: verified Playwright flows at desktop/mobile, no hardcoded statistics, animation reduced-motion compatibility. Push `feat(ui): add complete audio lab research journey`.

## Phase S5 — Evaluation & automation at scale

Parallel batch jobs (bounded), asynchronous task queue, autosaved experiment configurations, reproducible train/test control, uncertainty and statistical summaries, report reproducibility checker, export a paper-style figure package. Gate: benchmark repeats from manifest with equal hashes/algorithm commits and same output to floating-point tolerance. Push `feat(eval): batch orchestration and signed research reports`.

## Phase S6 — Native engine and streaming simulator

C++/CMake NLMS and hybrid with Python parity, real RNNoise library integration; offline WAV comparison first. Loopback 2-node link simulator with UDP framing, jitter/loss/dropout handling, sequence numbers and timestamps; CLI streaming capture using PortAudio/miniaudio. Gate: measured host processing p95/max and packet continuity, 30-minute burn-in; no claiming physical hardware. Push `feat(native): parity-tested low-latency engine and link simulator`.

## Phase S7 — Edge interface + honest telemetry

Hardware-adapter abstraction for Raspberry Pi A/B, native callback instrumentation, CPU/RAM/temperature watchers, circuit-breaker supervisor, watchdog and fallback; dashboard real telemetry. Gate: Pi is actually provisioned, synchronized microphones are measured, hardware reports collected. Can be postponed until boards exist. Push `feat(edge): add instrumented hardware adapters`.

## Phase S8 — Release & showcase

CLI and Docker installation, signed versioned reproducibility manifest, user guide and architecture animations showing **real** state, downloadable sample results where licensed, regression tests, demo narration, ethical/safety boundaries and video of live two-node test when ready. Gate: fresh Windows/Linux setup and 5 external benchmark cases, green CI, PR reviews and published alpha release. Push `docs(release): ship reproducible demonstration and audit trail`.

**90% target definition:** 90% of **software** (excluding physical hardware commissioning) means S0–S6 substantially pass their gates and S8 documented; actual RNNoise, real speech tests, robust reference gating, streaming/native parity, and frontend validation must be real. The current package is a working **alpha seed**, not proof of those future gates. “90% done” must follow acceptance evidence, never a milestone counter.

## Git workflow across every phase

```bash
# Set remote only after the owner provides the exact repository URL:
git remote add origin https://github.com/<owner>/<target-repo>.git
# For each milestone, after clean tests:
git switch -c feat/<short-milestone>
python -m pytest -q
node --check web/app.js
git add app web scripts tests docs README.md .github
# Inspect git diff --cached --stat before committing
git commit -m 'feat(scope): verified milestone'
git push -u origin feat/<short-milestone>
# Open PR, check Actions, merge when green, pull current main; next milestone begins.
```

Never force push unrelated projects, silently overwrite remote changes, or put third-party datasets in Git.
