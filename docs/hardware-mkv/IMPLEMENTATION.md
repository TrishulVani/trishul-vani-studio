# MK-V preview: implementation and evidence

This branch adds `/hardware-mkv.html` as an **unreleased local preview**. The established V2 page links to it, and embeds the MK-IV workbench so that the existing assembly, netlist, controller scripts and real offline processor are reachable without leaving the app. The green tab favicon and Hindi `त्रि` wordmark are shared across the site.

| Area | Implemented | Evidence and limit |
|---|---|---|
| Product mode | Responsive field-to-control visual story and a generated photoreal concept image | `web/assets/mkv-field-concept.png` is illustrative artwork, not a photo of built hardware. |
| Assembly and connections | Reuses the selectable 261-mesh MK-IV scene, wire inspector, source/sink nets and scriptable Pi 4 Model B, Pico W and ESP32-S3 virtual controllers | `web/hardware.html`, `web/hardware-v2.js`, `web/virtual-rig-v2.js`; no CAD, GLB, electrical simulation or actual firmware deployment. |
| Signal evidence | Actual FastAPI run ID, stored WAVs, RAW/NLMS/Spectral/Hybrid switching at matched time, common-scale PCM envelope, reported metrics and downloads | Synthetic audio is not human speech or field audio. RNNoise appears only if the real backend offers it. |
| Reliability | Backend disconnection is explicit; playback is muted until the visitor enables it; V1 remains separate | `tests/e2e/hardware-mkv.spec.cjs` and `tests/e2e/hardware.spec.cjs`. |

The evidence design draws workflow ideas from [Steinberg's SpectraLayers interface manual](https://download.steinberg.net/downloads_software/SpectraLayers_13/help/Pro/_user_interface.html): transport, waveform/spectral inspection, tools, history and layers. The existing [`/studio.html`](../../web/studio.html) provides actual STFT visualization, spectral region editing, immutable source, undo/redo, layers, A/B preview and WAV export. It does not implement Steinberg's proprietary unmixing, transcription, restoration modules or full UI. The MK-V evidence panel is a focused RAW-to-processed comparison; open the spectral editor for detailed frequency work.

## Verification

- Python DSP/API: `.\.venv\Scripts\python.exe -m pytest -q --basetemp .pytest-hardware-mkv-final` (17 passing after the MK-V UI changes).
- Browser: `node node_modules/@playwright/test/cli.js test tests/e2e/hardware-mkv.spec.cjs tests/e2e/hardware.spec.cjs --workers=1` (30 passing across desktop, tablet and mobile).
- Full browser regression: `node node_modules/@playwright/test/cli.js test --workers=1` (72 passing across desktop, tablet and mobile). This includes V1, intro, connected lab, spectral editor and virtual hardware.
- Browser tests cover five independently stored factory, engine, wind, impulse and crowd runs; each returned finite RAW/Hybrid SNR and a RIFF WAV. They also verify a one-line script change, controller pin/UART propagation, removing/restoring a logical wire, audio handoff and disconnected UI.
- Preview screenshots: [desktop](screenshots/mkv-preview-desktop.png), [mobile](screenshots/mkv-preview-mobile.png), [populated audio desktop](screenshots/mkv-evidence-desktop.png), [populated audio mobile](screenshots/mkv-evidence-mobile.png). Recreate populated evidence after starting the local server with `node scripts/capture_mkv_evidence.cjs`.

## Required physical gates

The branch cannot claim a manufacturable device or a measured multi-board system. No source CAD/GLB, parts datasheets, dimensions, power budget, synchronized dual-mic ADC measurement, firmware image, network transport, latency test or real acoustic corpus was supplied. The next hardware gate is to select a specific capture device and boards, create dimensioned CAD, then test power/clock/audio paths on a bench. The current script interpreter deliberately accepts only its documented bounded command language; Python, MicroPython and C source are **not** executed on simulated or physical microcontrollers.
