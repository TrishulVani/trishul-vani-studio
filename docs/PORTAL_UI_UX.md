# TRISHUL VANI — Portal UI / Motion and UX implementation checklist v0.2

Design objective: a cinematic *but scientifically credible* command-and-control **research instrument**, not a cyberpunk movie dashboard and not a commercial tactical platform. Respect existing `/web` look and feel: obsidian `#080e10`, mint `#b8f6b2`, green panels, current typography and trident mark.

**Core pages**: Mission Control → Audio Experiment Studio → Spectral Studio → Adaptive Controller → Benchmark Arena → Dataset Vault → Edge Lab → Provenance/History.

## Navigation and flow
- Sidebar: collapsible without page-jank, tooltip labels when collapsed, one active destination, mobile drawer, accessible keyboard tab order.
- App header: breadcrumb, local processor/mic state from API, command palette shortcut (`Ctrl/⌘ + K`), help, dataset/licensing indicator; no imaginary live metrics.
- Home CTA: launch new experiment with clear preconditions and dataset health; future hardware state should read DISCONNECTED until measured.
- Studio horizontal rail: `1 Select audio` → `2 Add noise` → `3 Choose method` → `4 Process` → `5 Inspect` → `6 Compare/export`. Completing a step is tied to actual backend state; resumable on refresh.
- Motion easing: motion durations ~120–280ms for practical UI and ~450ms for exceptional panel transitions, not for data updates that require immediacy. Honor reduced motion; use opacity/transform rather than layout-triggering animation. Avoid playback/spectrogram desync caused by UI animation.

## Component map
- `SignalTransport`: low-latency play/pause/loop/scrub, current time, playback rate optional, segment selection. Audio time is source of truth.
- `DualSignalView`: waveform + spectrogram lockstep, actual PCM, pan/zoom, frequency ruler with log/linear modes.
- `LayerStack`: original locked, each edit in immutable history, imported external WAV labeled; solo/mute/opacity.
- `InspectorPanel`: selected region Hz/seconds/dB, measured RMS/peak, FFT size and hop, warnings.
- `MethodRail`: RAW, NLMS, Spectral DSP, authentic RNNoise (conditional), TRISHUL; no fake enabled feature.
- `EvidenceDrawer`: actual metrics, test provenance, worker progress, downloaded artifacts.
- `ControllerMap`: trident flow channels shown only from recorded controller traces, tooltip per state.
- `DatasetBrowser`: license status and installed/available distinctions; no auto-download of unlicensed files.
- `ProfessionalReferenceBadge`: human-entered SpectraLayers processing name and version, WAV SHA, **External offline reference** badge, no proprietary product endorsement implied.

## Visualization safety and accessibility
- Labels and numeric metrics always visible independent of color. The heatmap palette and data ranges are explicit, color-blind-friendly options. No uncalibrated reference meter presented as calibrated SPL (dB SPL requires physical calibration).
- Green/mint remains the primary brand; amber denotes transients, icy cyan denotes analysis, lavender denotes optional neural layer. Heatmap color must have a numeric legend.
- Screen-reader text for chart descriptions, keyboard transport/region input, pointer/touch equivalents. Never automatically play loud audio. Avoid sudden noise bursts in demos; warn about headphones and normalize preview safely.
- Loading/error/empty/success all have actual state; low-RAM fallback renders smaller tiles. Animations run off data and are deterministic enough for visual regression.

## Screenshots/acceptance
- Save approved designs at `docs/references/approved-<viewport>.png` only after local visual QA and the user's reference reel audit.
- Browser E2E at 375, 768, 1440 widths with pointer, keyboard, reduced motion, no clipping, no horizontal scroll; Lighthouse/a11y findings must be triaged.
- Done means every displayed button has real behavior and matching backend; placeholder disabled buttons must say `Coming later`.
