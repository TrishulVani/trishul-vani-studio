# Spectral Intelligence Studio — build specification v0.2

**TRISHUL VANI · VoltEdge · software-first DSP research**
**Status:** design/implementation contract; **NOT a claim that this subsystem is implemented.** Start from existing alpha, preserve current working code/tests. This feature is inspired by *capability categories* in Steinberg SpectraLayers, not a SpectraLayers clone or an integration with its proprietary algorithms.

## Why this feature exists

Develop an interactive, reproducible lab to **see** frequency-time structure, inspect noise sources, **edit with transparent signal-processing methods**, and evaluate TRISHUL VANI enhancement against independent reference outputs. Critical distinction: SpectraLayers output files may be imported manually as **external comparison data**; SpectraLayers is a separately licensed product and its proprietary AI modules are neither shipped nor remotely controlled by our app. Never claim feature parity with proprietary 'Unmix Noisy Speech' or 'Voice Enhance'. Never label a spectral mask as AI speech separation.

Steinberg feature references for product research (not assets to copy):
- https://www.steinberg.net/spectralayers/
- https://download.steinberg.net/downloads_software/SpectraLayers_13/help/Pro/_denoise.html
- https://download.steinberg.net/downloads_software/SpectraLayers_13/help/Pro/_modules.html
- https://download.steinberg.net/downloads_software/SpectraLayers_13/help/Pro/_unmix_components.html
- https://download.steinberg.net/downloads_software/SpectraLayers_13/help/Pro/_voice_enhance.html

## Scope and release ladder

### Level A — scientifically correct spectral viewer (ship first)
1. WAV/FLAC import and existing experiment track selection. Validate duration, sample rate, encoding, channel count, file size, NaN/Inf, clipped samples, path safety and upload errors. Do not consume browser microphone without user permission.
2. **True** STFT-based spectrogram from uploaded/generated PCM with time/frequency axes and calibrated power/dB scale, selectable linear/log frequencies and zoom. Optimize tiles for 60s recordings and viewport; don't send full FFT tensors as giant JSON payloads.
3. Linked original/noisy/reference/enhanced waveforms; sample-correct cursor/playhead; selectable time regions; synchronized play/pause/scrub/loop and A/B comparison with gain matching and anti-clipping.
4. Noise diagnostics: RMS, peak, clipping count, dominant frequency, spectrum/PSD, optional spectral centroid/flux and detected impulses. All from actual data; distinguish estimates from ground truth.
5. Reference channel shown only for real paired captures or transparently simulated 2-channel data; never invent it.
6. Persist a session manifest: imported file hash, sample rate, channels, source/provenance/license when known, processing parameters, software versions, timestamps and Git commit.

### Level B — genuine editable spectral layers (ship second)
1. Non-destructive **layer stack**: original (immutable), per-processing outputs, editable spectral masks and imported professional-reference WAVs. Each visible layer has mute/solo/opacity, source label, measured metadata, export, provenance badge.
2. A rectangular time-frequency selection and **frequency-band** selection, first implemented with correct time/frequency-to-STFT-bin mapping and viewport zoom. Implement brush and lasso only after rectangle tested thoroughly. Mask opacity means *display opacity*; attenuation must use separately specified dB.
3. Three honest edits: **attenuate selected bins**, **isolate selected bins** and **revert an edit**. Use phase-preserving complex-STFT multiplication, iSTFT/overlap-add with correct windows; verify identity round trip with tolerances and exact output alignment/length. Optional spectral subtraction or Wiener mask must be named distinctly and tested, never marketed as semantic unmixing.
4. Undo/redo through a command history/immutable operation list; any replay yields repeatable same WAV. Edits never destructively alter source file. Preview processed selection before apply; cancel unneeded renders; show processing indicator only while actual job runs.
5. For time/frequency selections, offer a source-estimate/preservation warning: broad suppression may damage speech components. Do **not** promise source separation, word recovery, or hearing protection.
6. Export edited WAV plus JSON edit recipe/manifest and optionally CSV of real diagnostics; deterministic hashes where sample formats permit.

### Level C — advanced research comparison (ship third)
1. Add **Professional Reference** import from SpectraLayers or other tools: user exports WAV externally and uploads. Fields: tool name, edition/version if user knows it, module and settings if user knows them, source filename/hash, operator notes, provenance and optional license; `unknown` acceptable. Mark 'Externally processed' not 'Our model'. Never automate proprietary SpectraLayers without documented official supported API and explicit license.
2. Alignment: resample using declared policy, verify channel selection, estimate time offset where appropriate and **allow user review**. Compare identical source segment; detect mismatch and avoid metric computation rather than silently using invalid references.
3. Show RAW / NLMS / actual RNNoise / TRISHUL Hybrid / Spectral DSP / external reference without silently replacing any. If RNNoise isn't installed show `Not configured`, not fake output.
4. Benchmark SNR, STOI, PESQ only when valid clean ground truth exists. For no-clean recordings provide reference-free observations (spectral characteristics / listening) and explicit `N/A` for objective ground-truth metrics. Host offline processing time vs native frame compute vs hardware end-to-end latency are separate columns.
5. Compare two outputs with matched playback loudness, blind optional A/B, pinned regions, side-by-side spectrogram or difference map (with meaningful normalization); show failure/counterexample samples.
6. Export a reproducible research report referencing committed code, parameter/version/hashes, real files, data licenses, graphs and missing values.

### Level D — optional ML-assisted sound segmentation (future only)
If an open, legally redistributable, locally executable model is available, add behind an explicit `experimental` feature flag, run on background workers, record model hash and licensing; verify output on held-out recordings. No claim to match Steinberg models. Do not add a cloud API dependency for edge mode. Never let optional model exploration block Levels A–C.

## Layout blueprint (retain original Obsidian Signal Lab appearance)

**Workspace anatomy**: sticky side rail → top command bar → project breadcrumb → central dual-view timeline (waveform above / spectral heatmap below) → collapsible **Layer Stack** left or bottom → **Inspector** on right with measured values/FFT settings, selection properties and method parameters → transport strip under timeline → bottom evidence/jobs drawer. On mobile, stacked regions and bottom-sheet inspector; wave selection via large touch handles.

**Suggested information architecture**: Mission Control · Experiment Studio · **Spectral Studio** · Benchmark Arena · Controller Inspector · Dataset Vault · Edge Lab · History · Docs. All visible navigation must work; do not present inaccessible fake panels as operational.

**Tool bar**: Pointer / Pan / Rectangle / Frequency Band / Brush (disabled+label until implemented), Zoom ±, Fit, Selection duration, Play/Loop, Undo/Redo, Preview, Apply, Export. Support keyboard shortcuts with a help overlay, visible focus rings, no accidental hotkeys when typing.

**Token system** (existing CSS tokens are authority): background `#080e10`, surface `#101919`, text `#e9f3ed`, mint `#b8f6b2`, cyan `#9bd8d0`; restricted new semantic accents: impulse amber `#f6bd77`, warning coral `#f19a92`, neuro/analysis violet `#bba9f4`. The spectra themselves can use a high-contrast perceptually monotonic color map; do not confuse UI palette with scientific heatmap. Semantic statuses remain readable without color alone.

**Micro-interactions**: real spectrogram pan with inertial *optional* friction, crosshair frequency-time readout, drag region ghost selection, on-request smooth pane expand/collapse, animated audio playhead only while playing, real job progress, subtle active lane glow on real selection, selection morph. Target 60fps for normal viewport transforms; rendering intensive jobs off main thread where feasible. Honor `prefers-reduced-motion`; no distracting permanent decorative animations or fake live health.

## Backend contracts to design and test

Implement in `app/` with typed Pydantic schemas and clear file/worker modules, preserving existing routes. Route shapes are **proposed contracts**, adapt as necessary and publish OpenAPI examples before frontend wiring:
- `POST /api/spectral/sessions` — accepted WAV/FLAC or previous local experiment track ID, returns session ID + real metadata and manifest hash.
- `GET /api/spectral/sessions/{id}` — track/layer list, processing state, provenance; no arbitrary paths.
- `GET /api/spectral/sessions/{id}/tiles?start_s=&end_s=&min_hz=&max_hz=&fft_size=&scale=` — bounded, authenticated/local PNG tile or compact numeric result, axis metadata, cache key.
- `GET /api/spectral/sessions/{id}/waveform?start_s=&end_s=&points=` — downsampled actual PCM envelope with timebase.
- `POST /api/spectral/sessions/{id}/edits` — validated selection + named deterministic op; returns queued render job or versioned new immutable layer ID.
- `POST /api/spectral/sessions/{id}/render` — output preview/download job; derive from immutable source and edit recipe.
- `POST /api/spectral/sessions/{id}/import-reference` — accept external WAV with truthfully declared provenance, create new track.
- `GET /api/spectral/sessions/{id}/compare` — aligned comparison and only mathematically valid metrics.
- `GET /api/spectral/jobs/{id}` and `DELETE /api/spectral/jobs/{id}` — bounded job status/cancellation if queued.
- `GET /api/spectral/sessions/{id}/export` — WAV/manifest download after completion.

Don't expose filesystem paths to clients, shell user-provided names, process unchecked uploads or allow unbounded FFT sizes. Include MAX_UPLOAD_BYTES/MAX_DURATION_S configurables, retention policy, lifecycle cleanup and safe audio decode. Apply rate/size control appropriate to local research prototype. No external user uploads to a public unauthenticated demo.

## DSP implementation details and required truth checks

- Select a consistent STFT convention (e.g. Hann window, 1024 or 2048 FFT, hop 256/512 at 16kHz) and document how boundary and length reconstruction work. Tests: `istft(stft(x)) ≈ x` within an explicitly justified tolerance for different sample lengths, including odd lengths and silence.
- Display conversion: `20*log10(|STFT| + eps)` with stated normalization and a fixed/controllable dB dynamic range. Clamp image values but never truncate underlying audio. Frequency-axis mapping must be correct when zoomed/log scale; unit-test pointer pixels → time/frequency/FFT indices.
- Apply spectral masks to complex STFT using nonnegative weights with explicit dB-to-linear amplitude conversion `10**(dB/20)`. Preserve original phase when appropriate; selection boundary tapering to prevent audible clicks. Use overlap-add reconstruction; prevent NaNs, overflow and accidental volume spikes.
- Compare tracks sample-aligned using explicit sample-rate conversion and offset metadata. Guard clipped audio, silent reference, misalignment, stereo-to-mono policy and non-finite samples. External processed track never becomes the ground-truth clean speech unless the researcher **explicitly selects independently recorded clean truth**.
- Compute only measured values; display uncertainty and `unavailable` when no clean truth. Do not use synthetic signals to claim human speech intelligibility.
- All heavy analysis/render tasks must be bounded and cancellable. Cache tile data by source hash + processing version + STFT parameters; invalidate correctly on edit. Retain precise source audio, not re-encode through repeated edit chains.

## Test matrix — mandatory

Unit DSP: sinusoidal tones 440/1000Hz; chirp; stationary broadband noise; time-limited impulses; silence; near-silence; stereo; mismatched sample rates; clipped inputs; odd frame length; impulse near start/end; mask inversion; undo/redo; feature flags. Verify time-frequency selection maps to known tone and attenuates intended region without corrupting unrelated audio. Verify exact output duration, finite samples, preview vs export consistency.

API integration: upload + validate; session GET; bounded tiles; mask preview; edit apply; history; external WAV import with provenance; compare with clean reference vs without; render/export; oversized/unsupported/corrupt input; path traversal; worker cancellation; storage retention.

Browser E2E: desktop 1440px, tablet 768px, mobile 375px; file upload → real heatmap → selection → preview → apply → undo → external import → aligned A/B → export → refresh persistent result. Test keyboard focus, `prefers-reduced-motion`, denied microphone permission, and no horizontal scroll. Screenshot tests must compare to *approved* baselines, not the unavailable reel.

Performance evidence: 10s/30s/60s fixtures; tile generation time, viewport scrolling FPS, API payload size, memory peak and job cancellation on actual test host. Collect OS/tool version and test commands. Never report fabricated numbers or a 'validated 90%' based on checklist cosmetics.

## Done criteria / stop conditions

**Level A:** real uploaded audio generates correct interactive spectrogram + waveform; tests and browser flows green, accurate units, committed/pushed. **Level B:** selection, attenuate/isolate, non-destructive layer, preview/undo/export preserve timing, quantitatively tested, committed/pushed. **Level C:** externally processed WAV import, metadata, alignment, defensible comparison, correct N/A handling and report; committed/pushed.

Each commit must be small enough for code review. If no authorized GitHub remote exists, commit locally only and ask the user for the repository URL; never claim a push occurred. If the portal reel is absent, finish scientifically useful work and put visual matching into a blocked subtask rather than guessing how it looks.
