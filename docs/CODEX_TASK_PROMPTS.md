# Copy/Paste Codex Execution Prompts — v0.2

Use `CODEX_MASTER_PROMPT.md` as the standing specification and `AGENTS.md` as the short operating rules. **One prompt per session/milestone** gives GPT-5.6 Medium/GPT-6 Light enough focus to test rather than generate an unreviewable rewrite.

### 0 / Start audit (run first)

Inspect README.md, AGENTS.md, CODEX_MASTER_PROMPT.md, docs/ROADMAP.md, docs/SPECTRAL_STUDIO_SPEC.md, docs/PORTAL_UI_UX.md and docs/PORTAL_REEL_INTAKE.md. Inspect actual source and git history; run existing pytest + frontend static checks + API/UI smoke. Report the exact status. Work on a feature branch if authorized repo remote exists; if not, ask me for URL, commit locally and never claim to push. Implement nothing large in this step beyond baseline fixes, and record measured evidence.

### 1 / Licensed audio dataset registry

Implement only S1 dataset manifest/import first: human speech sample(s), three real licensed environment-noise classes via a user-installed tiny dataset, hashes/licenses/sample metadata and 5 fixed SNR mixes. No bundled copyrighted datasets, no huge download, no invented metrics. Add API docs, Pytest fixtures, real UI data source cards. Test, doc, commit, push only if authorized remote, report evidence.

### 2 / Spectral Studio Level A — actual viewer

Implement `docs/SPECTRAL_STUDIO_SPEC.md` Level A **only**: uploaded WAV/FLAC→validated session→real STFT spectrogram tiles and aligned PCM waveform→zoom/pan/cursor/seek/loop with correct frequency/time units. Keep existing routes and theme. Implement backend schemas, strict upload limits, deterministic DSP, tests and browser E2E; do not add brush and AI unmix yet. Review diff, commit, push if possible, report. Move to Level B only after this passes.

### 3 / Spectral Studio Level B — honest editing

Build a versioned non-destructive layer stack, rectangle/frequency-region spectral attenuation/isolation, preview, undo/redo and exact-length WAV+manifest export using complex STFT + iSTFT. Verify reconstruction identity, selection-to-bin mapping, overlap-add correctness, padding alignment, no clipping/corrupt outputs, and actual responsiveness. No semantic source-separation claims. Add tests, docs, commit+push.

### 4 / SpectraLayers reference comparison

Build external WAV reference import **only**—we do not have a Steinberg SDK or permission to bundle its proprietary components. Label external-processing provenance and input hashes; implement time/sample-rate alignment with user review; allow matched-loudness A/B and metrics only with actual independently recorded clean reference. Compare RAW/NLMS/RNNoise/TRISHUL with honest availability statuses. Add end-to-end tests and example reproducibility manifest. Commit+push when green.

### 5 / Reel-inspired portal design

FIRST verify whether `docs/references/portal-reel.mp4` or a URL/media has actually been supplied. If absent, explicitly mark reel matching BLOCKED and continue implementation of `docs/PORTAL_UI_UX.md` generic high-value interactions; do not fabricate reel observations. If present, build docs/REEL_DESIGN_AUDIT.md with timestamped observations and prioritize at most 3–5 specific interactions mapped to functional TRISHUL VANI pages. Preserve existing green-black identity, avoid copying copyrighted exact visual assets/layout, add reduced motion and tests. Commit+push.

### 6 / Benchmark/engine hardening

Follow S2–S6 in docs/ROADMAP.md: validate genuine RNNoise + dual-channel NLMS + hybrid policies, measured comparison, backend jobs, C++ port and software-only two-node simulator. Keep source and external benchmark separate, fail closed on missing ground truth, run tests and commit/push each small milestone. Do not claim 90% until actual software acceptance gates pass.

### 7 / Release QA

Verify clean clone setup Windows/Linux, full Pytest/Playwright, basic performance metrics, licensed manifest exports, screenshot/a11y review, CI, container checks. Build evidence-oriented README and accurate changelog. Document pending real microphone/Raspberry Pi tests. Submit measured progress % as passed/total acceptance gates with test links, not subjective guess. Commit/push.

**Required report after each task**: `Task`, `files changed`, `tests actually run + results`, `manual UI evidence`, `commit`, `push/PR URL or BLOCKED`, `open defects`, `next microtask`. Stop on unreviewed breaking changes and unauthorized repo.
